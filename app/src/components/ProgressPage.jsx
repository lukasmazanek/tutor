import { useState, useMemo } from 'react'
import problemBank from '../data/problem_bank.json'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

function ProgressPage({ onBack }) {
  const [selectedTopic, setSelectedTopic] = useState('all')

  // Load progress data from localStorage
  const progressData = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('tutor_progress') || '[]')
      return raw
    } catch {
      return []
    }
  }, [])

  // Filter sessions by topic
  const filteredSessions = useMemo(() => {
    if (selectedTopic === 'all') return progressData
    return progressData.filter(s => s.topic === selectedTopic)
  }, [progressData, selectedTopic])

  // Calculate stats
  const stats = useMemo(() => {
    const sessions = filteredSessions
    const totalExplored = sessions.reduce((sum, s) => sum + (s.problemsExplored || 0), 0)
    const totalWithoutHints = sessions.reduce(
      (sum, s) => sum + (s.sessionMetrics?.problemsWithoutHints || 0), 0
    )
    const hintIndependenceRate = totalExplored > 0
      ? Math.round((totalWithoutHints / totalExplored) * 100)
      : 0

    return {
      totalSessions: sessions.length,
      totalExplored,
      totalWithoutHints,
      hintIndependenceRate
    }
  }, [filteredSessions])

  // Get topic name
  const getTopicName = (topicId) => {
    if (topicId === 'mixed') return 'Mix'
    return problemBank.topics[topicId]?.name_cs || topicId
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-200 transition-gentle"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-2xl font-semibold text-slate-800">
          Můj pokrok
        </h1>
      </div>

      {/* Topic filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-gentle
            ${selectedTopic === 'all'
              ? 'bg-safe-blue text-white'
              : 'bg-white text-slate-600 border border-slate-200'
            }`}
        >
          Vše
        </button>
        {Object.keys(problemBank.topics).map(topicId => (
          <button
            key={topicId}
            onClick={() => setSelectedTopic(topicId)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-gentle
              ${selectedTopic === topicId
                ? 'bg-safe-blue text-white'
                : 'bg-white text-slate-600 border border-slate-200'
              }`}
          >
            {problemBank.topics[topicId].name_cs}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-safe-blue">
            {stats.totalExplored}
          </div>
          <div className="text-sm text-slate-500">úloh prozkoumáno</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalSessions}
          </div>
          <div className="text-sm text-slate-500">cvičení</div>
        </div>

        {/* Hint independence - key metric */}
        <div className="col-span-2 bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalWithoutHints}
              </div>
              <div className="text-sm text-green-700">
                samostatně vyřešeno
              </div>
            </div>
            {stats.totalExplored > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {stats.hintIndependenceRate}%
                </div>
                <div className="text-xs text-green-600">
                  bez nápovědy
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      <ProgressTimeline sessions={filteredSessions} />

      {/* Session list */}
      <SessionList sessions={filteredSessions} getTopicName={getTopicName} formatDate={formatDate} />
    </div>
  )
}

// Progress timeline showing last 10 sessions
function ProgressTimeline({ sessions }) {
  const recentSessions = sessions.slice(-10)

  if (recentSessions.length < 2) {
    return (
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm text-center">
        <p className="text-slate-500">
          Pokračuj v práci a sleduj svůj růst!
        </p>
      </div>
    )
  }

  const maxProblems = Math.max(...recentSessions.map(s => s.problemsExplored || 0))

  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-600 mb-4">
        Poslední cvičení
      </h3>
      <div className="flex items-end gap-1 h-24">
        {recentSessions.map((session, i) => {
          const total = session.problemsExplored || 0
          const withoutHints = session.sessionMetrics?.problemsWithoutHints || 0
          const height = maxProblems > 0 ? (total / maxProblems) * 100 : 0
          const hintHeight = total > 0 ? (withoutHints / total) * height : 0

          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="w-full bg-safe-blue/30 rounded-t relative"
                style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
              >
                <div
                  className="absolute bottom-0 w-full bg-green-500 rounded-t"
                  style={{ height: `${hintHeight}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>Starší</span>
        <span>Dnes</span>
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-slate-500">Samostatně</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-safe-blue/30 rounded" />
          <span className="text-slate-500">S nápovědou</span>
        </div>
      </div>
    </div>
  )
}

// Session list
function SessionList({ sessions, getTopicName, formatDate }) {
  // Reverse to show newest first
  const orderedSessions = [...sessions].reverse()

  if (orderedSessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Zatím žádná cvičení. Začni prozkoumávat!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-600">
        Historie cvičení
      </h3>
      {orderedSessions.map((session, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-slate-800">
                {session.problemsExplored} úloh
              </div>
              <div className="text-sm text-slate-500">
                {getTopicName(session.topic)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">
                {session.sessionMetrics?.problemsWithoutHints || 0} samostatně
              </div>
              <div className="text-xs text-slate-400">
                {formatDate(session.date)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProgressPage
