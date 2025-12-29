import { useState, useEffect } from 'react'
import { LightBulbIcon, TagIcon, CalculatorIcon } from '@heroicons/react/24/outline'
import QuestionDisplay from './QuestionDisplay'
import BottomBar from './BottomBar'
import PageHeader from './PageHeader'
import { getQuestionText } from '../lib/questionUtils'
import topicTypeMapping from '../data/topic_type_mapping.json'
import { evaluateAnswer } from '@lib/mathParser'
import { UnifiedQuestion, TopicTypeMappingData } from '../types'
import { AttemptResult, ProgressIndicator } from '../types'
import { saveAttempt } from '../hooks/useAttempts'

// ADR-031: Topic display names for header
const TOPIC_LABELS: Record<string, string> = {
  'o_x_vice': 'O X více/méně',
  'equations': 'Rovnice',
  'fractions': 'Zlomky',
  'pythagorean': 'Pythagorova věta',
  'sequences': 'Posloupnosti',
  'percents': 'Procenta',
  'geometry': 'Geometrie'
}

// Type the imported JSON
const mappingData = topicTypeMapping as TopicTypeMappingData

// Format answer for display (Czech locale for numbers)
function formatAnswer(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// ADR-022: Variable detection moved to data pipeline (keyboard.variable)
// This function is now a fallback only

interface ProblemCardProps {
  problem: UnifiedQuestion
  onAnswer: (result: AttemptResult) => void
  progress?: ProgressIndicator
  onExit: () => void
  onViewProgress: () => void
  typePromptEnabled: boolean
  onToggleTypePrompt: () => void
  skipStrategyPrompt: boolean
  onStrategyAnswered?: (topic: string) => void
}

type FeedbackType = 'correct' | 'tryAgain' | null
type PromptPhase = 'strategy' | 'done'

function ProblemCard({
  problem,
  onAnswer,
  progress,
  onExit,
  onViewProgress,
  typePromptEnabled,
  onToggleTypePrompt,
  skipStrategyPrompt,
  onStrategyAnswered
}: ProblemCardProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [revealedSteps, setRevealedSteps] = useState<number[]>([])
  const [solutionRevealed, setSolutionRevealed] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  // Get type mapping for current problem
  const typeMapping = mappingData.mappings[problem.topic] || null

  // Strategy prompt state
  const shouldShowStrategy = typePromptEnabled && typeMapping && !skipStrategyPrompt
  const [promptPhase, setPromptPhase] = useState<PromptPhase>(
    shouldShowStrategy ? 'strategy' : 'done'
  )
  const [strategyPromptResult, setStrategyPromptResult] = useState<boolean | null>(null)

  // Reset prompt phase when problem changes
  useEffect(() => {
    if (shouldShowStrategy) {
      setPromptPhase('strategy')
      setStrategyPromptResult(null)
    } else {
      setPromptPhase('done')
    }
  }, [problem.id, shouldShowStrategy])

  // Get hint source: prefer solution.steps, fallback to hints
  // UNIFIED FORMAT: problem.solution.steps instead of problem.solution_steps
  const hintSource = problem.solution.steps.length > 0 ? problem.solution.steps : problem.hints

  // Detect if on touch device (mobile)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
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

  useEffect(() => {
    setProblemStartTime(Date.now())
  }, [problem.id])

  // Check answer using mathParser (ADR-017, ADR-022)
  // Use modes.numeric for answer
  const checkAnswer = () => {
    if (!problem.modes.numeric) return // Safety check

    const result = evaluateAnswer(userAnswer, {
      question: { originalValue: null },
      answer: {
        value: problem.modes.numeric.answer,
        unit: problem.modes.numeric.unit || null
      }
    })

    if (result.isCorrect) {
      setFeedback('correct')
      // ADR-023: Save attempt to local cache
      saveAttempt({
        question_id: problem.id,
        question_stem: problemText,
        correct_answer: String(problem.modes.numeric.answer),
        topic: problem.topic,
        difficulty: problem.difficulty,
        user_answer: userAnswer,
        is_correct: true,
        mode: 'numeric',
        hints_used: revealedSteps.length,
        hints_shown: revealedSteps.map(i => hintSource[i]),
        time_spent_ms: Date.now() - problemStartTime
      })
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
    if (typePromptEnabled && typeMapping) {
      setPromptPhase('strategy')
      setStrategyPromptResult(null)
    }
  }

  const handleStrategyPromptAnswer = (_answer: string, isCorrect: boolean) => {
    setStrategyPromptResult(isCorrect)
    if (onStrategyAnswered) {
      onStrategyAnswered(problem.topic)
    }
    setTimeout(() => setPromptPhase('done'), 300)
  }

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

      if (newRevealed.length >= hintSource.length) {
        setSolutionRevealed(true)
      }
    }
  }

  const handleContinueAfterSolution = () => {
    onAnswer({
      correct: false,
      hintsUsed: revealedSteps.length,
      timeSpent: Date.now() - problemStartTime,
      usedFullSolution: true
    })
    resetState()
  }

  // ADR-022/029: Get display text and keyboard config
  const problemText = getQuestionText(problem)
  const answerUnit = problem.modes.numeric?.unit || null
  const variableKey = problem.keyboard.variable // From data, null = no variable key

  // ADR-031: Get topic display name for header
  const topicLabel = TOPIC_LABELS[problem.topic] || problem.topic

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* ADR-031: HEADER template - PageHeader with topic name */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            icon={CalculatorIcon}
            title={topicLabel}
            progress={progress ? { current: progress.current, total: progress.total } : undefined}
          />
        </div>
      </div>

      {/* Problem text and diagram - ADR-028, ADR-031: max-w-2xl for desktop */}
      <div className="max-w-2xl mx-auto w-full">
        <QuestionDisplay
          question={problem}
          className="bg-white rounded-2xl shadow-sm p-5 mb-4 mx-4 mt-4"
          textClassName="text-lg text-slate-800 leading-relaxed"
        />
      </div>

      {/* Strategy prompt phase */}
      {promptPhase === 'strategy' && typeMapping && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-20 max-w-2xl mx-auto w-full">
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
                    bg-white border-2 border-slate-200 text-slate-700 md:hover:border-indigo-300
                    active:scale-[0.98]"
                >
                  <span className="font-mono">{option.value}</span>
                </button>
              ))}
            </div>
          </div>
          <BottomBar
            slots={{
              1: { onClick: onExit },
              2: { onClick: onViewProgress },
              5: { action: 'skip', onClick: () => setPromptPhase('done') }
            }}
          />
        </>
      )}

      {/* Content area - ADR-031: max-w-2xl for desktop */}
      {promptPhase === 'done' && (
      <div className="flex-1 min-h-0 flex flex-col overflow-auto px-4 pb-64 max-w-2xl mx-auto w-full">
        {/* Strategy result */}
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

        {/* Progressive hints */}
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

        {/* Solution revealed */}
        {solutionRevealed && problem.modes.numeric && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-green-800 font-medium">
              Správná odpověď: {formatAnswer(problem.modes.numeric.answer)}{answerUnit ? ` ${answerUnit}` : ''}
            </p>
          </div>
        )}

        {/* Answer input */}
        {!solutionRevealed && (
        <div>
          <div className="mb-4">
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

            {answerUnit && (
              <span className="text-slate-500 text-sm mt-1 block">
                Odpověz v: {answerUnit}
              </span>
            )}
          </div>

          {/* Feedback */}
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

      {/* Fixed bottom section */}
      {promptPhase === 'done' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb">
          <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
            {/* Virtual keyboard - mobile (ADR-025: 3-block layout) */}
            {isMobile && !solutionRevealed && (() => {
              const hasExtras = variableKey || answerUnit

              // ADR-025: Block definitions
              // Block 1 (gray): Numbers + comma + delete - FIXED position
              // Block 2 (purple): Operators - FIXED position
              // Block 3 (teal): Extras (unit, variable) - OPTIONAL

              const handleKey = (key: string) => {
                if (key === '⌫') {
                  setUserAnswer(prev => prev.slice(0, -1))
                } else if (key === ',') {
                  setUserAnswer(prev => prev + '.')
                } else if (key === '√') {
                  setUserAnswer(prev => prev + '√(')
                } else if (key === '÷') {
                  setUserAnswer(prev => prev + '/')
                } else if (key === '×') {
                  setUserAnswer(prev => prev + '*')
                } else if (key === '−') {
                  setUserAnswer(prev => prev + '-')
                } else {
                  setUserAnswer(prev => prev + key)
                }
              }

              // Key style based on block
              const getKeyStyle = (key: string, block: 1 | 2 | 3) => {
                const base = 'h-11 rounded-xl text-base font-medium transition-gentle active:scale-95'
                if (key === '⌫') return `${base} bg-red-50 text-red-600`
                if (block === 1) return `${base} bg-slate-100 text-slate-800`
                if (block === 2) return `${base} bg-purple-100 text-purple-700`
                if (block === 3) return `${base} bg-teal-100 text-teal-700`
                return base
              }

              return (
                <div className={`grid gap-1 mb-2 ${hasExtras ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  {/* Row 1: Block1(7,8,9) Block2(÷,^) Block3([unit]) */}
                  <button type="button" onClick={() => handleKey('7')} className={getKeyStyle('7', 1)}>7</button>
                  <button type="button" onClick={() => handleKey('8')} className={getKeyStyle('8', 1)}>8</button>
                  <button type="button" onClick={() => handleKey('9')} className={getKeyStyle('9', 1)}>9</button>
                  <button type="button" onClick={() => handleKey('÷')} className={getKeyStyle('÷', 2)}>÷</button>
                  <button type="button" onClick={() => handleKey('^')} className={getKeyStyle('^', 2)}>^</button>
                  {hasExtras && (answerUnit
                    ? <button type="button" onClick={() => handleKey(answerUnit)} className={getKeyStyle(answerUnit, 3)}>{answerUnit}</button>
                    : <div />
                  )}

                  {/* Row 2: Block1(4,5,6) Block2(×,√) Block3([var]) */}
                  <button type="button" onClick={() => handleKey('4')} className={getKeyStyle('4', 1)}>4</button>
                  <button type="button" onClick={() => handleKey('5')} className={getKeyStyle('5', 1)}>5</button>
                  <button type="button" onClick={() => handleKey('6')} className={getKeyStyle('6', 1)}>6</button>
                  <button type="button" onClick={() => handleKey('×')} className={getKeyStyle('×', 2)}>×</button>
                  <button type="button" onClick={() => handleKey('√')} className={getKeyStyle('√', 2)}>√</button>
                  {hasExtras && (variableKey
                    ? <button type="button" onClick={() => handleKey(variableKey)} className={getKeyStyle(variableKey, 3)}>{variableKey}</button>
                    : <div />
                  )}

                  {/* Row 3: Block1(1,2,3) Block2(−,+) Block3(empty) */}
                  <button type="button" onClick={() => handleKey('1')} className={getKeyStyle('1', 1)}>1</button>
                  <button type="button" onClick={() => handleKey('2')} className={getKeyStyle('2', 1)}>2</button>
                  <button type="button" onClick={() => handleKey('3')} className={getKeyStyle('3', 1)}>3</button>
                  <button type="button" onClick={() => handleKey('−')} className={getKeyStyle('−', 2)}>−</button>
                  <button type="button" onClick={() => handleKey('+')} className={getKeyStyle('+', 2)}>+</button>
                  {hasExtras && <div />}

                  {/* Row 4: Block1(0,,,⌫) Block2((,)) Block3(empty) */}
                  <button type="button" onClick={() => handleKey('0')} className={getKeyStyle('0', 1)}>0</button>
                  <button type="button" onClick={() => handleKey(',')} className={getKeyStyle(',', 1)}>,</button>
                  <button type="button" onClick={() => handleKey('⌫')} className={getKeyStyle('⌫', 1)}>⌫</button>
                  <button type="button" onClick={() => handleKey('(')} className={getKeyStyle('(', 2)}>(</button>
                  <button type="button" onClick={() => handleKey(')')} className={getKeyStyle(')', 2)}>)</button>
                  {hasExtras && <div />}
                </div>
              )
            })()}

            {/* Desktop symbol bar - ADR-022: variableKey from data */}
            {!isMobile && !solutionRevealed && (
              <div className="flex gap-2 mb-2">
                {[
                  ...(variableKey ? [{ symbol: variableKey, display: variableKey }] : []),
                  { symbol: '√(', display: '√(' },
                  { symbol: '^', display: '^' },
                  { symbol: '(', display: '(' },
                  { symbol: ')', display: ')' },
                  ...(answerUnit ? [{ symbol: answerUnit, display: answerUnit }] : [])
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

            {/* Action buttons */}
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
        </div>
      )}
    </div>
  )
}

export default ProblemCard
