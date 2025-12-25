# ADR-007: Lightning Round Implementation

**Date:** 2024-12-24
**Status:** Accepted
**Type:** Feature/UX
**Related:** [EDR-002](EDR-002-lightning-round.md)

## Context

EDR-002 definuje koncept "Bleskové kolo" pro trénink atomických dovedností. Toto ADR dokumentuje konkrétní implementační rozhodnutí z QAR session.

## QAR Summary

| # | Otázka | Rozhodnutí |
|---|--------|------------|
| Q1 | Kde v UI bude vstup? | **A** - Tlačítko na homepage pod "Mix všeho" |
| Q2 | Kolik kategorií na začátku? | **B** - Jen "o X více/méně" (MVP) |
| Q3 | Formát otázek? | **A** - Přímý překlad na násobitel, zlomky pro nekonečné rozvoje |
| Q4 | Timer? | **C** - Skrytý, ukázat až v summary |
| Q5 | Feedback při chybě? | **B** - Správná odpověď + hint, manuální pokračování |
| Q6 | Streak counter? | **C** - Zobrazit až od 3+ (silent reset) |

## Implementation Details

### Q1: Entry Point
- Nové tlačítko na homepage mezi "Mix všeho" a "Můj pokrok"
- Barva: amber (odlišení od ostatních)
- Ikona: BoltIcon (⚡)
- Text: "Bleskové kolo" + "Rychlý trénink: o X více/méně"

### Q2: Kategorie
- MVP obsahuje pouze kategorii "o X více/méně"
- 40 otázek pokrývajících:
  - Zlomky (třetina, čtvrtina, pětina, šestina, osmina)
  - Procenta (5%, 10%, 20%, 25%, 30%, 50%, 75%, 100%)
  - "více" i "méně" varianty
- Další kategorie (binomy, převody, posloupnosti) přidáme iterativně

### Q3: Formát odpovědí
- Nekonečné rozvoje → zlomky: `4/3`, `5/6`, `2/3`
- Konečné rozvoje → desetinná čísla: `1,25`, `0,75`, `1,5`
- 3 odpovědi na výběr (1 správná + 2 distraktory)

### Q4: Timer
- Čas se měří v pozadí (pro tracking fluence)
- NEZOBRAZUJE se během odpovídání
- Ukáže se až v summary: "Průměrný čas: 2.3s"
- Žádný časový tlak = psychologická bezpečnost

### Q5: Feedback
**Správná odpověď:**
- Zelená fajfka + správná odpověď
- Streak counter (pokud ≥3)
- Auto-advance po 0.8s

**Špatná odpověď:**
- Tvoje odpověď (přeškrtnutě)
- Správná odpověď (zeleně)
- Mini-hint vysvětlující pravidlo
- Manuální "Pokračovat" tlačítko
- NIKDY slovo "špatně" nebo "chyba"

### Q6: Streak Counter
- Nezobrazuje se při streak 0-2
- Zobrazí se s ikonou 🔥 od streak 3+
- Při chybě tiše zmizí (silent reset)
- V summary ukáže "Nejdelší série: X"

## File Structure

```
app/src/
├── components/
│   └── LightningRound/
│       ├── index.jsx      # Main container + state
│       ├── Question.jsx   # Question display
│       ├── Feedback.jsx   # Correct/incorrect feedback
│       └── Summary.jsx    # End of round summary
├── data/
│   └── lightning_questions.json  # Question bank (40 questions)
```

## Psychological Safety Alignment

| Princip | Implementace |
|---------|--------------|
| Žádný negativní jazyk | Nikdy "špatně", jen ukáže správně |
| Soft timer | Měří se, ale nezobrazuje |
| Exit kdykoliv | "Ukončit" tlačítko vždy viditelné |
| Self-comparison | Progress vs vlastní minulost |
| Silent reset | Streak zmizí tiše, ne "série přerušena" |
| Hints jako učení | Vždy vysvětlení, ne trest |

## Implementation Checklist

- [x] Question bank (40 otázek "o X více/méně")
- [x] LightningRound komponenty (Question, Feedback, Summary)
- [x] Entry point na homepage (TopicSelector.jsx)
- [x] Integrace do App.jsx
- [ ] localStorage pro progress tracking (future)
- [x] Test a deploy

## Consequences

**Positive:**
- Cílený trénink kritického error patternu
- Psychologicky bezpečný design
- Rychlé sessions (2-3 min)
- Měřitelný progress (čas + accuracy)

**Negative:**
- Zatím jen 1 kategorie (rozšíříme iterativně)
- Bez localStorage trackingu v MVP (přidáme)

## Open Questions

1. Přidat localStorage tracking progress mezi sessions?
2. Ukázat "zlepšení vs minule" v summary?
3. Zvukové efekty? (pravděpodobně ne - může rušit)

## Related

- [EDR-002](EDR-002-lightning-round.md) - Původní design dokument
- [PDR-001](PDR-001-psychological-safety-review.md) - Psychological safety review
