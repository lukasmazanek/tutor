#!/usr/bin/env node
/**
 * Generate unified output format from source data
 * Run: node scripts/generate-formats.js
 *
 * ADR-014: Single output format, presentation layer decides MC vs open answer
 * ADR-022: Multi-mode questions and keyboard enhancement
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'data/source/content');
const GENERATED_DIR = path.join(ROOT, 'data/generated');

// Ensure output directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Load all source files
function loadAllQuestions() {
  const questions = [];
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8'));
    questions.push(...data.questions);
  });

  return questions;
}

// Determine which side of right triangle to highlight based on question stem
function getPythagoreanHighlight(stem) {
  if (!stem) return 'c'; // default to hypotenuse
  const s = stem.toLowerCase();

  // Check for specific side being asked
  if (s.includes('c = ?') || s.includes('přeponu') || s.includes('c =')) return 'c';
  if (s.includes('a = ?') || s.includes('odvěsnu a') || s.includes('a =')) return 'a';
  if (s.includes('b = ?') || s.includes('odvěsnu b') || s.includes('b =')) return 'b';

  return 'c'; // default
}

// Generate diagram labels from pythagorean stem
// Parses patterns like "a = 3, b = 4, c = ?" or "Odvěsny 3 a 4. Přepona?"
function getPythagoreanLabels(stem) {
  if (!stem) return null;

  // Pattern 1: "a = 3, b = 4, c = ?"
  const explicitPattern = /([abc])\s*=\s*(\?|√?\d+)/gi;
  const matches = [...stem.matchAll(explicitPattern)];

  if (matches.length >= 2) {
    const labels = {};
    matches.forEach(m => {
      labels[m[1].toLowerCase()] = m[2];
    });
    // Fill in missing sides with default
    if (!labels.a) labels.a = 'a';
    if (!labels.b) labels.b = 'b';
    if (!labels.c) labels.c = 'c';
    return labels;
  }

  // Pattern 2: "Odvěsny 3 a 4. Přepona?" or "Odvěsna 3, přepona 5. Druhá odvěsna?"
  const odvesny = stem.match(/[Oo]dvěsn[ya]\s+(\d+)\s+a\s+(\d+)/);
  if (odvesny) {
    return { a: odvesny[1], b: odvesny[2], c: '?' };
  }

  const odvesnaPrep = stem.match(/[Oo]dvěsna\s+(\d+),?\s+přepona\s+(\d+)/);
  if (odvesnaPrep) {
    return { a: odvesnaPrep[1], b: '?', c: odvesnaPrep[2] };
  }

  return null; // Cannot parse, use defaults
}

// ADR-022: Detect keyboard variable from question text
// Only matches algebraic patterns like 4n, 3a, 2x (digit + letter)
// Prevents false positives on Czech words like "opřený"
function detectKeyboardVariable(q) {
  const text = q.question?.stem || q.question?.context || '';

  // Require digit before variable to avoid Czech word matches
  const match = text.match(/\d+([nabxy])\b/i);
  if (match) return match[1].toLowerCase();

  return null; // No variable key for word problems
}

// ADR-022: Build modes structure based on question type
function buildModes(q) {
  const modes = {};
  const hasDistractors = q.distractors && q.distractors.length >= 2;
  const originalType = q.meta?.original_type;

  if (originalType === 'problem_type') {
    // Type recognition question - answer is the problem type name
    modes.type_recognition = {
      answer: q.answer.correct,
      distractors: hasDistractors ? q.distractors.map(d => d.value) : []
    };

    // If source data has modes.numeric, include it (for questions with both)
    if (q.modes?.numeric) {
      modes.numeric = q.modes.numeric;
    }
  } else {
    // Numeric/calculation question
    modes.numeric = {
      answer: q.answer.correct,
      unit: q.answer.unit || null,
      variants: q.answer.variants || [],
      distractors: hasDistractors ? q.distractors.map(d => d.value) : []
    };

    // If source data has modes.type_recognition, include it
    if (q.modes?.type_recognition) {
      modes.type_recognition = q.modes.type_recognition;
    }
  }

  return modes;
}

// ADR-033: Transform common_errors for output
function transformCommonErrors(commonErrors) {
  if (!commonErrors || commonErrors.length === 0) return undefined;

  return commonErrors.map(err => ({
    value: err.value,
    variants: err.variants || [],
    feedback: err.feedback,
    misconception: err.misconception || null
  }));
}

// Transform to unified output format (ADR-014, ADR-016, ADR-020, ADR-022, ADR-033)
function toUnifiedFormat(q) {
  const modes = buildModes(q);

  // Build base object
  const result = {
    id: q.id,
    topic: q.topic,
    difficulty: q.difficulty || 1,
    question: {
      stem: q.question.stem || null,
      context: q.question.context || null
    },
    modes: modes,
    keyboard: {
      variable: detectKeyboardVariable(q)
    },
    hints: q.hints ? q.hints.map(h => h.text) : [],
    solution: {
      steps: q.solution?.steps || [],
      strategy: q.solution?.strategy || null
    },
    meta: {
      type_id: q.meta?.type_id || null,
      type_label: q.meta?.type_label || null,
      original_type: q.meta?.original_type || null
    }
  };

  // ADR-033: Include common_errors if present
  const commonErrors = transformCommonErrors(q.common_errors);
  if (commonErrors) {
    result.common_errors = commonErrors;
  }

  // Add diagram - either from source or auto-generate for pythagorean
  if (q.diagram) {
    // Use source diagram directly
    result.diagram = {
      type: q.diagram.type,
      highlight: q.diagram.highlight || null,
      labels: q.diagram.labels || null
    };
  } else if (q.topic === 'pythagorean') {
    // Auto-generate for pythagorean questions
    result.diagram = {
      type: 'right_triangle',
      highlight: getPythagoreanHighlight(q.question.stem),
      labels: getPythagoreanLabels(q.question.stem)
    };
  }

  return result;
}

// Extract unique topics
function extractTopics(questions) {
  const topics = {};
  const topicNames = {
    'equations': 'Lineární rovnice',
    'fractions': 'Zlomky',
    'o_x_vice': 'o X více/méně',
    'pythagorean': 'Pythagorova věta',
    'sequences': 'Posloupnosti',
    'binomial_squares': 'Umocňování (a±b)²',
    'unit_conversions': 'Převody jednotek'
  };

  questions.forEach(q => {
    if (!topics[q.topic]) {
      topics[q.topic] = {
        id: q.topic,
        name_cs: topicNames[q.topic] || q.meta?.type_label || q.topic,
        is_strength: ['equations', 'fractions', 'pythagorean'].includes(q.topic),
        is_critical: ['o_x_vice', 'sequences', 'binomial_squares', 'unit_conversions'].includes(q.topic)
      };
    }
  });
  return topics;
}

// Main generation
console.log('Generating unified output format from source...\n');

const allQuestions = loadAllQuestions();
console.log(`Loaded ${allQuestions.length} questions from source\n`);

const unifiedQuestions = allQuestions.map(toUnifiedFormat);

// Stats - ADR-022 mode-based counting
const numericCount = unifiedQuestions.filter(q => q.modes.numeric).length;
const typeRecogCount = unifiedQuestions.filter(q => q.modes.type_recognition).length;
const bothModesCount = unifiedQuestions.filter(q => q.modes.numeric && q.modes.type_recognition).length;
const withVariableCount = unifiedQuestions.filter(q => q.keyboard.variable).length;

const output = {
  version: '4.0',
  generated: new Date().toISOString(),
  description: 'ADR-022: Multi-mode questions with keyboard config',
  topics: extractTopics(allQuestions),
  questions: unifiedQuestions
};

fs.writeFileSync(
  path.join(GENERATED_DIR, 'questions.json'),
  JSON.stringify(output, null, 2)
);

console.log(`✓ questions.json (v4.0 - ADR-022)`);
console.log(`  - ${unifiedQuestions.length} total questions`);
console.log(`  - ${numericCount} support numeric mode`);
console.log(`  - ${typeRecogCount} support type_recognition mode`);
console.log(`  - ${bothModesCount} support both modes`);
console.log(`  - ${withVariableCount} have keyboard variable`);
console.log(`\nGeneration complete!`);
console.log(`Output: ${GENERATED_DIR}`);
