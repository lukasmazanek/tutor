# ADR-002: Desktop Math Symbol Input

**Date:** 2024-12-24
**Status:** Accepted
**Type:** UI/UX
**Component:** ProblemCard

## Context

Na desktopu používáme standardní textový input s klávesnicí. Uživatel ale nemůže snadno zadat matematické symboly jako √ (odmocnina), které jsou běžné v CERMAT úlohách.

Na mobilu máme virtuální klávesnici se všemi symboly - na desktopu je to redundantní pro čísla, ale potřebné pro speciální znaky.

## Decision

**Hybrid přístup: Symbol bar + text shortcuts**

### 1. Symbol Bar (vizuální)

Malý panel pouze se speciálními symboly, umístěný pod inputem:

```
┌─────────────────────────────────────┐
│  Tvoje odpověď...                   │  ← input
└─────────────────────────────────────┘
   √(    ^    (    )                     ← symbol bar
┌────┬────┬────┬────┐
│ 🏠 │ 📊 │ 💡 │ ✓  │                    ← action buttons
└────┴────┴────┴────┘
```

**Symboly:**
| Symbol | Funkce | Vloží |
|--------|--------|-------|
| `√(` | Odmocnina | `√(` (kurzor mezi závorky) |
| `^` | Mocnina | `^` |
| `(` | Levá závorka | `(` |
| `)` | Pravá závorka | `)` |

### 2. Text Shortcuts (power users)

Parser akceptuje textové alternativy:

| Uživatel napíše | Interpretováno jako |
|-----------------|---------------------|
| `sqrt(9)` | `√(9)` = 3 |
| `3^2` | 3² = 9 (už funguje) |
| `*` | násobení (už funguje) |

### Kde se zobrazuje

| Zařízení | Symbol bar | Text shortcuts |
|----------|------------|----------------|
| Mobile | NE (má full keyboard) | ANO |
| Desktop | ANO | ANO |

## Rationale

### Proč hybrid?

1. **Symbol bar** = viditelná pomoc pro běžné uživatele
   - "Hints are features, not failures" (PDR-001)
   - Okamžitě vidí, že √ je možné zadat

2. **Text shortcuts** = agency pro power users
   - Rychlejší workflow bez myši
   - Nenutíme jeden způsob

### Proč jen 4 symboly?

- Méně = méně overwhelm
- Čísla píše na klávesnici (není potřeba duplikovat)
- `/` je na klávesnici
- `+`, `-` jsou na klávesnici

### Proč pod inputem?

- Blízko action buttons = konzistentní zóna interakce
- Neblokuje pohled na zadání úlohy
- Přirozený flow: napsat → doplnit symbol → odeslat

## Implementation

### Parser Update (parseUserAnswer)

```javascript
// Existing
let mathExpr = normalized.replace(/√\(/g, 'Math.sqrt(')

// Add text alternative
mathExpr = mathExpr.replace(/sqrt\(/gi, 'Math.sqrt(')
```

### Symbol Bar Component

```jsx
{/* Desktop symbol bar - only on desktop, only for non-MC */}
{!isMobile && problem.type !== 'multiple_choice' && (
  <div className="flex gap-2 mb-3">
    {['√(', '^', '(', ')'].map((symbol) => (
      <button
        key={symbol}
        type="button"
        onClick={() => setUserAnswer(prev => prev + symbol)}
        className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700
          font-mono text-lg hover:bg-purple-200 transition-gentle"
      >
        {symbol}
      </button>
    ))}
  </div>
)}
```

### Placement

```jsx
{/* Answer input */}
<input ... />

{/* Desktop symbol bar */}
{!isMobile && <SymbolBar />}

{/* Action buttons */}
<div className="grid grid-cols-4 gap-2">
```

## Consequences

**Positive:**
- Desktop users can input all math symbols
- Two input methods = flexibility
- Minimal UI footprint
- Consistent with mobile experience (same symbols available)

**Negative:**
- Additional UI element on desktop
- Need to document text shortcuts somewhere

**Mitigation:**
- Symbol bar is small and unobtrusive
- Text shortcuts work even if user doesn't know about them
- Tooltip on hover could show "or type sqrt("

## Checklist

- [x] Add `sqrt(` parsing to parseUserAnswer ✓ 2024-12-24
- [x] Create desktop symbol bar component ✓ 2024-12-24
- [x] Position between input and action buttons ✓ 2024-12-24
- [x] Test on desktop browsers ✓ 2024-12-24
- [x] Verify mobile still shows full virtual keyboard ✓ 2024-12-24 (logic verified: isMobile = touch && smallScreen)

## Related

- [ADR-001](ADR-001-responsive-multi-column-layout.md) - Responsive layout
- [PDR-001](PDR-001-psychological-safety-review.md) - "Hints are features" principle
- ProblemCard.jsx - Main component
