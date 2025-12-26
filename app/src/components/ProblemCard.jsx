import { useState, useEffect } from 'react'
import { LightBulbIcon, TagIcon } from '@heroicons/react/24/outline'
import DiagramRenderer from './diagrams/DiagramRenderer'
import BottomBar from './BottomBar'
import topicTypeMapping from '../data/topic_type_mapping.json'
import { evaluateAnswer } from '@lib/mathParser'

// Format answer for display (Czech locale for numbers)
function formatAnswer(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// Adapter: transform problem format to format expected by mathParser
function adaptProblemForParser(problem) {
  // Format 1: New format with explicit answer.type
  if (problem.answer?.type) {
    return {
      question: {
        originalValue: problem.question?.originalValue || problem.originalValue || null
      },
      answer: problem.answer
    }
  }

  // Format 2: Unified format (has answer.value but no answer.type)
  if (problem.answer?.value !== undefined) {
    const value = problem.answer.value
    // Infer type: if answer contains 'x', it's symbolic
    const isSymbolic = typeof value === 'string' && value.toLowerCase().includes('x')
    return {
      question: {
        originalValue: problem.question?.originalValue || null
      },
      answer: {
        type: isSymbolic ? 'symbolic' : 'numeric',
        value: value,
        unit: problem.answer.unit || null
      }
    }
  }

  // Format 3: Old format (problem.type + problem.answer)
  let answerType, answerValue

  if (problem.type === 'text') {
    answerType = 'symbolic'
    answerValue = problem.answer
  } else if (problem.type === 'fraction') {
    answerType = 'numeric'
    answerValue = problem.answer_decimal
  } else {
    answerType = 'numeric'
    answerValue = problem.answer
  }

  return {
    question: {
      originalValue: problem.originalValue || null
    },
    answer: {
      type: answerType,
      value: answerValue,
      unit: problem.answer_unit || null
    }
  }
}

function ProblemCard({ problem, onAnswer, progress, onExit, onViewProgress, typePromptEnabled, onToggleTypePrompt }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [revealedSteps, setRevealedSteps] = useState([]) // Progressive hints - array of revealed step indices
  const [solutionRevealed, setSolutionRevealed] = useState(false) // All steps shown
  const [feedback, setFeedback] = useState(null) // 'correct' | 'tryAgain' | null
  const [wrongAttempts, setWrongAttempts] = useState(0) // Auto-hint after 3 wrong attempts

  // Get type mapping for current problem
  const typeMapping = topicTypeMapping.mappings[problem.topic] || null

  // Strategy prompt state (when typePromptEnabled AND mapping exists)
  // Phase: 'strategy' | 'done' (type phase removed - user already knows type from topic selection)
  const [promptPhase, setPromptPhase] = useState(
    (typePromptEnabled && typeMapping) ? 'strategy' : 'done'
  )
  const [strategyPromptResult, setStrategyPromptResult] = useState(null) // true/false/null

  // Reset prompt phase when problem changes
  useEffect(() => {
    if (typePromptEnabled && typeMapping) {
      setPromptPhase('strategy')
      setStrategyPromptResult(null)
    } else {
      setPromptPhase('done')
    }
  }, [problem.id, typePromptEnabled, typeMapping])

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

  // Check answer using mathParser (ADR-017)
  const checkAnswer = () => {
    const adaptedProblem = adaptProblemForParser(problem)
    const result = evaluateAnswer(userAnswer, adaptedProblem)

    if (result.isCorrect) {
      setFeedback('correct')
      setTimeout(() => {
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
      setPromptPhase('strategy')
      setStrategyPromptResult(null)
    }
  }

  // Handle strategy prompt answer
  const handleStrategyPromptAnswer = (answer, isCorrect) => {
    setStrategyPromptResult(isCorrect)
    setTimeout(() => setPromptPhase('done'), 300)
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
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Progress bar */}
      {progress && (
        <div className="mb-3 px-4 pt-2">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-safe-blue transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Problem text and diagram */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 mx-4">
        {/* Diagram - if present */}
        {problem.diagram && (
          <DiagramRenderer diagram={problem.diagram} />
        )}

        <p className="text-lg text-slate-800 leading-relaxed">
          {problem.problem_cs}
        </p>
      </div>

      {/* Strategy prompt phase - SELECTION category */}
      {promptPhase === 'strategy' && typeMapping && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-20">
            {/* Show type label as context */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700">
              <TagIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{typeMapping.type_label}</span>
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
          {/* BottomBar - ADR-015 SELECTION */}
          <BottomBar
            slots={{
              1: { onClick: onExit },
              2: { onClick: onViewProgress },
              5: { action: 'skip', onClick: () => setPromptPhase('done') }
            }}
          />
        </>
      )}

      {/* Content area - scrollable with padding for fixed bottom bar */}
      {promptPhase === 'done' && (
      <div className="flex-1 flex flex-col overflow-auto px-4 pb-64">
        {/* Strategy result from prompt (shown in hint style) */}
        {typePromptEnabled && typeMapping && strategyPromptResult !== null && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 flex-shrink-0">
            <div className="flex items-start gap-3">
              <TagIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-indigo-800">
                  <span className="font-medium">Strategie:</span> {typeMapping.strategy}
                  <span className={`ml-2 ${strategyPromptResult ? 'text-green-600' : 'text-amber-600'}`}>
                    {strategyPromptResult ? '✓' : '○'}
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
              Správná odpověď: {formatAnswer(problem.answer)}{problem.answer_unit ? ` ${problem.answer_unit}` : ''}
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
                  disabled:opacity-50`}
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

      {/* Fixed bottom section - keyboard + BottomBar */}
      {promptPhase === 'done' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb">
          <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
            {/* Virtual keyboard - only on mobile, hidden when solution revealed or multiple choice */}
            {isMobile && !solutionRevealed && problem.type !== 'multiple_choice' && (
              <div className="grid grid-cols-5 gap-1 mb-2">
                {/* Row 1: 7 8 9 ÷ √ */}
                {['7', '8', '9', '/', '√'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserAnswer(prev => prev + (key === '√' ? '√(' : key))}
                    className={`h-11 rounded-xl text-base font-medium transition-gentle active:scale-95
                      ${key === '/' || key === '√' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                  >
                    {key === '/' ? '÷' : key}
                  </button>
                ))}
                {/* Row 2: 4 5 6 × x */}
                {['4', '5', '6', '*', 'x'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserAnswer(prev => prev + key)}
                    className={`h-11 rounded-xl text-base font-medium transition-gentle active:scale-95
                      ${key === '*' || key === 'x' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
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
                    className={`h-11 rounded-xl text-base font-medium transition-gentle active:scale-95
                      ${key === '-' || key === '(' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                  >
                    {key === '-' ? '−' : key}
                  </button>
                ))}
                {/* Row 4: 0 , ⌫ + ) */}
                <button
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + '0')}
                  className="h-11 rounded-xl text-base font-medium bg-slate-100 text-slate-800 transition-gentle active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + '.')}
                  className="h-11 rounded-xl text-base font-medium bg-slate-100 text-slate-800 transition-gentle active:scale-95"
                >
                  ,
                </button>
                <button
                  type="button"
                  onClick={() => setUserAnswer(prev => prev.slice(0, -1))}
                  className="h-11 rounded-xl text-base bg-red-50 text-red-600 transition-gentle active:scale-95"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + '+')}
                  className="h-11 rounded-xl text-base font-medium bg-purple-100 text-purple-700 transition-gentle active:scale-95"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setUserAnswer(prev => prev + ')')}
                  className="h-11 rounded-xl text-base font-medium bg-purple-100 text-purple-700 transition-gentle active:scale-95"
                >
                  )
                </button>
              </div>
            )}

            {/* Desktop symbol bar - math symbols only, hidden when solution revealed */}
            {!isMobile && !solutionRevealed && problem.type !== 'multiple_choice' && (
              <div className="flex gap-2 mb-2">
                {[
                  { symbol: 'x', display: 'x' },
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
                5: problem.type === 'multiple_choice'
                  ? { action: 'continue', onClick: handleContinueAfterSolution, disabled: !solutionRevealed }
                  : {
                      action: solutionRevealed ? 'continue' : 'submit',
                      onClick: solutionRevealed ? handleContinueAfterSolution : checkAnswer,
                      disabled: !solutionRevealed && !userAnswer.trim()
                    }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProblemCard
