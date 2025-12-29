/**
 * ADR-030: Shared Summary Card Component
 *
 * Psychological safety principles:
 * - Main metric = total explored (effort, not accuracy)
 * - No percentages or X/Y scores
 * - Hints framed positively
 * - Only positive comparisons
 * - Qualitative encouragement (not threshold-based)
 */

import { TrophyIcon, BoltIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/solid'
import BottomBar from '../BottomBar'

export type SummaryIcon = 'trophy' | 'bolt' | 'academic'

export interface TotalStatsData {
  problems: number
  sessions: number
}

export interface SummaryCardProps {
  // Identity
  icon: SummaryIcon
  title: string
  subtitle?: string

  // Main metric (always the same - effort based)
  totalExplored: number
  comparisonMessage?: string | null  // "+3 více než minule!"

  // Optional positive metrics
  streak?: number              // 🔥 for Lightning
  hintsHelped?: number         // 💡 for all modes
  totalStats?: TotalStatsData  // Cumulative progress

  // Custom encouragement (no percentage thresholds!)
  encouragement?: string

  // Actions
  onExit: () => void
  onRestart: () => void
  onViewProgress: () => void

  // ADR-031: Allow 'continue' action for SessionSummary
  actionType?: 'restart' | 'continue'
}

const ICONS = {
  trophy: TrophyIcon,
  bolt: BoltIcon,
  academic: AcademicCapIcon
}

const ICON_COLORS = {
  trophy: 'text-amber-500',
  bolt: 'text-amber-500',
  academic: 'text-indigo-600'
}

const ICON_BG = {
  trophy: '',
  bolt: '',
  academic: 'bg-indigo-100 rounded-full p-3'
}

function SummaryCard({
  icon,
  title,
  subtitle,
  totalExplored,
  comparisonMessage,
  streak,
  hintsHelped,
  totalStats,
  encouragement,
  onExit,
  onRestart,
  onViewProgress,
  actionType = 'restart'
}: SummaryCardProps) {
  const IconComponent = ICONS[icon]
  const iconColor = ICON_COLORS[icon]
  const iconBg = ICON_BG[icon]

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Scrollable centered content - ADR-015 CENTERED template */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={iconBg}>
              <IconComponent className={`w-12 h-12 sm:w-16 sm:h-16 ${iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-600 mb-6">{subtitle}</p>
          )}

          {/* Main metric: Total explored (effort-based) */}
          <div className="bg-safe-blue/10 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-safe-blue">
              {totalExplored}
            </div>
            <div className="text-sm text-blue-700">
              úloh prozkoumáno
            </div>
            {comparisonMessage && (
              <div className="text-sm text-green-600 mt-2 font-medium">
                {comparisonMessage}
              </div>
            )}
          </div>

          {/* Streak - only for Lightning */}
          {streak !== undefined && streak > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <FireIcon className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold text-amber-800">
                  {streak} v řadě!
                </span>
              </div>
              <div className="text-sm text-amber-700 mt-1">
                Nejdelší série
              </div>
            </div>
          )}

          {/* Hints helped - positive framing */}
          {hintsHelped !== undefined && hintsHelped > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">💡</span>
                <span className="font-medium text-purple-800">
                  Nápovědy ti pomohly
                </span>
              </div>
              <div className="text-sm text-purple-600">
                {hintsHelped}× ses díky nim naučila správný postup
              </div>
            </div>
          )}

          {/* Total stats - cumulative progress */}
          {totalStats && totalStats.problems > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="text-lg font-medium text-slate-700">
                {totalStats.problems} úloh celkem
              </div>
              <div className="text-sm text-slate-500">
                za {totalStats.sessions} cvičení
              </div>
            </div>
          )}

          {/* Encouragement - no percentage thresholds */}
          {encouragement && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-green-700">{encouragement}</p>
            </div>
          )}
        </div>
      </div>

      {/* BottomBar - ADR-015 */}
      <BottomBar
        slots={{
          1: { onClick: onExit },
          2: { onClick: onViewProgress },
          5: { action: actionType, onClick: onRestart }
        }}
      />
    </div>
  )
}

export default SummaryCard
