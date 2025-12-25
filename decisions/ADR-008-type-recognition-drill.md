# ADR-008: Type Recognition Drill

**Date:** 2024-12-25
**Status:** Accepted
**Type:** Feature/Training
**Related:** [EDR-004](EDR-004-problem-taxonomy.md)

## Context

EDR-004 definuje taxonomii CERMAT úloh a rozhodovací strom. Tento ADR dokumentuje implementaci drillu na rozpoznávání typů úloh a volbu strategie.

Klíčový insight: V časově omezeném testu je rychlé rozpoznání typu úlohy a výběr strategie kritický faktor úspěchu.

## QAR Summary

| # | Otázka | Rozhodnutí |
|---|--------|------------|
| Q1 | Kdy použít | **D** - Samostatný mód + volitelně v session |
| Q2 | Formát drillu | **B** - Typ + strategie (dvě otázky) |
| Q3 | Prompt v session | **C** - Uživatel si zapne/vypne (toggle) |
| Q4 | Zdroj zadání | **B** - Nový soubor type_drill.json |
| Q5 | UI integrace | **B** - Toggle v session headeru (tooltip) |
| Q6 | Kde zobrazit v session | **B2** - Otázka před úlohou → odpověď v hint boxu |

**Poznámka:** Připravit Bleskové kolo jen na typy/strategie (budoucí rozšíření)

## Implementation Details

### 1. Standalone Drill Mode

**Entry Point:** Tlačítko na homepage (vedle Bleskového kola)

**Flow:**
1. Zobrazí se zadání úlohy (jen text, ne celé řešení)
2. Otázka 1: "Jaký je to typ?" (3-4 možnosti)
3. Pokud správně → Otázka 2: "Jaká je strategie?" (3-4 možnosti)
4. Feedback + vysvětlení
5. Další úloha

**UI Design:**
- Podobný Bleskovému kolu (rychlý, čistý)
- Barva: indigo (odlišení od amber Bleskového kola)
- Ikona: AcademicCapIcon nebo TagIcon

### 2. Session Toggle

**Location:** Bottom bar v ProblemCard (nová ikona)

**Behavior:**
- Toggle ZAP/VYP pro "Ptát se na typ"
- Když ZAP: před každou úlohou se zobrazí typ/strategie otázky
- Defaultně VYP (nezpomalovat)

**Icon:** TagIcon nebo QuestionMarkCircleIcon

### 3. Data Structure

**File:** `data/drills/type_drill.json`

```json
{
  "questions": [
    {
      "id": "TD-001",
      "prompt": "Cena vzrostla o třetinu. Původní cena byla 120 Kč.",
      "type": {
        "correct": "WORD-OXVICE",
        "correct_label": "o X více/méně",
        "distractors": [
          {"id": "NUM-PROC", "label": "Procenta"},
          {"id": "ALG-EQ", "label": "Rovnice"}
        ]
      },
      "strategy": {
        "correct": "× (1 + 1/3)",
        "distractors": ["× 1/3", "+ 1/3"]
      },
      "explanation": "\"o třetinu více\" = násobení ×(1 + 1/3) = ×(4/3)"
    }
  ]
}
```

### 4. File Structure

```
app/src/
├── components/
│   └── TypeDrill/
│       ├── index.jsx      # Main container
│       ├── TypeQuestion.jsx   # "Jaký typ?" screen
│       ├── StrategyQuestion.jsx  # "Jaká strategie?" screen
│       └── Summary.jsx    # End summary
├── data/
│   └── drills/
│       └── type_drill.json
```

## Psychological Safety

| Princip | Implementace |
|---------|--------------|
| Žádný negativní jazyk | "Zkus to znovu" ne "Špatně" |
| Vysvětlení vždy | Po každé odpovědi ukázat proč |
| Bez časového tlaku | Timer jen v pozadí pro statistiky |
| Toggle kontrola | Uživatel rozhoduje kdy trénovat |

## Implementation Checklist

- [x] ADR-008 dokument
- [x] type_drill.json (30 zadání)
- [x] TypeDrill komponenty (index, TypeQuestion, StrategyQuestion, Summary)
- [x] Entry point na homepage (TopicSelector)
- [x] Toggle v session (ProblemCard) - TagIcon v bottom baru
- [x] Integrace do App.jsx
- [x] Test a deploy

## Future Extensions

1. **Bleskové kolo na typy/strategie** - rychlý drill bez dvou fází
2. **Adaptivní prioritizace** - více kritických typů (⚠️)
3. **Progress tracking** - localStorage statistiky

## Consequences

**Positive:**
- Explicitní trénink pattern recognition
- Oddělený od řešení = menší cognitive load
- Připravuje na rychlé rozhodování v testu

**Negative:**
- Další mód = více komplexity
- Toggle může být přehlédnut

## Related

- [EDR-004](EDR-004-problem-taxonomy.md) - Taxonomy source
- [EDR-002](EDR-002-lightning-round.md) - Similar drill format
- [ADR-007](ADR-007-lightning-round-implementation.md) - UI patterns
