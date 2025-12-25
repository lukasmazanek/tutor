# ADR-005: Progressive Hints System

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UX/Educational
**Component:** ProblemCard.jsx

## Context

Current hint system shows static hints from `hints` array. User requested progressive hints that lead step-by-step to the solution, providing scaffolded support.

## Decision

### QAR Summary

| Question | Decision |
|----------|----------|
| How progressive? | **B** - Hints lead to answer, last hint = answer |
| Number of hints | **C** - Based on `solution_steps` in data |
| Display style | **B** - Cumulative (hints stack under each other) |
| After final hint | **B** - Show "Pokračovat" button, user decides when ready |

### Implementation

1. **Data source**: Use `solution_steps` array from problem data
2. **Progressive reveal**: Each "Nápověda" click reveals next step
3. **Cumulative display**: All revealed steps visible, stacked vertically
4. **Final step**: Last solution step = full answer revealed
5. **After reveal**: Show "Pokračovat" button instead of answer input

### UI Flow

```
[Wrong answer] → [Try again with input visible]
                     ↓
              [Click "Nápověda"]
                     ↓
              [Step 1 appears]
                     ↓
              [Click "Nápověda"]
                     ↓
              [Step 1 + Step 2 visible]
                     ↓
              [Click "Nápověda"]
                     ↓
              [All steps + final answer visible]
              [Input hidden, "Pokračovat" button shown]
```

### Psychological Considerations

**Positive:**
- Scaffolded learning (zone of proximal development)
- Reduces frustration without removing challenge
- Student sees solution building up (educational)
- Agency preserved (she requests each hint)

**Risk mitigation:**
- Track hints used per problem (already in metrics)
- "Samostatně" metric reflects hint usage
- Visual indication of hint count used

## Consequences

**Positive:**
- Better learning support
- Matches real tutoring experience
- Uses existing `solution_steps` data
- Clearer path from stuck → understanding

**Negative:**
- May encourage hint dependency
- Less "productive struggle"
- Need to ensure all problems have `solution_steps`

## Implementation Checklist

- [x] Modify ProblemCard hint state to track revealed steps ✓ 2024-12-24
- [x] Change hint button to reveal next solution_step ✓ 2024-12-24
- [x] Implement cumulative hint display ✓ 2024-12-24
- [x] Hide input and show "Pokračovat" after all hints revealed ✓ 2024-12-24
- [x] Update hint counter to reflect solution_steps count ✓ 2024-12-24
- [x] Test with problems that have/don't have solution_steps ✓ 2024-12-24
- [x] Fallback to old hints array if no solution_steps ✓ 2024-12-24

## Related

- [PDR-001](PDR-001-psychological-safety-review.md) - Psychological safety
- ProblemCard.jsx - Main component
