# ADR-033: Smart Error Feedback (Chytré nápovědy)

**Date:** 2024-12-29
**Status:** Proposed
**Role:** Architect

## Context

When a student answers incorrectly, the current system shows generic feedback. However, many wrong answers reveal **specific misconceptions** that could be addressed with targeted guidance.

**Real example:**
- Question: "Za kolik **dalších** dní zeď dokončí?" (How many MORE days...)
- Correct: 2,67 (additional days after day 1)
- Common error: 3,67 (total days including day 1)
- Root cause: Missed the word "dalších" (more/additional)

Generic "Try again" doesn't help. But if we recognize the error pattern, we can say:
> "Pozor na slovo 'dalších' - ptáme se kolik dní PO tom prvním dni."

## Decision

### 1. Data Format Extension

Add `common_errors` array to question schema:

```typescript
interface CommonError {
  value: string              // The wrong answer to match
  variants?: string[]        // Alternative forms (3.67, 3,67, etc.)
  tolerance?: number         // For numeric matching (default: 0.01)
  feedback: string           // Targeted feedback message
  misconception?: string     // Internal label for analytics
}

// In question schema
{
  "answer": { ... },
  "common_errors": [
    {
      "value": "3,67",
      "variants": ["3.67", "11/3"],
      "feedback": "Pozor na slovo 'dalších' v zadání - ptáme se kolik dní PO tom prvním dni, ne celkem.",
      "misconception": "total_vs_additional"
    }
  ]
}
```

### 2. Error Categories

| Category | Example | Feedback Pattern |
|----------|---------|------------------|
| **Reading error** | "dalších" missed | Point to specific word in question |
| **Concept error** | "o třetinu více" = ×1.33 | Explain the concept briefly |
| **Calculation slip** | Off by factor of 10 | "Zkontroluj jednotky" |
| **Partial solution** | Stopped early | "Tohle je mezivýsledek, pokračuj..." |
| **Inverted operation** | + instead of - | "Rozmysli směr změny" |

### 3. Matching Logic

```typescript
function checkAnswer(userAnswer: string, question: Question): AnswerResult {
  // 1. Check if correct
  if (isCorrect(userAnswer, question.answer)) {
    return { correct: true }
  }

  // 2. Check common errors
  const matchedError = question.common_errors?.find(error =>
    matchesValue(userAnswer, error.value, error.variants, error.tolerance)
  )

  if (matchedError) {
    return {
      correct: false,
      feedback: matchedError.feedback,
      feedbackType: 'targeted',
      misconception: matchedError.misconception
    }
  }

  // 3. Fallback to generic
  return {
    correct: false,
    feedback: null,  // Use default hints
    feedbackType: 'generic'
  }
}
```

### 4. UI Presentation

When targeted feedback is available:

```
┌─────────────────────────────────────────┐
│  💡 Tip                                 │
│                                         │
│  Pozor na slovo "dalších" v zadání -    │
│  ptáme se kolik dní PO tom prvním dni.  │
│                                         │
│  [Zkusit znovu]                         │
└─────────────────────────────────────────┘
```

**Key design decisions:**
- Use 💡 (lightbulb) not ❌ (cross) - guidance, not punishment
- "Tip" framing - helpful, not corrective
- No "Wrong!" label - just the helpful guidance
- Immediate actionable insight

### 5. Psychological Safety

| Principle | Implementation |
|-----------|----------------|
| No shame | "Tip" not "Chyba" |
| Specific guidance | Points to exact issue |
| Preserves agency | Student still solves it |
| Learning moment | Explains the "why" |
| Not punitive | Same visual as regular hints |

### 6. Analytics Value

Track `misconception` field to identify:
- Which misconceptions are most common
- Which questions need better wording
- Student-specific error patterns
- Effectiveness of feedback (do they get it right after?)

## Implementation Plan

### Phase 1: Data Format
1. Update `lib/storage/types.ts` with CommonError type
2. Update ADR-014 (content format) reference
3. Add validation in `scripts/validate-data.js`

### Phase 2: Content
1. Add common_errors to work_problems.json (starting point)
2. Add to o_x_vice.json (known misconception area)
3. Document error patterns for content creators

### Phase 3: Evaluation Logic
1. Update answer checking in ProblemCard
2. Pass targeted feedback to UI
3. Track misconception in attempt record

### Phase 4: UI
1. Display targeted feedback with "Tip" styling
2. Same visual language as hints (purple, lightbulb)

## Examples

### Example 1: Work Problem (dalších vs celkem)
```json
{
  "id": "work-002",
  "stem": "...Za kolik dalších dní zeď dokončí?",
  "answer": { "correct": "2,67" },
  "common_errors": [
    {
      "value": "3,67",
      "feedback": "Pozor na slovo 'dalších' - ptáme se kolik dní PO tom prvním dni.",
      "misconception": "total_vs_additional"
    }
  ]
}
```

### Example 2: "o X více" (multiplicative vs additive)
```json
{
  "id": "oxv-015",
  "stem": "Cena se zvýšila o třetinu. Původní cena byla 300 Kč.",
  "answer": { "correct": "400" },
  "common_errors": [
    {
      "value": "100",
      "feedback": "'O třetinu více' znamená původní + třetina, ne jen třetina.",
      "misconception": "additive_only"
    },
    {
      "value": "333",
      "feedback": "Třetina z 300 je 100. Ale 'o třetinu více' = 300 + 100.",
      "misconception": "partial_calculation"
    }
  ]
}
```

### Example 3: Equation (sign error)
```json
{
  "id": "eq-008",
  "stem": "Řeš: 3x - 7 = 14",
  "answer": { "correct": "7" },
  "common_errors": [
    {
      "value": "-7",
      "feedback": "Při přesunu -7 na druhou stranu se znaménko mění na +7.",
      "misconception": "sign_transfer"
    }
  ]
}
```

## Consequences

**Positive:**
- Targeted learning from mistakes
- Reduced frustration ("now I understand WHY")
- Data for identifying common misconceptions
- Content improvement insights
- Feels like a tutor, not a test

**Negative:**
- More content work (defining common errors)
- Maintenance of error patterns
- Risk of missing errors (fallback to generic)

## Migration

- Existing questions work unchanged (common_errors is optional)
- Add common_errors incrementally based on observed patterns
- Priority: work_problems, o_x_vice (known problem areas)

## Related ADRs

- [ADR-014](ADR-014-unified-content-format.md) - Content format (extends question schema)
- [ADR-005](ADR-005-progressive-hints.md) - Hint system (similar UI pattern)
- [ADR-023](ADR-023-answer-persistence.md) - Track misconception in attempts

## Open Questions

1. Should we limit common_errors per question? (Recommendation: max 3-4)
2. Should feedback auto-show or require tap? (Recommendation: auto-show)
3. Track "targeted feedback shown" in attempts? (Recommendation: yes)
