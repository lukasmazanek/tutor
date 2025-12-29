/**
 * ADR-030: LightningRound Summary with Psychological Safety
 *
 * Uses shared SummaryCard component with effort-based metrics.
 * No percentages, no X/Y scores - just exploration count and streak.
 */

import { SummaryCard } from '../Summary'
import { LightningStats } from './types'

interface SummaryProps {
  stats: LightningStats
  onRestart: () => void
  onExit: () => void
  onViewProgress: () => void
}

function Summary({ stats, onRestart, onExit, onViewProgress }: SummaryProps) {
  // Focus on effort (total explored), not correctness
  const totalExplored = stats.total
  const streak = stats.bestStreak

  // Encouragement based on engagement, not score
  const getEncouragement = (): string => {
    if (streak >= 5) return 'Skvělá série! Tohle téma ti jde.'
    if (totalExplored >= 10) return 'Výborně! Hodně jsi toho prozkoumala.'
    return 'Každý pokus tě posouvá dál!'
  }

  return (
    <SummaryCard
      icon="bolt"
      title="Hotovo!"
      totalExplored={totalExplored}
      streak={streak}
      encouragement={getEncouragement()}
      onExit={onExit}
      onRestart={onRestart}
      onViewProgress={onViewProgress}
    />
  )
}

export default Summary
