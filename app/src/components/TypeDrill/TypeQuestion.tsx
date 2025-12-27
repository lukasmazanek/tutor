import { useState } from 'react'
import { TypeDrillQuestion } from './types'

interface TypeQuestionProps {
  question: TypeDrillQuestion
  onAnswer: (answerId: string, isCorrect: boolean) => void
}

function TypeQuestion({ question, onAnswer }: TypeQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)

  // UNIFIED FORMAT: Build options from question meta + distractors
  const correctId = question.meta.type_id || ''
  const correctLabel = question.meta.type_label || ''

  const options = [
    { id: correctId, label: correctLabel, isCorrect: true },
    ...question.typeDistractors.map(d => ({ id: d.id, label: d.label, isCorrect: false }))
  ].sort(() => Math.random() - 0.5)

  const handleSelect = (option: { id: string; label: string; isCorrect: boolean }) => {
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
            className={`w-full p-4 rounded-xl text-left transition-gentle active:scale-[0.98]
              ${selected === option.id
                ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
              }
              disabled:opacity-50`}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TypeQuestion
