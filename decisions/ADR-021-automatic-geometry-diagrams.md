# ADR-021: Automatic Geometry Diagrams

## Status
Accepted

## Date
2024-12-27

## Context

Pythagorean theorem questions display without visual context, making them confusing or impossible to solve. For example:

```
"Hledám odvěsnu a ="
```

Without a labeled right triangle diagram, the student doesn't know what a, b, c refer to.

### Problem Analysis

1. **Data structure supports diagrams** - `UnifiedQuestion` has optional `diagram?: DiagramConfig`
2. **Diagram components exist** - `RightTriangleDiagram` with highlight support
3. **Source data lacks diagrams** - 34 pythagorean questions, 0 have diagram field
4. **Questions are unusable** - Cannot solve geometry without visual reference

### Decision Driver

The app should determine diagram requirements from **structured data** (topic, stem), not rely on manual configuration for every question.

## Decision

**Automatically generate `diagram` field for geometry topics during data generation.**

### Implementation

In `generate-formats.js`, add diagram based on topic:

```javascript
if (q.topic === 'pythagorean') {
  result.diagram = {
    type: 'right_triangle',
    highlight: getPythagoreanHighlight(q.question.stem)
  };
}
```

### Highlight Detection Logic

Parse question stem to determine which side is being asked:

| Pattern in stem | Highlight |
|-----------------|-----------|
| `c = ?`, `přeponu`, `c =` | `"c"` (hypotenuse) |
| `a = ?`, `odvěsnu a`, `a =` | `"a"` (leg) |
| `b = ?`, `odvěsnu b`, `b =` | `"b"` (leg) |
| default | `"c"` |

### Output Format

```json
{
  "id": "PYTH-T02",
  "topic": "pythagorean",
  "question": {
    "stem": "Hledám odvěsnu a ="
  },
  "diagram": {
    "type": "right_triangle",
    "highlight": "a"
  }
}
```

## Consequences

### Positive
- All pythagorean questions automatically get diagrams
- Highlight shows which side is being solved for
- No manual diagram configuration needed
- Visual learning supported consistently

### Negative
- Logic assumes standard a, b, c labeling convention
- May need extension for other geometry topics (rectangles, cubes)

### Future Extensions

Same pattern can apply to other geometry topics:

| Topic | Diagram Type | Highlight Source |
|-------|--------------|------------------|
| `pythagorean` | `right_triangle` | stem parsing |
| `area_rectangle` | `rectangle` | stem parsing |
| `volume_cube` | `cube` | stem parsing |

## Alternatives Considered

### A: Manual diagram in source data
- Requires editing 34+ questions manually
- Error-prone, easy to forget
- Rejected: Too much maintenance

### B: Diagram required field in schema
- Would break existing questions
- Requires migration
- Rejected: Automatic generation is cleaner

## Related
- ADR-014: Unified question format
- ADR-016: Unified answer field
- `app/src/components/diagrams/RightTriangleDiagram.tsx`
