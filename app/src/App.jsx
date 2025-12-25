import { useState, useEffect } from 'react'
import { LightBulbIcon } from '@heroicons/react/24/outline'
import problemBank from './data/problem_bank.json'
import ProblemCard from './components/ProblemCard'
import SessionSummary from './components/SessionSummary'
import TopicSelector from './components/TopicSelector'
import VisualExplainer from './components/VisualExplainer'
import ProgressPage from './components/ProgressPage'
import LightningRound from './components/LightningRound'
import TypeDrill from './components/TypeDrill'

// Helper to get last session from localStorage
function getLastSession() {
  try {
    const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]')
    return progress.length > 0 ? progress[progress.length - 1] : null
  } catch {
    return null
  }
}

// Helper to get problem IDs that have been answered correctly (mastered)
function getMasteredProblemIds() {
  try {
    const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]')
    const mastered = new Set()

    for (const session of progress) {
      for (const attempt of session.attempts || []) {
        // Consider mastered if answered correctly without hints
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

// Helper to generate session problems based on topic
function generateSessionProblems(topicId) {
  const PROBLEMS_PER_SESSION = 6
  const mastered = getMasteredProblemIds()

  // Filter out mastered problems, but keep them as fallback if not enough new ones
  const filterProblems = (problems) => {
    const unmastered = problems.filter(p => !mastered.has(p.id))
    // If we have enough unmastered, use those; otherwise include mastered too
    return unmastered.length >= PROBLEMS_PER_SESSION ? unmastered : problems
  }

  if (topicId === 'mixed') {
    // Confidence sandwich: strength → strength → strength → challenge → strength → strength
    const equations = filterProblems(
      problemBank.problems.filter(p => p.topic === 'equations')
    )
    const oxVice = filterProblems(
      problemBank.problems.filter(p => p.topic === 'o_x_vice')
    )

    // Shuffle and pick
    const shuffledEq = [...equations].sort(() => Math.random() - 0.5)
    const shuffledOx = [...oxVice].sort(() => Math.random() - 0.5)

    return [
      shuffledEq[0],
      shuffledEq[1],
      shuffledEq[2],
      shuffledOx[0], // challenge
      shuffledEq[3],
      shuffledEq[4],
    ].filter(Boolean) // Remove undefined if not enough problems
  }

  // Single topic - get random problems, preferring unmastered
  const allTopicProblems = problemBank.problems.filter(p => p.topic === topicId)
  const unmasteredProblems = allTopicProblems.filter(p => !mastered.has(p.id))

  // Use unmastered if available, fall back to all if needed
  const problemPool = unmasteredProblems.length > 0 ? unmasteredProblems : allTopicProblems
  const shuffled = [...problemPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(PROBLEMS_PER_SESSION, shuffled.length))
}

function App() {
  // App state: 'topic_select' | 'session' | 'summary' | 'progress' | 'lightning' | 'typedrill'
  const [appState, setAppState] = useState('topic_select')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [sessionProblems, setSessionProblems] = useState([])
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [attempts, setAttempts] = useState([])
  const [lastSession, setLastSession] = useState(null)

  // Visual explainer state
  const [showExplainer, setShowExplainer] = useState(false)
  const [explainerShownFor, setExplainerShownFor] = useState(new Set())

  // Type prompt toggle (persisted in localStorage)
  const [typePromptEnabled, setTypePromptEnabled] = useState(() => {
    try {
      return localStorage.getItem('tutor_type_prompt') === 'true'
    } catch {
      return false
    }
  })

  const handleToggleTypePrompt = () => {
    const newValue = !typePromptEnabled
    setTypePromptEnabled(newValue)
    try {
      localStorage.setItem('tutor_type_prompt', String(newValue))
    } catch (e) {
      console.error('Failed to save type prompt setting:', e)
    }
  }

  // Load last session on mount
  useEffect(() => {
    setLastSession(getLastSession())
  }, [])

  const currentProblem = sessionProblems[currentProblemIndex]

  // Check if we should show visual explainer for this problem
  const shouldShowExplainer = () => {
    if (!currentProblem) return false
    if (currentProblem.topic !== 'o_x_vice') return false
    if (explainerShownFor.has(currentProblem.id)) return false
    // Only show for first o_x_vice problem in session
    const oxViceProblemsEncountered = sessionProblems
      .slice(0, currentProblemIndex + 1)
      .filter(p => p.topic === 'o_x_vice')
    return oxViceProblemsEncountered.length === 1
  }

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId)
    setSessionProblems(generateSessionProblems(topicId))
    setCurrentProblemIndex(0)
    setAttempts([])
    setAppState('session')
  }

  const handleAnswer = (attemptData) => {
    // Accept rich attempt data from ProblemCard
    const enrichedAttempt = {
      problemId: currentProblem.id,
      topic: currentProblem.topic,
      correct: attemptData.correct,
      timestamp: new Date().toISOString(),
      hintsUsed: attemptData.hintsUsed || 0,
      timeSpent: attemptData.timeSpent || 0
    }
    const newAttempts = [...attempts, enrichedAttempt]
    setAttempts(newAttempts)

    if (currentProblemIndex < sessionProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1)
      setShowExplainer(false)
    } else {
      // Save session to localStorage (pass newAttempts to avoid async state issue)
      saveSession(newAttempts)
      setAppState('summary')
    }
  }

  const saveSession = (finalAttempts) => {
    try {
      const existing = JSON.parse(localStorage.getItem('tutor_progress') || '[]')

      // Calculate session metrics for "závod sama se sebou"
      const sessionMetrics = {
        totalHintsUsed: finalAttempts.reduce((sum, a) => sum + (a.hintsUsed || 0), 0),
        problemsWithoutHints: finalAttempts.filter(a => (a.hintsUsed || 0) === 0).length,
        totalTimeSpent: finalAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
      }

      existing.push({
        date: new Date().toISOString(),
        topic: selectedTopic,
        problemsExplored: sessionProblems.length,
        sessionMetrics,
        attempts: finalAttempts
      })
      localStorage.setItem('tutor_progress', JSON.stringify(existing))
    } catch (e) {
      console.error('Failed to save progress:', e)
    }
  }

  const handleContinueFromExplainer = () => {
    setExplainerShownFor(new Set([...explainerShownFor, currentProblem.id]))
    setShowExplainer(false)
  }

  const handleNewSession = () => {
    setLastSession(getLastSession())
    setAppState('topic_select')
    setSelectedTopic(null)
    setSessionProblems([])
    setCurrentProblemIndex(0)
    setAttempts([])
    setShowExplainer(false)
    setExplainerShownFor(new Set())
  }

  const handleViewProgress = () => {
    setAppState('progress')
  }

  const handleStartLightning = () => {
    setAppState('lightning')
  }

  const handleStartTypeDrill = () => {
    setAppState('typedrill')
  }

  // Render based on app state
  if (appState === 'lightning') {
    return (
      <LightningRound
        onExit={handleNewSession}
      />
    )
  }

  if (appState === 'typedrill') {
    return (
      <TypeDrill
        onExit={handleNewSession}
        onViewProgress={handleViewProgress}
      />
    )
  }

  if (appState === 'progress') {
    return (
      <ProgressPage
        onBack={() => {
          setLastSession(getLastSession())
          setAppState('topic_select')
        }}
      />
    )
  }

  if (appState === 'topic_select') {
    return (
      <TopicSelector
        onSelectTopic={handleTopicSelect}
        lastSession={lastSession}
        onViewProgress={handleViewProgress}
        onStartLightning={handleStartLightning}
        onStartTypeDrill={handleStartTypeDrill}
      />
    )
  }

  if (appState === 'summary') {
    // Calculate session metrics for display
    const sessionMetrics = {
      totalHintsUsed: attempts.reduce((sum, a) => sum + (a.hintsUsed || 0), 0),
      problemsWithoutHints: attempts.filter(a => (a.hintsUsed || 0) === 0).length
    }

    return (
      <SessionSummary
        attempts={attempts}
        totalProblems={sessionProblems.length}
        topic={selectedTopic}
        sessionMetrics={sessionMetrics}
        onNewSession={handleNewSession}
        onViewProgress={handleViewProgress}
      />
    )
  }

  // Session view
  // Check if we should show explainer
  if (shouldShowExplainer() && !showExplainer && !explainerShownFor.has(currentProblem?.id)) {
    // First time seeing an o_x_vice problem - ask if they want help
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <LightBulbIcon className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Téma: "O X více/méně"
          </h2>
          <p className="text-slate-600 mb-6">
            Chceš nejdřív vidět vizuální vysvětlení, jak tyto úlohy fungují?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setExplainerShownFor(new Set([...explainerShownFor, currentProblem.id]))
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-200 text-slate-700
                font-medium transition-gentle active:scale-[0.98]"
            >
              Zkusím to
            </button>
            <button
              onClick={() => setShowExplainer(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-safe-blue text-white
                font-medium transition-gentle active:scale-[0.98]"
            >
              Ukaž mi
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showExplainer && currentProblem) {
    return (
      <VisualExplainer
        problem={currentProblem}
        onContinue={handleContinueFromExplainer}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-2 pb-6 flex flex-col">
      {/* Problem card - progress is shown inside ProblemCard's fixed header */}
      {currentProblem && (
        <ProblemCard
          problem={currentProblem}
          onAnswer={handleAnswer}
          progress={{ current: currentProblemIndex + 1, total: sessionProblems.length }}
          onExit={handleNewSession}
          onViewProgress={handleViewProgress}
          typePromptEnabled={typePromptEnabled}
          onToggleTypePrompt={handleToggleTypePrompt}
        />
      )}
    </div>
  )
}

export default App
