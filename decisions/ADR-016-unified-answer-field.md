# ADR-016: Unified Answer Field

## Status
Accepted

## Date
2024-12-25

## Context

The current answer format uses two fields that store the same information in different formats:

```json
"answer": {
  "correct": "1,2",    // Czech format string for display
  "numeric": 1.2,      // JS number for comparison
  "unit": null
}
```

### Problems with current approach

1. **Data duplication** - Same value stored twice in different formats
2. **Bug-prone** - Fields can get out of sync (just fixed 16+ bugs where `numeric: 1` should have been `1.2`, `1.5`, etc.)
3. **Maintenance burden** - Must update both fields when adding/editing questions
4. **Confusing semantics** - When to use which field?

### Current usage patterns

| Answer Type | `correct` | `numeric` | Example |
|-------------|-----------|-----------|---------|
| Integer | "4" | 4 | Equation solution |
| Decimal | "1,2" | 1.2 | o X více multiplier |
| Algebraic | "x × 6/5" | null | Type recognition |

## Decision

**Unify to single `value` field** with automatic display formatting.

### New format

```json
"answer": {
  "value": 1.2,        // Number for numeric, string for algebraic
  "unit": null
}
```

### Display logic

```javascript
function formatAnswer(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ');  // 1.2 → "1,2"
  }
  return value;  // Already a string
}
```

### Comparison logic

```javascript
function checkAnswer(userInput, answer) {
  if (typeof answer.value === 'number') {
    // Parse user input (handle both "1.2" and "1,2")
    const parsed = parseFloat(userInput.replace(',', '.'));
    return Math.abs(parsed - answer.value) < 0.001;
  }
  // String comparison for algebraic expressions
  return normalizeExpression(userInput) === normalizeExpression(answer.value);
}
```

## Consequences

### Positive
- **Single source of truth** - No desynchronization possible
- **Less data** - Smaller JSON files
- **Clearer semantics** - One field, one purpose
- **Type-based behavior** - `typeof value` determines handling

### Negative
- **Migration required** - Must update all existing questions
- **Code changes** - ProblemCard must be updated

### Neutral
- Display formatting moves from data to code (appropriate separation)

## Migration

1. For each question:
   - If `numeric` is not null → `value = numeric`
   - If `numeric` is null → `value = correct`
2. Remove `correct` field
3. Rename `numeric` to `value`

## Implementation

- Migration script: `scripts/migrate-answer-field.js`
- Affected components: `ProblemCard.jsx`
