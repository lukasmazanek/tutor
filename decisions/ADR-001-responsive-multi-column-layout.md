# ADR-001: Responsive Multi-Column Layout

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UI/Architecture
**Component:** ProblemCard, LightningRound

## Context

Na větších obrazovkách (tablet, desktop) zůstává layout single-column, i když je dostatek místa pro efektivnější využití prostoru. Elementy, které se nevejdou do viewportu, by měly být zobrazeny ve více sloupcích.

## Decision

**Elementy, které se nevejdou do okna, zobrazit ve 2+ sloupcích** podle dostupné šířky.

### QAR Decisions (2024-12-24)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Které elementy? | **Všechny** (MC options, LR kategorie, LR odpovědi) | Konzistentní UX pattern |
| Breakpoint? | **640px (sm)** | Dřív využít prostor |
| Max sloupců? | **3** (2 pro 4 položky, 3 pro 3 položky) | Optimální pro oba layouts |

### Affected Components

| Component | Current | New | Columns |
|-----------|---------|-----|---------|
| Home page topics | 1 column | 2×3 grid | `grid-cols-2` (all screens) ✓ |
| Multiple choice options | 1 column | 2×2 grid | `sm:grid-cols-2` ✓ |
| Lightning Round kategorie | 1 column | 2×2 grid | `sm:grid-cols-2` |
| Lightning Round odpovědi | 1 column | 1×3 row | `sm:grid-cols-3` |
| Virtual keyboard | 5 columns | Keep | Already multi-column |

### Breakpoint Strategy

```
Mobile (<640px):    1 column, compact spacing
Tablet+ (≥640px):   2-3 columns, full spacing
```

### Mobile Compact Mode (2024-12-24)

Na mobilu nestačí jen 1 sloupec - obsah se musí také zmenšit:

| Element | Mobile | Tablet+ |
|---------|--------|---------|
| Container padding | `px-3 py-4` | `px-4 py-6` |
| Grid gap | `gap-2` | `gap-4` |
| Card padding | `p-3` | `p-5` |
| Font sizes | `text-xl`, `text-base` | `text-2xl`, `text-lg` |
| "Důležité pro CERMAT" | `hidden` | `sm:flex` |
| Popisky u special buttons | `hidden` | `sm:block` |

**Rationale:** 6 témat + 2 special buttons = příliš mnoho pro viewport 667px. Kompaktní mode zajistí, že vše je viditelné s minimálním scrollem.

**Update 2024-12-24:** Homepage topics changed to `grid-cols-2` on ALL screens (not just sm+). With 6 topics + 2 special buttons, single column wastes horizontal space on mobile and requires scrolling. Two columns fit all content without scroll.

### CSS Approach

```css
/* Grid-based responsive columns */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

/* Or Tailwind equivalent */
/* grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 */
```

## Specific Implementations

### Multiple Choice Options

**Before:**
```jsx
<div className="space-y-3 mb-4">
  {problem.options.map((option) => (
    <button className="w-full p-4 ...">
```

**After:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
  {problem.options.map((option) => (
    <button className="p-4 ...">
```

### Lightning Round Answer Buttons (EDR-002)

3 answer choices → display in row on tablet+:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
```

## Consequences

**Positive:**
- Better space utilization on larger screens
- Reduced scrolling
- More professional appearance
- Faster scanning of options

**Negative:**
- More complex CSS
- Need to test all breakpoints
- Reading order may be less obvious (left-to-right vs top-to-bottom)

**Mitigation:**
- Use consistent left-to-right, top-to-bottom order
- Test with real user on different devices
- Keep mobile as primary (unchanged)

## Open Questions

| # | Question | Decision |
|---|----------|----------|
| 1 | Které elementy přesně? | ✅ Všechny (MC, LR kategorie, LR odpovědi) |
| 2 | Max columns? | ✅ 3 max (2 pro 4 položky, 3 pro 3) |
| 3 | Min item width? | 200px (prevents too narrow) |
| 4 | Breakpoint? | ✅ 640px (sm) |

## Implementation

### Completed

**ProblemCard.jsx - Multiple Choice** (2024-12-24)
```jsx
// Before
<div className="space-y-3 mb-4">

// After
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
```

### Future (when Lightning Round is built)

**CategorySelect.jsx** - 4 kategorie → 2×2 grid:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {categories.map(cat => <CategoryCard ... />)}
</div>
```

**Question.jsx** - 3 odpovědi → 1×3 row:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  {answers.map(ans => <AnswerButton ... />)}
</div>
```

### Checklist

- [x] ProblemCard.jsx - multiple choice options
- [x] TopicSelector.jsx - home page topic cards (2024-12-24)
- [ ] LightningRound/CategorySelect.jsx (not yet built)
- [ ] LightningRound/Question.jsx (not yet built)
- [x] Test on mobile, tablet, desktop (2024-12-24)
- [x] Verify touch targets remain ≥44px (buttons have p-5 = 20px padding)

## Related

- [EDR-002](EDR-002-lightning-round.md) - Lightning Round (answer buttons)
- ProblemCard.jsx - Main component
- Tailwind config: `tailwind.config.js`
