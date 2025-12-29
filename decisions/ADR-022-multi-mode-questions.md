# ADR-022: Multi-Mode Questions and Keyboard Enhancement

## Status
Implemented (2025-12-29)

## Date
2025-12-27

## Context

QAR session identified 4 related issues with the Pythagorean ladder question display:

1. **Variable Detection False Positive** - Keyboard showed 'n' for word problem "Žebřík délky 5 m opřený o zeď..." because regex matched Czech word "opřený"

2. **Type Question Routing** - Questions with `original_type: "problem_type"` (answer is text "Pythagorova věta") appeared in ProblemCard with numeric keyboard

3. **Diagram Labels Mismatch** - Diagram showed generic labels (a, b, c) but question used specific values (5 m, 4 m)

4. **Missing Exponent Key** - Keyboard lacked `²` for binomial expansion answers like `9a² - 12a + 4`

### Root Cause

Current architecture assumes one answer per question. Reality: same question can be used in multiple modes (numeric, type recognition, multiple choice).

## Decision

### 1. Mode-First Question Structure

Replace single `answer` with `modes` object. Each mode contains its own answer and distractors.

**Before:**
```json
{
  "answer": {
    "value": "Pythagorova věta",
    "unit": null
  },
  "distractors": ["Přímá úměrnost", "Rovnice"],
  "meta": {
    "supports_mc": true,
    "supports_open": true
  }
}
```

**After:**
```json
{
  "modes": {
    "numeric": {
      "answer": "3",
      "unit": "m",
      "variants": ["3", "3 m", "3m"],
      "distractors": ["4", "5", "6"]
    },
    "type_recognition": {
      "answer": "Pythagorova věta",
      "distractors": ["Přímá úměrnost", "Rovnice"]
    }
  }
}
```

**Rules:**
- Missing key = mode not supported
- `meta.supports_X` derived from `!!modes.X`
- App selects mode based on current view (ProblemCard → `numeric`, TypeDrill → `type_recognition`)

### 2. Keyboard Configuration in Data

Move variable detection from app runtime to data pipeline. Add `keyboard` config.

```json
{
  "keyboard": {
    "variable": "a"    // null = don't show variable key
  }
}
```

**Detection logic in generate-formats.js:**
```javascript
function detectKeyboardVariable(q) {
  const text = q.question.stem || q.question.context || ''

  // Require digit before variable: 4n, 3a, 2x
  // Prevents matching Czech words like "opřený"
  const match = text.match(/\d+([nabxy])\b/i)
  if (match) return match[1].toLowerCase()

  return null  // No variable key for word problems
}
```

### 3. Explicit Diagram Labels

Add `labels` to diagram config in source data. Claude generates, human reviews.

```json
{
  "diagram": {
    "type": "right_triangle",
    "highlight": "b",
    "labels": {
      "a": "4 m",
      "b": "?",
      "c": "5 m"
    }
  }
}
```

**Mapping for ladder problem:**
- c (hypotenuse) = "5 m" (ladder length)
- a (vertical) = "4 m" (wall height)
- b (horizontal) = "?" (distance from wall, unknown)

### 4. Expanded Keyboard Layout

Expand from 5 to 6 columns to include `²` for binomial answers.

**Before (5 columns):**
```
7  8  9  ÷  √
4  5  6  ×  [a]
1  2  3  -  (
0  ,  ⌫  +  )
```

**After (6 columns):**
```
7  8  9  ÷  √  ²
4  5  6  ×  (  )
1  2  3  -  +  [a]
0  ,  ⌫        ✓
```

**Notes:**
- `[a]` is dynamic variable from `keyboard.variable`
- If `keyboard.variable: null`, that cell is empty or hidden
- `✓` is submit button
- Touch targets remain adequate (recalculate widths)

## Implementation Plan

### Phase 1: Data Schema Migration

1. Update `data/source/content/*.json`:
   - Add `modes` structure
   - Add `keyboard.variable`
   - Add `diagram.labels` for pythagorean questions

2. Update `scripts/generate-formats.js`:
   - Transform to new schema
   - Detect keyboard variable
   - Pass through diagram labels

3. Update `scripts/validate-data.js`:
   - Validate `modes` structure
   - Validate `keyboard` config

### Phase 2: App Updates

4. Update TypeScript types in `app/src/types/`:
   - `UnifiedQuestion` with `modes`
   - `KeyboardConfig` type
   - `DiagramConfig` with labels

5. Update `ProblemCard.tsx`:
   - Use `modes.numeric` for answer
   - Use `keyboard.variable` for key display
   - Implement 6-column layout

6. Update `TypeDrill`:
   - Use `modes.type_recognition` for answer

7. Update `RightTriangleDiagram.tsx`:
   - Display labels from data

### Phase 3: Data Population

8. Claude generates `diagram.labels` for ~34 pythagorean questions
9. Claude generates `modes.numeric` answers for type_recognition questions that lack them
10. Human review and commit

## Consequences

### Positive

- One question usable in all modes
- Explicit data = no runtime guessing
- Keyboard configurable per question
- Diagrams show actual values from problem
- Architecturally clean separation

### Negative

- Schema migration required
- ~34 questions need manual label addition
- Larger JSON payload (minimal impact)

### Neutral

- `meta.supports_X` becomes derived, not stored
- Old apps need update to read new format

## Alternatives Considered

### A: Runtime variable detection with better regex
- Rejected: Czech language makes regex unreliable

### B: Separate questions per mode
- Rejected: Content duplication, maintenance burden

### C: Auto-extract diagram labels from text
- Rejected: NLP on Czech text too fragile for MVP

## Related

- ADR-014: Unified question format
- ADR-016: Unified answer field
- ADR-021: Automatic geometry diagrams
- QAR-2025-12-27: Pythagorean ladder issues

## Migration Example

**Full question transformation:**

```json
// BEFORE (current)
{
  "id": "PYTH-029",
  "topic": "pythagorean",
  "question": {
    "stem": "Žebřík délky 5 m opřený o zeď dosahuje do výšky 4 m. Jak daleko je od zdi?",
    "context": null
  },
  "answer": {
    "value": "Pythagorova věta",
    "unit": null
  },
  "distractors": ["Přímá úměrnost", "Rovnice"],
  "diagram": {
    "type": "right_triangle",
    "highlight": "b"
  },
  "meta": {
    "type_id": "PYTH-PTYPE",
    "original_type": "problem_type",
    "supports_mc": true,
    "supports_open": true
  }
}

// AFTER (new)
{
  "id": "PYTH-029",
  "topic": "pythagorean",
  "question": {
    "stem": "Žebřík délky 5 m opřený o zeď dosahuje do výšky 4 m. Jak daleko je od zdi?",
    "context": null
  },
  "modes": {
    "numeric": {
      "answer": "3",
      "unit": "m",
      "variants": ["3", "3 m", "3m"],
      "distractors": ["4", "5", "6"]
    },
    "type_recognition": {
      "answer": "Pythagorova věta",
      "distractors": ["Přímá úměrnost", "Rovnice"]
    }
  },
  "keyboard": {
    "variable": null
  },
  "diagram": {
    "type": "right_triangle",
    "highlight": "b",
    "labels": {
      "a": "4 m",
      "b": "?",
      "c": "5 m"
    }
  },
  "meta": {
    "type_id": "PYTH-PTYPE",
    "original_type": "problem_type"
  }
}
```
