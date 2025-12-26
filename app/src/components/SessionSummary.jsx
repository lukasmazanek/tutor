import questionsData from '../data/questions.json'
import { TrophyIcon } from '@heroicons/react/24/outline'
import BottomBar from './BottomBar'

function SessionSummary({ attempts, totalProblems, topic, sessionMetrics, onNewSession, onViewProgress, onHome }) {
  // Calculate total explored (not "correct" - that's judgmental)
  const totalExplored = attempts.length
  const problemsWithoutHints = sessionMetrics?.problemsWithoutHints || 0

  // Get topic name for display
  const topicName = topic === 'mixed'
    ? 'Mix všeho'
    : questionsData.topics[topic]?.name_cs || topic

  // Get comparison with previous same-topic session
  const getComparison = () => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]')
      // Get previous sessions of same topic (excluding current which was just saved)
      const sameTopic = progress.filter(s => s.topic === topic)
      // The last one in array is the current session, so get second to last
      const previousSame = sameTopic.length >= 2 ? sameTopic[sameTopic.length - 2] : null
      return { previousSame, totalSessions: progress.length }
    } catch {
      return { previousSame: null, totalSessions: 0 }
    }
  }

  const comparison = getComparison()

  // Calculate comparison with previous session (only show positive)
  const getComparisonMessage = () => {
    if (!comparison.previousSame?.sessionMetrics) return null
    const prevWithoutHints = comparison.previousSame.sessionMetrics.problemsWithoutHints || 0
    const diff = problemsWithoutHints - prevWithoutHints

    if (diff > 0) {
      return `+${diff} více samostatně než minule`
    } else if (diff === 0 && prevWithoutHints > 0) {
      return 'Stejně jako minule - stabilní!'
    }
    // If worse, return nothing - no negative comparisons
    return null
  }

  const comparisonMessage = getComparisonMessage()

  // Calculate total sessions from localStorage
  const getTotalStats = () => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]')
      const totalProblemsEver = progress.reduce((sum, s) => sum + (s.problemsExplored || 0), 0)
      const totalWithoutHints = progress.reduce(
        (sum, s) => sum + (s.sessionMetrics?.problemsWithoutHints || 0), 0
      )
      return {
        sessions: progress.length,
        problems: totalProblemsEver,
        withoutHints: totalWithoutHints
      }
    } catch {
      return { sessions: 0, problems: 0, withoutHints: 0 }
    }
  }

  const stats = getTotalStats()

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Scrollable centered content - ADR-015 CENTERED template */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
          {/* Celebration - not about score */}
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
            Skvělé prozkoumávání!
          </h1>

          <p className="text-slate-600 mb-6">
            Dnes jsi prozkoumala {totalExplored} {totalExplored === 1 ? 'úlohu' : totalExplored < 5 ? 'úlohy' : 'úloh'}
            {topicName && <span className="text-slate-400"> z tématu {topicName}</span>}
          </p>

          {/* Hint independence - key "závod sama se sebou" metric */}
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-green-600">
              {problemsWithoutHints}
            </div>
            <div className="text-sm text-green-700">
              samostatně (bez nápovědy)
            </div>
            {comparisonMessage && (
              <div className="text-sm text-green-600 mt-2 font-medium">
                {comparisonMessage}
              </div>
            )}
          </div>

          {/* Session stats */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-safe-blue">
              {totalExplored}
            </div>
            <div className="text-sm text-slate-500">
              prozkoumáno dnes
            </div>
          </div>

          {/* Total progress - "race against yourself" */}
          {stats.problems > 0 && (
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-lg font-medium text-purple-700">
                {stats.problems} úloh celkem
              </div>
              <div className="text-sm text-purple-500">
                za {stats.sessions} cvičení
              </div>
              {stats.withoutHints > 0 && (
                <div className="text-sm text-purple-600 mt-1">
                  {stats.withoutHints} samostatně
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BottomBar - ADR-015 */}
      <BottomBar
        slots={{
          1: { onClick: onHome || onNewSession },
          2: { onClick: onViewProgress },
          5: { action: 'continue', onClick: onNewSession }
        }}
      />
    </div>
  )
}

export default SessionSummary
