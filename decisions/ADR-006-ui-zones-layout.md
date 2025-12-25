# ADR-006: UI Zones Layout

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UI/UX
**Component:** ProblemCard.jsx

## Context

After implementing progressive hints (ADR-005), the "Pokračovat" button appeared in the content area instead of the fixed bottom bar. This breaks UI consistency - action buttons should always be in the same place.

## Decision

### QAR Summary

| Question | Decision |
|----------|----------|
| Screen zones | **B** - 3 zones: Header (fixed) + Content (scroll) + Bottom bar (fixed) |
| Bottom bar contents | **C** - All actions always: Home, Progress, Hint, Submit/Pokračovat |
| Keyboard after solution | **A** - Keyboard hides, Bottom bar stays, Submit → Pokračovat |

### Zone Layout

```
┌─────────────────────────────────┐
│ ████████░░░░░░░░ Progress bar   │ ← Header (fixed)
├─────────────────────────────────┤
│                                 │
│ Problem text + diagram          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💡 Hint 1                   │ │
│ │    Hint 2                   │ │ ← Content (scrollable)
│ │    Hint 3 (bold)            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Správná odpověď: X]            │
│                                 │
├─────────────────────────────────┤
│ [Keyboard - hidden after solve] │
├─────────────────────────────────┤
│ 🏠  │  📊  │  💡  │  ✓/→       │ ← Bottom bar (fixed)
└─────────────────────────────────┘
```

### Button States

| State | Button 4 (right) | Icon |
|-------|------------------|------|
| Answering | Submit (enabled when input) | ✓ CheckIcon |
| Solution revealed | Pokračovat | → ArrowRightIcon |

### Implementation

1. Remove "Pokračovat" button from content area
2. Keep bottom bar visible when solution revealed
3. Hide only keyboard when solution revealed
4. Change Submit button to Pokračovat based on `solutionRevealed` state

## Consequences

**Positive:**
- Consistent button positions (reduced cognitive load)
- Thumb-friendly actions always accessible
- More space for content when keyboard hidden
- Clear visual hierarchy

**Negative:**
- Slightly more complex conditional rendering

## Implementation Checklist

- [x] Remove Pokračovat from content area ✓ 2024-12-24
- [x] Keep bottom bar visible after solution ✓ 2024-12-24
- [x] Hide only keyboard div after solution ✓ 2024-12-24
- [x] Change Submit → Pokračovat icon and handler ✓ 2024-12-24
- [x] Test on mobile and desktop ✓ 2024-12-24

## Related

- [ADR-005](ADR-005-progressive-hints.md) - Progressive hints (triggered this issue)
- [ADR-004](ADR-004-compact-mobile-keyboard.md) - Compact keyboard
- [ADR-009](ADR-009-centralized-ui-controls.md) - Centralized UI controls (extends this ADR with slot-based architecture)
