# EDR-002: Lightning Round (Bleskové kolo)

**Date:** 2024-12-24
**Status:** Accepted
**Roles:** Tutor, Architect
**Student:** Anezka Mazankova (generalizable)
**Related:** [EDR-001](EDR-001-atomic-skills-approach.md)

## Context

EDR-001 established that complex problems require automatized atomic skills. We need an app feature that:

1. Drills atomic skills in isolation
2. Builds speed AND accuracy (fluency)
3. Is psychologically safe (no punishment for errors)
4. Tracks progress over time
5. Feels like a game, not a test

Current app has problem practice, but problems are complex (multi-step). No way to drill single atomic skills to automaticity.

## Decision

**Create "Bleskové kolo" (Lightning Round)** - a quick-fire drill mode for atomic skills.

Core mechanics:
- **10 questions per round** (short, completable in 2-3 minutes)
- **One category per round** (no mixing initially)
- **3 answer choices** (fast decision, reduced anxiety)
- **Soft timer** (visual motivation, not failure condition)
- **Streak tracking** (gamification without grades)

## User Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Main Menu  │ ──► │  Category   │ ──► │  Question   │ ──► │   Summary   │
│             │     │  Selection  │     │  (×10)      │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   ▼
                           │            ┌─────────────┐
                           │            │  Feedback   │
                           │            │  (0.8-2s)   │
                           │            └─────────────┘
                           │
                           ▼
                    Can quit anytime
                    (progress saved)
```

## Screen Designs

### Screen 1: Category Selection

```
┌─────────────────────────────────┐
│  ⚡ BLESKOVÉ KOLO               │
│                                 │
│  Vyber kategorii:               │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔥 o X více/méně          │  │  ← CRITICAL badge
│  │    Poslední: 7/10 (2.1s)  │  │  ← Last score + avg time
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📐 Binomické vzorce       │  │
│  │    Nové!                  │  │  ← Not yet attempted
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📏 Převody jednotek       │  │
│  │    Poslední: 9/10 (1.8s)  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔢 Posloupnosti           │  │
│  │    Poslední: 5/10 (3.2s)  │  │
│  └───────────────────────────┘  │
│                                 │
│  [← Zpět na hlavní menu]        │
└─────────────────────────────────┘
```

**Design notes:**
- Show last performance to track progress
- "Nové!" badge for untried categories
- CRITICAL categories marked with 🔥
- Large touch targets (full width cards)

### Screen 2: Question

```
┌─────────────────────────────────┐
│  ⚡ o X více/méně       3/10    │  ← Category + progress
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   "o čtvrtinu více"       │  │  ← Question text
│  │        = × ?              │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┐  ┌─────────┐       │
│  │  0,25   │  │  1,25   │       │  ← Answer choices
│  └─────────┘  └─────────┘       │     (randomized order)
│                                 │
│  ┌─────────┐                    │
│  │    4    │                    │
│  └─────────┘                    │
│                                 │
│  ████████████░░░░░░░░  5s       │  ← Soft timer bar
│                                 │
│  🔥 Streak: 5                   │  ← Current streak
│                                 │
│  [Ukončit]                      │  ← Always available
└─────────────────────────────────┘
```

**Design notes:**
- Timer is VISUAL only - no failure if it runs out
- 3 choices maximum (quick decision)
- Answer buttons in thumb zone
- Streak counter for motivation
- Can quit anytime (no penalty)

### Screen 3: Feedback - Correct

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│             ✓                   │  ← Green checkmark
│                                 │
│           1,25                  │  ← Show correct answer
│                                 │
│         +1 🔥                   │  ← Streak increased
│                                 │
│                                 │
│     [auto-advance 0.8s]         │
│                                 │
└─────────────────────────────────┘
```

**Design notes:**
- Minimal, positive feedback
- Auto-advance after 0.8s
- No interruption to flow

### Screen 4: Feedback - Incorrect

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│  Tvoje odpověď:  0,25           │  ← No "wrong" label
│                                 │
│  Správně:  1,25                 │  ← Just show correct
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💡 "o X více" = ×(1+X)    │  │  ← Mini hint
│  │    o čtvrtinu = o 1/4     │  │
│  │    → ×(1 + 0,25) = ×1,25  │  │
│  └───────────────────────────┘  │
│                                 │
│  [Pokračovat]                   │  ← Manual advance
│                                 │
└─────────────────────────────────┘
```

**Design notes:**
- NEVER say "Špatně" or "Chyba"
- Show what was answered vs correct
- Provide mini-hint for learning
- Manual advance (time to read hint)
- Hint explains the concept, not just the answer

### Screen 5: Summary

```
┌─────────────────────────────────┐
│  ⚡ Hotovo!                      │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │        8 / 10             │  │  ← Score
│  │    ████████░░  80%        │  │  ← Visual bar
│  │                           │  │
│  │    Průměrný čas: 2.3s     │  │  ← Avg response time
│  │    Nejdelší streak: 6     │  │  ← Best streak
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📈 Zlepšení: +2 ✓         │  │  ← vs last attempt
│  │    Minule: 6/10 → Teď: 8  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┐  ┌─────────────┐   │
│  │  Znovu  │  │ Jiná kat.   │   │
│  └─────────┘  └─────────────┘   │
│                                 │
│  [← Hlavní menu]                │
└─────────────────────────────────┘
```

**Design notes:**
- Celebrate improvement, not absolute score
- Compare to SELF, not others
- Easy to retry or switch category
- Track streaks (gamification)

## Psychological Safety Principles

| Principle | Implementation |
|-----------|----------------|
| No negative language | Never "Špatně", just show correct answer |
| Soft timer | Visual bar, no failure if expired |
| Exit anytime | "Ukončit" always visible, no penalty |
| Self-comparison | "Zlepšení +2" vs last attempt |
| Streaks not scores | 🔥 counter emphasizes momentum |
| Hints as help | 💡 explains concept, not punishment |
| No leaderboards | Progress is private, personal |

## Data Model

### Question Schema

```json
{
  "id": "OXV-11",
  "category": "OXV",
  "category_name": "o X více/méně",
  "skill_name": "o X více → násobitel",
  "question_text": "\"o čtvrtinu více\" = ×?",
  "correct_answer": "1,25",
  "distractors": ["0,25", "4"],
  "target_time_ms": 3000,
  "hint": {
    "rule": "\"o X více\" = ×(1+X)",
    "explanation": "o čtvrtinu = o 1/4 = o 0,25 → ×(1 + 0,25) = ×1,25"
  },
  "difficulty": 2,
  "prerequisites": ["OXV-01"]
}
```

### Session Result Schema

```json
{
  "session_id": "uuid-v4",
  "timestamp": "2024-12-24T10:30:00Z",
  "category": "OXV",
  "completed": true,
  "questions": [
    {
      "question_id": "OXV-11",
      "selected_answer": "1,25",
      "correct": true,
      "time_ms": 2100
    },
    {
      "question_id": "OXV-12",
      "selected_answer": "0,33",
      "correct": false,
      "time_ms": 4500
    }
  ],
  "summary": {
    "score": 8,
    "total": 10,
    "accuracy_percent": 80,
    "avg_time_ms": 2450,
    "best_streak": 6
  }
}
```

### Progress Schema (localStorage)

```json
{
  "lightning_progress": {
    "OXV": {
      "attempts": 5,
      "best_score": 9,
      "last_score": 8,
      "best_avg_time_ms": 2100,
      "last_attempt": "2024-12-24T10:30:00Z",
      "total_questions_answered": 50,
      "total_correct": 42
    },
    "BIN": {
      "attempts": 0
    }
  }
}
```

## Question Selection Algorithm

```
1. Load all questions for selected category
2. Filter by prerequisites (only show if prereqs mastered)
3. Prioritize:
   a. Questions answered incorrectly last time
   b. Questions with low accuracy history
   c. New questions not yet seen
   d. Random from remaining pool
4. Select 10 questions
5. Randomize order
6. For each question, randomize answer positions
```

**Mastery definition:** 80% accuracy over last 5 attempts

## Timer Behavior

| Condition | Behavior |
|-----------|----------|
| Timer expires | Question stays on screen, can still answer |
| Answer selected | Timer stops, record time |
| No answer + tap elsewhere | Timer pauses? (TBD) |
| Very slow answer (>10s) | Record as "slow", count for accuracy but flag |

**Timer is NEVER a failure condition.** It's purely informational for tracking fluency.

## Gamification Elements

| Element | Purpose | Implementation |
|---------|---------|----------------|
| Streak counter | Momentum, flow state | 🔥 Streak: N (resets on wrong) |
| Personal best | Self-competition | "Nový rekord!" when beaten |
| Progress vs last | Growth mindset | "+2 od minule" |
| Category badges | Completion motivation | 🔥 CRITICAL, ⭐ mastered |
| Session count | Persistence reward | "5. pokus" (neutral, not comparative) |

**NOT included:**
- Leaderboards (social comparison)
- Time pressure penalties
- "Lose" conditions
- Punishment animations

## Implementation Notes

### File Structure (proposed)

```
app/src/
├── components/
│   ├── LightningRound/
│   │   ├── CategorySelect.jsx
│   │   ├── Question.jsx
│   │   ├── Feedback.jsx
│   │   ├── Summary.jsx
│   │   └── index.jsx
│   └── ...
├── data/
│   ├── problem_bank.json        # Existing
│   └── lightning_questions.json # NEW - atomic skills
├── hooks/
│   └── useLightningRound.js     # State management
└── ...
```

### localStorage Keys

```
tutor_lightning_progress    # Progress data
tutor_lightning_sessions    # Session history (last 10)
```

## Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Unlock system? | Skills unlock in order vs all available | TBD |
| 2 | Repeat wrong questions at end? | Yes / No / Optional | TBD |
| 3 | Sound effects? | Yes / No / User setting | TBD |
| 4 | Haptic feedback on mobile? | Yes / No | TBD |
| 5 | Daily goal? | "3 rounds per day" motivation | TBD |
| 6 | Mixed mode later? | Cross-category rounds | Future - after single-category mastery |
| 7 | Parent view? | Dashboard showing progress | Future feature |

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Accuracy improvement | +20% over 2 weeks | Compare first vs recent sessions |
| Speed improvement | -30% avg time | Track avg_time_ms trend |
| Engagement | 3+ sessions/week | Session count |
| Category coverage | All 4 attempted | Track attempts per category |
| Retention | Return after 3+ days | Last attempt timestamp |

## Consequences

**Positive:**
- Directly addresses EDR-001 (automatize atomic skills)
- Psychologically safe (no punishment)
- Measurable progress (speed + accuracy)
- Short sessions (fits busy schedule)
- Works offline (localStorage)
- Gamified without competition

**Negative:**
- Additional development effort
- Need to create question bank (48 skills × ~5 variants = ~240 questions)
- Risk of feeling repetitive (mitigate with variety, short sessions)
- Doesn't replace full problem practice (complementary)

## Related

- [EDR-001](EDR-001-atomic-skills-approach.md) - Atomic Skills Approach (prerequisite)
- Psychological profile: `data/psychology/profiles/anezka_mazankova.json`
- Design principles: See CLAUDE.md "App Design Principles"
