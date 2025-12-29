/**
 * ADR-030: Session Summary with Psychological Safety
 * ADR-031: Uses SummaryCard (CENTERED template)
 *
 * Key principles:
 * - Main metric = total explored (effort)
 * - Hints reframed as positive learning tool
 * - No emphasis on "bez nápovědy" as success metric
 * - Only positive comparisons shown
 */

import questionsData from '../data/questions.json'
import SummaryCard from './Summary/SummaryCard'
import { SessionAttempt, SessionMetrics, Session, QuestionsData } from '../types'

const data = questionsData as QuestionsData

interface SessionSummaryProps {
  attempts: SessionAttempt[]
  totalProblems: number
  topic: string | null
  sessionMetrics: SessionMetrics
  onNewSession: () => void
  onViewProgress: () => void
  onHome?: () => void
}

function SessionSummary({ attempts, totalProblems: _totalProblems, topic, sessionMetrics: _sessionMetrics, onNewSession, onViewProgress, onHome }: SessionSummaryProps) {
  // Calculate metrics - focus on exploration, not correctness
  const totalExplored = attempts.length
  const correctWithHints = attempts.filter(a => a.hintsUsed > 0 && a.correct).length

  // Get topic name for display
  const topicName = topic === 'mixed'
    ? 'Mix všeho'
    : (topic && data.topics[topic]?.name_cs) || topic

  // Get comparison with previous same-topic session (only positive!)
  const getComparisonMessage = (): string | null => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]') as Session[]
      const sameTopic = progress.filter(s => s.topic === topic)
      const previousSame = sameTopic.length >= 2 ? sameTopic[sameTopic.length - 2] : null

      if (!previousSame) return null

      const prevExplored = previousSame.problemsExplored || 0
      const diff = totalExplored - prevExplored

      if (diff > 0) {
        return `+${diff} více než minule!`
      } else if (diff === 0 && prevExplored > 0) {
        return 'Stejně jako minule - stabilní!'
      }
      // If less, return nothing - no negative comparisons
      return null
    } catch {
      return null
    }
  }

  // Calculate total stats from localStorage
  const getTotalStats = (): { sessions: number; problems: number } => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]') as Session[]
      const totalProblemsEver = progress.reduce((sum, s) => sum + (s.problemsExplored || 0), 0)
      return {
        sessions: progress.length,
        problems: totalProblemsEver
      }
    } catch {
      return { sessions: 0, problems: 0 }
    }
  }

  const stats = getTotalStats()

  return (
    <SummaryCard
      icon="trophy"
      title="Skvělé prozkoumávání!"
      subtitle={topicName ? `Téma: ${topicName}` : undefined}
      totalExplored={totalExplored}
      comparisonMessage={getComparisonMessage()}
      hintsHelped={correctWithHints}
      totalStats={{ problems: stats.problems, sessions: stats.sessions }}
      onExit={onHome || onNewSession}
      onRestart={onNewSession}
      onViewProgress={onViewProgress}
      actionType="continue"
    />
  )
}

export default SessionSummary
