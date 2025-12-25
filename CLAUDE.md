# Tutor Project - CERMAT Math Test Analysis

## Ultimate Goal
**Create an application that helps Anezka Mazankova improve her math skills** for CERMAT entrance exams, based on psychological principles and error pattern analysis.

## Live App
- **URL:** https://lukasmazanek.github.io/tutor/
- **GitHub:** https://github.com/lukasmazanek/tutor

## Current Phase
MVP deployed. Analyzing math test mistakes to identify error patterns and create psychologically-informed practice materials.

## Available Commands
- `/psycholog` - Switch to Child Psychologist role (20+ years experience in learning difficulties)
- `/architect` - Switch to Learning Experience Architect role (app design, UX for anxious learners)

## Student Profile
- **Name**: Anezka Mazankova
- **Grade**: 9th (preparing for high school entrance exams)
- **Test type**: CERMAT Matematika 9 (standardized Czech math tests)
- **Average score**: 19.3/50 (38.6%)
- **Target**: 30/50 (60%)

## Test Results Summary

| Test ID | Year | Term | Score | % |
|---------|------|------|-------|---|
| M9PAD17C0T01 | 2017 | 1. radny | 13/50 | 26% |
| M9PAD22C0T01 | 2022 | 1. radny | 24/50 | 48% |
| M9PBD22C0T02 | 2022 | 1. nahradni | 27/50 | 54% |
| M9PCD22C0T03 | 2022 | 2. nahradni | 17/50 | 34% |
| M9PAD23C0T01 | 2023 | 1. radny | ? | - |
| M9PCD23C0T03 | 2023 | 1. nahradni | 23/50 | 46% |
| M9PBD24C0T02 | 2024 | 1. nahradni | 10/50 | 20% |
| M9PDD24C0T04 | 2024 | 2. nahradni | 21/50 | 42% |

## Critical Error Patterns (Priority Order)

### 1. "o X vice/mene" - CRITICAL
- **Problem**: Does not understand that "o tretinu vice" means x1.33, NOT +1/3
- **Example**: "o ctvrtinu vice" should be x1.25, she uses +0.25
- **Impact**: Loss of 4-8 points per test
- **Action**: Practice difference between multiplicative and additive changes

### 2. Konstrukce (Constructions) - SYSTEMATIC SKIP
- **Problem**: Consistently skips construction problems
- **Impact**: Loss of 5-6 points per test (10-12%)
- **Improvement noted**: M9PDD24C0T04 - attempted constructions (partial success)
- **Action**: Practice basic constructions (lichobeznik, obdelnik, trojuhelnik)

### 3. Posloupnosti (Sequences)
- **Problem**: Cannot find formulas for n-th term, pattern counting
- **Impact**: Loss of 2-4 points per test
- **Action**: Practice finding sequence formulas

### 4. Umocnovani (a+/-b)^2
- **Problem**: Forgets middle term in binomial expansion
- **Example**: (1/3 - 4b)^2 - forgot -8b/3 term
- **Impact**: Loss of 1-2 points per test

### 5. Prevody jednotek (Unit conversions)
- **Problem**: Uncertainty in m^2 <-> cm^2, dm^3 <-> cm^3
- **Impact**: Loss of 1-2 points per test

## Strengths
- **Rovnice (Equations)**: Linear equations ~70-80% success
- **Zlomky (Fractions)**: Basic operations good
- **Pythagorova veta**: Usually correct
- **Uzavrene ulohy**: Better at multiple choice (elimination method)

## Psychological Profile (Updated 2024-12-24)

### Key Insight
**The problem is not primarily mathematical - it's a harsh internal critic.** Same child, same knowledge, score range 10-27 points = anxiety factor.

### Inner Critic (from parent interview)
Verbatim self-critical statements:
- "Jsem blbá" (global self-judgment)
- "Tohle nikdy nepochopím" (permanent framing)
- "Zase jsem to pokazila" (self-blame)
- "Ostatní to umí, jen já ne" (unfavorable comparison)

**Critical:** Verbal reassurance doesn't work. Parents explained "mistakes are opportunities" 100x - she knows it intellectually but doesn't feel it. Needs EXPERIENTIAL change.

### Family Context
- **Pressure source**: INTERNAL (not from parents)
- **Parents**: Very supportive, express pride, believe in her
- **Father's observation**: "hrozně dře" (works very hard), improving steadily
- **Not a perfectionist** in general - only in academic context

### Behavioral Patterns
- **Avoidance of constructions**: Systematically skipped (fear of visible failure)
- **Preference for multiple choice**: Safety in elimination method
- **Social comparison**: Compares with everyone, but only where she "loses" (improving)
- **High score variance**: Performance depends on psychological state

### Active Interventions (assigned 2024-12-24)

1. **"Chyba dne"** - Dinner ritual where everyone shares their best mistake of the day
   - File: `data/psychology/interventions/chyba_dne.md`
   - Goal: Normalize mistakes through experience, not words

2. **Srovnávání interventions** - 6 techniques for social comparison
   - File: `data/psychology/interventions/srovnavani.md`
   - Key: "Závod sama se sebou" (race against herself, not others)

### Parent Guidance (when she says "Jsem blbá")
1. DON'T argue ("Nejsi blbá!") - doesn't work
2. Name the feeling: "Slyším, že jsi na sebe naštvaná"
3. Externalize critic: "Ten kritik v hlavě je dneska hlasitej"
4. Add "zatím" to permanent statements ("Nechápeš to... zatím")

### Intervention Priorities
1. **Phase 1 (Safety)**: Reduce threat perception, normalize mistakes, celebrate attempts
2. **Phase 2 (Repair)**: Fix "o X vice" misconception, gradual construction exposure
3. **Phase 3 (Consolidation)**: Build stable baseline, simulated test conditions

### Prognosis
- **Potential**: 30+ points (currently 19.3 average)
- **Evidence**: Best score 27 demonstrates capability
- **Timeline**: 2-3 months for stable 25-30 performance
- **Critical factor**: Managing inner critic before academic content focus
- **Positive signs**: Construction attempts in 2024, comparison improving, strong work ethic

Full profile: `data/psychology/profiles/anezka_mazankova.json`

## Session Log

| Date | Type | Key Findings |
|------|------|--------------|
| 2024-12-24 | Parent consultation (Father) | Pressure internal, not external. Verbatim self-critical statements obtained. Assigned "Chyba dne" + comparison interventions. |

## File Structure
```
.claude/
  commands/
    psycholog.md     # Child psychologist role (20+ years)

decisions/           # Educational Decision Records (EDRs)
  README.md          # Index with categories and template
  EDR-001-*.md       # Individual decision records

data/
  problems/          # Problem bank for MVP
    problem_bank.json  # 30 problems: equations, fractions, "o X více"
  tests/             # JSON files with detailed test analysis
    M9PAD17C0T01.json
    M9PAD22C0T01.json
    M9PBD22C0T02.json
    M9PCD22C0T03.json
    M9PAD23C0T01_new.json
    M9PCD23C0T03.json
    M9PBD24C0T02.json
    M9PDD24C0T04.json
  analysis/
    error_analysis_summary.json  # Comprehensive error analysis
  reference/
    cermat_urls.json  # CERMAT official URLs structure
  psychology/
    profiles/
      anezka_mazankova.json  # Psychological profile v1.1 (updated 2024-12-24)
    sessions/          # Session notes (to be added)
    interventions/
      chyba_dne.md           # "Mistake of the day" dinner ritual
      srovnavani.md          # 6 interventions for social comparison

tests/math/          # Original PDF files (filled tests)
  M1.pdf - M8.pdf
  M2a3.pdf           # Contains 2 tests
```

## CERMAT URL Structure
- **Main page**: https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika
- **Base URL**: https://prijimacky.cermat.cz/files/files/dokumenty/testova-zadani/4lete-mat/{year}/

### Test ID Mapping
| Prefix | Suffix | Term |
|--------|--------|------|
| M9PAD | A | 1. radny termin |
| M9PBD | B | 1. nahradni termin |
| M9PCD | C | 2. nahradni termin |
| M9PDD | D | 3. nahradni termin |

### File Patterns
- Test: `M9{suffix}_{year}_DT.pdf`
- Answer key: `M9{suffix}_{year}_KLIC.pdf`
- Sample solutions: `M9{suffix}_{year}_vzorove_reseni.pdf`

### Example URLs
```
M9PAD22C0T01:
  Test: .../2022/M9A_2022_DT.pdf
  Key:  .../2022/M9A_2022_KLIC.pdf
```

## JSON Test File Structure
Each test JSON contains:
- `test_id`, `student`, `date_taken`, `term`
- `total_points`: 50
- `teacher_score`: Circled score on title page
- `questions[]`: Array with detailed per-question analysis
  - `number`, `topic`, `task`, `max_points`
  - `correct_answer`, `student_answer`, `student_work`
  - `is_correct`, `earned_points`
  - `error_type`: "concept" | "calculation" | "incomplete"
  - `error_detail`: Description of mistake
- `error_analysis`: Patterns and strengths
- `summary`: Percentage and notes

## Important Notes
- **Teacher scores**: Always look for circled number on title page (often with "!" mark)
- **Score discrepancy**: My calculated scores often differ from teacher scores (teacher is stricter on incomplete work)
- **Language**: Test content is in Czech, analysis can be in English
- **Goal**: Identify patterns to create targeted practice, not just grade tests

## Next Steps

### Immediate (Phase 1 - Safety)
1. Father implements "Chyba dne" dinner ritual
2. Father practices "Ten kritik v hlavě" externalization
3. Father uses "zatím" addition technique
4. Wait for feedback on her response

### Soon (Phase 2 - Repair)
5. Create practice materials for "o X vice" problems
6. Develop gradual construction exposure system
7. Design "Závod sama se sebou" tracking

### Later (Phase 3 + App)
8. Design the tutoring app based on psychological principles
9. Implement progress tracking (attempts, not just scores)
10. Add session notes after tutoring interactions

## Educational Decision Records (EDRs)

All teaching, feature, and curriculum decisions are documented in `decisions/` folder.

| Category | Description |
|----------|-------------|
| Teaching Strategy | Pedagogical approaches, learning theories applied |
| App Features | Design decisions for app functionality |
| Psychological Interventions | Intervention designs and rationale |
| Content & Curriculum | Problem selection, skill taxonomies |

**Current EDRs:**
- [EDR-001](decisions/EDR-001-atomic-skills-approach.md) - Atomic Skills Approach (complex problems = basic skills composition)
- [EDR-002](decisions/EDR-002-lightning-round.md) - Lightning Round / Bleskové kolo (quick-fire drill for atomic skills)
- [EDR-003](decisions/EDR-003-equation-bridge-partial-feedback.md) - Equation Bridge & Partial Feedback (connect Pythagoras to equations, show partial correctness)

## Important Rules
- **NEVER save to Roam Research** - all data stays in project files
- Use `/psycholog` for Child Psychologist mode
- All session data goes to `data/psychology/` folder
- **`/architect` role**: NEVER start implementing without explicit user approval - design and propose first, wait for confirmation
- **Document decisions** in `decisions/` folder using EDR template
- **QAR Process**: Po dokončení QAR MUSÍ vždy následovat ADR záznam. Implementace POUZE po explicitním souhlasu uživatele!
  ```
  QAR dokončen → Vytvořit ADR → Získat souhlas → Implementovat
  ```

## App Design Principles (from psychological analysis)
- Never say "Wrong" - use "Let's see what happened"
- Offer hints as normal part of learning, not punishment
- Start with strength areas to build confidence
- Celebrate attempts, not just correct answers
- "Safe mode" for constructions - step-by-step without judgment
- Track progress in understanding, not just points

## Technical Specifications

### App Location
```
app/                    # React application
  src/
    components/         # React components
      ProblemCard.jsx   # Problem display + answer input
      SessionSummary.jsx # End of session screen
    data/
      problem_bank.json # Copied from data/problems/
    hooks/              # Custom React hooks
    pages/              # Page components (future)
    App.jsx             # Main app component
    index.css           # Tailwind CSS
```

### Running the App
```bash
cd app
npm run dev     # Start dev server at http://localhost:5173
npm run build   # Build for production
npm run deploy  # Deploy to GitHub Pages
```

### Tech Stack
- **Framework**: React 18 + Vite 4
- **Styling**: Tailwind CSS v3
- **Approach**: Mobile-first (mobile is PRIMARY target)
- **Data**: localStorage (MVP), Supabase (future)

### Breakpoints
| Breakpoint | Width | Priority |
|------------|-------|----------|
| Mobile | < 640px | **PRIMARY** - full experience, not simplified |
| Tablet | 640-1024px | Enhanced - more space for geometry |
| Desktop | > 1024px | Optional - parent dashboard |

### Mobile-First Design Principles
- **Mobile = complete app**, not degraded version
- **One problem per screen** (reduces cognitive load + anxiety)
- **Large touch targets** (min 44px, ideally 48px)
- **Thumb-friendly navigation** - key actions in bottom zone
- **Swipe gestures** for navigation between problems
- **No horizontal scrolling**
- **Geometry on mobile**: Step-by-step guided mode (full construction on tablet+)
