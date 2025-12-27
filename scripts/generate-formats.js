#!/usr/bin/env node
/**
 * Generate unified output format from source data
 * Run: node scripts/generate-formats.js
 *
 * ADR-014: Single output format, presentation layer decides MC vs open answer
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

// Transform to unified output format (ADR-016, ADR-020)
function toUnifiedFormat(q) {
  const hasDistractors = q.distractors && q.distractors.length >= 2;
  const hasQuestion = !!(q.question.context || q.question.stem);
  const hasAnswer = !!q.answer.correct;

  // ADR-020: Always use correct - parser can evaluate expressions like "1/6"
  const answerValue = q.answer.correct;

  // Build base object
  const result = {
    id: q.id,
    topic: q.topic,
    difficulty: q.difficulty || 1,
    question: {
      stem: q.question.stem || null,
      context: q.question.context || null
    },
    answer: {
      value: answerValue,
      unit: q.answer.unit || null
    },
    distractors: hasDistractors ? q.distractors.map(d => d.value) : [],
    hints: q.hints ? q.hints.map(h => h.text) : [],
    solution: {
      steps: q.solution?.steps || [],
      strategy: q.solution?.strategy || null
    },
    meta: {
      type_id: q.meta?.type_id || null,
      type_label: q.meta?.type_label || null,
      original_type: q.meta?.original_type || null,
      supports_mc: hasDistractors,
      supports_open: hasQuestion && hasAnswer
    }
  };

  // Add diagram for pythagorean questions
  if (q.topic === 'pythagorean') {
    result.diagram = {
      type: 'right_triangle',
      highlight: getPythagoreanHighlight(q.question.stem)
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

// Stats
const mcCount = unifiedQuestions.filter(q => q.meta.supports_mc).length;
const openCount = unifiedQuestions.filter(q => q.meta.supports_open).length;

const output = {
  version: '3.0',
  generated: new Date().toISOString(),
  description: 'Unified question format - presentation layer decides MC vs open answer',
  topics: extractTopics(allQuestions),
  questions: unifiedQuestions
};

fs.writeFileSync(
  path.join(GENERATED_DIR, 'questions.json'),
  JSON.stringify(output, null, 2)
);

console.log(`✓ questions.json`);
console.log(`  - ${unifiedQuestions.length} total questions`);
console.log(`  - ${mcCount} support multiple choice`);
console.log(`  - ${openCount} support open answer`);
console.log(`\nGeneration complete!`);
console.log(`Output: ${GENERATED_DIR}`);
