import { useMemo } from 'react'
import AnswerOptions, { AnswerOption } from '../AnswerOptions'
import { TypeDrillQuestion } from './types'

interface TypeQuestionProps {
  question: TypeDrillQuestion
  onAnswer: (answerId: string, isCorrect: boolean) => void
}

function TypeQuestion({ question, onAnswer }: TypeQuestionProps) {
  // UNIFIED FORMAT: Build options from type_recognition mode
  const options: AnswerOption[] = useMemo(() => {
    const typeRec = question.modes?.type_recognition
    const correctId = question.meta.type_id || ''
    // Use type_recognition.answer for label (more specific), fallback to meta.type_label
    const correctLabel = typeRec?.answer || question.meta.type_label || ''

    // Use distractors from type_recognition mode if available
    const distractors = typeRec?.distractors || []

    return [
      { id: correctId, label: correctLabel, isCorrect: true },
      ...distractors.map((d, i) => ({ id: `distractor-${i}`, label: d, isCorrect: false })),
      ...question.typeDistractors.map(d => ({ id: d.id, label: d.label, isCorrect: false }))
    ]
      .filter((opt, idx, arr) => arr.findIndex(o => o.label === opt.label) === idx) // dedupe by label
      .sort(() => Math.random() - 0.5)
  }, [question.id])

  const handleSelect = (option: AnswerOption) => {
    onAnswer(option.id, option.isCorrect)
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Jaký je to typ úlohy?
      </h3>

      {/* ADR-029: Centralized AnswerOptions component */}
      <AnswerOptions
        options={options}
        questionId={question.id}
        onSelect={handleSelect}
        mode="delayed"
      />
    </div>
  )
}

export default TypeQuestion
