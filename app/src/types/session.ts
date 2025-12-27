/**
 * Session and progress tracking types
 * Used for localStorage data and component props
 */

// Single attempt at a problem
export interface SessionAttempt {
  problemId: string
  topic: string
  correct: boolean
  timestamp: string
  hintsUsed: number
  timeSpent: number
  usedFullSolution?: boolean
}

// Metrics for a session (závod sama se sebou)
export interface SessionMetrics {
  totalHintsUsed: number
  problemsWithoutHints: number
  totalTimeSpent?: number
}

// Complete session record (stored in localStorage)
export interface Session {
  date: string
  topic: string
  problemsExplored: number
  sessionMetrics: SessionMetrics
  attempts: SessionAttempt[]
}

// Progress tracking (aggregated from sessions)
export interface ProgressStats {
  totalSessions: number
  totalExplored: number
  totalWithoutHints: number
  hintIndependenceRate: number
}

// Result passed from ProblemCard to parent
export interface AttemptResult {
  correct: boolean
  hintsUsed: number
  timeSpent: number
  usedFullSolution?: boolean
}

// Progress indicator props
export interface ProgressIndicator {
  current: number
  total: number
}
