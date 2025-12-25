# PDR-001: Psychological Safety Review of EDRs

**Date:** 2024-12-24
**Status:** Accepted
**Role:** Psychologist (20+ years experience in learning difficulties)
**Student:** Anezka Mazankova

## Context

All Educational Decision Records (EDR-001, EDR-002, EDR-003) were reviewed from a psychological perspective, specifically considering:
- Anezka's harsh internal critic ("Jsem blbá", "Tohle nikdy nepochopím")
- High score variance (10-27 points) indicating anxiety as primary factor
- Parent feedback that verbal reassurance doesn't work
- Need for EXPERIENTIAL change, not cognitive explanations

## Reviewed Documents

| EDR | Title | Psychological Rating | Risk Level |
|-----|-------|---------------------|------------|
| EDR-001 | Atomic Skills | ⭐⭐⭐⭐ Good | Low |
| EDR-002 | Lightning Round | ⭐⭐⭐⭐⭐ Excellent | **Medium** (streak counter) |
| EDR-003 | Equation Bridge | ⭐⭐⭐⭐⭐ Excellent | Very Low |

## Decisions

### D1: Streak Counter Warning

**Risk:** EDR-002's streak counter (0-1-2-3...) could trigger:
- Anxiety when streak resets to 0
- "Zase jsem to pokazila" response
- Avoidance of continuing after mistake

**Decision:** Implement with safety modifications:
```
✓ Show streak, but NEVER show "0" or "broken"
✓ Use "Nový začátek!" instead of reset message
✓ After 3 correct: "Jdeš jako blesk!"
✓ After mistake: Silent reset, no visual judgment
✓ Consider: Show only positive streaks (hide counter until 2+)
```

### D2: First Session Protection

**Risk:** First experience sets emotional tone for entire app relationship.

**Decision:** First session MUST:
1. Start with strength area (equations - 70-80% success rate)
2. Include at least one "guaranteed win" problem
3. Never show failure states in first 5 problems
4. End on positive note (even if artificially extended)

### D3: Session Start Order

**Risk:** Starting with difficult topic triggers "Jsem blbá" immediately.

**Decision:** Session order algorithm:
```
1. First problem: Strength area (equations, fractions)
2. Second problem: Same area (build confidence)
3. Third problem: Target area (gentle introduction)
4. Alternate: strength → target → strength → target
5. End: Strength area (positive closing)
```

### D4: Atomic Skills Framing

**Risk:** Repetitive practice of same skill type could feel like "drilling mistakes."

**Decision:** Frame atomic skills as:
- "Pojďme si to procvičit jinak" (Let's practice differently)
- NOT: "Tady děláš chyby, tak to zopakujeme" (You make mistakes here, so we'll repeat)
- Show variety: Same skill, different visual presentations
- Progress indicator: "Už umíš 3 varianty tohoto typu"

### D5: Partial Feedback Safety

**Risk:** Showing "what went wrong" could reinforce failure focus.

**Decision:** Partial feedback order (EDR-003):
```
1. FIRST: Show what's correct (green highlight)
2. SECOND: Acknowledge the approach ("Správně jsi začala s...")
3. THIRD: Gentle hint about missing part ("Ještě potřebujeme...")
4. NEVER: "Chyba byla tady" or red highlights first
```

## Psychological Basis

### Attribution Theory (Weiner)
- Internal critic uses internal-stable-global attributions ("I'm stupid")
- Intervention: Shift to internal-unstable-specific ("I haven't practiced this yet")
- Implementation: "zatím" addition, skill-specific feedback

### Self-Efficacy (Bandura)
- Mastery experiences > verbal persuasion
- Starting with strengths builds efficacy before tackling weaknesses
- Streak counter (when safe) provides mastery evidence

### Emotional Priming
- First impression creates emotional anchor
- Protected first session prevents negative priming
- End on success = positive anticipation for next session

### Inner Critic Externalization (IFS/Parts Work)
- "Ten kritik v hlavě" = externalized, not identity
- App should never feed the critic
- Silence on failure > any negative message

## Implementation Checklist

### Immediate (before launch)
- [ ] Review all error messages for critic-triggering language
- [ ] Implement "silent reset" for streak counter
- [ ] Create "first session" problem sequence
- [ ] Test all feedback messages with "Would this trigger inner critic?"

### Soon (first iteration)
- [ ] Add session start algorithm (strength-first)
- [ ] Implement partial feedback order (positive-first)
- [ ] Create "Nový začátek" messaging

### Later (monitoring)
- [ ] Track: Does she continue after mistakes or quit?
- [ ] Track: Time spent on strength vs. weakness areas
- [ ] Parent feedback: Changes in self-talk about app?

## Consequences

**Positive:**
- Reduced anxiety during practice
- Better engagement and session completion
- Experiential success building (not verbal)
- Gradual tolerance building for mistakes

**Negative:**
- May delay exposure to difficult content
- Could create "too safe" environment (low challenge)
- Requires more complex session logic

**Mitigation:**
- Gradual challenge increase after stable engagement
- Monitor for avoidance of target areas
- Parent check-ins on self-talk changes

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should streak counter be completely hidden until streak ≥ 2? | Proposed |
| 2 | How long should "first session protection" last? (1 session? 3?) | Needs testing |
| 3 | Should app track emotional state? (happy/neutral/frustrated selector) | Future consideration |
| 4 | Is there a threshold where she can handle normal failure feedback? | Monitor over time |

## Related

- [EDR-001](EDR-001-atomic-skills-approach.md) - Atomic Skills (reviewed)
- [EDR-002](EDR-002-lightning-round.md) - Lightning Round (reviewed)
- [EDR-003](EDR-003-equation-bridge-partial-feedback.md) - Equation Bridge (reviewed)
- [Psychological Profile](../data/psychology/profiles/anezka_mazankova.json)
- [Intervention: Chyba dne](../data/psychology/interventions/chyba_dne.md)
- [Intervention: Srovnávání](../data/psychology/interventions/srovnavani.md)
