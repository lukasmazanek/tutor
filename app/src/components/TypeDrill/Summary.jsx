import { AcademicCapIcon } from '@heroicons/react/24/outline'

function Summary({ results, questions, onExit }) {
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
  const getMessage = () => {
    if (overallPercentage >= 90) return 'Skvělé! Typy i strategie máš výborně.'
    if (overallPercentage >= 70) return 'Dobrá práce! Většinu typů poznáváš správně.'
    if (overallPercentage >= 50) return 'Jdeš správným směrem. Pokračuj v tréninku!'
    if (typePercentage > strategyPercentage) return 'Typy poznáváš dobře, strategie ještě procvič.'
    if (strategyPercentage > typePercentage) return 'Strategie umíš, zaměř se na rozpoznávání typů.'
    return 'Nevadí, cvičení dělá mistra. Zkus to znovu!'
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Hotovo!</h1>
        <p className="text-slate-600 mt-2">{getMessage()}</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Overall score */}
          <div className="col-span-2 text-center pb-4 border-b border-slate-100">
            <div className="text-4xl font-bold text-indigo-600">{overallPercentage}%</div>
            <div className="text-slate-500 text-sm">Celková úspěšnost</div>
            <div className="text-slate-400 text-xs mt-1">
              (typ i strategie správně: {bothCorrect}/{totalQuestions})
            </div>
          </div>

          {/* Type accuracy */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-700">{typePercentage}%</div>
            <div className="text-slate-500 text-sm">Rozpoznání typu</div>
            <div className="text-slate-400 text-xs">{typeCorrect}/{totalQuestions}</div>
          </div>

          {/* Strategy accuracy */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-700">{strategyPercentage}%</div>
            <div className="text-slate-500 text-sm">Volba strategie</div>
            <div className="text-slate-400 text-xs">{strategyCorrect}/{totalQuestions}</div>
          </div>
        </div>

        {/* Average time */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <span className="text-slate-500 text-sm">Průměrný čas: </span>
          <span className="text-slate-700 font-medium">{avgTime}s</span>
        </div>
      </div>

      {/* Problem types breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="font-medium text-slate-700 mb-3">Výsledky podle úloh</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results.map((result, index) => {
            const question = questions.find(q => q.id === result.questionId)
            return (
              <div
                key={index}
                className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0"
              >
                <span className="text-slate-600 truncate flex-1 mr-2">
                  {question?.type.correct_label || 'Úloha ' + (index + 1)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={result.typeCorrect ? 'text-green-600' : 'text-amber-500'}>
                    {result.typeCorrect ? '✓' : '○'}
                  </span>
                  <span className={result.strategyCorrect ? 'text-green-600' : 'text-amber-500'}>
                    {result.strategyCorrect ? '✓' : '○'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <button
          onClick={onExit}
          className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl
            font-medium transition-gentle active:scale-[0.98]"
        >
          Zpět na úvod
        </button>
      </div>
    </div>
  )
}

export default Summary
