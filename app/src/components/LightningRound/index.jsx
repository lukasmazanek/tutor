import { useState } from 'react'
import { BoltIcon } from '@heroicons/react/24/solid'
import questionsData from '../../data/questions.json'
import Question from './Question'
import Feedback from './Feedback'
import Summary from './Summary'
import BottomBar from '../BottomBar'

const QUESTIONS_PER_ROUND = 10

// Format answer value for display (Czech locale for numbers)
function formatAnswerValue(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// Transform unified format to Lightning format for subcomponents
function toLightningFormat(q) {
  return {
    id: q.id,
    question: q.question.stem || q.question.context,
    correct: formatAnswerValue(q.answer.value),
    distractors: q.distractors,
    type: q.meta.original_type || 'calculation',
    hint: {
      rule: q.solution.strategy || '',
      explanation: q.hints[0] || ''
    }
  }
}

function LightningRound({ onExit, onViewProgress }) {
  const [phase, setPhase] = useState('playing') // 'playing' | 'feedback' | 'summary'
  const [questions, setQuestions] = useState(() => selectMixedQuestions())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [results, setResults] = useState([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now())

  // Shuffle correct answer with distractors
  function shuffleAnswers(correct, distractors) {
    const all = [correct, ...distractors]
    return all.sort(() => Math.random() - 0.5)
  }

  // Handle answer selection
  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentIndex]
    const correct = answer === currentQuestion.correct
    const timeMs = Date.now() - questionStartTime

    setSelectedAnswer(answer)
    setIsCorrect(correct)

    // Update streak
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
      }
    } else {
      setStreak(0)
    }

    // Record result
    setResults(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      correct,
      timeMs
    }])

    // Show feedback
    setPhase('feedback')

    // Auto-advance for correct answers
    if (correct) {
      setTimeout(() => {
        advanceToNext()
      }, 800)
    }
  }

  // Move to next question or summary
  const advanceToNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('summary')
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setPhase('playing')
      setQuestionStartTime(Date.now())
    }
  }

  // Handle "Pokračovat" button in feedback (for wrong answers)
  const handleContinue = () => {
    advanceToNext()
  }

  // Select mixed questions with guaranteed type mix
  function selectMixedQuestions() {
    // Filter only MC-capable questions from unified format
    const mcQuestions = questionsData.questions
      .filter(q => q.meta.supports_mc)
      .map(toLightningFormat)

    // Separate questions by type to ensure mix
    const typeQuestions = mcQuestions.filter(q =>
      q.type === 'type_recognition' || q.type === 'problem_type'
    )
    const calcQuestions = mcQuestions.filter(q =>
      q.type !== 'type_recognition' && q.type !== 'problem_type'
    )

    // Shuffle each pool
    const shuffledType = [...typeQuestions].sort(() => Math.random() - 0.5)
    const shuffledCalc = [...calcQuestions].sort(() => Math.random() - 0.5)

    // Pick 3 type questions and 7 calc questions
    const typeCount = Math.min(3, shuffledType.length)
    const calcCount = QUESTIONS_PER_ROUND - typeCount

    const selectedType = shuffledType.slice(0, typeCount)
    const selectedCalc = shuffledCalc.slice(0, calcCount)

    // Combine and shuffle final selection
    const selected = [...selectedType, ...selectedCalc].sort(() => Math.random() - 0.5)

    // Shuffle answer order for each question
    return selected.map(q => ({
      ...q,
      answers: shuffleAnswers(q.correct, q.distractors)
    }))
  }

  // Restart with new questions
  const handleRestart = () => {
    setQuestions(selectMixedQuestions())
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setResults([])
    setStreak(0)
    setBestStreak(0)
    setPhase('playing')
    setQuestionStartTime(Date.now())
  }

  // Calculate summary stats
  const getSummaryStats = () => {
    const correctCount = results.filter(r => r.correct).length
    const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0)
    const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0

    return {
      correct: correctCount,
      total: results.length,
      avgTimeMs: avgTime,
      bestStreak
    }
  }

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <BoltIcon className="w-12 h-12 text-amber-500 animate-pulse" />
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-slate-700">Bleskové kolo</span>
            </div>
            {phase !== 'summary' && (
              <span className="text-slate-500 text-sm">
                {currentIndex + 1}/{questions.length}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {phase !== 'summary' && (
            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-gentle"
                style={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-y-auto max-w-2xl mx-auto w-full pb-20">
        {phase === 'playing' && (
          <Question
            question={currentQuestion}
            onAnswer={handleAnswer}
            streak={streak}
          />
        )}

        {phase === 'feedback' && (
          <Feedback
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
            streak={streak}
          />
        )}

        {phase === 'summary' && (
          <Summary
            stats={getSummaryStats()}
            onRestart={handleRestart}
            onExit={onExit}
            onViewProgress={onViewProgress}
          />
        )}
      </div>

      {/* Bottom bar - ADR-009 centralized (except in summary - it has its own) */}
      {phase !== 'summary' && (
        <BottomBar
          slots={{
            1: { onClick: onExit },
            2: { onClick: onViewProgress },
            // 3: Toggle - not applicable
            // 4: Hint - not applicable
            5: phase === 'feedback' && !isCorrect
              ? { action: 'continue', onClick: handleContinue }
              : null
          }}
        />
      )}
    </div>
  )
}

export default LightningRound
