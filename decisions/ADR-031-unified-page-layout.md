# ADR-031: Unified Page Layout System

**Date:** 2024-12-29
**Status:** Accepted
**Role:** Architect

## Context

UI audit revealed significant inconsistencies across pages:

1. **PageLayout component exists but is NOT USED** by any page
2. **3 different header patterns** across pages
3. **Inconsistent max-width** constraints
4. **ProblemCard missing page title** - user doesn't know what topic they're practicing
5. **No governance** - new pages created without following any template

## Decision

### RULE: Every Page MUST Use a Template

**POVINNÉ:** Každá stránka v aplikaci MUSÍ vycházet z jedné ze 3 definovaných šablon.

- Při vytváření nové stránky → vybrat existující šablonu
- Nová šablona pouze pokud žádná existující nevyhovuje (vyžaduje ADR)
- Výjimky nejsou povoleny bez explicitního zdůvodnění v ADR

### The 3 Templates

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   TEMPLATE 1: HEADER          TEMPLATE 2: CENTERED              │
│   ┌──────────────────┐        ┌──────────────────┐              │
│   │ [⚡] Title  3/10 │        │                  │              │
│   │ ████████░░░░░░░░ │        │   ┌──────────┐   │              │
│   ├──────────────────┤        │   │   🏆     │   │              │
│   │                  │        │   │ Hotovo!  │   │              │
│   │    Content       │        │   └──────────┘   │              │
│   │                  │        │                  │              │
│   ├──────────────────┤        ├──────────────────┤              │
│   │ [🏠][📊][ ][💡][✓]│       │ [🏠][📊][ ][ ][🔄]│             │
│   └──────────────────┘        └──────────────────┘              │
│                                                                 │
│   TEMPLATE 3: HOME                                              │
│   ┌──────────────────┐                                          │
│   │                  │                                          │
│   │ Co dnes          │  ← No header, no BottomBar               │
│   │ prozkoumáme?     │                                          │
│   │                  │                                          │
│   │ [Téma1] [Téma2]  │                                          │
│   │ [Téma3] [Téma4]  │                                          │
│   │                  │                                          │
│   └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Template | Component | Use Case | Structure |
|----------|-----------|----------|-----------|
| **HEADER** | `PageLayout` + `PageHeader` | Activities, drills, info pages | Header bar + Content + BottomBar |
| **CENTERED** | `SummaryCard` | End-of-session summaries | Centered card + BottomBar |
| **HOME** | Custom (exception) | Entry point only | Full content, no chrome |

### Template Assignment

| Page | Template | Notes |
|------|----------|-------|
| TopicSelector | **HOME** | Entry point, no navigation needed |
| ProblemCard | **HEADER** | Shows topic name + progress |
| LightningRound | **HEADER** | Shows "Bleskové kolo" + progress |
| TypeDrill | **HEADER** | Shows "Rozpoznej typ" + progress |
| ProgressPage | **HEADER** | Shows "Můj pokrok" |
| SessionSummary | **CENTERED** | End of practice session |
| LightningRound/Summary | **CENTERED** | End of lightning round |
| TypeDrill/Summary | **CENTERED** | End of type drill |
| VisualExplainer | **HEADER** | Tutorial with steps |

## Template 1: HEADER

### PageHeader Component

```tsx
interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  progress?: { current: number; total: number }
  iconColor?: string  // default: text-safe-blue
  progressColor?: string  // default: bg-safe-blue
}
```

### Header Specifications

| Page | Icon | Title | Counter | Colors |
|------|------|-------|---------|--------|
| ProblemCard | CalculatorIcon | Topic name (e.g., "Zlomky") | 3/10 | blue |
| LightningRound | BoltIcon | "Bleskové kolo" | 5/10 | amber |
| TypeDrill | AcademicCapIcon | "Rozpoznej typ" | 3/10 | indigo |
| ProgressPage | ChartBarIcon | "Můj pokrok" | None | purple |
| VisualExplainer | LightBulbIcon | "Vizuální nápověda" | 2/4 | purple |

### Usage

```tsx
<PageLayout
  header={
    <PageHeader
      icon={BoltIcon}
      title="Bleskové kolo"
      progress={{ current: 5, total: 10 }}
      iconColor="text-amber-500"
      progressColor="bg-amber-500"
    />
  }
  bottomBar={{ 1: { onClick: onExit }, ... }}
>
  {/* content only */}
</PageLayout>
```

## Template 2: CENTERED

Already implemented as `SummaryCard` component (ADR-030).

Used for end-of-session screens where the focus is on a single centered message/card.

## Template 3: HOME

Special case for TopicSelector only. No template component - custom implementation allowed.

**Rules for HOME template:**
- No header bar
- No BottomBar
- Full-height scrollable content
- Only for entry point pages

## Implementation Plan

### Phase 1: Create PageHeader Component
1. Create `components/PageHeader.tsx`
2. Implement icon + title + progress layout
3. Support color customization

### Phase 2: Migrate Pages to Templates
1. **LightningRound** → HEADER template
2. **TypeDrill** → HEADER template
3. **ProblemCard** → HEADER template (add topic name!)
4. **ProgressPage** → HEADER template
5. **VisualExplainer** → HEADER template

### Phase 3: Verify CENTERED Pages
1. Confirm SessionSummary uses SummaryCard
2. Confirm LightningRound/Summary uses SummaryCard
3. Confirm TypeDrill/Summary uses SummaryCard

## Governance

### PRAVIDLO: Každá stránka MUSÍ použít šablonu

```
1. POVINNÉ: Každá stránka MUSÍ vycházet z nějaké šablony
2. PREFERUJ existující šablony (HEADER, CENTERED, HOME)
3. NOVÁ ŠABLONA: Pokud žádná nevyhovuje, vytvoř novou SE SOUHLASEM (vyžaduje ADR)
4. ZAKÁZÁNO: Stránka bez přiřazené šablony
```

**Proč?**
- Konzistentní UX pro uživatele
- Snazší údržba kódu
- Prevence "každá stránka jinak" chaosu

### Template Selection Guide

```
Is it an entry point / home screen?
  → YES → Use HOME template
  → NO ↓

Is it an end-of-activity summary?
  → YES → Use CENTERED template (SummaryCard)
  → NO ↓

Does it have navigation and active content?
  → YES → Use HEADER template (PageLayout + PageHeader)
```

## Psychological Safety Checklist

- [x] No anxiety-inducing elements in header
- [x] Progress shown as exploration, not test
- [x] Icon provides quick orientation (reduces cognitive load)
- [x] Consistent layout reduces uncertainty
- [x] Topic name in ProblemCard helps context (not judgment)

## Consequences

**Positive:**
- Consistent user experience across all pages
- Easier maintenance (single source of truth)
- User always knows "where am I"
- ProblemCard finally shows topic context
- Clear governance prevents future inconsistencies

**Negative:**
- Initial refactoring effort
- ProblemCard loses ~56px vertical space (acceptable trade-off)

## Files to Create/Modify

| File | Action |
|------|--------|
| `components/PageHeader.tsx` | CREATE |
| `components/PageLayout.tsx` | UPDATE (minor) |
| `components/LightningRound/index.tsx` | MIGRATE to template |
| `components/TypeDrill/index.tsx` | MIGRATE to template |
| `components/ProblemCard.tsx` | MIGRATE to template |
| `components/ProgressPage.tsx` | MIGRATE to template |
| `components/VisualExplainer.tsx` | MIGRATE to template |

## Related ADRs

- [ADR-009](ADR-009-centralized-ui-controls.md) - BottomBar
- [ADR-010](ADR-010-mobile-safe-layout.md) - Mobile layout
- [ADR-015](ADR-015-page-categories.md) - Page categories
- [ADR-029](ADR-029-component-consolidation.md) - Component consolidation
- [ADR-030](ADR-030-progress-page-psychology.md) - SummaryCard (CENTERED template)
