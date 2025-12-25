# EDR-001: Atomic Skills Approach

**Date:** 2024-12-24
**Status:** Accepted
**Roles:** Tutor
**Student:** Anezka Mazankova (generalizable)

## Context

Complex CERMAT math problems appear overwhelming to students like Anezka. Analysis shows that errors often stem not from inability to solve the full problem, but from hesitation or mistakes in basic sub-steps (e.g., "o čtvrtinu více" = ×1.25).

Observation: Anezka knows 1/4 = 0.25, and she can multiply. But when these appear together in a word problem under time pressure, she makes errors. The basic skills are not *automatized*.

## Decision

**Decompose every complex skill into atomic sub-skills and train each to automaticity before combining.**

An atomic skill is:
- A single mental operation
- Completable in <5 seconds
- Binary correct/incorrect
- Does not require other skills to execute

Example decomposition for "o X více" problems:

```
Complex skill: "Cena se zvýšila o čtvrtinu. Kolik stojí nyní?"
                              │
         ┌──────────────────┼───────────────────┐
         ▼                  ▼                   ▼
    OXV-01              OXV-11              OXV-40
    1/4 = 0,25    "o čtvrtinu více"    původní × 1,25
                      = ×1,25
```

## Pedagogical Basis

### Cognitive Load Theory (Sweller, 1988)

Working memory has limited capacity (~4 items). When basic operations require conscious effort, they consume capacity needed for higher-order reasoning.

| Non-automatized | Automatized |
|-----------------|-------------|
| Each step = cognitive load | Basic steps = "free" |
| Total load exceeds capacity | Capacity available for problem-solving |
| Errors under stress | Stable under stress |

### Automaticity (LaBerge & Samuels, 1974)

A skill is automatic when it:
- Requires no conscious attention
- Executes consistently regardless of context
- Does not degrade under cognitive load

### Chunking (Miller, 1956)

Experts don't have better working memory - they have more pre-built chunks. "1/4 = 0.25" becomes one chunk, not a calculation.

### Fluency Building (Precision Teaching)

Fluency = accuracy + speed. Both are required for automaticity. A student who answers correctly but slowly is not yet fluent.

## Application

### Anezka's Critical Gaps → Atomic Skills

| Gap | Atomic Skills Required |
|-----|----------------------|
| "o X více/méně" | OXV-01 to OXV-42 (18 skills) |
| Binomické vzorce | BIN-01 to BIN-31 (9 skills) |
| Převody jednotek | PRE-01 to PRE-31 (11 skills) |
| Posloupnosti | POS-01 to POS-40 (10 skills) |

### Skill Taxonomy

See: [Atomic Skills Taxonomy](#atomic-skills-taxonomy) below

### Training Protocol

1. **Isolate** - Practice one skill at a time
2. **Drill** - Repeat until <3 second response
3. **Mix** - Combine with other mastered skills
4. **Apply** - Use in full problem context

## Consequences

**Positive:**
- Targets root cause of errors, not symptoms
- Builds confidence through small wins
- Progress is measurable (time + accuracy)
- Works under stress (automaticity is robust)
- Scalable to any topic area

**Negative:**
- Requires skill decomposition work upfront
- May feel repetitive to student
- Need to balance drill with meaningful practice
- Risk of "drill without understanding" if poorly implemented

**Mitigation for negatives:**
- Gamify drills (streaks, personal bests)
- Always connect skill to "why it matters"
- Interleave with full problems to show application

## Implementation

### App Feature: Bleskové kolo (Lightning Round)

See: [EDR-002](EDR-002-lightning-round.md) (to be created)

Quick-fire practice of atomic skills:
- 10 questions per round
- Single skill per round (no mixing initially)
- 3 answer choices
- Soft timer (visual motivation, not punishment)
- Track speed + accuracy over time

### Skill Progression

```
Level 1: Single skill drill (OXV-01 only)
    ↓
Level 2: Related skills mixed (OXV-01 to OXV-05)
    ↓
Level 3: Cross-skill (OXV + application)
    ↓
Level 4: Full problem with all skills
```

## Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | How many repetitions for automaticity? | Research suggests 30-50 correct trials minimum |
| 2 | How to handle frustration with drill? | Gamification, short sessions, celebrate streaks |
| 3 | When to advance from drill to application? | Propose: 80% accuracy + <3s average time |
| 4 | Should skills unlock in sequence? | TBD - may increase or decrease motivation |

---

## Atomic Skills Taxonomy

### Naming Convention

`{CATEGORY}-{NUMBER}`

| Category | Code | Skills Count |
|----------|------|--------------|
| "o X více/méně" | OXV | 18 |
| Binomické vzorce | BIN | 9 |
| Převody jednotek | PRE | 11 |
| Posloupnosti | POS | 10 |
| **Total** | | **48** |

### OXV: "o X více/méně" (CRITICAL)

| ID | Skill | Example Q → A | Target |
|----|-------|---------------|--------|
| OXV-01 | Zlomek → desetinné | 1/4 = ? → 0,25 | 2s |
| OXV-02 | Zlomek → desetinné | 1/3 = ? → 0,33 | 2s |
| OXV-03 | Zlomek → desetinné | 1/5 = ? → 0,2 | 2s |
| OXV-04 | Zlomek → desetinné | 2/5 = ? → 0,4 | 2s |
| OXV-05 | Zlomek → desetinné | 3/4 = ? → 0,75 | 2s |
| OXV-10 | "o X více" → koef. | "o polovinu více" = ×? → 1,5 | 3s |
| OXV-11 | "o X více" → koef. | "o čtvrtinu více" = ×? → 1,25 | 3s |
| OXV-12 | "o X více" → koef. | "o třetinu více" = ×? → 1,33 | 3s |
| OXV-13 | "o X více" → koef. | "o pětinu více" = ×? → 1,2 | 3s |
| OXV-20 | "o X méně" → koef. | "o polovinu méně" = ×? → 0,5 | 3s |
| OXV-21 | "o X méně" → koef. | "o čtvrtinu méně" = ×? → 0,75 | 3s |
| OXV-22 | "o X méně" → koef. | "o třetinu méně" = ×? → 0,67 | 3s |
| OXV-30 | "X-krát více" | "třikrát více" = ×? → 3 | 2s |
| OXV-31 | "X-krát více" | "dvakrát více" = ×? → 2 | 2s |
| OXV-32 | "X-krát méně" | "dvakrát méně" = ×? → 0,5 | 2s |
| OXV-40 | Aplikace | 80 × 1,25 = ? → 100 | 5s |
| OXV-41 | Aplikace | 120 × 0,75 = ? → 90 | 5s |
| OXV-42 | Full verbal | 60 "o třetinu více" = ? → 80 | 6s |

### BIN: Binomické vzorce

| ID | Skill | Example Q → A | Target |
|----|-------|---------------|--------|
| BIN-01 | Vzorec (a+b)² | (a+b)² = ? → a² + 2ab + b² | 3s |
| BIN-02 | Vzorec (a-b)² | (a-b)² = ? → a² - 2ab + b² | 3s |
| BIN-03 | Vzorec (a+b)(a-b) | (a+b)(a-b) = ? → a² - b² | 3s |
| BIN-10 | Identifikace a | (2x+3)² → a=? → 2x | 2s |
| BIN-11 | Identifikace b | (2x+3)² → b=? → 3 | 2s |
| BIN-20 | Střední člen | (2x+3)² → 2ab=? → 12x | 4s |
| BIN-21 | Střední člen | (5-2y)² → 2ab=? → 20y | 4s |
| BIN-30 | Celý rozvoj | (x+4)² = ? → x² + 8x + 16 | 6s |
| BIN-31 | Celý rozvoj | (2a-1)² = ? → 4a² - 4a + 1 | 6s |

### PRE: Převody jednotek

| ID | Skill | Example Q → A | Target |
|----|-------|---------------|--------|
| PRE-01 | Délka | 1 m = ? cm → 100 | 2s |
| PRE-02 | Délka | 1 m = ? dm → 10 | 2s |
| PRE-10 | Plocha | 1 m² = ? cm² → 10 000 | 3s |
| PRE-11 | Plocha | 1 m² = ? dm² → 100 | 3s |
| PRE-12 | Plocha | 1 dm² = ? cm² → 100 | 3s |
| PRE-20 | Objem | 1 m³ = ? dm³ → 1 000 | 3s |
| PRE-21 | Objem | 1 dm³ = ? cm³ → 1 000 | 3s |
| PRE-22 | Objem | 1 dm³ = ? l → 1 | 2s |
| PRE-23 | Objem | 1 l = ? ml → 1 000 | 2s |
| PRE-30 | Aplikace | 5 000 cm² = ? m² → 0,5 | 4s |
| PRE-31 | Aplikace | 2,5 dm³ = ? l → 2,5 | 3s |

### POS: Posloupnosti

| ID | Skill | Example Q → A | Target |
|----|-------|---------------|--------|
| POS-01 | Rozpoznání | 2, 5, 8, 11 → typ? → aritmetická | 3s |
| POS-02 | Rozpoznání | 2, 6, 18, 54 → typ? → geometrická | 3s |
| POS-10 | Diference | 2, 5, 8, 11 → d=? → 3 | 3s |
| POS-11 | Kvocient | 2, 6, 18, 54 → q=? → 3 | 3s |
| POS-20 | Vzorec aritm. | a₁=2, d=3 → aₙ=? → 3n-1 | 5s |
| POS-21 | Vzorec geom. | a₁=2, q=3 → aₙ=? → 2×3^(n-1) | 5s |
| POS-30 | Dosazení | aₙ=3n-1, n=10 → ? → 29 | 4s |
| POS-31 | Dosazení | aₙ=2×3^(n-1), n=4 → ? → 54 | 5s |
| POS-40 | Počet členů | Od 5 do 35 po 5 → počet? → 7 | 4s |
| POS-41 | Počet členů | Od 3 do 27, d=3 → počet? → 9 | 4s |

---

## Related

- Psychological profile: `data/psychology/profiles/anezka_mazankova.json`
- Error analysis: `data/analysis/error_analysis_summary.json`
- Test data: `data/tests/`
