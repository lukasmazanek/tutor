# App Improvement Insights

Pedagogické postřehy a návrhy na vylepšení aplikace.

**Klíčové reference:**
- `decisions/` - Educational Decision Records (EDRs)
  - [EDR-001](../../decisions/EDR-001-atomic-skills-approach.md) - Atomic Skills (dekompozice složitých problémů)
  - [EDR-002](../../decisions/EDR-002-lightning-round.md) - Bleskové kolo (drill mode pro atomic skills)

---

## 2024-12-24: Pythagoras - Equation Bridge + Partial Feedback

**Zdroj:** Diskuse s uživatelem

### Problém 1: Chybí "equation bridge"

Aktuální hinty pro Pythagorovu větu nenapojují na rovnice (Anežčina silná stránka ~70-80%).

**Aktuálně:**
```
"Pythagorova věta: a² + b² = c²"
"3² + 4² = 9 + 16 = 25. Co je odmocnina z 25?"
```

**Navrhovaná změna:**
```
"Tohle je vlastně rovnice! c² = a² + b². Dosaď a vyřeš - jako každou jinou rovnici."
"3² + 4² = 9 + 16 = 25. Máš c² = 25. Co je c?"
```

### Problém 2: Chybí partial feedback

Když studentka odpoví špatně, ale částečně správně, nedostane zpětnou vazbu co se povedlo.

**Příklady:**
- Odpověď 144 místo 12 → "Máš správnou rovnici! c² = 144. Teď ještě odmocnina."
- Odpověď 17 místo 13 (5+12) → "Pozor - to je součet stran. Pythagoras počítá s druhými mocninami."

### Implementace

1. Aktualizovat hinty v `problem_bank.json` pro všechny `py-*` problémy
2. Přidat partial feedback logiku do `ProblemCard.jsx`:
   - Detekce common mistakes (zapomenutá odmocnina, součet místo Pythagoras)
   - Kontextová zpětná vazba místo generického "Zkus jiný přístup"

### Status

- [ ] Equation bridge hints
- [ ] Partial feedback logika

**EDR vytvořen:** [EDR-003](../../decisions/EDR-003-equation-bridge-partial-feedback.md)
