import { useState, useEffect } from 'react'
import typeDrillData from '../../data/drills/type_drill.json'
import TypeQuestion from './TypeQuestion'
import StrategyQuestion from './StrategyQuestion'
import Summary from './Summary'
import BottomBar from '../BottomBar'

function TypeDrill({ onExit, onViewProgress }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // Phase: 'type' | 'strategy' | 'feedback' | 'summary'
  const [phase, setPhase] = useState('type')
  const [results, setResults] = useState([])
  const [currentResult, setCurrentResult] = useState(null)

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Shuffle and pick 10 questions on mount
  useEffect(() => {
    const shuffled = [...typeDrillData.questions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.slice(0, 10))
    setQuestionStartTime(Date.now())
  }, [])

  const currentQuestion = questions[currentIndex]

  // Handle type answer
  const handleTypeAnswer = (answerId, isCorrect) => {
    setCurrentResult({
      questionId: currentQuestion.id,
      typeCorrect: isCorrect,
      typeAnswer: answerId,
      strategyCorrect: null,
      strategyAnswer: null,
      timeSpent: Date.now() - questionStartTime
    })

    // Move to strategy question
    setPhase('strategy')
  }

  // Handle strategy answer
  const handleStrategyAnswer = (answer, isCorrect) => {
    const finalResult = {
      ...currentResult,
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
    const skippedResult = {
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
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + (phase === 'strategy' || phase === 'feedback' ? 0.5 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* ZONE 2: Content (scrollable) */}
      <div className="flex-1 px-4 py-6 flex flex-col max-w-2xl mx-auto w-full pb-24">
        {/* Problem prompt */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-lg text-slate-800 leading-relaxed">
            {currentQuestion.prompt}
          </p>
        </div>

        {/* Question phases */}
        {phase === 'type' && (
          <TypeQuestion
            question={currentQuestion}
            onAnswer={handleTypeAnswer}
          />
        )}

        {phase === 'strategy' && (
          <StrategyQuestion
            question={currentQuestion}
            typeWasCorrect={currentResult?.typeCorrect}
            onAnswer={handleStrategyAnswer}
          />
        )}

        {phase === 'feedback' && (
          <div className="flex-1 flex flex-col">
            {/* Feedback display */}
            <div className={`rounded-xl p-4 ${
              currentResult?.typeCorrect && currentResult?.strategyCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="space-y-3">
                {/* Type result */}
                <div className="flex items-start gap-2">
                  <span className={currentResult?.typeCorrect ? 'text-green-600' : 'text-amber-600'}>
                    {currentResult?.typeCorrect ? '✓' : '○'}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">Typ: </span>
                    <span className={currentResult?.typeCorrect ? 'text-green-700' : 'text-amber-700'}>
                      {currentQuestion.type.correct_label}
                    </span>
                  </div>
                </div>

                {/* Strategy result */}
                <div className="flex items-start gap-2">
                  <span className={currentResult?.strategyCorrect ? 'text-green-600' : 'text-amber-600'}>
                    {currentResult?.strategyCorrect ? '✓' : '○'}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">Strategie: </span>
                    <span className={currentResult?.strategyCorrect ? 'text-green-700' : 'text-amber-700'}>
                      {currentQuestion.strategy.correct}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <p className="text-slate-600 text-sm">
                    {currentQuestion.explanation}
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
          // 3: null (empty - Tag toggle position)
          // 4: null (empty - Hint position)
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
