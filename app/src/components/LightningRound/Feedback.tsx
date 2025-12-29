import { CheckIcon, LightBulbIcon, FireIcon } from '@heroicons/react/24/solid'
import DiagramRenderer from '../diagrams/DiagramRenderer'
import { LightningQuestion } from './types'

interface FeedbackProps {
  question: LightningQuestion
  selectedAnswer: string
  isCorrect: boolean
  streak: number
}

// Note: Continue button moved to BottomBar (ADR-009)
function Feedback({ question, selectedAnswer, isCorrect, streak }: FeedbackProps) {
  const originalType = question.meta.type_id || ''
  const isTypeRecognition = originalType === 'type_recognition'

  // UNIFIED FORMAT: Get hint data
  const hintRule = question.solution.strategy || ''
  const hintExplanation = question.hints[0] || ''

  if (isCorrect) {
    // Correct answer - minimal feedback, auto-advances
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-10 h-10 text-green-600" />
        </div>
        <p className={`text-2xl font-bold text-green-700 mb-2 ${isTypeRecognition ? 'font-mono' : ''}`}>
          {question.displayCorrect}
        </p>
        {streak >= 3 && (
          <div className="flex items-center gap-1 text-orange-500">
            <FireIcon className="w-5 h-5" />
            <span className="font-bold">{streak}</span>
          </div>
        )}
      </div>
    )
  }

  // Wrong answer - show question + hint (Continue button in BottomBar)
  const questionText = question.question.stem || question.question.context || ''

  return (
    <div className="flex-1 flex flex-col items-center p-4 pb-24 overflow-y-auto">
      {/* Original question + diagram */}
      <div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-sm mb-4">
        {question.diagram && (
          <DiagramRenderer diagram={question.diagram} />
        )}
        <p className={`text-lg text-center text-slate-800 font-medium ${isTypeRecognition ? 'font-mono' : ''}`}>
          {questionText}
        </p>
      </div>

      {/* What was answered vs correct */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm mb-4">
        <div className="text-center mb-4">
          <p className="text-slate-500 text-sm mb-1">Tvoje odpověď</p>
          <p className={`text-xl text-slate-400 line-through ${isTypeRecognition ? 'font-mono' : ''}`}>{selectedAnswer}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-1">Správně</p>
          <p className={`text-2xl font-bold text-green-600 ${isTypeRecognition ? 'font-mono' : ''}`}>{question.displayCorrect}</p>
        </div>
      </div>

      {/* Hint */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 w-full max-w-sm">
        <div className="flex items-start gap-3">
          <LightBulbIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-800 font-medium mb-1">
              {hintRule}
            </p>
            <p className="text-purple-600 text-sm">
              {hintExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback
