# Educational Decision Records

This directory contains all Educational Decision Records (EDRs) for the Tutor project.

**Total:** 4 EDRs + 23 ADRs + 2 PDRs | **Format:** One file per record | **Naming:** `EDR-XXX-slug.md`, `ADR-XXX-slug.md`, or `PDR-XXX-slug.md`

---

## Quick Reference

### Teaching Strategy

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [EDR-001](EDR-001-atomic-skills-approach.md) | Atomic Skills Approach | Accepted | Complex problems = composition of automatized basic skills |
| [EDR-003](EDR-003-equation-bridge-partial-feedback.md) | Equation Bridge & Partial Feedback | Accepted | Connect Pythagoras to equations (strength), show partial correctness |
| [EDR-004](EDR-004-problem-taxonomy.md) | Problem Taxonomy & Decision Tree | Accepted | 3-level CERMAT taxonomy + keyword/object recognition |

### App Features

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [EDR-002](EDR-002-lightning-round.md) | Lightning Round (Bleskové kolo) | Accepted | Quick-fire drill mode for atomic skills |

### Psychological Decisions (PDRs)

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [PDR-001](PDR-001-psychological-safety-review.md) | Psychological Safety Review | Accepted | Review of EDRs for inner critic risks, streak counter safety |
| [PDR-002](PDR-002-app-messages-review.md) | App Messages Review | Accepted | Audit of all user-facing messages for critic triggers |

### Psychological Interventions

| ID | Title | Status | Summary |
|----|-------|--------|---------|

### Content & Curriculum

| ID | Title | Status | Summary |
|----|-------|--------|---------|

### Architecture (ADRs)

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [ADR-001](ADR-001-responsive-multi-column-layout.md) | Responsive Multi-Column Layout | Accepted | Elements that don't fit → 2+ columns (sm: 640px) |
| [ADR-002](ADR-002-desktop-math-symbol-input.md) | Desktop Math Symbol Input | Accepted | Symbol bar (√ ^ ( )) + text shortcuts (sqrt) |
| [ADR-003](ADR-003-pythagoras-diagrams.md) | Pythagoras Diagrams | Accepted | Dynamic SVG diagrams for geometry problems |
| [ADR-004](ADR-004-compact-mobile-keyboard.md) | Compact Mobile Keyboard | Accepted | Smaller buttons + gaps for more content space |
| [ADR-005](ADR-005-progressive-hints.md) | Progressive Hints | Accepted | solution_steps reveal cumulatively, ends with answer |
| [ADR-006](ADR-006-ui-zones-layout.md) | UI Zones Layout | Accepted | 3 zones: Header + Content + Bottom bar (fixed) |
| [ADR-007](ADR-007-lightning-round-implementation.md) | Lightning Round Implementation | Accepted | QAR decisions for Bleskové kolo MVP |
| [ADR-008](ADR-008-type-recognition-drill.md) | Type Recognition Drill | Accepted | Problem type + strategy recognition training |
| [ADR-009](ADR-009-centralized-bottombar.md) | Centralized BottomBar | Accepted | 5-slot bottom bar system |
| [ADR-010](ADR-010-mobile-safe-layout.md) | Mobile-Safe Layout | Accepted | h-[100dvh], pb-20, min-h-0 pattern |
| [ADR-013](ADR-013-single-source-data.md) | Single Source Data | Accepted | Source → Generated → App pipeline |
| [ADR-014](ADR-014-unified-content-format.md) | Unified Content Format | Accepted | Standardized question JSON schema |
| [ADR-015](ADR-015-page-categories.md) | Page Categories | Accepted | HOME/PROBLEM/SELECTION/CENTERED/DASHBOARD |
| [ADR-016](ADR-016-unified-answer-field.md) | Unified Answer Field | Accepted | answer.value + numeric + unit |
| [ADR-017](ADR-017-math-input-language.md) | Math Input Language | Accepted | Parser rules for math expressions |
| [ADR-018](ADR-018-math-keyboard-component.md) | MathKeyboard Component | Proposed | Extracted 6-column keyboard |
| [ADR-019](ADR-019-component-architecture.md) | Component Architecture | Proposed | Atomic Design + state + data flow |
| [ADR-020](ADR-020-evaluatable-expected-values.md) | Evaluatable Expected Values | Accepted | Parser evaluates string fractions |
| [ADR-021](ADR-021-automatic-geometry-diagrams.md) | Automatic Geometry Diagrams | Accepted | Auto-generate diagrams for pythagorean questions |
| [ADR-022](ADR-022-multi-mode-questions.md) | Multi-Mode Questions | Accepted | modes.numeric + modes.type_recognition + auto labels |
| [ADR-023](ADR-023-answer-persistence.md) | Answer Persistence | Accepted | Supabase + local-first sync for multi-user analytics |

---

## QAR Process Rules

**IMPORTANT:** V QAR módu vždy postupuj po jedné otázce. Počkej na odpověď před další otázkou.

```
❌ Špatně: Q1, Q2, Q3 najednou
✓ Správně: Q1 → odpověď → Q2 → odpověď → Q3
```

**IMPORTANT:** Po dokončení QAR MUSÍ vždy následovat vyhodnocení dopadu do ADR (Architectural Decision Record). Každé rozhodnutí z QAR musí být zdokumentováno.

```
QAR dokončen → Vytvořit/aktualizovat ADR → Implementovat
```

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decision is active and should be followed |
| **Proposed** | Under discussion, not yet decided |
| **Superseded** | Replaced by newer EDR (see reference) |
| **Rejected** | Considered but not adopted |

---

## PDR Template

Psychological Decision Records focus on emotional safety and inner critic management:

```markdown
# PDR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded | Rejected
**Role:** Psychologist
**Student:** Anezka Mazankova (or "General")

## Context

[What psychological risk or opportunity was identified?]

## Reviewed Documents

[Which EDRs/ADRs were reviewed, with risk assessment]

## Decisions

[Specific psychological safety decisions, with implementation details]

## Psychological Basis

[Theories and research supporting decisions - Attribution Theory, Self-Efficacy, etc.]

## Implementation Checklist

[Concrete steps to implement psychological protections]

## Consequences

**Positive:** [benefits for emotional safety]
**Negative:** [risks of over-protection]

## Open Questions

[Unresolved psychological considerations]

## Related

[Links to EDRs, interventions, psychological profile]
```

---

## EDR Template

New EDRs should follow this structure:

```markdown
# EDR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded | Rejected
**Roles:** Tutor | Psychologist | Architect
**Student:** Anezka Mazankova (or "General" if applies broadly)

## Context

[What problem are we solving? What observation triggered this?]

## Decision

[What we decided to do]

## Pedagogical Basis

[Why this works educationally - cite theories, research, or experience]

## Application

[How this applies to Anezka specifically - concrete examples]

## Consequences

**Positive:** [benefits]
**Negative:** [drawbacks or risks]

## Implementation

[Where/how this will be implemented - app feature, tutoring approach, etc.]

## Open Questions

[Unresolved issues for future discussion]

## Related

- [links to related EDRs, psychological profile, etc.]
```

---

## Related

- [Psychological Profile](../data/psychology/profiles/anezka_mazankova.json)
- [Error Analysis](../data/analysis/error_analysis_summary.json)
- [App Problem Bank](../app/src/data/problem_bank.json)
- [CLAUDE.md](../CLAUDE.md) - Project overview
