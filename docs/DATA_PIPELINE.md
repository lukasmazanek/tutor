# Data Pipeline Documentation

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT SOURCES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  tests/math/*.pdf              data/tests/*.json                        │
│  (Filled CERMAT tests)         (Analyzed test results)                  │
│       M1-M8.pdf          →          235 questions                       │
│                                                                          │
│         │                              │                                 │
│         │ Manual analysis              │ scripts/extract-from-tests.js  │
│         │ (Claude + human)             │ (automatic)                    │
│         ▼                              ▼                                 │
│                                                                          │
│              data/source/content/*.json                                  │
│              (Practice questions - unified source)                       │
│                     152+ questions                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ scripts/generate-formats.js
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        GENERATED OUTPUT                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│              data/generated/questions.json                               │
│              (Unified format for app consumption)                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ scripts/sync-data.sh
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          APP DATA                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│              app/src/data/questions.json                                 │
│              app/src/data/topic_type_mapping.json                        │
│              app/src/data/profiles/*.json                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ npm run build
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│              https://lukasmazanek.github.io/tutor/                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scripts

### 1. Manual Analysis (PDF → Test JSON)
**Input:** `tests/math/*.pdf` (scanned filled tests)
**Output:** `data/tests/*.json` (analyzed test results)
**Process:** Manual - Claude analyzes PDFs, human reviews

Each test JSON contains:
- Student answers and work shown
- Correct answers
- Error analysis (concept/calculation/incomplete)
- Topic categorization

### 2. Extract from Tests
**Script:** `scripts/extract-from-tests.js`
**Input:** `data/tests/*.json`
**Output:** `data/source/content/*.json` (new/updated)

```bash
# Preview what would be extracted
node scripts/extract-from-tests.js --dry-run

# Actually extract and add to source
node scripts/extract-from-tests.js
```

Features:
- Deduplicates questions (by normalized task text)
- Maps test topics to source topics
- Creates new topic files if needed
- Preserves existing questions

### 3. Generate Formats
**Script:** `scripts/generate-formats.js`
**Input:** `data/source/content/*.json`
**Output:** `data/generated/questions.json`

Transforms source format to unified app format:
- ADR-014: Unified content format
- ADR-022: Multi-mode questions
- ADR-033: Common error feedback

### 4. Sync to App
**Script:** `scripts/sync-data.sh`
**Input:** `data/generated/*.json`, `data/taxonomy/*.json`, `data/psychology/profiles/*.json`
**Output:** `app/src/data/*`

Copies generated data to React app.

### 5. Full Pipeline
**Command:** `npm run sync-data` (from app directory)

Runs:
1. `validate-data.js` - validates source data
2. `generate-formats.js` - transforms to unified format
3. `sync-data.sh` - copies to app

## File Formats

### Source Content Format (`data/source/content/*.json`)
```json
{
  "topic": "equations",
  "name": "Lineární rovnice",
  "version": "1.1",
  "questions": [
    {
      "id": "eq-001",
      "topic": "equations",
      "difficulty": 1,
      "question": {
        "stem": "2x + 3 = 7",
        "context": "Vyřeš rovnici: 2x + 3 = 7"
      },
      "answer": {
        "correct": "2",
        "unit": null,
        "variants": []
      },
      "distractors": [
        { "value": "3" },
        { "value": "5" }
      ],
      "hints": [
        { "level": 1, "text": "Převeď 3 na druhou stranu" }
      ],
      "solution": {
        "steps": ["2x + 3 = 7", "2x = 4", "x = 2"],
        "strategy": "Izoluj x"
      },
      "meta": {
        "type_id": "EQ-LINEAR",
        "type_label": "Lineární rovnice"
      }
    }
  ]
}
```

### Generated Format (`data/generated/questions.json`)
```json
{
  "version": "4.0",
  "generated": "2024-12-29T...",
  "description": "ADR-022: Multi-mode questions",
  "topics": {
    "equations": {
      "id": "equations",
      "name_cs": "Lineární rovnice",
      "is_strength": true,
      "is_critical": false
    }
  },
  "questions": [
    {
      "id": "eq-001",
      "topic": "equations",
      "difficulty": 1,
      "question": { "stem": "...", "context": "..." },
      "modes": {
        "numeric": {
          "answer": "2",
          "unit": null,
          "variants": [],
          "distractors": ["3", "5"]
        }
      },
      "keyboard": { "variable": "x" },
      "hints": ["..."],
      "solution": { "steps": [...], "strategy": "..." },
      "meta": { ... },
      "common_errors": [...]  // ADR-033
    }
  ]
}
```

## Topic Mapping

| Test Topic | Source Topic | Czech Name |
|------------|--------------|------------|
| Zlomky | fractions | Zlomky |
| Lineární rovnice | equations | Lineární rovnice |
| Procenta | percents | Procenta |
| Pythagorova věta | pythagorean | Pythagorova věta |
| Posloupnosti | sequences | Posloupnosti |
| Vzorce (a+b)² | binomial_squares | Umocňování (a±b)² |
| Slovní úlohy | word_problems | Slovní úlohy |
| Objem těles | volume | Objem těles |
| ... | ... | ... |

Full mapping in `scripts/extract-from-tests.js`.

## Commands

```bash
# From project root
node scripts/extract-from-tests.js --dry-run  # Preview extraction
node scripts/extract-from-tests.js            # Run extraction

# From app directory
npm run validate     # Validate source data
npm run sync-data    # Full pipeline (validate → generate → sync)
npm run build        # Build for production
npm run deploy       # Deploy to GitHub Pages
```

## ADR References

- [ADR-014](../decisions/ADR-014-unified-content-format.md) - Unified content format
- [ADR-022](../decisions/ADR-022-multi-mode-questions.md) - Multi-mode questions
- [ADR-033](../decisions/ADR-033-smart-error-feedback.md) - Smart error feedback
