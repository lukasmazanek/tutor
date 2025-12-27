import { useState, useEffect } from 'react'
import questionsData from '../../data/questions.json'
import TypeQuestion from './TypeQuestion'
import StrategyQuestion from './StrategyQuestion'
import Summary from './Summary'
import BottomBar from '../BottomBar'
import { UnifiedQuestion, QuestionsData } from '../../types'
import { TypeDrillQuestion, TypeDrillResult, TypeOption } from './types'

const data = questionsData as QuestionsData

// Helper: Get type distractors - kept as helper function, not transformation
function getTypeDistractors(typeId: string | null): TypeOption[] {
  const distractorMap: Record<string, TypeOption[]> = {
    'WORD-OXVICE': [
      { id: 'NUM-PROC', label: 'Procenta' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ],
    'ALG-EQ': [
      { id: 'ALG-EXPR', label: 'Úprava výrazu' },
      { id: 'NUM-ZLOM', label: 'Zlomky' }
    ],
    'NUM-ZLOM': [
      { id: 'NUM-PROC', label: 'Procenta' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ],
    'GEOM-PYTH': [
      { id: 'GEOM-OBSAH', label: 'Obsah/obvod' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ]
  }
  return distractorMap[typeId || ''] || [{ id: 'OTHER', label: 'Jiný typ' }]
}

// Helper: Get strategy distractors
function getStrategyDistractors(topic: string): string[] {
  const map: Record<string, string[]> = {
    'o_x_vice': ['+ zlomek', '÷ zlomek'],
    'equations': ['Vytýkej', 'Rozlož'],
    'fractions': ['Násob přímo', 'Převrať'],
    'pythagorean': ['a + b', 'a × b']
  }
  return map[topic] || ['Jiná strategie']
}

// NO TRANSFORMATION FUNCTION - extend UnifiedQuestion inline
function prepareTypeDrillQuestion(q: UnifiedQuestion): TypeDrillQuestion {
  return {
    ...q,
    typeDistractors: getTypeDistractors(q.meta.type_id),
    strategyDistractors: getStrategyDistractors(q.topic)
  }
}

interface TypeDrillProps {
  onExit: () => void
  onViewProgress: () => void
}

function TypeDrill({ onExit, onViewProgress }: TypeDrillProps) {
  const [questions, setQuestions] = useState<TypeDrillQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // Phase: 'type' | 'strategy' | 'feedback' | 'summary'
  const [phase, setPhase] = useState<'type' | 'strategy' | 'feedback' | 'summary'>('type')
  const [results, setResults] = useState<TypeDrillResult[]>([])
  const [currentResult, setCurrentResult] = useState<TypeDrillResult | null>(null)

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Initialize questions
  const initQuestions = (): TypeDrillQuestion[] => {
    // ADR-022: Filter questions that support type_recognition mode
    const typeDrillQuestions = data.questions
      .filter(q => q.modes.type_recognition && q.question.context)
      .map(prepareTypeDrillQuestion)

    const shuffled = [...typeDrillQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  }

  // Shuffle and pick 10 questions on mount
  useEffect(() => {
    setQuestions(initQuestions())
    setQuestionStartTime(Date.now())
  }, [])

  // Restart handler
  const handleRestart = () => {
    setQuestions(initQuestions())
    setCurrentIndex(0)
    setPhase('type')
    setResults([])
    setCurrentResult(null)
    setQuestionStartTime(Date.now())
  }

  const currentQuestion = questions[currentIndex]

  // Handle type answer
  const handleTypeAnswer = (answerId: string, isCorrect: boolean) => {
    setCurrentResult({
      questionId: currentQuestion.id,
      typeCorrect: isCorrect,
      typeAnswer: answerId,
      strategyCorrect: false,
      strategyAnswer: null,
      timeSpent: Date.now() - questionStartTime
    })

    // Move to strategy question
    setPhase('strategy')
  }

  // Handle strategy answer
  const handleStrategyAnswer = (answer: string, isCorrect: boolean) => {
    const finalResult: TypeDrillResult = {
      ...currentResult!,
      strategyCorrect: isCorrect,
      strategyAnswer: answer,
      timeSpent: Date.now() - questionStartTime
    }

    setCurrentResult(finalResult)
    setResults([...results, finalResult])
    setPhase('feedback')
  }

  // Continue to next question
  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setPhase('type')
      setCurrentResult(null)
      setQuestionStartTime(Date.now())
    } else {
      setPhase('summary')
    }
  }

  // Skip current question (records as skipped)
  const handleSkip = () => {
    const skippedResult: TypeDrillResult = {
      questionId: currentQuestion.id,
      typeCorrect: false,
      typeAnswer: null,
      strategyCorrect: false,
      strategyAnswer: null,
      timeSpent: Date.now() - questionStartTime,
      skipped: true
    }
    setResults([...results, skippedResult])
    handleContinue()
  }

  // Auto-advance on correct answers
  useEffect(() => {
    if (phase === 'feedback' && currentResult?.typeCorrect && currentResult?.strategyCorrect) {
      const timer = setTimeout(handleContinue, 1200)
      return () => clearTimeout(timer)
    }
  }, [phase, currentResult])

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Načítám...</div>
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <Summary
        results={results}
        questions={questions}
        onExit={onExit}
        onViewProgress={onViewProgress}
        onRestart={handleRestart}
      />
    )
  }

  // UNIFIED FORMAT: Get question context
  const questionContext = currentQuestion.question.context || ''
  const typeLabel = currentQuestion.meta.type_label || ''
  const correctStrategy = currentQuestion.solution.strategy || ''
  const explanation = currentQuestion.hints[0] || ''

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* ZONE 1: Header (fixed) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-semibold">Rozpoznej typ</span>
            <span className="text-slate-400 text-sm">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-indigo-500 transition-gentle"
          style={{ width: `${((currentIndex + (phase === 'strategy' || phase === 'feedback' ? 0.5 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* ZONE 2: Content (scrollable) - ADR-010 mobile-safe pattern */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 flex flex-col max-w-2xl mx-auto w-full pb-20">
        {/* Problem prompt */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-lg text-slate-800 leading-relaxed">
            {questionContext}
          </p>
        </div>

        {/* Question phases */}
        {phase === 'type' && (
          <TypeQuestion
            question={currentQuestion}
            onAnswer={handleTypeAnswer}
          />
        )}

        {phase === 'strategy' && currentResult && (
          <StrategyQuestion
            question={currentQuestion}
            typeWasCorrect={currentResult.typeCorrect}
            onAnswer={handleStrategyAnswer}
          />
        )}

        {phase === 'feedback' && currentResult && (
          <div className="flex-1 flex flex-col">
            {/* Feedback display */}
            <div className={`rounded-xl p-4 ${
              currentResult.typeCorrect && currentResult.strategyCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="space-y-3">
                {/* Type result */}
                <div className="flex items-start gap-2">
                  <span className={currentResult.typeCorrect ? 'text-green-600' : 'text-amber-600'}>
                    {currentResult.typeCorrect ? '✓' : '○'}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">Typ: </span>
                    <span className={currentResult.typeCorrect ? 'text-green-700' : 'text-amber-700'}>
                      {typeLabel}
                    </span>
                  </div>
                </div>

                {/* Strategy result */}
                <div className="flex items-start gap-2">
                  <span className={currentResult.strategyCorrect ? 'text-green-600' : 'text-amber-600'}>
                    {currentResult.strategyCorrect ? '✓' : '○'}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">Strategie: </span>
                    <span className={currentResult.strategyCorrect ? 'text-green-700' : 'text-amber-700'}>
                      {correctStrategy}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <p className="text-slate-600 text-sm">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ZONE 3: Bottom bar - ADR-009 centralized */}
      <BottomBar
        slots={{
          1: { onClick: onExit },
          2: { onClick: onViewProgress },
          5: {
            action: phase === 'feedback' ? 'continue' : 'skip',
            onClick: phase === 'feedback' ? handleContinue : handleSkip
          }
        }}
      />
    </div>
  )
}

export default TypeDrill
