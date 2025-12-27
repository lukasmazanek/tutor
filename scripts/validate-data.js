/**
 * Data Validation Script
 * Validates source data against:
 * - ADR-014 (Unified Content Format)
 * - ADR-017 (Math Input Language)
 * - ADR-022 (Multi-mode questions and keyboard enhancement)
 *
 * Run: node scripts/validate-data.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_DIR = path.join(__dirname, '../data/source/content')

// Validation errors
const errors = []
const warnings = []

function error(file, questionId, message) {
  errors.push({ file, questionId, message })
}

function warn(file, questionId, message) {
  warnings.push({ file, questionId, message })
}

/**
 * ADR-014: Required fields
 */
function validateRequiredFields(q, file) {
  const required = ['id', 'topic', 'question', 'answer']
  for (const field of required) {
    if (!q[field]) {
      error(file, q.id || '?', `Missing required field: ${field}`)
    }
  }

  if (q.question && !q.question.stem) {
    error(file, q.id, 'Missing question.stem')
  }

  if (q.answer && q.answer.correct === undefined) {
    error(file, q.id, 'Missing answer.correct')
  }
}

/**
 * ADR-014 + ADR-017: Answer format validation
 */
function validateAnswerFormat(q, file) {
  if (!q.answer) return

  const correct = q.answer.correct
  if (typeof correct !== 'string' && typeof correct !== 'number') {
    error(file, q.id, `answer.correct must be string or number, got ${typeof correct}`)
    return
  }

  const correctStr = String(correct)

  // Check for embedded Czech text (should be mathematical expression only)
  const czechPatterns = [
    /neboli/i,
    /původní/i,
    /třetina/i,
    /čtvrtina/i,
    /polovina/i,
    /litrů/i,
    /metrů/i,
    /korun/i,
    /centimetr/i,
  ]

  for (const pattern of czechPatterns) {
    if (pattern.test(correctStr)) {
      error(file, q.id, `answer.correct contains Czech text "${correctStr}" - should be math expression only`)
      break
    }
  }

  // Check for embedded units (should be in answer.unit field)
  const unitPatterns = [
    /\d+\s*(Kč|kč|KČ)\s*$/,
    /\d+\s*(cm|m|km|mm)\s*$/i,
    /\d+\s*(l|litr|litry)\s*$/i,
    /\d+\s*(kg|g|mg)\s*$/i,
    /\d+\s*(°|stupňů|stupně)\s*$/i,
    /\d+\s*%\s*$/, // percentage at end (might be intentional)
  ]

  for (const pattern of unitPatterns) {
    if (pattern.test(correctStr) && !q.answer.unit) {
      error(file, q.id, `answer.correct "${correctStr}" has embedded unit - move to answer.unit field`)
      break
    }
  }

  // Check for invalid math expression starts
  if (/^[×·÷:]\s/.test(correctStr)) {
    error(file, q.id, `answer.correct "${correctStr}" starts with operator - invalid expression`)
  }

  // Check unit field type
  if (q.answer.unit !== undefined && q.answer.unit !== null && typeof q.answer.unit !== 'string') {
    error(file, q.id, `answer.unit must be string or null, got ${typeof q.answer.unit}`)
  }
}

/**
 * Validate distractors format
 */
function validateDistractors(q, file) {
  if (!q.distractors || !Array.isArray(q.distractors)) return

  for (let i = 0; i < q.distractors.length; i++) {
    const d = q.distractors[i]
    if (d.value === undefined) {
      error(file, q.id, `distractors[${i}] missing value field`)
    }
  }
}

/**
 * Validate hints format
 */
function validateHints(q, file) {
  if (!q.hints || !Array.isArray(q.hints)) return

  for (let i = 0; i < q.hints.length; i++) {
    const h = q.hints[i]
    if (!h.text) {
      error(file, q.id, `hints[${i}] missing text field`)
    }
  }
}

/**
 * Validate meta fields
 */
function validateMeta(q, file) {
  if (!q.meta) {
    warn(file, q.id, 'Missing meta field')
    return
  }

  if (!q.meta.type_id) {
    warn(file, q.id, 'Missing meta.type_id')
  }
}

/**
 * ADR-022: Validate diagram configuration
 */
function validateDiagram(q, file) {
  if (!q.diagram) return // diagram is optional

  if (!q.diagram.type) {
    error(file, q.id, 'diagram.type is required when diagram is present')
  }

  const validTypes = ['right_triangle', 'rectangle', 'cube', 'equilateral_triangle', 'ladder']
  if (q.diagram.type && !validTypes.includes(q.diagram.type)) {
    warn(file, q.id, `diagram.type "${q.diagram.type}" not in known types: ${validTypes.join(', ')}`)
  }

  if (q.diagram.highlight && !['a', 'b', 'c'].includes(q.diagram.highlight)) {
    warn(file, q.id, `diagram.highlight "${q.diagram.highlight}" should be 'a', 'b', or 'c'`)
  }

  if (q.diagram.labels) {
    const labels = q.diagram.labels
    if (typeof labels !== 'object') {
      error(file, q.id, 'diagram.labels must be an object')
    }
  }
}

/**
 * ADR-022: Validate modes configuration (if present in source)
 */
function validateModes(q, file) {
  if (!q.modes) return // modes is optional in source data

  if (q.modes.numeric) {
    if (!q.modes.numeric.answer) {
      error(file, q.id, 'modes.numeric.answer is required')
    }
  }

  if (q.modes.type_recognition) {
    if (!q.modes.type_recognition.answer) {
      error(file, q.id, 'modes.type_recognition.answer is required')
    }
  }
}

/**
 * Main validation function for a single question
 */
function validateQuestion(q, file) {
  validateRequiredFields(q, file)
  validateAnswerFormat(q, file)
  validateDistractors(q, file)
  validateHints(q, file)
  validateMeta(q, file)
  validateDiagram(q, file)
  validateModes(q, file)
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  const fileName = path.basename(filePath)

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)

    if (!data.questions || !Array.isArray(data.questions)) {
      error(fileName, '-', 'File must have questions array')
      return
    }

    // Check file-level fields
    if (!data.topic) {
      warn(fileName, '-', 'Missing topic field at file level')
    }

    // Validate each question
    for (const q of data.questions) {
      validateQuestion(q, fileName)
    }

    console.log(`  ✓ ${fileName}: ${data.questions.length} questions`)

  } catch (e) {
    error(fileName, '-', `Failed to parse: ${e.message}`)
  }
}

/**
 * Main
 */
function main() {
  console.log('Validating data against ADR-014 and ADR-017...\n')
  console.log('Source directory:', SOURCE_DIR)
  console.log('')

  // Find all JSON files in source/content
  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(SOURCE_DIR, f))

  if (files.length === 0) {
    console.log('No JSON files found in source/content/')
    process.exit(1)
  }

  console.log('Files:')
  for (const file of files) {
    validateFile(file)
  }

  // Report results
  console.log('\n' + '='.repeat(50))

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ All validations passed!')
    process.exit(0)
  }

  if (warnings.length > 0) {
    console.log(`\n⚠ Warnings (${warnings.length}):`)
    for (const w of warnings) {
      console.log(`  [${w.file}] ${w.questionId}: ${w.message}`)
    }
  }

  if (errors.length > 0) {
    console.log(`\n✗ Errors (${errors.length}):`)
    for (const e of errors) {
      console.log(`  [${e.file}] ${e.questionId}: ${e.message}`)
    }
    process.exit(1)
  }

  process.exit(0)
}

main()
