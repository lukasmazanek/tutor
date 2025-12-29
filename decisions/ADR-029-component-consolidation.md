# ADR-029: Component Consolidation Refactoring

## Status
Implemented (2025-12-29)

## Date
2025-12-29

## Context

Architectural review revealed multiple instances of duplicated code patterns across components. This creates:
- **Maintenance burden** - changes require edits in multiple files
- **Bug risk** - easy to forget updating one location (e.g., diagram rendering)
- **Inconsistency** - slightly different implementations across components

### Identified Patterns

| Pattern | Occurrences | Impact |
|---------|-------------|--------|
| Question text extraction | 5 files | High |
| Page layout structure | 9 files | High |
| Card CSS classes | 8+ files | Medium |
| Solution data access | 3 files | Medium |
| Answer option buttons | 3 files | Medium |
| Question timer state | 3 files | Medium |
| Streak display | 3 files | Low |
| Percentage calculation | 5 files | Low |

## Decision

### Phase 1: Core Abstractions (High Priority)

#### 1.1 QuestionDisplay Component (ADR-028)
```tsx
// components/QuestionDisplay.tsx
interface QuestionDisplayProps {
  question: { question: { stem?: string; context?: string }; diagram?: DiagramConfig }
  className?: string
}

function QuestionDisplay({ question, className }: QuestionDisplayProps) {
  const text = question.question.context || question.question.stem || ''
  return (
    <div className={className}>
      {question.diagram && <DiagramRenderer diagram={question.diagram} />}
      <p>{text}</p>
    </div>
  )
}
```

**Replaces in:** ProblemCard, LightningRound/Question, LightningRound/Feedback, TypeDrill

#### 1.2 PageLayout Component
```tsx
// components/PageLayout.tsx
interface PageLayoutProps {
  header?: ReactNode
  children: ReactNode
  bottomBar?: BottomBarProps
  className?: string
}

function PageLayout({ header, children, bottomBar, className }: PageLayoutProps) {
  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {header}
      <main className={cn("flex-1 min-h-0 overflow-y-auto pb-20", className)}>
        {children}
      </main>
      {bottomBar && <BottomBar slots={bottomBar} />}
    </div>
  )
}
```

**Replaces in:** ProblemCard, VisualExplainer, LightningRound/index, TypeDrill/index, ProgressPage, SessionSummary, LightningRound/Summary, TypeDrill/Summary

#### 1.3 Question Text Utility
```tsx
// lib/questionUtils.ts
export function getQuestionText(question: { question: { stem?: string; context?: string } }): string {
  return question.question.context || question.question.stem || ''
}
```

**Replaces in:** ProblemCard, VisualExplainer, LightningRound/Question, LightningRound/Feedback, TypeDrill/index

### Phase 2: UI Components (Medium Priority)

#### 2.1 Tailwind Constants
```tsx
// constants/styles.ts
export const CARD = {
  base: 'bg-white rounded-2xl shadow-sm',
  sm: 'bg-white rounded-2xl shadow-sm p-4',
  md: 'bg-white rounded-2xl shadow-sm p-5',
  lg: 'bg-white rounded-2xl shadow-sm p-6',
  centered: 'bg-white rounded-2xl shadow-sm p-6 max-w-sm w-full text-center'
}

export const BUTTON = {
  option: `w-full p-3 rounded-xl bg-white border-2 border-slate-200
    text-base font-medium text-slate-700
    transition-gentle active:scale-[0.98]`,
  optionSelected: 'bg-indigo-100 border-indigo-400 text-indigo-800'
}
```

#### 2.2 AnswerOptions Component
```tsx
// components/AnswerOptions.tsx
interface AnswerOptionsProps {
  options: string[]
  questionId: string
  onSelect: (answer: string) => void
  disabled?: boolean
  className?: string
}

function AnswerOptions({ options, questionId, onSelect, disabled }: AnswerOptionsProps) {
  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <button
          key={`${questionId}-${index}`}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={BUTTON.option}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
```

**Replaces in:** LightningRound/Question, TypeDrill/StrategyQuestion, TypeDrill/TypeQuestion

#### 2.3 Solution Data Utility
```tsx
// lib/questionUtils.ts
export function getSolutionData(question: UnifiedQuestion) {
  return {
    strategy: question.solution.strategy || '',
    steps: question.solution.steps || [],
    hints: question.hints || []
  }
}
```

### Phase 3: Hooks & Utilities (Lower Priority)

#### 3.1 useQuestionTimer Hook
```tsx
// hooks/useQuestionTimer.ts
export function useQuestionTimer(questionId?: string) {
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    setStartTime(Date.now())
  }, [questionId])

  const getElapsed = () => Date.now() - startTime

  return { startTime, getElapsed }
}
```

#### 3.2 StreakBadge Component
```tsx
// components/StreakBadge.tsx
function StreakBadge({ streak, threshold = 3 }: { streak: number; threshold?: number }) {
  if (streak < threshold) return null
  return (
    <div className="flex items-center gap-1">
      <FireIcon className="w-5 h-5 text-orange-500" />
      <span className="text-orange-600 font-bold">{streak}</span>
    </div>
  )
}
```

#### 3.3 Percentage Utility
```tsx
// lib/mathUtils.ts
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
```

## Implementation Plan

### Phase 1 (Core) ✅ COMPLETE
1. ✅ ADR-028: QuestionDisplay component
2. ✅ Create `lib/questionUtils.ts` with `getQuestionText()` and `getSolutionData()`
3. ✅ Create `PageLayout` component
4. ✅ Refactor ProblemCard, LightningRound, TypeDrill, VisualExplainer

### Phase 2 (UI) ✅ COMPLETE
5. ✅ Create `constants/styles.ts` with CARD, BUTTON, STATUS constants
6. ✅ Create `AnswerOptions` component
7. ✅ Refactor TypeDrill/TypeQuestion and StrategyQuestion

### Phase 3 (Hooks) ✅ COMPLETE
8. ✅ Create `useQuestionTimer` hook
9. ✅ Create `StreakBadge` component
10. ✅ Create `lib/mathUtils.ts` with calculatePercentage, formatTimeSeconds, calculateAverage
11. ✅ Refactor LightningRound and TypeDrill summaries

## File Structure After Refactoring

```
app/src/
├── components/
│   ├── PageLayout.tsx          # NEW - page structure
│   ├── QuestionDisplay.tsx     # NEW - question + diagram
│   ├── AnswerOptions.tsx       # NEW - multiple choice
│   ├── StreakBadge.tsx         # NEW - streak indicator
│   ├── BottomBar/              # existing
│   ├── diagrams/               # existing
│   ├── LightningRound/         # refactored
│   ├── TypeDrill/              # refactored
│   └── ...
├── constants/
│   ├── bottomBar.ts            # existing
│   └── styles.ts               # NEW - Tailwind constants
├── hooks/
│   ├── useAttempts.ts          # existing
│   └── useQuestionTimer.ts     # NEW
└── lib/
    ├── mathParser.ts           # existing
    ├── questionUtils.ts        # NEW
    └── mathUtils.ts            # NEW
```

## Consequences

### Positive
- **Single source of truth** for each pattern
- **Easier maintenance** - change once, applies everywhere
- **Reduced bug risk** - can't forget to add diagram support
- **Consistent UI** - same styling across all components
- **Better DX** - new pages are simpler to create

### Negative
- Initial refactoring effort
- More files to navigate (mitigated by clear naming)
- Slight learning curve for new patterns

### Metrics
- Lines of duplicated code reduced by ~40%
- Number of files touched for "add diagram" type changes: 1 instead of 4+
- New page creation: ~50% less boilerplate

## Related ADRs
- ADR-009: Centralized BottomBar (existing pattern to follow)
- ADR-028: QuestionDisplay Component (first step)
- ADR-010: Mobile-Safe Layout (constraints for PageLayout)

## Testing Checklist

After each phase, verify:
- [ ] All existing flows work unchanged
- [ ] No visual regressions
- [ ] Mobile layout intact (ADR-010)
- [ ] BottomBar still functions (ADR-009)
- [ ] Diagrams render correctly
- [ ] TypeScript types are satisfied
