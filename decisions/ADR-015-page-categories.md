# ADR-015: Page Categories and Layout Templates

## Status
Accepted

## Date
2024-12-25

## Context

The app has grown to include multiple screen types (TopicSelector, ProblemCard, LightningRound, TypeDrill, ProgressPage, etc.). Each screen was built independently, leading to:

1. Inconsistent layout patterns across screens
2. Repeated layout bugs (e.g., iOS viewport issues fixed in ADR-010)
3. No clear standard for new screens
4. Difficulty maintaining visual consistency

We need a categorization system where each screen type has a defined layout template.

## Decision

Define **6 page categories**, each with a specific layout template that all screens in that category MUST follow.

### BottomBar Rule

> **BottomBar is present on EVERY screen EXCEPT Homepage.**

Homepage (TopicSelector) is the navigation hub - it IS the destination, so "Home" button would be redundant. All other screens have BottomBar for consistent navigation.

---

## Category 1: HOME

**Purpose:** Entry point, navigation hub

**Screens:** TopicSelector

**Characteristics:**
- No BottomBar (standalone navigation)
- Mixed content types (topic cards + special action buttons)
- Optional contextual message (welcome back)
- Full-height, scrollable if needed

**Layout Template:**

```jsx
<div className="min-h-screen bg-slate-50 px-3 sm:px-4 py-4 sm:py-6 flex flex-col">
  {/* Optional: Contextual message */}
  {showMessage && (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      {/* Message content */}
    </div>
  )}

  {/* Header */}
  <div className="mb-4 sm:mb-6">
    <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1 sm:mb-2">
      {title}
    </h1>
    <p className="text-slate-500 text-sm sm:text-base">
      {subtitle}
    </p>
  </div>

  {/* Content grid */}
  <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1">
    {/* Cards and buttons */}
  </div>
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `min-h-screen flex flex-col` | Full height, vertical layout |
| Message | `bg-white rounded-xl p-4 mb-6 shadow-sm` | Contextual info card |
| Grid | `grid grid-cols-2 gap-2 sm:gap-4` | 2-column responsive grid |

---

## Category 2: SELECTION

**Purpose:** Choose one answer from multiple options (quiz-style)

**Screens:**
- LightningRound/Question
- TypeDrill/TypeQuestion
- TypeDrill/StrategyQuestion
- ProblemCard (type/strategy prompt phases)

**Characteristics:**
- Question/prompt at top
- Grid or list of answer options
- Has BottomBar
- Options are interactive buttons
- Follows ADR-010 mobile-safe pattern

**Layout Template:**

```jsx
<div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
  {/* Header with progress */}
  <div className="bg-white border-b border-slate-200">
    <div className="max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-700">{title}</span>
        <span className="text-slate-500 text-sm">{progress}</span>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-{color}-500 transition-gentle" style={{ width }} />
      </div>
    </div>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 pb-20 max-w-2xl mx-auto w-full">
    {/* Question/prompt card */}
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
      <p className="text-lg text-slate-800 leading-relaxed">{question}</p>
    </div>

    {/* Answer options */}
    <div className="space-y-3">
      {options.map(option => (
        <button className="w-full p-4 rounded-xl text-left transition-all
          bg-white border-2 border-slate-200 hover:border-{color}-300
          active:scale-[0.98]">
          {option.label}
        </button>
      ))}
    </div>
  </div>

  {/* BottomBar */}
  <BottomBar slots={{...}} />
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `h-screen h-[100dvh] flex flex-col overflow-hidden` | ADR-010 pattern |
| Header | `bg-white border-b` | Fixed header with progress |
| Content | `flex-1 min-h-0 overflow-y-auto pb-20` | Scrollable with BottomBar padding |
| Question | `bg-white rounded-2xl shadow-sm p-5` | Prominent question card |
| Options | `space-y-3` | Vertical stack of buttons |
| Option button | `w-full p-4 rounded-xl border-2` | Full-width touch target |

---

## Category 3: PROBLEM

**Purpose:** Solve a problem with text/number input

**Screens:** ProblemCard (done phase)

**Characteristics:**
- Problem display at top
- Progressive hints area (expandable)
- Answer input field
- Virtual keyboard on mobile
- BottomBar with context-aware actions
- Most complex layout in app

**Layout Template:**

```jsx
<div className="h-screen h-[100dvh] flex flex-col overflow-hidden">
  {/* Progress bar */}
  <div className="px-4 pt-2 pb-3">
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-safe-blue transition-all" style={{ width }} />
    </div>
  </div>

  {/* Problem card */}
  <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 mx-4">
    {diagram && <DiagramRenderer diagram={diagram} />}
    <p className="text-lg text-slate-800 leading-relaxed">{problem}</p>
  </div>

  {/* Scrollable content area */}
  <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-64">
    {/* Type/Strategy result (if enabled) */}
    {typeResult && (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
        {/* Type and strategy feedback */}
      </div>
    )}

    {/* Progressive hints */}
    {hints.length > 0 && (
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
        {/* Revealed hints */}
      </div>
    )}

    {/* Solution revealed */}
    {solutionRevealed && (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-green-800 font-medium">Správná odpověď: {answer}</p>
      </div>
    )}

    {/* Answer input */}
    {!solutionRevealed && (
      <div className="mb-4">
        <input className="w-full p-4 text-xl rounded-xl border-2 border-slate-200" />
      </div>
    )}

    {/* Feedback */}
    {feedback && (
      <div className="mb-4 p-4 rounded-xl text-center">
        {feedback}
      </div>
    )}
  </div>

  {/* Fixed bottom: Keyboard + BottomBar */}
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb">
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
      {/* Virtual keyboard (mobile only, hidden when solution revealed) */}
      {isMobile && !solutionRevealed && (
        <div className="grid grid-cols-5 gap-1 mb-2">
          {/* Keyboard buttons */}
        </div>
      )}

      <BottomBar contained slots={{...}} />
    </div>
  </div>
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `h-screen h-[100dvh] flex flex-col overflow-hidden` | ADR-010 pattern |
| Problem card | `bg-white rounded-2xl shadow-sm p-5 mx-4` | Prominent problem display |
| Content | `flex-1 min-h-0 overflow-y-auto pb-64` | Extra padding for keyboard |
| Hints | `bg-purple-50 border border-purple-100 rounded-xl` | Progressive hint cards |
| Solution | `bg-green-50 border border-green-200 rounded-xl` | Answer reveal |
| Fixed bottom | `fixed bottom-0 left-0 right-0` | Keyboard + BottomBar |

---

## Category 4: CENTERED

**Purpose:** Centered card for summaries, decisions, or any focused single-card content

**Screens:**
- SessionSummary
- LightningRound/Summary
- TypeDrill/Summary
- Explainer prompt (App.jsx)

**Characteristics:**
- Centered content card on neutral background
- Icon at top (celebration or question)
- Content varies: stats OR decision buttons
- Has BottomBar (consistent navigation)
- Follows ADR-010 mobile-safe pattern

**Layout Template:**

```jsx
<div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
  {/* Scrollable centered content */}
  <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-{color}-500" />
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
        {title}
      </h1>

      {/* Subtitle/Description */}
      <p className="text-slate-600 mb-6">
        {subtitle}
      </p>

      {/* VARIANT A: Stats (for summaries) */}
      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <div className="text-4xl font-bold text-green-600">{stat}</div>
        <div className="text-sm text-green-700">{label}</div>
      </div>

      {/* VARIANT B: Decision buttons (for modals) */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 px-4 rounded-xl bg-slate-200 text-slate-700 font-medium">
          {secondaryAction}
        </button>
        <button className="flex-1 py-3 px-4 rounded-xl bg-safe-blue text-white font-medium">
          {primaryAction}
        </button>
      </div>
    </div>
  </div>

  {/* BottomBar */}
  <BottomBar slots={{
    1: { onClick: onHome },
    2: { onClick: onViewProgress },  // optional
    5: { action: 'continue', onClick: onContinue }  // optional
  }} />
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `h-screen h-[100dvh] flex flex-col overflow-hidden` | ADR-010 pattern |
| Content | `flex-1 min-h-0 overflow-y-auto flex items-center justify-center pb-20` | Centered with BottomBar padding |
| Card | `bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm` | Central content card |
| Icon | `w-12 h-12 sm:w-16 sm:h-16` | Visual indicator |
| Stat card | `bg-{color}-50 rounded-xl p-4 mb-4` | Metric display (variant A) |
| Decision buttons | `flex gap-3` | Side-by-side actions (variant B) |

**BottomBar Slots:**

| Slot | Summary variant | Modal variant |
|------|-----------------|---------------|
| 1 | Home | Home (escape hatch) |
| 2 | Progress | - |
| 5 | Continue | - (decision is inline) |

**Color Mapping for Stats:**

| Stat Type | Background | Text |
|-----------|------------|------|
| Independence (bez nápovědy) | `bg-green-50` | `text-green-600` |
| Count (prozkoumáno) | `bg-slate-50` | `text-safe-blue` |
| Historical | `bg-purple-50` | `text-purple-700` |
| Streak/Speed | `bg-amber-50` | `text-amber-600` |

---

## Category 5: DASHBOARD

**Purpose:** Dashboard showing historical data, statistics, and lists

**Screens:** ProgressPage

**Characteristics:**
- Header with title
- Filter chips (horizontal scroll)
- Stat cards grid
- Charts/timeline
- Session history list
- Has BottomBar
- Follows ADR-010 mobile-safe pattern

**Layout Template:**

```jsx
<div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
  {/* Scrollable content */}
  <div className="flex-1 min-h-0 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-6 pb-20">
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
    </div>

    {/* Filter chips */}
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map(filter => (
        <button className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap
          ${active ? 'bg-safe-blue text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          {filter.label}
        </button>
      ))}
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-3xl font-bold text-safe-blue">{stat1}</div>
        <div className="text-sm text-slate-500">{label1}</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-3xl font-bold text-purple-600">{stat2}</div>
        <div className="text-sm text-slate-500">{label2}</div>
      </div>
      {/* Full-width highlight stat */}
      <div className="col-span-2 bg-green-50 rounded-xl p-4">
        {/* Independence metric */}
      </div>
    </div>

    {/* Chart/Timeline */}
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-600 mb-4">{chartTitle}</h3>
      {/* Chart content */}
    </div>

    {/* History list */}
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-600">{listTitle}</h3>
      {items.map(item => (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {/* Item content */}
        </div>
      ))}
    </div>
  </div>

  {/* BottomBar */}
  <BottomBar slots={{...}} />
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `h-screen h-[100dvh] flex flex-col overflow-hidden` | ADR-010 pattern |
| Content | `flex-1 min-h-0 overflow-y-auto pb-20` | Scrollable with BottomBar padding |
| Filter chip | `px-4 py-2 min-h-[44px] rounded-full` | Touch-friendly filter |
| Stats grid | `grid grid-cols-2 gap-4` | 2-column stat cards |
| Stat card | `bg-white rounded-xl p-4 shadow-sm` | Individual metric |
| List item | `bg-white rounded-xl p-4 shadow-sm` | History entry |

---

## Category 6: TUTORIAL

**Purpose:** Step-by-step guided explanation with visuals

**Screens:** VisualExplainer

**Characteristics:**
- Header with step context
- Central visual/animation area
- Step indicator dots
- Has BottomBar (consistent navigation)
- Follows ADR-010 mobile-safe pattern

**Layout Template:**

```jsx
<div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
  {/* Scrollable content */}
  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 pb-20">
    {/* Header */}
    <div className="mb-6">
      <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
        <LightBulbIcon className="w-4 h-4" />
        {label}
      </span>
      <h2 className="text-xl font-semibold text-slate-800 mt-1">{stepTitle}</h2>
      <p className="text-slate-600 mt-1">{stepDescription}</p>
    </div>

    {/* Visual content area */}
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm">
        {/* Visual blocks/diagrams */}
      </div>

      {/* Key insight (final step) */}
      {isFinalStep && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 w-full max-w-sm">
          <p className="text-amber-800 text-sm">
            <strong>Klíčové:</strong> {insight}
          </p>
        </div>
      )}
    </div>

    {/* Step indicator */}
    <div className="flex justify-center gap-2 mt-6">
      {steps.map((_, i) => (
        <div className={`w-2 h-2 rounded-full ${i === step ? 'bg-safe-blue' : 'bg-slate-300'}`} />
      ))}
    </div>
  </div>

  {/* BottomBar */}
  <BottomBar slots={{
    1: { onClick: onHome },
    2: { onClick: onViewProgress },
    4: step > 0 ? { action: 'back', onClick: onBack } : null,
    5: { action: 'continue', onClick: isLastStep ? onFinish : onNext }
  }} />
</div>
```

**Key Elements:**

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `h-screen h-[100dvh] flex flex-col overflow-hidden` | ADR-010 pattern |
| Content | `flex-1 min-h-0 overflow-y-auto pb-20` | Scrollable with BottomBar padding |
| Header label | `text-sm text-purple-600 font-medium` | Context indicator |
| Visual card | `bg-white rounded-2xl shadow-sm p-6 max-w-sm` | Central content |
| Insight box | `bg-amber-50 border border-amber-200 rounded-xl` | Key takeaway |
| Step dots | `w-2 h-2 rounded-full` | Progress indicator |

**BottomBar Slots:**

| Slot | Action | Purpose |
|------|--------|---------|
| 1 | Home | Exit tutorial, return home |
| 2 | Progress | View progress |
| 4 | Back (optional) | Go to previous step (when step > 0) |
| 5 | Continue | Advance to next step or finish |

**Note:** Uses slot 4 for "back" navigation when multi-step, slot 5 always shows continue/next.

---

## Screen-to-Category Mapping

| Screen | Category | Has BottomBar |
|--------|----------|---------------|
| TopicSelector | HOME | **No** (is navigation hub) |
| ProblemCard (type phase) | SELECTION | Yes* |
| ProblemCard (strategy phase) | SELECTION | Yes* |
| ProblemCard (done phase) | PROBLEM | Yes |
| LightningRound/Question | SELECTION | Yes |
| LightningRound/Feedback | SELECTION | Yes |
| LightningRound/Summary | CENTERED | Yes |
| TypeDrill/TypeQuestion | SELECTION | Yes |
| TypeDrill/StrategyQuestion | SELECTION | Yes |
| TypeDrill/Summary | CENTERED | Yes |
| SessionSummary | CENTERED | Yes |
| ProgressPage | DASHBOARD | Yes |
| VisualExplainer | TUTORIAL | Yes |
| Explainer prompt | CENTERED | Yes |

*ProblemCard type/strategy phases show BottomBar but with limited slots.

**Rule:** BottomBar on every screen except HOME.

---

## Shared Design Tokens

### Colors (Tailwind)

| Token | Class | Usage |
|-------|-------|-------|
| Primary action | `bg-safe-blue` | Main CTA buttons |
| Success | `bg-green-50/600` | Correct, independence |
| Warning | `bg-amber-50/600` | Hints, streaks |
| Info | `bg-purple-50/600` | Hints, progress |
| Neutral | `bg-slate-50/200` | Backgrounds, secondary |

### Spacing

| Element | Mobile | Desktop |
|---------|--------|---------|
| Container padding | `px-3 py-4` | `px-4 py-6` |
| Card padding | `p-4` | `p-5` |
| Grid gap | `gap-2` | `gap-4` |
| Section margin | `mb-4` | `mb-6` |

### Touch Targets

| Element | Minimum Height |
|---------|----------------|
| Button | `44px` (min-h-[44px]) |
| Filter chip | `44px` |
| Keyboard key | `44px` (h-11) |
| Option card | `56px` (p-4) |

---

## Consequences

### Positive
- Clear standard for each screen type
- Consistent user experience across app
- Easier to create new screens (pick category, follow template)
- Reduces layout bugs
- Improves maintainability

### Negative
- Requires refactoring some existing screens to match templates
- More rigid structure (less flexibility)
- Longer ADR document

### Neutral
- Templates can evolve as we learn more

---

## Implementation Checklist

### BottomBar Additions (New)
- [x] Add BottomBar to SessionSummary (CENTERED)
- [x] Add BottomBar to LightningRound/Summary (CENTERED)
- [x] Add BottomBar to TypeDrill/Summary (CENTERED)
- [x] Add BottomBar to VisualExplainer (TUTORIAL)
- [x] Add BottomBar to Explainer prompt (CENTERED)

### Template Verification
- [ ] Verify TopicSelector matches HOME template (no BottomBar)
- [ ] Verify ProblemCard matches PROBLEM template
- [ ] Verify LightningRound/Question matches SELECTION template
- [ ] Verify TypeDrill questions match SELECTION template
- [ ] Verify all summaries match CENTERED template
- [ ] Verify ProgressPage matches DASHBOARD template
- [ ] Verify VisualExplainer matches TUTORIAL template
- [ ] Verify Explainer prompt matches CENTERED template

### Refactoring
- [ ] Create reusable layout wrapper components if patterns repeat
- [ ] Ensure all screens follow ADR-010 mobile-safe pattern

---

## Implementation Notes

### New BottomBar Actions Added

To support this ADR, two new actions were added to `src/constants/bottomBar.js`:

| Action | Icon | Title | Style | Use Case |
|--------|------|-------|-------|----------|
| `back` | ArrowLeftIcon | Zpět | secondary | Step navigation (TUTORIAL) |
| `restart` | ArrowPathIcon | Znovu | primary | Summary screens (CENTERED) |

### Slot Flexibility

BottomBar Slot component was updated to allow actions on any slot (not just slot 5), enabling:
- Slot 4 with `action: 'back'` for tutorial navigation
- Any slot can now use defined actions via `action` prop

---

## Related

- [ADR-006](ADR-006-ui-zones-layout.md) - UI Zones (Header/Content/Footer)
- [ADR-009](ADR-009-centralized-ui-controls.md) - Centralized UI Controls (BottomBar)
- [ADR-010](ADR-010-mobile-safe-layout.md) - Mobile-Safe Layout Pattern
