# EDR-004: CERMAT Problem Taxonomy & Decision Tree

**Date:** 2024-12-25
**Status:** Accepted
**Roles:** Tutor
**Student:** Anezka Mazankova

## Context

In time-limited tests like CERMAT, quick problem type recognition and strategy selection is a key success factor. Expert problem-solvers:
1. Recognize problem type instantly (pattern matching)
2. Select appropriate strategy automatically
3. Save cognitive load for actual computation

Anezka shows this pattern clearly:
- **Equations** → recognizes → correct strategy → 70-80% success
- **"o X více"** → doesn't recognize as multiplication → wrong strategy → systematic errors
- **Constructions** → doesn't know how to start → avoids completely

## QAR Decisions

| # | Question | Decision |
|---|----------|----------|
| Q1 | Taxonomy depth | 3 levels (category → type → variant) |
| Q2 | Category basis | CERMAT structure + Anežka's error priorities |
| Q3 | Tree format | Visual diagram + text rules |
| Q4 | Entry point | Keywords first, then math objects |
| Q5 | Documentation | EDR + JSON data file |

## Taxonomy (3 Levels)

### Legend
- ⚠️ Kritické (systematic errors)
- ✓ Silné (consistent success)
- ○ Neutrální (average performance)

### 1. NUMERICKÉ VÝPOČTY (Numerical Computation)

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **Zlomky** | Sčítání/odčítání | ✓ | Společný jmenovatel |
| | Násobení/dělení | ✓ | Násobit přímo, krátit |
| | Složené zlomky | ○ | Převést na dělení |
| **Desetinná čísla** | Základní operace | ✓ | Pozor na desetinnou čárku |
| | Zaokrouhlování | ○ | Pravidlo 5+ nahoru |
| **Procenta** | Základ → procento | ○ | × (p/100) |
| | Procento → základ | ○ | ÷ (p/100) |
| | ⚠️ "o X % více/méně" | ⚠️ | × (1 ± p/100) |
| **Mocniny** | Základní | ✓ | Definice |
| | ⚠️ (a±b)² | ⚠️ | a² ± 2ab + b² |

### 2. ALGEBRA

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **Lineární rovnice** | Bez závorek | ✓ | Izoluj x |
| | Se závorkami | ✓ | Roznásob NEBO vyděl |
| | Se zlomky | ○ | Vynásob společným jmenovatelem |
| **Výrazy** | Úpravy | ✓ | Vytýkání, roznásobování |
| | Dosazování | ✓ | Dosaď a vypočítej |
| **Nerovnice** | Lineární | ○ | Jako rovnice, pozor na × (-1) |

### 3. GEOMETRIE

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **Obvod/obsah** | Základní tvary | ✓ | Vzorec |
| | Složené tvary | ○ | Rozložit na základní |
| **Pythagorova věta** | Přímé použití | ✓ | a² + b² = c² |
| | V úlohách | ✓ | Najít pravý úhel |
| **⚠️ Konstrukce** | Trojúhelník | ⚠️ | Postup: strana → oblouk → průsečík |
| | Lichobežník | ⚠️ | Postup: základna → rovnoběžka → úhly |
| | Kružnice | ⚠️ | Střed + poloměr |
| **Transformace** | Osová souměrnost | ○ | Kolmice + stejná vzdálenost |
| | Posunutí | ○ | Vektor posunu |

### 4. SLOVNÍ ÚLOHY

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **Přímá úměrnost** | Trojčlenka | ○ | x/a = y/b |
| **Nepřímá úměrnost** | Trojčlenka | ○ | x·a = y·b |
| **⚠️ "o X více/méně"** | Zlomky | ⚠️ | "o třetinu více" = ×(1+1/3) = ×4/3 |
| | Procenta | ⚠️ | "o 25% méně" = ×0,75 |
| **Pohyb** | Rychlost/čas/dráha | ○ | s = v·t |
| **Směsi** | Koncentrace | ○ | m₁·c₁ + m₂·c₂ = m·c |

### 5. POSLOUPNOSTI A VZORY

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **⚠️ Aritmetická** | Najít n-tý člen | ⚠️ | aₙ = a₁ + (n-1)·d |
| | Najít vzorec | ⚠️ | Najít d, pak dosazovat |
| **Geometrická** | Najít n-tý člen | ○ | aₙ = a₁ · qⁿ⁻¹ |
| **Obrazce** | Počítání prvků | ⚠️ | Nakreslit, najít vzor |

### 6. PŘEVODY JEDNOTEK

| Typ | Varianta | Status | Strategie |
|-----|----------|--------|-----------|
| **Délka** | m, cm, mm | ✓ | ×10 nebo ÷10 |
| **⚠️ Plocha** | m², cm², dm² | ⚠️ | ×100 nebo ÷100 (druhá mocnina!) |
| **⚠️ Objem** | m³, dm³, cm³ | ⚠️ | ×1000 nebo ÷1000 (třetí mocnina!) |
| **Čas** | h, min, s | ○ | ×60 nebo ÷60 |

---

## Decision Tree

### Visual Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    VSTUP: Přečti zadání                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FÁZE 1: SKENUJ KLÍČOVÁ SLOVA                       │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│"o X více/méně"│    │  "sestrojte"  │    │  "kolikrát"   │
│"o X % více"   │    │  "narýsujte"  │    │  "poměr"      │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ⚠️ NÁSOBENÍ          KONSTRUKCE            DĚLENÍ
   ×(1 ± X)            Postup krok            a ÷ b
                       za krokem

        │ Žádné klíčové slovo?
        ▼
┌─────────────────────────────────────────────────────────────────┐
│              FÁZE 2: ANALYZUJ MATEMATICKÝ OBJEKT                │
└─────────────────────────────────────────────────────────────────┘
                              │
    ┌──────────┬──────────┬───┴───┬──────────┬──────────┐
    ▼          ▼          ▼       ▼          ▼          ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│Rovnice│ │Zlomek │ │Obrazec│ │Výraz  │ │Tabulka│ │Jednot.│
│  = ?  │ │  a/b  │ │ △ □ ○ │ │ 2x+3  │ │posloup│ │m²→cm² │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼         ▼
 IZOLUJ    SPOLEČ.   VZOREC    UPRAV     NAJDI     POZOR
   X       JMENOV.   obvod/    vytýkej   VZOREC    mocnina!
           krátit    obsah    roznásob   pro n     ×100,×1000
```

### Textová Pravidla (If-Then)

#### FÁZE 1: Klíčová slova (rychlé rozpoznání)

```
IF zadání obsahuje "o třetinu/čtvrtinu/pětinu více"
   OR "o X % více"
THEN → Strategie: NÁSOBENÍ ×(1 + zlomek)
       Příklad: "o třetinu více" = ×(1 + 1/3) = ×(4/3)

IF zadání obsahuje "o třetinu/čtvrtinu/pětinu méně"
   OR "o X % méně"
THEN → Strategie: NÁSOBENÍ ×(1 - zlomek)
       Příklad: "o čtvrtinu méně" = ×(1 - 1/4) = ×(3/4)

IF zadání obsahuje "sestrojte" OR "narýsujte" OR "zkonstruujte"
THEN → Strategie: KONSTRUKCE
       1. Identifikuj co je dáno
       2. Napiš postup slovně
       3. Proveď krok za krokem

IF zadání obsahuje "kolikrát více/méně" OR "poměr"
THEN → Strategie: DĚLENÍ
       "Kolikrát více" = větší ÷ menší

IF zadání obsahuje "n-tý člen" OR "vzorec pro"
THEN → Strategie: POSLOUPNOST
       1. Najdi rozdíl d (aritmetická) nebo podíl q (geometrická)
       2. Použij vzorec: aₙ = a₁ + (n-1)·d

IF zadání obsahuje jednotky plochy (m², cm², dm²)
THEN → Strategie: PŘEVOD PLOŠNÝ
       ⚠️ Pozor: 1 m² = 10 000 cm² (ne 100!)
       Pravidlo: (převodní faktor)²

IF zadání obsahuje jednotky objemu (m³, dm³, cm³, litry)
THEN → Strategie: PŘEVOD OBJEMOVÝ
       ⚠️ Pozor: 1 m³ = 1 000 000 cm³
       Pravidlo: (převodní faktor)³
```

#### FÁZE 2: Matematické objekty (když není klíčové slovo)

```
IF vidím "= ?" nebo "x = ?"
THEN → Typ: ROVNICE
       Strategie: Izoluj neznámou na jednu stranu
       - Se závorkou? Vyděl NEBO roznásob (vyber kratší)
       - Se zlomkem? Vynásob společným jmenovatelem

IF vidím zlomek (a/b) mimo rovnici
THEN → Typ: ZLOMKOVÉ OPERACE
       Strategie:
       - Sčítání/odčítání → společný jmenovatel
       - Násobení → čitatel × čitatel, jmenovatel × jmenovatel
       - Dělení → převrať a násobení

IF vidím geometrický obrazec (trojúhelník, obdélník, kruh...)
THEN → Typ: GEOMETRIE
       Strategie:
       - Hledám obvod/obsah → vzorec
       - Pravý úhel? → možná Pythagoras
       - Složený tvar → rozlož na jednoduché

IF vidím výraz bez "="
THEN → Typ: ÚPRAVA VÝRAZU
       Strategie:
       - Zjednodušit → vytýkej, krať
       - Dosadit → nahraď proměnnou hodnotou

IF vidím tabulku nebo posloupnost čísel
THEN → Typ: POSLOUPNOST
       Strategie:
       1. Spočítej rozdíly (d) nebo podíly (q)
       2. Aritmetická (konstantní d) → aₙ = a₁ + (n-1)·d
       3. Geometrická (konstantní q) → aₙ = a₁ · qⁿ⁻¹

IF vidím (a + b)² nebo (a - b)²
THEN → Typ: BINOMICKÁ FORMULE
       ⚠️ Strategie: NEZAPOMEŇ prostřední člen!
       (a + b)² = a² + 2ab + b²
       (a - b)² = a² - 2ab + b²
```

---

## Implementation

### Files Created
- `decisions/EDR-004-problem-taxonomy.md` (this document)
- `data/taxonomy/problem_taxonomy.json` (machine-readable)

### Future App Integration
1. **Problem Type Drill** - quick classification practice
2. **Strategy Hints** - show relevant strategy for current problem
3. **Pre-test Review** - quiz on types before timed practice

---

## Consequences

**Positive:**
- Explicit teaching of expert pattern recognition
- Reduces cognitive load during test
- Addresses root cause of "o X více" errors (recognition, not computation)
- Reusable for other students

**Negative:**
- Initial learning overhead
- Risk of over-rigid thinking (edge cases)

---

## Related

- [EDR-001](EDR-001-atomic-skills-approach.md) - Atomic Skills Approach
- [EDR-002](EDR-002-lightning-round.md) - Lightning Round (uses this taxonomy)
- [ADR-007](ADR-007-lightning-round-implementation.md) - Lightning Round Implementation
