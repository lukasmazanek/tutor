# ADR-003: Pythagoras Diagrams

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UI/Content
**Component:** ProblemCard, new DiagramRenderer

## Context

Pythagorovské úlohy v aplikaci mají pouze slovní popis. V CERMAT testech je u geometrických úloh vždy vizuální náčrtek. Vizualizace:
- Snižuje cognitive load
- Odpovídá formátu skutečných testů
- Pomáhá pochopit prostorové vztahy

## Decision

### QAR Summary

| Question | Decision |
|----------|----------|
| Typ vizualizace | **Dynamický SVG** (React komponenta) |
| Kdy zobrazit | **Vždy se zadáním** (jako CERMAT) |
| Typy diagramů | **Všechny** (trojúhelník, žebřík, krychle) |
| Umístění v UI | **V kartě se zadáním** |

### Diagram Types

#### 1. Pravoúhlý trojúhelník (pyth-001, pyth-002)
```
      /|
     / |
  c /  | a
   /   |
  /____|
    b
```
- Označení stran (a, b, c nebo konkrétní hodnoty)
- Zvýraznění pravého úhlu (čtvereček)
- Hledaná strana jinou barvou

#### 2. Žebřík u zdi (pyth-003)
```
  |╲
  | ╲
  |  ╲ žebřík
zeď   ╲
  |    ╲
  |_____╲
   vzdálenost
```
- Zeď (svislá čára)
- Země (vodorovná čára)
- Žebřík (šikmá čára)
- Kóty s hodnotami

#### 3. Krychle - tělesová úhlopříčka (pyth-004)
```
    +-------+
   /|      /|
  / |     / |
 +-------+  |
 |  +....|..+
 | /  d  | /
 |/      |/
 +-------+
```
- 3D reprezentace krychle
- Tělesová úhlopříčka (čárkovaně nebo jinou barvou)
- Označení hrany

### Data Schema

Rozšíření problem_bank.json:

```json
{
  "id": "pyth-001",
  "diagram": {
    "type": "right_triangle",
    "labels": {
      "a": "3",
      "b": "4",
      "c": "?"
    },
    "highlight": "c"
  }
}
```

```json
{
  "id": "pyth-003",
  "diagram": {
    "type": "ladder",
    "labels": {
      "wall_height": "?",
      "ground_distance": "1,5 m",
      "ladder_length": "4 m"
    },
    "highlight": "wall_height"
  }
}
```

```json
{
  "id": "pyth-004",
  "diagram": {
    "type": "cube_diagonal",
    "labels": {
      "edge": "6 cm",
      "diagonal": "?"
    },
    "highlight": "diagonal"
  }
}
```

### Component Architecture

```
ProblemCard.jsx
  └── DiagramRenderer.jsx (new)
        ├── RightTriangleDiagram.jsx
        ├── LadderDiagram.jsx
        └── CubeDiagram.jsx
```

### UI Layout

```jsx
{/* Problem card */}
<div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
  {/* Diagram - if present */}
  {problem.diagram && (
    <div className="mb-4 flex justify-center">
      <DiagramRenderer diagram={problem.diagram} />
    </div>
  )}

  {/* Problem text */}
  <p className="text-lg text-slate-800 leading-relaxed">
    {problem.problem_cs}
  </p>
</div>
```

### Styling

- **Responsive sizing (updated 2024-12-24):**
  - Mobile: `h-24` (96px) - explicit height required for SVG scaling
  - Tablet+: `h-32` (128px)
  - SVG: `w-auto h-full max-w-[200px]` - scales with container
  - Container margin: `my-2` (reduced from my-4)
  - Note: `max-h-*` doesn't work with `h-full` SVG - must use explicit `h-*`
- Colors:
  - Lines: `slate-600`
  - Labels: `slate-700`
  - Highlight (unknown): `safe-blue` or `purple-600`
  - Right angle marker: `slate-400`
- Font: system font, 14px for labels

## Consequences

**Positive:**
- Matches CERMAT test format
- Reduces cognitive load
- Helps visual learners
- Professional appearance

**Negative:**
- More complex problem data schema
- Need to create SVG components
- Maintenance of diagram types

**Mitigation:**
- Start with 3 diagram types only
- Reusable components for future geometry

## Implementation Checklist

- [x] Create DiagramRenderer.jsx component ✓ 2024-12-24
- [x] Create RightTriangleDiagram.jsx ✓ 2024-12-24
- [x] Create LadderDiagram.jsx ✓ 2024-12-24
- [x] Create CubeDiagram.jsx ✓ 2024-12-24
- [x] Create RectangleDiagram.jsx ✓ 2024-12-24
- [x] Create SquareDiagram.jsx ✓ 2024-12-24
- [x] Create EquilateralTriangleDiagram.jsx ✓ 2024-12-24
- [x] Update problem_bank.json with diagram data (10 problems) ✓ 2024-12-24
- [x] Integrate into ProblemCard.jsx ✓ 2024-12-24
- [x] Test on mobile ✓ 2024-12-24
- [x] Fix diagram size for mobile viewport ✓ 2024-12-24
- [ ] Update existing Pythagoras hints (remove text descriptions of shapes)

## Related

- [ADR-001](ADR-001-responsive-multi-column-layout.md) - Responsive layout
- [ADR-002](ADR-002-desktop-math-symbol-input.md) - Math input
- ProblemCard.jsx - Parent component
- VisualExplainer.jsx - Similar pattern for o_x_vice
