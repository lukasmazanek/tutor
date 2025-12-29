# ADR-027: Feedback Shows Original Question

## Status
Accepted

## Date
2025-12-29

## Context

In Lightning Round, when a student answers incorrectly, the feedback screen showed only:
- Student's answer (crossed out)
- Correct answer
- Hint

**Problem:** The original question was NOT visible. Student couldn't see what they got wrong, making the feedback confusing and less educational.

**Bug report from testing:**
```
Pokud špatně odpovím, není už vidět otázka
```

## Decision

### Show original question + diagram on wrong answer feedback

The feedback screen for incorrect answers must display:

1. **Original question** (stem + context)
2. **Diagram** (if present - especially for Pythagorean problems)
3. **Answer comparison** (user answer vs correct)
4. **Hint** (strategy + explanation)

### Layout

```
┌─────────────────────────────────────┐
│  [Diagram if present]               │
│  Original question text             │
├─────────────────────────────────────┤
│  Tvoje odpověď: ~~wrong~~           │
│  Správně: correct                   │
├─────────────────────────────────────┤
│  💡 Hint title                      │
│     Hint explanation                │
└─────────────────────────────────────┘
```

## Psychological Rationale

1. **Context for learning** - Without seeing the question, feedback is meaningless
2. **No shame** - Question shown neutrally, not highlighted as "what you got wrong"
3. **Complete picture** - Student can trace their thinking and see where it diverged
4. **Diagram importance** - Visual context essential for geometry problems

## Implementation

In `LightningRound/Feedback.tsx`:

```tsx
// Add DiagramRenderer import
import DiagramRenderer from '../diagrams/DiagramRenderer'

// In wrong answer section, add before answer comparison:
<div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-sm mb-4">
  {question.diagram && (
    <DiagramRenderer diagram={question.diagram} />
  )}
  <p className="text-lg text-center text-slate-800 font-medium">
    {question.question.stem || question.question.context}
  </p>
</div>
```

Also added `overflow-y-auto` to container for scrollability when content is long.

## Consequences

### Positive
- Student can understand what they got wrong
- Diagrams visible for geometry problems
- Complete feedback loop for learning
- Scrollable if content is long

### Negative
- Slightly more content on feedback screen
- More vertical space used

### Neutral
- Consistent with ProblemCard which shows question + diagram

## Related ADRs
- ADR-021: Automatic Geometry Diagrams (diagrams in questions)
- ADR-007: Lightning Round Implementation (original design)
