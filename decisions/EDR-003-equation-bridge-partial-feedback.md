# EDR-003: Equation Bridge & Partial Feedback

**Date:** 2024-12-24
**Status:** Accepted
**Roles:** Tutor, Architect
**Student:** Anezka Mazankova (generalizable)
**Related:** [EDR-001](EDR-001-atomic-skills-approach.md)

## Context

Při analýze Pythagorovy věty v aplikaci byly identifikovány dva problémy:

### Problém 1: Chybí napojení na silné stránky

Anežka má úspěšnost ~70-80% u rovnic, ale Pythagorova věta je prezentována jako "geometrie", ne jako "rovnice". Přitom `c² = a² + b²` JE rovnice, kterou umí řešit.

Aktuální hinty:
```
"Pythagorova věta: a² + b² = c²"
"3² + 4² = 9 + 16 = 25. Co je odmocnina z 25?"
```

Chybí explicitní most: "Tohle je rovnice jako každá jiná!"

### Problém 2: Binární feedback

Když studentka odpoví špatně, ale částečně správně, nedostane informaci o tom, co se povedlo:

```javascript
// Aktuální feedback
{feedback === 'correct' ? "Přesně tak! ✓" : "Zkus jiný přístup"}
```

Příklad: Odpověď 144 místo 12 znamená, že správně:
- Dosadila do vzorce
- Vypočítala 3² + 4² = 9 + 16 = 25... wait, 144 by bylo jiný příklad
- Dejme příklad: odpověď 25 místo 5 = správný výpočet, zapomenutá odmocnina

## Decision

### 1. Equation Bridge

**Explicitně propojit Pythagorovu větu s rovnicemi** prostřednictvím hint textu a framing.

Nový vzor pro Pythagoras hinty:
```
Hint 1: "Tohle je vlastně ROVNICE! c² = a² + b². Dosaď a vyřeš - jako každou jinou rovnici."
Hint 2: "3² + 4² = 9 + 16 = 25. Máš c² = 25. Co je c?"
```

### 2. Partial Feedback

**Analyzovat odpověď a ukázat, co se povedlo**, když je odpověď špatná ale obsahuje správné kroky.

Vzory pro Pythagoras:
| Odpověď | Správně | Chyba | Feedback |
|---------|---------|-------|----------|
| 25 (místo 5) | Výpočet c² | Zapomenutá √ | "Správně! c² = 25. Teď ještě odmocnina..." |
| 7 (místo 5, kde a=3,b=4) | - | Sečetl strany | "Pozor - sčítáme DRUHÉ MOCNINY, ne strany." |
| 1 (místo 5) | - | Odečetl | "Pythagorova věta SČÍTÁ druhé mocniny." |

## Pedagogical Basis

### 1. Transfer of Learning (Thorndike, 1901)

Transfer je snazší, když student vidí PODOBNOST mezi problémy. Explicitní "tohle je rovnice" aktivuje existující schéma.

| Implicitní | Explicitní |
|------------|------------|
| Student musí sám objevit podobnost | Učitel ukáže most |
| Transfer selhává pod stresem | Transfer je robustnější |
| Závisí na metakognici | Podporuje metakognici |

### 2. Bridging (Perkins & Salomon, 1988)

"Bridging" = explicitní propojení mezi kontexty. Efektivnější než doufat, že student propojení najde sám.

### 3. Formative Feedback (Black & Wiliam, 1998)

Efektivní feedback není jen "správně/špatně", ale ukazuje:
- Co bylo správně (posiluje)
- Kde nastala chyba (opravuje)
- Jak pokračovat (směruje)

### 4. Error Analysis (Ashlock, 2010)

Systematické chyby mají důvod. Když víme PROČ student chyboval, můžeme cílit feedback:
- 25 místo 5 = procedurální chyba (zapomněl krok)
- 7 místo 5 = konceptuální chyba (špatný vzorec)

## Application

### Pythagoras Hints - Equation Bridge

Aktualizovat všechny `py-*` problémy v `problem_bank.json`:

**Před:**
```json
"hints": [
  "Pythagorova věta: a² + b² = c²",
  "3² + 4² = 9 + 16 = 25. Co je odmocnina z 25?"
]
```

**Po:**
```json
"hints": [
  "Tohle je vlastně rovnice! c² = a² + b². Dosaď čísla a vyřeš jako každou jinou rovnici.",
  "3² + 4² = 9 + 16 = 25. Máš c² = 25. Teď vyřeš: c = ?"
]
```

### Partial Feedback - Common Mistakes

Přidat do `problem_bank.json` pole `common_mistakes` pro Pythagoras problémy:

```json
{
  "id": "py-001",
  "topic": "pythagoras",
  "problem_cs": "Pravoúhlý trojúhelník má odvěsny 3 cm a 4 cm. Jak dlouhá je přepona?",
  "answer": 5,
  "common_mistakes": [
    {
      "pattern": "answer_squared",
      "check": "user_answer === correct_answer * correct_answer",
      "feedback": "Správně! c² = {user_answer}. Teď ještě odmocnina: c = √{user_answer} = ?"
    },
    {
      "pattern": "sum_of_sides",
      "check": "user_answer === a + b",
      "feedback": "Pozor - Pythagoras sčítá DRUHÉ MOCNINY (a² + b²), ne samotné strany."
    },
    {
      "pattern": "difference",
      "check": "user_answer === Math.abs(a - b)",
      "feedback": "Pythagorova věta SČÍTÁ, ne odčítá. Zkus: a² + b² = ?"
    }
  ]
}
```

### ProblemCard.jsx - Feedback Logic

Rozšířit feedback v komponentě:

```javascript
// Místo binárního feedbacku
if (!isCorrect) {
  const partialMatch = checkPartialCorrectness(userAnswer, problem)
  if (partialMatch) {
    setFeedback({ type: 'partial', message: partialMatch.feedback })
  } else {
    setFeedback({ type: 'tryAgain' })
  }
}
```

## Consequences

**Positive:**
- Využívá existující sílu (rovnice) pro slabší oblast
- Redukuje kognitivní zátěž ("už to umím, je to rovnice")
- Partial feedback učí, ne jen hodnotí
- Snižuje frustraci ("aspoň něco jsem měla správně")
- Podporuje growth mindset (chyba = informace, ne selhání)

**Negative:**
- Vyžaduje manuální definici common_mistakes pro každý problém
- Komplexnější feedback logika v kódu
- Risk: příliš mnoho textu ve feedbacku (KISS)

**Mitigation:**
- Začít s Pythagoras problémy, pak rozšířit
- Feedback krátký, jedna věta
- Testovat s reálným uživatelem

## Implementation

### Phase 1: Data (problem_bank.json)

1. Aktualizovat hinty pro všechny `py-*` problémy (10 problémů)
2. Přidat `common_mistakes` pole s 2-3 vzory na problém

### Phase 2: Logic (ProblemCard.jsx)

1. Přidat funkci `checkPartialCorrectness(userAnswer, problem)`
2. Rozšířit feedback state o typ 'partial'
3. Renderovat partial feedback s jinou barvou (modrá = info, ne amber = chyba)

### Phase 3: Testing

1. Otestovat všechny common mistake patterns
2. Ověřit, že feedback je srozumitelný
3. Sledovat, zda se chyby opakují méně

## Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Jak dlouhý feedback? | 1 věta / 2 věty / s příkladem | 1 věta (testovat) |
| 2 | Barva partial feedbacku? | Modrá (info) / Zelená (pozitivní) | Modrá |
| 3 | Rozšířit na jiné topics? | Ihned / Po validaci na Pythagoras | Po validaci |
| 4 | Trackovat partial matches? | Ano / Ne | Ano (pro analýzu) |

## Related

- [EDR-001](EDR-001-atomic-skills-approach.md) - Atomic Skills (Pythagoras = rovnice je příklad "chunkingu")
- Psychological profile: `data/psychology/profiles/anezka_mazankova.json`
- Insight origin: `data/insights/app_improvements.md`
- Problem bank: `app/src/data/problem_bank.json`
