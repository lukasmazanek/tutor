import { BoltIcon, FireIcon, ClockIcon } from '@heroicons/react/24/solid'
import BottomBar from '../BottomBar'

function Summary({ stats, onRestart, onExit, onViewProgress }) {
  const percentage = Math.round((stats.correct / stats.total) * 100)
  const avgTimeSeconds = (stats.avgTimeMs / 1000).toFixed(1)

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Scrollable centered content - ADR-015 CENTERED template */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
          {/* Header */}
          <div className="flex justify-center mb-4">
            <BoltIcon className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Hotovo!</h1>

          {/* Score */}
          <div className="mb-4">
            <p className="text-4xl sm:text-5xl font-bold text-slate-800">
              {stats.correct} / {stats.total}
            </p>
            <div className="mt-3 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-slate-500 mt-2">{percentage} %</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm">Průměrný čas</span>
              </div>
              <p className="text-lg font-medium text-slate-700">{avgTimeSeconds}s</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <FireIcon className="w-4 h-4" />
                <span className="text-sm">Nejdelší série</span>
              </div>
              <p className="text-lg font-medium text-slate-700">{stats.bestStreak}</p>
            </div>
          </div>

          {/* Encouragement based on score */}
          <div className="bg-amber-50 rounded-xl p-4 mt-4">
            {percentage >= 80 ? (
              <p className="text-amber-700">
                Skvělá práce! Tohle téma ti jde.
              </p>
            ) : percentage >= 50 ? (
              <p className="text-amber-700">
                Dobrý základ! Zkus to znovu a uvidíš zlepšení.
              </p>
            ) : (
              <p className="text-amber-700">
                Nevadí! Každý pokus tě posouvá dál.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BottomBar - ADR-015 */}
      <BottomBar
        slots={{
          1: { onClick: onExit },
          2: { onClick: onViewProgress },
          5: { action: 'restart', onClick: onRestart }
        }}
      />
    </div>
  )
}

export default Summary
