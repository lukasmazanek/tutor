import { useState, useEffect } from 'react'
import { LightBulbIcon, TagIcon } from '@heroicons/react/24/outline'
import DiagramRenderer from './diagrams/DiagramRenderer'
import BottomBar from './BottomBar'
import topicTypeMapping from '../data/topic_type_mapping.json'

function ProblemCard({ problem, onAnswer, progress, onExit, onViewProgress, typePromptEnabled, onToggleTypePrompt }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [revealedSteps, setRevealedSteps] = useState([]) // Progressive hints - array of revealed step indices
  const [solutionRevealed, setSolutionRevealed] = useState(false) // All steps shown
  const [feedback, setFeedback] = useState(null) // 'correct' | 'tryAgain' | null
  const [wrongAttempts, setWrongAttempts] = useState(0) // Auto-hint after 3 wrong attempts

  // Type prompt state (when typePromptEnabled)
  // Phase: null (not started) | 'type' | 'strategy' | 'done'
  const [promptPhase, setPromptPhase] = useState(typePromptEnabled ? 'type' : 'done')
  const [typePromptResult, setTypePromptResult] = useState({ typeCorrect: null, strategyCorrect: null })

  // Get type mapping for current problem
  const typeMapping = topicTypeMapping.mappings[problem.topic] || null

  // Reset prompt phase when problem changes
  useEffect(() => {
    if (typePromptEnabled && typeMapping) {
      setPromptPhase('type')
      setTypePromptResult({ typeCorrect: null, strategyCorrect: null })
    } else {
      setPromptPhase('done')
    }
  }, [problem.id, typePromptEnabled])

  // Get hint source: prefer solution_steps, fallback to hints
  const hintSource = problem.solution_steps?.length > 0 ? problem.solution_steps : (problem.hints || [])

  // Detect if on touch device (mobile)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Check for touch support and screen width
    const checkMobile = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(hasTouchScreen && isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Progress tracking state
  const [problemStartTime, setProblemStartTime] = useState(Date.now())

  // Reset start time when problem changes
  useEffect(() => {
    setProblemStartTime(Date.now())
  }, [problem.id])

  // Parse and evaluate user input flexibly
  const parseUserAnswer = (input) => {
    let normalized = input.trim().replace(',', '.').toLowerCase()

    // Remove "x=" or "x =" prefix (for equations)
    normalized = normalized.replace(/^x\s*=\s*/, '')

    // Remove units (Kč, kg, cm, l, g, etc.)
    normalized = normalized.replace(/\s*(kč|kg|cm|m|l|g|litrů|litru)\.?$/i, '')

    // Convert math notation to JavaScript
    // √(x) -> Math.sqrt(x)
    let mathExpr = normalized.replace(/√\(/g, 'Math.sqrt(')
    // sqrt(x) -> Math.sqrt(x) (text alternative for desktop)
    mathExpr = mathExpr.replace(/sqrt\(/gi, 'Math.sqrt(')
    // x^y -> Math.pow(x,y) - handle simple cases like 3^2
    mathExpr = mathExpr.replace(/(\d+)\^(\d+)/g, 'Math.pow($1,$2)')

    // Try to evaluate expressions with math functions
    try {
      const result = Function('"use strict"; return (' + mathExpr + ')')()
      if (typeof result === 'number' && !isNaN(result)) {
        return { value: result, type: 'number' }
      }
    } catch (e) {
      // If evaluation fails, continue with other parsing
    }

    // Check if it's a fraction (e.g., "3/4", "6/8")
    const fractionMatch = normalized.match(/^(-?\d+)\s*\/\s*(\d+)$/)
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1])
      const denominator = parseInt(fractionMatch[2])
      if (denominator !== 0) {
        return { value: numerator / denominator, type: 'fraction', original: normalized }
      }
    }

    // Try parsing as a plain number
    const num = parseFloat(normalized)
    if (!isNaN(num)) {
      return { value: num, type: 'number' }
    }

    return { value: normalized, type: 'string' }
  }

  // Check if two fraction strings are equivalent
  const fractionsEqual = (userFraction, correctFraction) => {
    const userMatch = userFraction.match(/^(-?\d+)\s*\/\s*(\d+)$/)
    const correctMatch = correctFraction.match(/^(-?\d+)\s*\/\s*(\d+)$/)

    if (userMatch && correctMatch) {
      const userVal = parseInt(userMatch[1]) / parseInt(userMatch[2])
      const correctVal = parseInt(correctMatch[1]) / parseInt(correctMatch[2])
      return Math.abs(userVal - correctVal) < 0.0001
    }
    return false
  }

  const checkAnswer = () => {
    const parsed = parseUserAnswer(userAnswer)
    let isCorrect = false

    if (problem.type === 'number') {
      // Accept number or evaluated expression
      // Tolerance 0.01 allows for rounding (e.g., √108 ≈ 10.39)
      if (parsed.type === 'number' || parsed.type === 'fraction') {
        isCorrect = Math.abs(parsed.value - problem.answer) < 0.01
      }
    } else if (problem.type === 'fraction') {
      // Accept exact fraction, equivalent fraction, or decimal
      const correctDecimal = problem.answer_decimal

      if (parsed.type === 'fraction' || parsed.type === 'number') {
        // Check decimal equivalence
        isCorrect = Math.abs(parsed.value - correctDecimal) < 0.001
      }

      // Also check exact fraction string match
      if (!isCorrect && parsed.original) {
        isCorrect = fractionsEqual(parsed.original, problem.answer)
      }

      // Check if user typed the exact answer string
      if (!isCorrect) {
        const normalized = userAnswer.trim().replace(',', '.').toLowerCase()
        isCorrect = normalized === problem.answer.toLowerCase()
      }
    } else if (problem.type === 'multiple_choice') {
      const normalized = userAnswer.trim().toLowerCase()
      isCorrect = normalized === problem.answer
    }

    if (isCorrect) {
      setFeedback('correct')
      setTimeout(() => {
        // Pass rich attempt data for progress tracking
        onAnswer({
          correct: true,
          hintsUsed: revealedSteps.length,
          timeSpent: Date.now() - problemStartTime
        })
        resetState()
      }, 1500)
    } else {
      setFeedback('tryAgain')
      const newWrongAttempts = wrongAttempts + 1
      setWrongAttempts(newWrongAttempts)

      // Auto-hint after 3rd wrong attempt (if hints available and not all revealed)
      if (newWrongAttempts >= 3 && !solutionRevealed && revealedSteps.length < hintSource.length) {
        setTimeout(() => {
          setFeedback(null)
          showNextHint()
        }, 1500)
      } else {
        setTimeout(() => setFeedback(null), 2000)
      }
    }
  }

  const resetState = () => {
    setUserAnswer('')
    setRevealedSteps([])
    setSolutionRevealed(false)
    setFeedback(null)
    setWrongAttempts(0)
    setProblemStartTime(Date.now())
    // Reset prompt phase for next problem
    if (typePromptEnabled && typeMapping) {
      setPromptPhase('type')
      setTypePromptResult({ typeCorrect: null, strategyCorrect: null })
    }
  }

  // Handle type prompt answer
  const handleTypePromptAnswer = (answerId, isCorrect) => {
    setTypePromptResult(prev => ({ ...prev, typeCorrect: isCorrect }))
    setTimeout(() => setPromptPhase('strategy'), 300)
  }

  // Handle strategy prompt answer
  const handleStrategyPromptAnswer = (answer, isCorrect) => {
    setTypePromptResult(prev => ({ ...prev, strategyCorrect: isCorrect }))
    setTimeout(() => setPromptPhase('done'), 300)
  }

  // Build shuffled type options
  const getTypeOptions = () => {
    if (!typeMapping) return []
    return [
      { id: typeMapping.type_id, label: typeMapping.type_label, isCorrect: true },
      ...typeMapping.distractors_type.map(d => ({ id: d.id, label: d.label, isCorrect: false }))
    ].sort(() => Math.random() - 0.5)
  }

  // Build shuffled strategy options
  const getStrategyOptions = () => {
    if (!typeMapping) return []
    return [
      { value: typeMapping.strategy, isCorrect: true },
      ...typeMapping.distractors_strategy.map(s => ({ value: s, isCorrect: false }))
    ].sort(() => Math.random() - 0.5)
  }

  const showNextHint = () => {
    if (solutionRevealed || hintSource.length === 0) return

    const nextIndex = revealedSteps.length
    if (nextIndex < hintSource.length) {
      const newRevealed = [...revealedSteps, nextIndex]
      setRevealedSteps(newRevealed)

      // Check if this was the last hint
      if (newRevealed.length >= hintSource.length) {
        setSolutionRevealed(true)
      }
    }
  }

  // Handle "Pokračovat" after solution revealed
  const handleContinueAfterSolution = () => {
    onAnswer({
      correct: false,
      hintsUsed: revealedSteps.length,
      timeSpent: Date.now() - problemStartTime,
      usedFullSolution: true
    })
    resetState()
  }

  return (
    <div className="h-[100dvh] flex flex-col -mx-4 -mt-2 px-4 pt-2">
      {/* Progress bar */}
      {progress && (
        <div className="mb-3">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-safe-blue transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Problem text and diagram */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        {/* Diagram - if present */}
        {problem.diagram && (
          <DiagramRenderer diagram={problem.diagram} />
        )}

        <p className="text-lg text-slate-800 leading-relaxed">
          {problem.problem_cs}
        </p>
      </div>

      {/* Type prompt phase */}
      {promptPhase === 'type' && typeMapping && (
        <div className="flex-1 flex flex-col px-1">
          <h3 className="text-lg font-medium text-indigo-700 mb-4">
            Jaký je to typ úlohy?
          </h3>
          <div className="space-y-3">
            {getTypeOptions().map((option) => (
              <button
                key={option.id}
                onClick={() => handleTypePromptAnswer(option.id, option.isCorrect)}
                className="w-full p-4 rounded-xl text-left transition-all duration-200
                  bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300
                  active:scale-[0.98]"
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Strategy prompt phase */}
      {promptPhase === 'strategy' && typeMapping && (
        <div className="flex-1 flex flex-col px-1">
          {/* Type result */}
          <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
            typePromptResult.typeCorrect ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <span>{typePromptResult.typeCorrect ? '✓' : '○'}</span>
            <span className="text-sm">
              Typ: {typeMapping.type_label}
            </span>
          </div>

          <h3 className="text-lg font-medium text-indigo-700 mb-4">
            Jaká je správná strategie?
          </h3>
          <div className="space-y-3">
            {getStrategyOptions().map((option, index) => (
              <button
                key={index}
                onClick={() => handleStrategyPromptAnswer(option.value, option.isCorrect)}
                className="w-full p-4 rounded-xl text-left transition-all duration-200
                  bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300
                  active:scale-[0.98]"
              >
                <span className="font-mono">{option.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content area - grows to push keyboard to bottom (only when solving) */}
      {promptPhase === 'done' && (
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Type/Strategy result from prompt (shown in hint style) */}
        {typePromptEnabled && typeMapping && typePromptResult.typeCorrect !== null && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 flex-shrink-0">
            <div className="flex items-start gap-3">
              <TagIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="text-indigo-800">
                  <span className="font-medium">Typ:</span> {typeMapping.type_label}
                  <span className={`ml-2 ${typePromptResult.typeCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                    {typePromptResult.typeCorrect ? '✓' : '○'}
                  </span>
                </p>
                <p className="text-indigo-800">
                  <span className="font-medium">Strategie:</span> {typeMapping.strategy}
                  <span className={`ml-2 ${typePromptResult.strategyCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                    {typePromptResult.strategyCorrect ? '✓' : '○'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progressive hints section - cumulative display */}
        {revealedSteps.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 transition-gentle flex-shrink-0">
            <div className="flex items-start gap-3">
              <LightBulbIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                {revealedSteps.map((stepIndex, i) => (
                  <p key={i} className={`text-purple-800 ${i === revealedSteps.length - 1 ? 'font-medium' : 'text-purple-600'}`}>
                    {i + 1}. {hintSource[stepIndex]}
                  </p>
                ))}
                {!solutionRevealed && (
                  <p className="text-purple-400 text-sm mt-2">
                    ({revealedSteps.length}/{hintSource.length} kroků)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Solution revealed - show answer (Pokračovat button is in bottom bar) */}
        {solutionRevealed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-green-800 font-medium">
              Správná odpověď: {problem.answer}{problem.answer_unit ? ` ${problem.answer_unit}` : ''}
            </p>
          </div>
        )}

        {/* Answer input - hidden when solution revealed */}
        {!solutionRevealed && (
        <div>
        {problem.type === 'multiple_choice' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {problem.options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setUserAnswer(option.id)
                  // Auto-check answer for multiple choice
                  const isCorrect = option.id === problem.answer
                  if (isCorrect) {
                    setFeedback('correct')
                    setTimeout(() => {
                      onAnswer({
                        correct: true,
                        hintsUsed: revealedSteps.length,
                        timeSpent: Date.now() - problemStartTime
                      })
                      resetState()
                    }, 1200)
                  } else {
                    setFeedback('tryAgain')
                    const newWrongAttempts = wrongAttempts + 1
                    setWrongAttempts(newWrongAttempts)

                    // Auto-hint after 3rd wrong attempt
                    if (newWrongAttempts >= 3 && !solutionRevealed && revealedSteps.length < hintSource.length) {
                      setTimeout(() => {
                        setFeedback(null)
                        showNextHint()
                      }, 1200)
                    } else {
                      setTimeout(() => setFeedback(null), 1500)
                    }
                  }
                }}
                disabled={feedback !== null}
                className={`p-4 rounded-xl text-left transition-gentle touch-target
                  ${userAnswer === option.id
                    ? 'bg-safe-blue text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                  }
                  disabled:opacity-70`}
              >
                <span className="font-medium mr-2">{option.id.toUpperCase()})</span>
                {option.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-4">
            {/* Desktop: real input with keyboard | Mobile: display only */}
            {isMobile ? (
              <div
                className="w-full p-4 text-xl rounded-xl border-2 border-slate-200
                  bg-white min-h-[56px] flex items-center"
              >
                {userAnswer || <span className="text-slate-400">Tvoje odpověď...</span>}
              </div>
            ) : (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    checkAnswer()
                  }
                }}
                placeholder="Tvoje odpověď..."
                className="w-full p-4 text-xl rounded-xl border-2 border-slate-200
                  bg-white min-h-[56px] focus:border-safe-blue focus:outline-none"
                autoFocus
              />
            )}

            {problem.answer_unit && (
              <span className="text-slate-500 text-sm mt-1 block">
                Odpověz v: {problem.answer_unit}
              </span>
            )}
          </div>
        )}

        {/* Feedback overlay */}
        {feedback && (
          <div className={`mb-4 p-4 rounded-xl text-center transition-gentle
            ${feedback === 'correct' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
          >
            {feedback === 'correct' ? (
              <span className="font-medium">Přesně tak! ✓</span>
            ) : (
              <span>Zkus jiný přístup</span>
            )}
          </div>
        )}

        </div>
        )}
      </div>
      )}

      {/* Bottom bar - keyboard on mobile, just buttons on desktop (only when solving) */}
      {promptPhase === 'done' && problem.type !== 'multiple_choice' && (
        <div className="flex-shrink-0 bg-slate-50 pt-2 pb-2 border-t border-slate-200">
          {/* Virtual keyboard - only on mobile, hidden when solution revealed */}
          {isMobile && !solutionRevealed && (
            <div className="grid grid-cols-5 gap-1 mb-2">
              {/* Row 1: 7 8 9 ÷ √ */}
              {['7', '8', '9', '/', '√'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + (key === '√' ? '√(' : key))}
                  className={`h-10 rounded-xl text-base font-medium transition-gentle active:scale-95
                    ${key === '/' || key === '√' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                >
                  {key === '/' ? '÷' : key}
                </button>
              ))}
              {/* Row 2: 4 5 6 × ^ */}
              {['4', '5', '6', '*', '^'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + key)}
                  className={`h-10 rounded-xl text-base font-medium transition-gentle active:scale-95
                    ${key === '*' || key === '^' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                >
                  {key === '*' ? '×' : key}
                </button>
              ))}
              {/* Row 3: 1 2 3 − ( */}
              {['1', '2', '3', '-', '('].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + key)}
                  className={`h-10 rounded-xl text-base font-medium transition-gentle active:scale-95
                    ${key === '-' || key === '(' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                >
                  {key === '-' ? '−' : key}
                </button>
              ))}
              {/* Row 4: 0 , ⌫ + ) */}
              <button
                type="button"
                onClick={() => setUserAnswer(prev => prev + '0')}
                className="h-10 rounded-xl text-base font-medium bg-slate-100 text-slate-800 transition-gentle active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setUserAnswer(prev => prev + '.')}
                className="h-10 rounded-xl text-base font-medium bg-slate-100 text-slate-800 transition-gentle active:scale-95"
              >
                ,
              </button>
              <button
                type="button"
                onClick={() => setUserAnswer(prev => prev.slice(0, -1))}
                className="h-10 rounded-xl text-base bg-red-50 text-red-600 transition-gentle active:scale-95"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => setUserAnswer(prev => prev + '+')}
                className="h-10 rounded-xl text-base font-medium bg-purple-100 text-purple-700 transition-gentle active:scale-95"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setUserAnswer(prev => prev + ')')}
                className="h-10 rounded-xl text-base font-medium bg-purple-100 text-purple-700 transition-gentle active:scale-95"
              >
                )
              </button>
            </div>
          )}

          {/* Desktop symbol bar - math symbols only, hidden when solution revealed */}
          {!isMobile && !solutionRevealed && (
            <div className="flex gap-2 mb-3">
              {[
                { symbol: '√(', display: '√(' },
                { symbol: '^', display: '^' },
                { symbol: '(', display: '(' },
                { symbol: ')', display: ')' }
              ].map(({ symbol, display }) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + symbol)}
                  className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700
                    font-mono text-lg hover:bg-purple-200 transition-gentle"
                >
                  {display}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons - ADR-009 centralized */}
          <BottomBar
            contained
            slots={{
              1: { onClick: onExit },
              2: { onClick: onViewProgress },
              3: { onClick: onToggleTypePrompt, active: typePromptEnabled },
              4: { onClick: showNextHint, disabled: solutionRevealed },
              5: {
                action: solutionRevealed ? 'continue' : 'submit',
                onClick: solutionRevealed ? handleContinueAfterSolution : checkAnswer,
                disabled: !solutionRevealed && !userAnswer.trim()
              }
            }}
          />
        </div>
      )}

      {/* Bottom bar for multiple choice - ADR-009 centralized */}
      {promptPhase === 'done' && problem.type === 'multiple_choice' && (
        <div className="flex-shrink-0 bg-slate-50 pt-2 pb-2 border-t border-slate-200">
          <BottomBar
            contained
            slots={{
              1: { onClick: onExit },
              2: { onClick: onViewProgress },
              3: { onClick: onToggleTypePrompt, active: typePromptEnabled },
              4: { onClick: showNextHint, disabled: solutionRevealed },
              5: { action: 'continue', onClick: handleContinueAfterSolution, disabled: !solutionRevealed }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ProblemCard
