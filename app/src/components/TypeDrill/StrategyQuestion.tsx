import { useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { TypeDrillQuestion } from './types'

interface StrategyQuestionProps {
  question: TypeDrillQuestion
  typeWasCorrect: boolean
  onAnswer: (answer: string, isCorrect: boolean) => void
}

function StrategyQuestion({ question, typeWasCorrect, onAnswer }: StrategyQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)

  // UNIFIED FORMAT: Get strategy from solution
  const correctStrategy = question.solution.strategy || ''
  const typeLabel = question.meta.type_label || ''

  // Build options: correct + distractors, shuffled
  const options = [
    { value: correctStrategy, isCorrect: true },
    ...question.strategyDistractors.map(d => ({ value: d, isCorrect: false }))
  ].sort(() => Math.random() - 0.5)

  const handleSelect = (option: { value: string; isCorrect: boolean }) => {
    setSelected(option.value)

    // Brief delay to show selection
    setTimeout(() => {
      onAnswer(option.value, option.isCorrect)
      setSelected(null)
    }, 300)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Type result indicator */}
      <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
        typeWasCorrect ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}>
        {typeWasCorrect ? (
          <CheckCircleIcon className="w-5 h-5" />
        ) : (
          <ExclamationCircleIcon className="w-5 h-5" />
        )}
        <span className="text-sm">
          Typ: {typeLabel}
          {typeWasCorrect ? '' : ' (správná odpověď)'}
        </span>
      </div>

      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Jaká je správná strategie?
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`w-full p-4 rounded-xl text-left transition-gentle active:scale-[0.98]
              ${selected === option.value
                ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
              }
              disabled:opacity-50`}
          >
            <span className="font-mono">{option.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StrategyQuestion
