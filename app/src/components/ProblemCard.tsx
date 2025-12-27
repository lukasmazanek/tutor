import { useState, useEffect } from 'react'
import { LightBulbIcon, TagIcon } from '@heroicons/react/24/outline'
import DiagramRenderer from './diagrams/DiagramRenderer'
import BottomBar from './BottomBar'
import topicTypeMapping from '../data/topic_type_mapping.json'
import { evaluateAnswer } from '@lib/mathParser'
import { UnifiedQuestion, TopicTypeMappingData } from '../types'
import { AttemptResult, ProgressIndicator } from '../types'

// Type the imported JSON
const mappingData = topicTypeMapping as TopicTypeMappingData

// Format answer for display (Czech locale for numbers)
function formatAnswer(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// Detect variable used in question (for dynamic keyboard)
function detectVariable(text: string): string {
  // Look for common variable patterns: (4n - 3), 3a, 2x, etc.
  // Order matters - check less common first
  const patterns = [
    /\d*[n]\b/i,  // n (as in 4n)
    /\d*[b]\b/i,  // b (as in 4b)
    /\d*[a]\b/i,  // a (as in 3a)
    /\d*[y]\b/i,  // y
    /\d*[x]\b/i,  // x (most common, check last)
  ]

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern)
      if (match) {
        // Extract just the letter
        const letter = match[0].replace(/\d/g, '').toLowerCase()
        if (letter) return letter
      }
    }
  }

  return 'x' // default
}

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

  // Check answer using mathParser (ADR-017)
  // NO ADAPTER NEEDED - mathParser now infers type from answer.value
  const checkAnswer = () => {
    const result = evaluateAnswer(userAnswer, {
      question: { originalValue: null },
      answer: problem.answer  // Pass UnifiedQuestion.answer directly
    })

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

  // UNIFIED FORMAT: Get display text
  const problemText = problem.question.context || problem.question.stem || ''
  const answerUnit = problem.answer.unit
  const variableKey = detectVariable(problemText)

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
        {problem.diagram && (
          <DiagramRenderer diagram={problem.diagram} />
        )}

        <p className="text-lg text-slate-800 leading-relaxed">
          {problemText}
        </p>
      </div>

      {/* Strategy prompt phase */}
      {promptPhase === 'strategy' && typeMapping && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-20">
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
          <BottomBar
            slots={{
              1: { onClick: onExit },
              2: { onClick: onViewProgress },
              5: { action: 'skip', onClick: () => setPromptPhase('done') }
            }}
          />
        </>
      )}

      {/* Content area */}
      {promptPhase === 'done' && (
      <div className="flex-1 flex flex-col overflow-auto px-4 pb-64">
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
        {solutionRevealed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-green-800 font-medium">
              Správná odpověď: {formatAnswer(problem.answer.value)}{answerUnit ? ` ${answerUnit}` : ''}
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
            {/* Virtual keyboard - mobile */}
            {isMobile && !solutionRevealed && (
              <div className="grid grid-cols-5 gap-1 mb-2">
                {['7', '8', '9', '/', answerUnit || '√'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserAnswer(prev => prev + (key === '√' ? '√(' : key))}
                    className={`h-11 rounded-xl text-base font-medium transition-gentle active:scale-95
                      ${key === '/' || key === '√' || key === answerUnit ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                  >
                    {key === '/' ? '÷' : key}
                  </button>
                ))}
                {['4', '5', '6', '*', variableKey].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserAnswer(prev => prev + key)}
                    className={`h-11 rounded-xl text-base font-medium transition-gentle active:scale-95
                      ${key === '*' || key === variableKey ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-800'}`}
                  >
                    {key === '*' ? '×' : key}
                  </button>
                ))}
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

            {/* Desktop symbol bar */}
            {!isMobile && !solutionRevealed && (
              <div className="flex gap-2 mb-2">
                {[
                  { symbol: variableKey, display: variableKey },
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
