import questionsData from '../data/questions.json'
import { SparklesIcon, LightBulbIcon, ChartBarIcon, CheckCircleIcon, BoltIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { Session, QuestionsData, TopicMeta } from '../types'

const data = questionsData as QuestionsData

// Helper to get mastered problem IDs from localStorage
function getMasteredProblemIds(): Set<string> {
  try {
    const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]') as Session[]
    const mastered = new Set<string>()

    for (const session of progress) {
      for (const attempt of session.attempts || []) {
        if (attempt.correct && (attempt.hintsUsed || 0) === 0) {
          mastered.add(attempt.problemId)
        }
      }
    }

    return mastered
  } catch {
    return new Set()
  }
}

interface TopicSelectorProps {
  onSelectTopic: (topicId: string) => void
  lastSession: Session | null
  onViewProgress: () => void
  onStartLightning: () => void
  onStartTypeDrill: () => void
}

interface ProblemCount {
  total: number
  mastered: number
  remaining: number
}

function TopicSelector({ onSelectTopic, lastSession, onViewProgress, onStartLightning, onStartTypeDrill }: TopicSelectorProps) {
  const topics = Object.values(data.topics) as TopicMeta[]
  const mastered = getMasteredProblemIds()

  // ADR-022: Get numeric problems for counting (problems that support open answer input)
  const openProblems = data.questions.filter(q => q.modes.numeric)

  // Count problems per topic and mastered per topic
  const problemCounts = topics.reduce<Record<string, ProblemCount>>((acc, topic) => {
    const topicProblems = openProblems.filter(p => p.topic === topic.id)
    acc[topic.id] = {
      total: topicProblems.length,
      mastered: topicProblems.filter(p => mastered.has(p.id)).length,
      remaining: topicProblems.filter(p => !mastered.has(p.id)).length
    }
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50 px-3 sm:px-4 py-4 sm:py-6 flex flex-col">
      {/* Welcome back message */}
      {lastSession && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-slate-600 text-sm flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>
              Naposledy jsi prozkoumala {lastSession.problemsExplored} úloh
              <span className="text-slate-400 ml-1">
                ({new Date(lastSession.date).toLocaleDateString('cs-CZ')})
              </span>
            </span>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1 sm:mb-2">
          Co dnes prozkoumáme?
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Vyber si téma, které tě zajímá
        </p>
      </div>

      {/* Topic cards - 2 columns on all screens */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className="bg-white rounded-xl p-3 sm:p-5 shadow-sm text-left relative
              transition-gentle active:scale-[0.98] border-2 border-transparent
              hover:border-safe-blue/20 focus:border-safe-blue focus:outline-none"
          >
            {/* Labels - top right corner */}
            {(topic.is_strength || topic.is_critical) && (
              <div className="absolute top-2 right-2 flex gap-1">
                {topic.is_strength && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    síla
                  </span>
                )}
                {topic.is_critical && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    časté
                  </span>
                )}
              </div>
            )}

            <h2 className="text-lg font-medium text-slate-800 mb-1 pr-14">
              {topic.name_cs}
            </h2>
            <p className="text-sm text-slate-500">
              {problemCounts[topic.id].remaining > 0 ? (
                <>
                  {problemCounts[topic.id].remaining} nových úloh
                  {problemCounts[topic.id].mastered > 0 && (
                    <span className="text-green-600 ml-1">
                      ✓ {problemCounts[topic.id].mastered} zvládnuto
                    </span>
                  )}
                </>
              ) : (
                <span className="text-green-600">
                  ✓ Vše zvládnuto! ({problemCounts[topic.id].total} úloh)
                </span>
              )}
            </p>

            {/* Topic description - hidden on mobile to save space */}
            {topic.is_critical && (
              <p className="hidden sm:flex text-sm text-blue-600 mt-2 items-center gap-1">
                <LightBulbIcon className="w-4 h-4" />
                Časté na CERMATu
              </p>
            )}
          </button>
        ))}

        {/* Empty slot if odd number of topics */}
        {topics.length % 2 === 1 && <div />}

        {/* Lightning Round */}
        <button
          onClick={onStartLightning}
          className="bg-amber-50 rounded-xl p-3 sm:p-5 text-left
            transition-gentle active:scale-[0.98] border-2 border-amber-200
            hover:bg-amber-100 focus:border-amber-400 focus:outline-none"
        >
          <h2 className="text-base sm:text-lg font-medium text-amber-700 mb-0 sm:mb-1 flex items-center gap-2">
            <BoltIcon className="w-5 h-5" />
            Bleskové kolo
          </h2>
          <p className="hidden sm:block text-sm text-amber-600">
            o X více/méně
          </p>
        </button>

        {/* Type Recognition Drill */}
        <button
          onClick={onStartTypeDrill}
          className="bg-indigo-50 rounded-xl p-3 sm:p-5 text-left
            transition-gentle active:scale-[0.98] border-2 border-indigo-200
            hover:bg-indigo-100 focus:border-indigo-400 focus:outline-none"
        >
          <h2 className="text-base sm:text-lg font-medium text-indigo-700 mb-0 sm:mb-1 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5" />
            Rozpoznej typ
          </h2>
          <p className="hidden sm:block text-sm text-indigo-600">
            Typ + strategie
          </p>
        </button>

        {/* All topics option */}
        <button
          onClick={() => onSelectTopic('mixed')}
          className="bg-safe-blue/10 rounded-xl p-3 sm:p-5 text-left
            transition-gentle active:scale-[0.98] border-2 border-safe-blue/20
            hover:bg-safe-blue/20 focus:border-safe-blue focus:outline-none"
        >
          <h2 className="text-base sm:text-lg font-medium text-safe-blue mb-0 sm:mb-1 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            Mix všeho
          </h2>
          <p className="hidden sm:block text-sm text-slate-500">
            Náhodný výběr
          </p>
        </button>

        {/* Progress tracking - "závod sama se sebou" */}
        <button
          onClick={onViewProgress}
          className="bg-purple-50 rounded-xl p-3 sm:p-5 text-left
            transition-gentle active:scale-[0.98] border-2 border-purple-200
            hover:bg-purple-100 focus:border-purple-400 focus:outline-none"
        >
          <h2 className="text-base sm:text-lg font-medium text-purple-700 mb-0 sm:mb-1 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Můj pokrok
          </h2>
          <p className="hidden sm:block text-sm text-purple-500">
            Závod sama se sebou
          </p>
        </button>
      </div>
    </div>
  )
}

export default TopicSelector
