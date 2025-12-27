import { UnifiedQuestion } from '../../types'

// Lightning round question with shuffled answers
export interface LightningQuestion extends UnifiedQuestion {
  // Added property: shuffled answers for multiple choice
  shuffledAnswers: string[]
  // Display-formatted correct answer
  displayCorrect: string
}

export interface LightningResult {
  questionId: string
  selectedAnswer: string
  correct: boolean
  timeMs: number
}

export interface LightningStats {
  correct: number
  total: number
  avgTimeMs: number
  bestStreak: number
}
