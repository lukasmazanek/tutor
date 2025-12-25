import { useState } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

function StrategyQuestion({ question, typeWasCorrect, onAnswer }) {
  const [selected, setSelected] = useState(null)

  // Build options: correct + distractors, shuffled
  const options = [
    { value: question.strategy.correct, isCorrect: true },
    ...question.strategy.distractors.map(d => ({ value: d, isCorrect: false }))
  ].sort(() => Math.random() - 0.5)

  const handleSelect = (option) => {
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
          Typ: {question.type.correct_label}
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
            className={`w-full p-4 rounded-xl text-left transition-all duration-200
              ${selected === option.value
                ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
              }
              disabled:opacity-70`}
          >
            <span className="font-mono">{option.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StrategyQuestion
