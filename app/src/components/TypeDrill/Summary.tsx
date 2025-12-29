/**
 * ADR-030: TypeDrill Summary with Psychological Safety
 *
 * Uses shared SummaryCard component with effort-based metrics.
 * No percentages, no X/Y scores - just exploration count.
 */

import { SummaryCard } from '../Summary'
import { TypeDrillResult, TypeDrillQuestion } from './types'

interface SummaryProps {
  results: TypeDrillResult[]
  questions: TypeDrillQuestion[]
  onExit: () => void
  onViewProgress: () => void
  onRestart: () => void
}

function Summary({ results, questions: _questions, onExit, onViewProgress, onRestart }: SummaryProps) {
  // Focus on effort (total explored), not correctness
  const totalExplored = results.length

  // Encouragement based on engagement, not score
  const getEncouragement = (): string => {
    if (totalExplored >= 8) return 'Skvělé prozkoumávání typů úloh!'
    if (totalExplored >= 5) return 'Dobrá práce! Učíš se rozpoznávat typy.'
    return 'Každý typ, který poznáš, tě posouvá dál!'
  }

  return (
    <SummaryCard
      icon="academic"
      title="Hotovo!"
      subtitle="Trénink rozpoznávání typů"
      totalExplored={totalExplored}
      encouragement={getEncouragement()}
      onExit={onExit}
      onRestart={onRestart}
      onViewProgress={onViewProgress}
    />
  )
}

export default Summary
