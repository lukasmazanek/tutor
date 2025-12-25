import { BoltIcon, ArrowPathIcon, HomeIcon, FireIcon, ClockIcon } from '@heroicons/react/24/solid'

function Summary({ stats, onRestart, onExit }) {
  const percentage = Math.round((stats.correct / stats.total) * 100)
  const avgTimeSeconds = (stats.avgTimeMs / 1000).toFixed(1)

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BoltIcon className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-800">Hotovo!</h1>
        </div>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-slate-800">
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
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
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
      </div>

      {/* Encouragement based on score */}
      <div className="bg-amber-50 rounded-xl p-4 mb-6 text-center">
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

      {/* Action buttons */}
      <div className="space-y-3 mt-auto">
        <button
          onClick={onRestart}
          className="w-full p-4 rounded-xl bg-amber-500 text-white font-medium
            flex items-center justify-center gap-2 transition-gentle active:scale-[0.98]"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Zkusit znovu
        </button>
        <button
          onClick={onExit}
          className="w-full p-4 rounded-xl bg-slate-200 text-slate-700 font-medium
            flex items-center justify-center gap-2 transition-gentle active:scale-[0.98]"
        >
          <HomeIcon className="w-5 h-5" />
          Hlavní menu
        </button>
      </div>
    </div>
  )
}

export default Summary
