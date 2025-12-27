import { UnifiedQuestion } from '../../types'

// Type distractor option
export interface TypeOption {
  id: string
  label: string
}

// TypeDrill question with generated distractors
export interface TypeDrillQuestion extends UnifiedQuestion {
  // Generated type distractors
  typeDistractors: TypeOption[]
  // Generated strategy distractors
  strategyDistractors: string[]
}

export interface TypeDrillResult {
  questionId: string
  typeCorrect: boolean
  typeAnswer: string | null
  strategyCorrect: boolean
  strategyAnswer: string | null
  timeSpent: number
  skipped?: boolean
}
