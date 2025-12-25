import { useState } from 'react'

function TypeQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)

  // Build options: correct + distractors, shuffled
  const options = [
    { id: question.type.correct, label: question.type.correct_label, isCorrect: true },
    ...question.type.distractors.map(d => ({ id: d.id, label: d.label, isCorrect: false }))
  ].sort(() => Math.random() - 0.5)

  const handleSelect = (option) => {
    setSelected(option.id)

    // Brief delay to show selection
    setTimeout(() => {
      onAnswer(option.id, option.isCorrect)
      setSelected(null)
    }, 300)
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Jaký je to typ úlohy?
      </h3>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200
              ${selected === option.id
                ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
              }
              disabled:opacity-70`}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TypeQuestion
