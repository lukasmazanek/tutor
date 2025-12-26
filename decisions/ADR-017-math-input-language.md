# ADR-017: Meta-jazyk pro matematický vstup

## Status
Schváleno (2024-12-26)

## Kontext
Aplikace potřebuje konzistentní pravidla pro parsování a vyhodnocování matematického vstupu od uživatele. Dosavadní ad-hoc řešení vedla k nekonzistentnímu chování (např. `500x0,8` nebylo vyhodnoceno, `x` vs `×` zmatek).

## Rozhodnutí

### 1. Dva režimy vyhodnocení

| Režim | Typ v datech | Metoda |
|-------|--------------|--------|
| **Numerický** | `answer.type: "numeric"` | JS eval → přesná shoda čísel |
| **Symbolický** | `answer.type: "symbolic"` | Normalizace → porovnání stringů |

### 2. Mapování vstupů na JS formát (numerický režim)

#### Násobení → `*`
| Vstup | → JS |
|-------|------|
| `×` | `*` |
| `·` | `*` |
| `*` | `*` |
| `x` | **zůstává `x`** (vždy proměnná) |

#### Dělení → `/`
| Vstup | → JS |
|-------|------|
| `/` | `/` |
| `÷` | `/` |
| `:` | `/` |

#### Mocnina → `**`
| Vstup | → JS |
|-------|------|
| `^` | `**` |
| `²` | `**2` |
| `³` | `**3` |

#### Odmocnina → `Math.sqrt()`
| Vstup | → JS |
|-------|------|
| `√(...)` | `Math.sqrt(...)` |
| `sqrt(...)` | `Math.sqrt(...)` |

#### Ostatní
| Vstup | → JS |
|-------|------|
| `,` | `.` (desetinná čárka) |

### 3. Pravidlo pro `x`

**`x` = vždy proměnná, nikdy násobení**

- Pro násobení uživatel musí použít `×`, `*` nebo `·`
- Klávesnice aplikace obsahuje tlačítko `×`

### 4. Typy odpovědí pro "o X více/méně"

#### Typ A: Operace (symbolic)
```
Zadání: o 30 % více = ?
Odpověď: 1,3x (algebraický výraz)
```

**Akceptované varianty:**
- `1,3x`, `1.3x`, `x·1,3`, `x×1,3`

**Chybná odpověď `1,3` → hint:**
```
Vyjádři jako výraz s x: 1,3x
```

#### Typ B: Výpočet (numeric)
```
Zadání: Cena o pětinu nižší. Původní 500 Kč. Kolik zaplatíš?
Odpověď: 400 Kč
```

**Akceptované varianty:**
- `400 Kč`
- `500×0,8 Kč` (výraz obsahující původní hodnotu)
- `500*4/5 Kč`
- `500-100 Kč`

**Neakceptované:**
- `200+200 Kč` (neobsahuje původní hodnotu 500)

### 5. Validace výrazů ve výpočtových úlohách

**Pravidlo:** Výraz musí obsahovat číslo ze zadání (`question.originalValue`).

### 6. Porovnání čísel

**Přesná shoda, žádná tolerance.**

### 7. Iracionální čísla

**Pouze přesný tvar, ne aproximace.**

- `√108` ✓
- `6√3` ✓ (ekvivalentní forma)
- `10,39` ✗ (aproximace)

**Ekvivalentní formy odmocnin** se uznávají. Ověření: numerické vyhodnocení obou stran.

### 8. Jednotky

**Povinné pokud definované v `answer.unit`.**

Akceptované varianty (case-insensitive, mezery volitelné):
- `400 Kč`, `400Kč`, `400 kč`, `400 KČ`

### 9. Normalizace algebraických výrazů (symbolic)

| Pravidlo | Příklad |
|----------|---------|
| `,` → `.` | `1,3x` → `1.3x` |
| Odstranit mezery | `x² + 6x` → `x²+6x` |
| Lowercase | `1,3X` → `1.3x` |
| `^2` → `²` | `x^2` → `x²` |
| `^3` → `³` | `x^3` → `x³` |

### 10. Implicitní násobení

Před proměnnou `x` se doplní `*`:

| Vstup | → Převod |
|-------|----------|
| `(1+1/5)x` | `(1+1/5)*x` |
| `2x` | `2*x` |
| `6/5x` | `6/5*x` |
| `1,2x` | `1.2*x` |

**Regex:** `(\d|\.|\))x` → `$1*x`

### 11. Ekvivalence symbolických výrazů

Pro výrazy s proměnnou `x`:
- Doplnit implicitní násobení
- Dosadit testovací hodnotu (x = 10)
- Vyhodnotit numericky
- Porovnat výsledky

**Ekvivalentní formy (všechny správné):**
- `1.2x` = `6/5·x` = `x×6/5` = `6x/5`

```javascript
function areEquivalent(userExpr, expectedExpr) {
  const testValue = 10
  const userResult = evaluate(userExpr, { x: testValue })
  const expectedResult = evaluate(expectedExpr, { x: testValue })
  return userResult === expectedResult
}
```

### 11. Chybové hinty

| Chyba | Hint |
|-------|------|
| `1,3` místo `1,3x` | "Vyjádři jako výraz s x: 1,3x" |
| Chybí jednotka | "Odpověz včetně jednotky: Kč" |
| Výraz neobsahuje původní hodnotu | "Výraz musí vycházet z původní hodnoty" |

Hinty se zobrazují:
- Při chybné odpovědi
- Na vyžádání uživatele

---

## Implementace

### Struktura projektu

```
tutor/
├── lib/
│   └── mathParser.js      # sdílená logika
├── app/
│   └── src/               # importuje přes @lib alias
│   └── vite.config.js     # alias: @lib → ../../lib
├── scripts/
│   └── generate-formats.js # importuje z lib/
```

### Vite konfigurace

```javascript
// vite.config.js
resolve: {
  alias: {
    '@lib': path.resolve(__dirname, '../lib')
  }
}
```

### API modulu

```javascript
// lib/mathParser.js

/**
 * Vyhodnotí odpověď uživatele
 * @param {string} userInput - vstup od uživatele
 * @param {object} problem - { question, answer } z dat
 * @returns {{ isCorrect: boolean, hint: string|null, normalized: string }}
 */
export function evaluateAnswer(userInput, problem) {
  // ...
}
```

### Formát dat

```json
{
  "question": {
    "stem": "Cena o pětinu nižší. Původní 500 Kč. Kolik zaplatíš?",
    "context": "...",
    "originalValue": 500
  },
  "answer": {
    "type": "numeric",
    "value": 400,
    "unit": "Kč"
  }
}
```

```json
{
  "question": {
    "stem": "o 30 % více = ?",
    "context": null,
    "originalValue": null
  },
  "answer": {
    "type": "symbolic",
    "value": "1.3x",
    "unit": null
  }
}
```

---

## Důsledky

### Pozitivní
- Konzistentní chování napříč aplikací
- Jasná pravidla pro uživatele
- `x` vždy proměnná = žádná ambiguita
- Sdílený kód mezi app a scripts

### Negativní
- Uživatel musí znát rozdíl mezi `x` a `×`
- Nutná migrace dat (přidat `answer.type`, `question.originalValue`)
- Změna zadání úloh (`×?` → `?`)

### Změny v datech
- [ ] Přidat `answer.type` ke všem otázkám
- [ ] Přidat `question.originalValue` k výpočtovým úlohám
- [ ] Změnit `answer.value` u operací z čísla na string (`1.3` → `"1.3x"`)
- [ ] Změnit zadání `o X více = ×?` → `o X více = ?`

---

## Reference
- QAR session 2024-12-26
