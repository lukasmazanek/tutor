import { useState } from 'react'
import { BoltIcon } from '@heroicons/react/24/solid'
import questionsData from '../../data/questions.json'
import Question from './Question'
import Feedback from './Feedback'
import Summary from './Summary'
import PageLayout from '../PageLayout'
import PageHeader from '../PageHeader'
import { UnifiedQuestion, QuestionsData } from '../../types'
import { LightningQuestion, LightningResult, LightningStats } from './types'
import { saveAttempt, saveError, startSession, endSession } from '../../hooks/useAttempts'

const data = questionsData as QuestionsData
const QUESTIONS_PER_ROUND = 10

// Format answer value for display (Czech locale for numbers)
function formatAnswerValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// Shuffle correct answer with distractors
function shuffleAnswers(correct: string, distractors: string[]): string[] {
  const all = [correct, ...distractors]
  return all.sort(() => Math.random() - 0.5)
}

// ADR-022: Extend UnifiedQuestion with display data using modes.numeric
function prepareLightningQuestion(q: UnifiedQuestion): LightningQuestion {
  const numericMode = q.modes.numeric
  if (!numericMode) throw new Error(`Question ${q.id} has no numeric mode`)

  const displayCorrect = formatAnswerValue(numericMode.answer)
  return {
    ...q,
    displayCorrect,
    shuffledAnswers: shuffleAnswers(displayCorrect, numericMode.distractors || [])
  }
}

interface LightningRoundProps {
  onExit: () => void
  onViewProgress: () => void
}

function LightningRound({ onExit, onViewProgress }: LightningRoundProps) {
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'summary'>('playing')
  const [questions, setQuestions] = useState<LightningQuestion[]>(() => {
    // ADR-023: Start session when lightning round begins
    startSession('lightning')
    return selectMixedQuestions()
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [results, setResults] = useState<LightningResult[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now())

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex]
    const correct = answer === currentQuestion.displayCorrect
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

    // ADR-023: Save attempt to local cache
    saveAttempt({
      question_id: currentQuestion.id,
      question_stem: currentQuestion.question.context || currentQuestion.question.stem || '',
      correct_answer: currentQuestion.displayCorrect,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      user_answer: answer,
      is_correct: correct,
      mode: 'lightning',
      hints_used: 0,
      hints_shown: [],
      time_spent_ms: timeMs
    })

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
      // ADR-023: End session when lightning round completes
      endSession()
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

  // Report error - save to queue and skip to next question
  const handleReportError = async () => {
    const currentQuestion = questions[currentIndex]
    const questionText = currentQuestion.question.context || currentQuestion.question.stem || ''

    await saveError({
      question_id: currentQuestion.id,
      question_stem: questionText,
      correct_answer: currentQuestion.displayCorrect,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      user_answer: selectedAnswer,
      hints_shown: [],
      time_spent_ms: Date.now() - questionStartTime
    })

    // Skip to next question
    advanceToNext()
  }

  // Select mixed questions with guaranteed type mix
  function selectMixedQuestions(): LightningQuestion[] {
    // ADR-022: Filter questions that have numeric mode with distractors (MC-capable)
    const mcQuestions = data.questions
      .filter(q => q.modes.numeric && (q.modes.numeric.distractors?.length || 0) >= 2)
      .map(prepareLightningQuestion)

    // Shuffle and pick
    const shuffled = [...mcQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, QUESTIONS_PER_ROUND)
  }

  // Restart with new questions
  const handleRestart = () => {
    // ADR-023: Start new session for restart
    startSession('lightning')
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
  const getSummaryStats = (): LightningStats => {
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

  // ADR-031: Summary uses CENTERED template (SummaryCard has its own layout)
  if (phase === 'summary') {
    return (
      <Summary
        stats={getSummaryStats()}
        onRestart={handleRestart}
        onExit={onExit}
        onViewProgress={onViewProgress}
      />
    )
  }

  // ADR-031: Playing/Feedback use HEADER template
  return (
    <PageLayout
      header={
        <PageHeader
          icon={BoltIcon}
          title="Bleskové kolo"
          progress={{ current: currentIndex + 1, total: questions.length }}
          iconColor="text-amber-500"
          progressColor="bg-amber-500"
        />
      }
      bottomBar={{
        1: { onClick: onExit },
        2: { onClick: onViewProgress },
        3: { action: 'error', onClick: handleReportError },
        5: phase === 'feedback' && !isCorrect
          ? { action: 'continue', onClick: handleContinue }
          : undefined
      }}
    >
      {phase === 'playing' && (
        <Question
          question={currentQuestion}
          onAnswer={handleAnswer}
          streak={streak}
        />
      )}

      {phase === 'feedback' && selectedAnswer !== null && isCorrect !== null && (
        <Feedback
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          streak={streak}
        />
      )}
    </PageLayout>
  )
}

export default LightningRound
