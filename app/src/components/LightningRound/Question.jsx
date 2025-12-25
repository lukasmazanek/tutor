import { FireIcon } from '@heroicons/react/24/solid'

function Question({ question, onAnswer, streak }) {
  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Streak indicator - only show when >= 3 */}
      {streak >= 3 && (
        <div className="flex items-center justify-center gap-1 mb-4">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <span className="text-orange-600 font-bold">{streak}</span>
        </div>
      )}

      {/* Question */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm">
          <p className="text-xl text-center text-slate-800 font-medium">
            {question.question}
          </p>
        </div>
      </div>

      {/* Answer buttons */}
      <div className="space-y-3 mt-6">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => onAnswer(answer)}
            className="w-full p-4 rounded-xl bg-white border-2 border-slate-200
              text-lg font-medium text-slate-700
              transition-gentle active:scale-[0.98] active:border-amber-400
              hover:border-amber-300 focus:border-amber-500 focus:outline-none"
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Question
