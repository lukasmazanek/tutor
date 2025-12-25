# ADR-004: Compact Mobile Keyboard

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UI/UX
**Component:** ProblemCard.jsx

## Context

Mobile keyboard for math symbol input was taking too much vertical space, reducing the area available for problem content and creating a cramped feeling on smaller screens.

## Decision

### QAR Summary

| Question | Decision |
|----------|----------|
| How to reduce keyboard size | **Option C**: Smaller buttons + smaller gaps |
| Bottom padding | Reduce from pb-4 to pb-2 |

### Changes Made

| Element | Before | After |
|---------|--------|-------|
| Button height | h-11 (44px) | h-10 (40px) |
| Button font size | text-lg | text-base |
| Grid gap | gap-2 | gap-1 |
| Margin below keyboard | mb-3 | mb-2 |
| Bottom padding | pb-4 | pb-2 |

### Implementation

```jsx
{/* Keyboard container */}
<div className="flex-shrink-0 bg-slate-50 pt-2 pb-2 border-t border-slate-200">
  <div className="grid grid-cols-5 gap-1 mb-2">
    {/* Buttons with h-10 rounded-xl text-base */}
  </div>
</div>
```

## Consequences

**Positive:**
- More vertical space for problem content
- Less cramped feeling on small screens
- Still maintains minimum touch target (40px > 38px minimum)

**Negative:**
- Slightly smaller touch targets (44px → 40px)
- May be harder for users with motor difficulties

**Mitigation:**
- 40px is still above accessibility minimum (38px)
- Buttons remain well-spaced and distinct

## Related

- [ADR-002](ADR-002-desktop-math-symbol-input.md) - Desktop math symbol input
- ProblemCard.jsx - Parent component
