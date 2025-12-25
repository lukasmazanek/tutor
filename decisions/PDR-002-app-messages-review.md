# PDR-002: App Messages Critic-Trigger Review

**Date:** 2024-12-24
**Status:** Accepted
**Role:** Psychologist
**Student:** Anezka Mazankova

## Context

Complete review of all user-facing messages in the app to identify language that could trigger Anezka's inner critic ("Jsem blbá", "Zase jsem to pokazila").

## Message Inventory

### ProblemCard.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 245, 257 | `Tvoje odpověď...` | GREEN | Neutral placeholder |
| 265 | `Odpověz v: {unit}` | GREEN | Neutral instruction |
| 277 | `Přesně tak! ✓` | GREEN | Positive, specific |
| **279** | **`Zkus jiný přístup`** | **AMBER** | See D1 below |

### SessionSummary.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 37 | `+X více samostatně než minule` | GREEN | Only positive comparisons |
| 39 | `Stejně jako minule - stabilní!` | GREEN | Neutral-positive |
| 41-42 | *(no message if worse)* | GREEN | Excellent - no negative comparisons |
| 76 | `Skvělé prozkoumávání!` | GREEN | Celebration of effort, not correctness |
| 80 | `prozkoumala X úloh` | GREEN | Neutral, factual |
| 90 | `samostatně (bez nápovědy)` | GREEN | Neutral metric |
| 116 | `za X sessions` | AMBER | English word - should be Czech |

### ProgressPage.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 103 | `úloh prozkoumáno` | GREEN | Neutral |
| 121 | `samostatně vyřešeno` | GREEN | Positive context |
| 155 | `Pokračuj v práci a sleduj svůj růst!` | GREEN | Growth-oriented |
| 165 | `Poslední sessions` | AMBER | English word |
| 217 | `Zatím žádné sessions. Začni prozkoumávat!` | GREEN | "Zatím" + encouraging |

### TopicSelector.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 47 | `Naposledy jsi prozkoumala X úloh` | GREEN | Neutral, factual |
| 59 | `Co dnes prozkoumáme?` | GREEN | Inviting, exploratory |
| 63 | `Vyber si téma, které tě zajímá` | GREEN | Agency, interest-based |
| 84 | `X nových úloh` | GREEN | Neutral |
| 87 | `✓ X zvládnuto` | AMBER | See D2 below |
| 93 | `✓ Vše zvládnuto!` | AMBER | See D2 below |
| 108 | `důležité` | AMBER | See D3 below |
| 118 | `Toto téma je důležité pro CERMAT` | AMBER | See D3 below |
| 152 | `Závod sama se sebou` | GREEN | Perfect framing |

### VisualExplainer.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 77 | `Vizuální nápověda` | GREEN | Neutral |
| 36 | `Začínáme s celou hodnotou` | GREEN | Neutral |
| 111 | `Přidáno / Odebráno` | GREEN | Factual |
| 195 | `Rozumím, pokračovat` | GREEN | Agency |

### App.jsx

| Line | Message | Risk | Analysis |
|------|---------|------|----------|
| 248 | `Chceš nejdřív vidět vizuální vysvětlení...?` | GREEN | Offering help |
| 258 | `Zkusím to` | GREEN | Agency, not "I know this" |
| 265 | `Ukaž mi` | GREEN | Neutral |

## Risk Summary

```
GREEN (safe):     25 messages
AMBER (monitor):   7 messages
RED (fix now):     0 messages
```

## Decisions

### D1: "Zkus jiný přístup" (Wrong Answer Feedback)

**Current:** `Zkus jiný přístup`

**Analysis:**
- Pro: Doesn't say "Wrong" or "Incorrect", focuses on approach
- Pro: Implies agency ("try" = you can do something)
- Con: If repeated multiple times, becomes "I keep failing"
- Con: "jiný" implies first approach was wrong

**Decision:** KEEP with monitoring. Consider after 3 wrong attempts:
```
Attempt 1: "Zkus jiný přístup"
Attempt 2: "Zkus jiný přístup"
Attempt 3+: Show hint automatically (no message)
```

**Future Enhancement:** After 2 wrong answers, show hint without any message. Silent help is less triggering than repeated "try again."

### D2: "Zvládnuto" Terminology

**Current:** `✓ X zvládnuto` and `✓ Vše zvládnuto!`

**Analysis:**
- "Zvládnuto" (mastered/handled) creates binary pass/fail frame
- Could trigger "why haven't I mastered this?" thoughts
- However, shown for SUCCESS cases only

**Decision:** KEEP. This shows on completed items only, reinforcing success. Risk is low because it never shows failure state.

**Alternative considered:** "Prozkoumáno" - but less satisfying for actual mastery.

### D3: "Důležité pro CERMAT" Pressure

**Current:** Badge showing `důležité` and text `Toto téma je důležité pro CERMAT`

**Analysis:**
- Creates external pressure (test importance)
- May trigger avoidance of important topics
- Already hidden on mobile (good)

**Decision:** MONITOR. The text is hidden on mobile which is primary device. Desktop users (likely parent checking) can see it. Consider:
- Changing from "důležité" to "časté" (frequent) - less pressure, same info
- Or "oblíbené CERMAT" (CERMAT favorite) - curious frame

### D4: English Words ("sessions")

**Locations:**
- SessionSummary.jsx:116 - `za X sessions`
- ProgressPage.jsx:165 - `Poslední sessions`
- ProgressPage.jsx:217 - `Zatím žádné sessions`

**Decision:** Change to Czech. Options:
- "sezení" (formal)
- "cvičení" (exercise/practice)
- "pokusů" (attempts) - NO, too failure-oriented

**Recommendation:** Use "cvičení" (exercise sessions)

## Implementation Checklist

### Immediate (before next deploy)
- [x] Change "sessions" to "cvičení" (5 locations) ✓ 2024-12-24

### Soon (next iteration)
- [x] Add auto-hint after 3rd wrong answer (ProblemCard.jsx) ✓ 2024-12-24
- [x] Change "důležité" to "časté" (blue, less pressure) ✓ 2024-12-24

### Monitor (collect data first)
- [ ] Track: How many wrong attempts before success?
- [ ] Track: Does she avoid "časté" topics?
- [ ] Parent feedback: Any comments on pressure language?

## Overall Assessment

**Rating: ⭐⭐⭐⭐⭐ Excellent**

The app already follows psychologically safe design principles:
1. Uses "prozkoumávání" (exploring) instead of "testování" (testing)
2. Never shows negative comparisons - only positive or silent
3. Celebrates effort (problems explored) not just correctness
4. Provides agency in help-seeking (hint button, explainer choice)
5. "Závod sama se sebou" framing is perfect

The only actionable items are minor:
- Fix English words → Czech ✓
- ~~Consider pressure reduction on "důležité"~~ ✓ Changed to "časté" (blue) 2024-12-24
- ~~Consider auto-hint after repeated wrong answers~~ ✓ Implemented 2024-12-24

## Related

- [PDR-001](PDR-001-psychological-safety-review.md) - Overall psychological safety review
- [EDR-003](EDR-003-equation-bridge-partial-feedback.md) - Partial feedback design
- [Psychological Profile](../data/psychology/profiles/anezka_mazankova.json)
