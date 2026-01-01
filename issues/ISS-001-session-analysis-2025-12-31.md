# ISS-001: Session Analysis 2025-12-31

**Date:** 2026-01-01
**Type:** Analysis
**Status:** Bugs Resolved (2026-01-01)
**Reporter:** System (Supabase data analysis)
**Session Period:** 2025-12-29 to 2025-12-31

---

## Summary

Analysis of Anezka's app usage from December 29-31, 2025. Identified learning patterns, content issues, and application bugs.

---

## Session Activity

| Date | Attempts | Correct | Accuracy | Time |
|------|----------|---------|----------|------|
| 2025-12-31 | 3 | 2 | 66% | 1.2 min |
| 2025-12-29 | 103 | 49 | 47% | 30.9 min |
| **Total** | **106** | **51** | **48%** | **32 min** |

---

## Learning Analysis

### Strengths (>65% accuracy)

| Topic | Score | Notes |
|-------|-------|-------|
| fractions | 5/5 (100%) | Solid understanding |
| equations | 2/2 (100%) | Strength area |
| averages | 11/16 (68%) | Good, some errors |
| work_problems | 4/6 (66%) | Acceptable |

### Critical Weaknesses (<50% accuracy)

#### 1. binomial_squares: 3/25 (12%) - CRITICAL

**Root cause:** Forgets to multiply middle term by 2

| Example | Her Answer | Correct | Error Pattern |
|---------|-----------|---------|---------------|
| (3a - 2)² | 9a² - **6a** + 4 | 9a² - **12a** + 4 | 2×3×2=12, not 6 |
| (1/3 - 4b)² | 1/9 - **4b/3** + 16b² | 1/9 - **8b/3** + 16b² | 2×(1/3)×4=8/3 |
| (x+2)² - (x-2)² | 4x | 8x | Difference of squares error |

**Pattern:** Uses `a² + b²` instead of `a² + 2ab + b²`

#### 2. o_x_vice: 17/31 (54%) - CRITICAL

**Root cause:** Doesn't understand "o X více" = 1 + X (multiplicative)

| Her Answer | Correct | Pattern |
|-----------|---------|---------|
| o 30% více = **30** | **1.3x** | Writes percentage, not multiplier |
| o 100% více = **100** | **2x** | Same error |
| o třetinu více = **1/3** | **4/3x** | Writes fraction, not result |
| o pětinu méně = **1.2** | **0.8x** | Inverted operation |

**Pattern:** Answers with the change amount, not the resulting multiplier.

#### 3. pythagorean: 8/16 (50%)

**Errors:**
- Adds instead of using Pythagorean theorem: `3+4=7` instead of `√(9+16)=5`
- Adds instead of subtracting for leg: `5+13=18` instead of `√(169-25)=12`

#### 4. sequences: 0/2 (0%)

- Off-by-one errors in arithmetic sequences
- Geometric sequence calculation errors

#### 5. unit_conversions: 1/3 (33%)

- Missing zeros in area conversions: `750` instead of `7500`

---

## Application Bugs

### BUG-1: Duplicate Attempt Records (HIGH) ✅ RESOLVED

**Description:** Same question saved multiple times with identical answers and timestamps.

**Evidence:** Question `(1/3 - 4b)²` recorded 19 times with:
- Same answer: `1/9 - 4b/3 + 16b²`
- Same time: 38s
- Same session

**Impact:** Inflates attempt counts, skews statistics.

**Root Cause:** Submit button was not disabled during 'correct' feedback phase (1.5s timeout). User could click multiple times.

**Fix:** Added `feedback === 'correct'` to disabled condition in `ProblemCard.tsx:586`.

**Commit:** `103795e` (2026-01-01)

### BUG-2: Wrong user_id in error_queue (MEDIUM) ✅ RESOLVED

**Description:** Error queue saves `user_id: "local"` instead of actual user ID (e.g., "anezka").

**Evidence:** All 41 error_queue records have `user_id: "local"`.

**Impact:** Cannot filter error reports by user.

**Root Cause:** When app loaded with stored profile, `setCurrentUserId()` wasn't called. Storage layer kept default `'local'` value.

**Fix:** Added useEffect in `App.tsx:143-147` to call `setCurrentUserId(storedUser)` on mount.

**Commit:** `103795e` (2026-01-01)

---

## Content Issues (41 Reported)

### By Category

| Category | Count | Description |
|----------|-------|-------------|
| Missing context | 9 | Question needs image/diagram |
| Unsupported type | 10 | Construction/table can't be solved digitally |
| Unclear answer | 22 | Answer format wrong or unclear |

### By Topic

| Topic | Reports | Issue |
|-------|---------|-------|
| percents | 6 | Questions incomplete without context |
| constructions | 6 | Can't solve constructions digitally |
| factoring | 5 | New topic, needs review |
| word_problems | 5 | Missing problem context |
| volume | 4 | Missing diagrams |
| tables_graphs | 4 | Markdown tables don't render |
| area_perimeter | 4 | Missing geometric diagrams |
| ratios | 3 | Missing number line images |
| circles | 2 | Missing diagrams |
| functions | 1 | Incomplete context |
| pythagorean | 1 | Wrong answer format ("Pythagorova věta" instead of number) |

### Specific Issues

#### Questions needing images (sample)
- `are-test-005`: "Obsah lichoběžníku ABCD" - no diagram
- `vol-test-009`: "Výška válce s poloměrem 50cm" - no visual
- `cir-test-001`: "Půlkruh s průměrem AB" - needs diagram

#### Construction questions (unsolvable digitally)
- `con-test-001` through `con-test-008`: All require paper/drawing

#### Wrong answer format
- `PYTH-P01`: Correct answer is "Pythagorova věta" but question asks for hypotenuse (should be "5")

---

## Recommendations

### Immediate (Bugs)

1. **Fix duplicate saving** - Add debounce or check for existing attempt
2. **Fix user_id in error_queue** - Use `getCurrentUserId()` in `saveError()`

### Short-term (Content)

1. **Add `requires_image` flag** to questions that need diagrams
2. **Hide/disable constructions** topic until digital solution exists
3. **Fix PYTH-P01 answer** - should be "5", not "Pythagorova věta"
4. **Review tables_graphs** - fix markdown rendering or convert to images

### Medium-term (Learning)

1. **Create binomial drill** focusing only on middle term: "2ab = ?"
2. **Redesign o_x_vice questions** - show formula building: "1 + 0.3 = ?"
3. **Add visual cues for Pythagorean** - color-code legs vs hypotenuse

---

## Root Cause: Missing Context in Pipeline

### The Pipeline Problem

```
CERMAT PDF ──┐
             │ [LOSS 1: Manual analysis didn't capture shared context]
             ▼
data/tests/*.json ──┐
  • task: "Kolik hodin denně v zaměstnání"
  • ❌ MISSING: shared context (pie chart showing daily time distribution)
  • ❌ MISSING: images/diagrams
                    │ [LOSS 2: scripts/extract-from-tests.js line 211-215]
                    │   context: q.task  // Just copies task!
                    │   image: null      // Always null!
                    ▼
data/source/content/*.json
  • stem: "Kolik hodin denně v zaměstnání"
  • context: "Kolik hodin denně v zaměstnání"  ← USELESS COPY!
  • image: null
                    ▼
                APP (question is unsolvable)
```

### Context Analysis (353 questions)

| Category | Count | % |
|----------|-------|---|
| Has meaningful context | 73 | 21% |
| Context = copy of stem | 240 | 68% |
| **MISSING CONTEXT (critical)** | **40** | **11%** |

### Most Affected Topics

| Topic | Missing Context | Typical Problem |
|-------|-----------------|-----------------|
| percents | 14 | Pie charts, tables missing |
| word_problems | 9 | Shared intro text missing |
| constructions | 4 | Can't solve digitally |
| area_perimeter | 3 | Geometry diagrams missing |

### Fix Strategy

1. **Phase 1: Triage** - Mark questions as `requires_context: true`
2. **Phase 2: Hide** - Don't show unsolvable questions in app
3. **Phase 3: Enrich** - Go back to CERMAT PDFs and extract:
   - Shared context paragraphs
   - Diagrams/charts as images or descriptions
   - Link related questions (8.1, 8.2 share same chart)

---

## Raw Data References

- Supabase table: `attempts` (user_id: "anezka")
- Supabase table: `error_queue` (user_id: "local")
- Date range: 2025-12-29 to 2025-12-31

---

## Related

- [ADR-023](../decisions/ADR-023-answer-persistence.md) - Answer Persistence (storage layer)
- [EDR-001](../decisions/EDR-001-atomic-skills-approach.md) - Atomic Skills (learning approach)
- [Psychological Profile](../data/psychology/profiles/anezka_mazankova.json)
