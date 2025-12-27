import { AcademicCapIcon } from '@heroicons/react/24/outline'
import BottomBar from '../BottomBar'
import { TypeDrillResult, TypeDrillQuestion } from './types'

interface SummaryProps {
  results: TypeDrillResult[]
  questions: TypeDrillQuestion[]
  onExit: () => void
  onViewProgress: () => void
  onRestart: () => void
}

function Summary({ results, questions: _questions, onExit, onViewProgress, onRestart }: SummaryProps) {
  // Calculate stats
  const totalQuestions = results.length
  const typeCorrect = results.filter(r => r.typeCorrect).length
  const strategyCorrect = results.filter(r => r.strategyCorrect).length
  const bothCorrect = results.filter(r => r.typeCorrect && r.strategyCorrect).length

  const typePercentage = Math.round((typeCorrect / totalQuestions) * 100)
  const strategyPercentage = Math.round((strategyCorrect / totalQuestions) * 100)
  const overallPercentage = Math.round((bothCorrect / totalQuestions) * 100)

  // Average time
  const avgTime = Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / totalQuestions / 1000 * 10) / 10

  // Encouraging message based on performance
  const getMessage = (): string => {
    if (overallPercentage >= 90) return 'Skvělé! Typy i strategie máš výborně.'
    if (overallPercentage >= 70) return 'Dobrá práce! Většinu typů poznáváš správně.'
    if (overallPercentage >= 50) return 'Jdeš správným směrem. Pokračuj v tréninku!'
    if (typePercentage > strategyPercentage) return 'Typy poznáváš dobře, strategie ještě procvič.'
    if (strategyPercentage > typePercentage) return 'Strategie umíš, zaměř se na rozpoznávání typů.'
    return 'Nevadí, cvičení dělá mistra. Zkus to znovu!'
  }

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Scrollable centered content - ADR-015 CENTERED template */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
          {/* Header */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full">
              <AcademicCapIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Hotovo!</h1>
          <p className="text-slate-600 mb-6">{getMessage()}</p>

          {/* Overall score */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-indigo-600">{overallPercentage}%</div>
            <div className="text-sm text-indigo-700">Celková úspěšnost</div>
            <div className="text-xs text-indigo-500 mt-1">
              (typ i strategie správně: {bothCorrect}/{totalQuestions})
            </div>
          </div>

          {/* Type & Strategy accuracy */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-semibold text-slate-700">{typePercentage}%</div>
              <div className="text-slate-500 text-xs">Rozpoznání typu</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-semibold text-slate-700">{strategyPercentage}%</div>
              <div className="text-slate-500 text-xs">Volba strategie</div>
            </div>
          </div>

          {/* Average time */}
          <div className="text-sm text-slate-500">
            Průměrný čas: <span className="text-slate-700 font-medium">{avgTime}s</span>
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
