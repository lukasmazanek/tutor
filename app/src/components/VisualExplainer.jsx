import { useState } from 'react'
import { LightBulbIcon } from '@heroicons/react/24/outline'

function VisualExplainer({ problem, onContinue }) {
  const [step, setStep] = useState(0)

  // Parse the problem to extract key info
  const isIncrease = problem.problem_cs.includes('více') ||
                     problem.problem_cs.includes('zvýšení') ||
                     problem.problem_cs.includes('přidáno') ||
                     problem.problem_cs.includes('zdražila')

  // Extract fraction from hints (e.g., "polovinu", "třetinu", "čtvrtinu")
  const fractionWords = {
    'polovin': { fraction: '1/2', blocks: 2, label: 'polovina' },
    'třetin': { fraction: '1/3', blocks: 3, label: 'třetina' },
    'čtvrtin': { fraction: '1/4', blocks: 4, label: 'čtvrtina' },
    'pětin': { fraction: '1/5', blocks: 5, label: 'pětina' }
  }

  let fractionInfo = { fraction: '1/2', blocks: 2, label: 'polovina' }
  for (const [key, value] of Object.entries(fractionWords)) {
    if (problem.problem_cs.toLowerCase().includes(key)) {
      fractionInfo = value
      break
    }
  }

  // Generate visual blocks
  const originalBlocks = Array(fractionInfo.blocks).fill('original')
  const changeBlock = isIncrease ? 'added' : 'removed'

  const steps = [
    {
      title: 'Původní hodnota',
      description: 'Začínáme s celou hodnotou',
      showOriginal: true,
      showChange: false,
      showResult: false
    },
    {
      title: `Co je ${fractionInfo.label}?`,
      description: `${fractionInfo.label} = jeden díl z ${fractionInfo.blocks}`,
      showOriginal: true,
      showChange: false,
      showResult: false,
      highlight: 0
    },
    {
      title: isIncrease ? `"O ${fractionInfo.label} více"` : `"O ${fractionInfo.label} méně"`,
      description: isIncrease
        ? `Přidáme ${fractionInfo.label} navíc`
        : `Odebereme ${fractionInfo.label}`,
      showOriginal: true,
      showChange: true,
      showResult: false
    },
    {
      title: 'Výsledek',
      description: isIncrease
        ? `Původní + ${fractionInfo.label} = ${fractionInfo.blocks + 1}/${fractionInfo.blocks} původního`
        : `Původní - ${fractionInfo.label} = ${fractionInfo.blocks - 1}/${fractionInfo.blocks} původního`,
      showOriginal: true,
      showChange: true,
      showResult: true
    }
  ]

  const currentStep = steps[step]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
          <LightBulbIcon className="w-4 h-4" />
          Vizuální nápověda
        </span>
        <h2 className="text-xl font-semibold text-slate-800 mt-1">
          {currentStep.title}
        </h2>
        <p className="text-slate-600 mt-1">{currentStep.description}</p>
      </div>

      {/* Visual representation */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm">
          {/* Original blocks */}
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Původní</p>
            <div className="flex gap-1">
              {originalBlocks.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-12 rounded-lg transition-all duration-300
                    ${currentStep.highlight === i
                      ? 'bg-purple-500 ring-2 ring-purple-300'
                      : 'bg-safe-blue'
                    }
                    ${!currentStep.showOriginal ? 'opacity-30' : ''}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Change visualization */}
          {(currentStep.showChange || step >= 2) && (
            <div className="mb-4 transition-all duration-300">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
                {isIncrease ? 'Přidáno' : 'Odebráno'}
              </p>
              <div className="flex gap-1">
                <div
                  className={`h-12 rounded-lg transition-all duration-300
                    ${isIncrease ? 'bg-green-500' : 'bg-red-400'}
                    ${currentStep.showChange ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{ width: `${100 / fractionInfo.blocks}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {currentStep.showResult && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Výsledek</p>
              <div className="flex gap-1">
                {isIncrease ? (
                  // Show original + 1 block
                  <>
                    {originalBlocks.map((_, i) => (
                      <div key={i} className="flex-1 h-12 rounded-lg bg-safe-blue" />
                    ))}
                    <div
                      className="h-12 rounded-lg bg-green-500"
                      style={{ width: `${100 / (fractionInfo.blocks + 1)}%` }}
                    />
                  </>
                ) : (
                  // Show original - 1 block (faded)
                  originalBlocks.slice(0, -1).map((_, i) => (
                    <div key={i} className="flex-1 h-12 rounded-lg bg-safe-blue" />
                  ))
                )}
              </div>
              <p className="text-center text-lg font-medium text-slate-700 mt-4">
                {isIncrease
                  ? `${fractionInfo.blocks + 1}/${fractionInfo.blocks} × původní`
                  : `${fractionInfo.blocks - 1}/${fractionInfo.blocks} × původní`
                }
              </p>
            </div>
          )}
        </div>

        {/* Key insight box */}
        {step === steps.length - 1 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 w-full max-w-sm">
            <p className="text-amber-800 text-sm">
              <strong>Klíčové:</strong> "{isIncrease ? 'O X více' : 'O X méně'}" =
              původní {isIncrease ? '+' : '-'} X z původního
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-4 px-6 rounded-xl bg-slate-200 text-slate-700
              font-medium touch-target transition-gentle active:scale-[0.98]"
          >
            Zpět
          </button>
        )}

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-4 px-6 rounded-xl bg-safe-blue text-white
              font-medium touch-target transition-gentle active:scale-[0.98]"
          >
            Další
          </button>
        ) : (
          <button
            onClick={onContinue}
            className="flex-1 py-4 px-6 rounded-xl bg-green-600 text-white
              font-medium touch-target transition-gentle active:scale-[0.98]"
          >
            Rozumím, pokračovat
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors
              ${i === step ? 'bg-safe-blue' : 'bg-slate-300'}
            `}
          />
        ))}
      </div>
    </div>
  )
}

export default VisualExplainer
