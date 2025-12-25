# ADR-009: Centralized UI Controls

**Date:** 2024-12-25
**Status:** Accepted
**Type:** Architecture/UI
**Related:** [ADR-006](ADR-006-ui-zones-layout.md), [ADR-008](ADR-008-type-recognition-drill.md)

## Context

During TypeDrill implementation (ADR-008), the bottom bar had inconsistent controls compared to ProblemCard. Manual synchronization was required to match:
- Button positions
- Icons
- Colors
- States (enabled/disabled)

ADR-006 defines the 3-zone layout but does not centralize the actual button definitions. This leads to:
- Inconsistent UI across screens
- Maintenance burden when updating styles
- Easy to introduce regressions

## QAR Summary

| # | Question | Decision |
|---|----------|----------|
| Q1 | What to centralize | **B** - Positions + icons + colors + states |
| Q2 | Definition format | **B** - JS constants (can import React icons) |
| Q3 | Screen variations | **A** - Slots system (fixed positions, variable content) |
| Q4 | File location | **A** - `src/constants/bottomBar.js` |

## Decision

### 1. Slot-Based Architecture

Bottom bar has 5 fixed positions (slots). Each screen declares which slots to use:

```
┌─────────────────────────────────────────────────────────┐
│  [1]      [2]      [3]      [4]      [5]               │
│  Home   Progress  Toggle   Hint    Action              │
│  ALWAYS  ALWAYS   optional optional variable           │
└─────────────────────────────────────────────────────────┘
```

### 2. Central Definition

**File:** `src/constants/bottomBar.js`

```js
import {
  HomeIcon,
  ChartBarIcon,
  TagIcon,
  LightBulbIcon,
  CheckIcon,
  ArrowRightIcon,
  ForwardIcon
} from '@heroicons/react/24/outline'

// Style presets
export const STYLES = {
  default: 'bg-slate-200 text-slate-700',
  toggle_off: 'bg-slate-200 text-slate-400',
  toggle_on: 'bg-indigo-100 text-indigo-700',
  hint: 'bg-purple-100 text-purple-700',
  primary: 'bg-safe-blue text-white',
  disabled: 'opacity-50'
}

// Base button class (all buttons share this)
export const BASE_CLASS = `
  py-3 rounded-xl flex items-center justify-center
  transition-gentle active:scale-[0.98]
`

// Slot definitions
export const SLOTS = {
  1: {
    name: 'home',
    icon: HomeIcon,
    style: 'default',
    title: 'Zpět domů',
    always: true
  },
  2: {
    name: 'progress',
    icon: ChartBarIcon,
    style: 'default',
    title: 'Můj pokrok',
    always: true
  },
  3: {
    name: 'toggle',
    icon: TagIcon,
    style: 'toggle_off',  // dynamic: toggle_off | toggle_on
    title: 'Typ úlohy',
    always: false
  },
  4: {
    name: 'hint',
    icon: LightBulbIcon,
    style: 'hint',
    title: 'Nápověda',
    always: false
  },
  5: {
    name: 'action',
    // icon is variable: CheckIcon | ArrowRightIcon | ForwardIcon
    style: 'primary',
    title: null,  // dynamic based on action
    always: true
  }
}

// Action variants for slot 5
export const ACTIONS = {
  submit: {
    icon: CheckIcon,
    title: 'Odeslat',
    style: 'primary'
  },
  continue: {
    icon: ArrowRightIcon,
    title: 'Pokračovat',
    style: 'primary'
  },
  skip: {
    icon: ForwardIcon,
    title: 'Přeskočit',
    style: 'default'
  }
}

// Icon size constant
export const ICON_SIZE = 'w-6 h-6'
```

### 3. Usage Pattern

Each screen specifies which slots to render:

```jsx
// ProblemCard - all 5 slots
const slots = {
  1: { onClick: onExit },
  2: { onClick: onViewProgress },
  3: { onClick: onToggleTypePrompt, active: typePromptEnabled },
  4: { onClick: showNextHint, disabled: solutionRevealed },
  5: { action: solutionRevealed ? 'continue' : 'submit', onClick: handleAction }
}

// TypeDrill - slots 1, 2, 5 only
const slots = {
  1: { onClick: onExit },
  2: { onClick: onViewProgress },
  3: null,  // empty
  4: null,  // empty
  5: { action: phase === 'feedback' ? 'continue' : 'skip', onClick: handleAction }
}
```

### 4. File Structure

```
src/
├── constants/
│   └── bottomBar.js        # Central definitions
├── components/
│   ├── BottomBar/
│   │   ├── index.jsx       # Renders slots based on config
│   │   └── Slot.jsx        # Single slot component
│   ├── ProblemCard.jsx     # Uses <BottomBar slots={...} />
│   └── TypeDrill/
│       └── index.jsx       # Uses <BottomBar slots={...} />
```

## Psychological Safety Alignment

This architecture supports psychological safety by:

1. **Consistent positions** - User always knows where Home is (reduces anxiety)
2. **Familiar icons** - Same icons across all screens (builds confidence)
3. **Predictable colors** - Blue = action, Purple = help, Gray = navigation
4. **No surprises** - Controls behave the same everywhere

## Implementation Checklist

- [x] Create `src/constants/bottomBar.js`
- [x] Create `src/components/BottomBar/index.jsx`
- [x] Create `src/components/BottomBar/Slot.jsx`
- [x] Refactor ProblemCard to use centralized BottomBar
- [x] Refactor TypeDrill to use centralized BottomBar
- [x] Refactor LightningRound to use centralized BottomBar
- [x] Update ADR-006 to reference this ADR
- [x] Test all screens for visual consistency ✓ 2024-12-25

## Consequences

**Positive:**
- Single source of truth for UI controls
- Easy to update styles globally
- Prevents inconsistencies between screens
- Reduces code duplication
- Easier onboarding for new screens

**Negative:**
- Initial refactoring effort
- Slightly more abstraction to understand
- Need to update constants when adding new button types

## Future Extensions

1. **Keyboard shortcuts** - Add `shortcut` property to slots
2. **Responsive variants** - Different layouts for mobile/desktop
3. **Animation configs** - Centralize transition settings
4. **A11y labels** - Centralize aria-labels

## Related

- [ADR-006](ADR-006-ui-zones-layout.md) - 3-zone layout (this ADR extends it)
- [ADR-008](ADR-008-type-recognition-drill.md) - TypeDrill (triggered this ADR)
