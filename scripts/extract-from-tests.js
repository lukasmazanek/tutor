#!/usr/bin/env node
/**
 * Extract unique questions from test files
 * Run: node scripts/extract-from-tests.js [--dry-run]
 *
 * Pipeline: data/tests/*.json → analysis → data/source/content/*.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'data/tests');
const SOURCE_DIR = path.join(ROOT, 'data/source/content');

// Test files to process
const TEST_FILES = [
  'M9PDD24C0T04.json',
  'M9PCD23C0T03.json',
  'M9PCD22C0T03.json',
  'M9PBD24C0T02.json',
  'M9PBD22C0T02.json',
  'M9PAD23C0T01_new.json',
  'M9PAD22C0T01.json',
  'M9PAD17C0T01.json'
];

// Topic mapping: test topic → source content topic
const TOPIC_MAP = {
  // Existing topics
  'Zlomky': 'fractions',
  'Zlomky - složené': 'fractions',
  'Zlomky - slovní úloha': 'fractions',
  'Lineární rovnice': 'equations',
  'Rovnice': 'equations',
  'Rovnice se zlomky': 'equations',
  'Vzorce (a+b)²': 'binomial_squares',
  'Vzorce (a-b)²': 'binomial_squares',
  'Vzorce a²-b²': 'binomial_squares',
  'Umocňování (a+b)²': 'binomial_squares',
  'Umocňování': 'binomial_squares',
  'Pythagorova věta': 'pythagorean',
  'Posloupnosti': 'sequences',
  'Posloupnosti a řady': 'sequences',
  'Průměry': 'averages',
  'Společná práce': 'work_problems',
  'Slovní úlohy - práce': 'work_problems',

  // New topics to create
  'Procenta': 'percents',
  'Procenta - přiřazení': 'percents',
  'Procenta - slevy': 'percents',
  'Procenta - slovní úloha': 'percents',
  'Grafy - procenta': 'percents',
  'Odmocniny': 'square_roots',
  'Mocniny a odmocniny': 'square_roots',
  'Mocniny': 'powers',
  'Mocniny a dělení': 'powers',
  'Obsah a obvod': 'area_perimeter',
  'Obsah čtyřúhelníku': 'area_perimeter',
  'Objem těles': 'volume',
  'Objem válce': 'volume',
  'Objem hranolu': 'volume',
  'Objem - kvádr': 'volume',
  'Válec': 'volume',
  'Tělesa - válec': 'volume',
  'Vytýkání a rozklad': 'factoring',
  'Rozklad vytknutím': 'factoring',
  'Rozklad na součin': 'factoring',
  'Výrazy s proměnnou': 'expressions',
  'Algebraické výrazy': 'expressions',
  'Pořadí operací': 'expressions',
  'Konstrukce': 'constructions',
  'Úhly a přímky': 'angles',
  'Úhly': 'angles',
  'Kružnice a kruh': 'circles',
  'Kruh a kružnice': 'circles',

  // Word problems (various)
  'Slovní úlohy': 'word_problems',
  'Slovní úlohy - logika': 'word_problems',
  'Slovní úlohy - délka': 'word_problems',
  'Slovní úlohy - výrazy': 'word_problems',
  'Směsi - ceny': 'word_problems',
  'Směsi - hmotnost': 'word_problems',
  'Měřítko': 'word_problems',

  // Other topics
  'Převody jednotek': 'unit_conversions',
  'Jednotky a převody': 'unit_conversions',
  'Poměr': 'ratios',
  'Přímá úměrnost': 'direct_proportion',
  'Nepřímá úměrnost': 'inverse_proportion',
  'Tabulky a grafy': 'tables_graphs',
  'Statistika - grafy': 'tables_graphs',
  'Soustavy rovnic': 'systems_equations',
  'Soustava rovnic': 'systems_equations',
  'Lineární funkce': 'functions',
  'Celá čísla': 'integers',
  'Kombinatorika': 'combinatorics',
  'Pravděpodobnost': 'probability',
  'Desetinná čísla': 'decimals',
  'Nerovnice': 'inequalities',
};

// Czech topic names for new files
const TOPIC_NAMES = {
  'percents': 'Procenta',
  'square_roots': 'Odmocniny',
  'area_perimeter': 'Obsah a obvod',
  'volume': 'Objem těles',
  'factoring': 'Vytýkání a rozklad',
  'expressions': 'Výrazy s proměnnou',
  'constructions': 'Konstrukce',
  'angles': 'Úhly a přímky',
  'circles': 'Kružnice a kruh',
  'ratios': 'Poměr',
  'direct_proportion': 'Přímá úměrnost',
  'inverse_proportion': 'Nepřímá úměrnost',
  'tables_graphs': 'Tabulky a grafy',
  'systems_equations': 'Soustavy rovnic',
  'powers': 'Mocniny',
  'integers': 'Celá čísla',
  'combinatorics': 'Kombinatorika',
  'probability': 'Pravděpodobnost',
  'decimals': 'Desetinná čísla',
  'inequalities': 'Nerovnice',
  'word_problems': 'Slovní úlohy',
  'functions': 'Lineární funkce',
  // Existing topics (for completeness)
  'fractions': 'Zlomky',
  'equations': 'Lineární rovnice',
  'binomial_squares': 'Umocňování (a±b)²',
  'pythagorean': 'Pythagorova věta',
  'sequences': 'Posloupnosti',
  'averages': 'Průměry',
  'work_problems': 'Úlohy o práci',
  'unit_conversions': 'Převody jednotek',
  'o_x_vice': 'o X více/méně',
};

// Normalize task text for deduplication
function normalizeTask(task) {
  return task
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]/g, '')
    .trim();
}

// Generate question ID
function generateId(topic, index) {
  const prefix = topic.substring(0, 3);
  return `${prefix}-test-${String(index).padStart(3, '0')}`;
}

// Load existing questions from source
function loadExistingQuestions() {
  const existing = new Map(); // normalized task → question

  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8'));
    data.questions.forEach(q => {
      const task = q.question?.stem || q.question?.context || '';
      existing.set(normalizeTask(task), q);
    });
  });

  return existing;
}

// Load all test questions
function loadTestQuestions() {
  const questions = [];

  TEST_FILES.forEach(file => {
    const filePath = path.join(TESTS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${file} not found`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const testId = data.test_id;

    data.questions.forEach(q => {
      questions.push({
        ...q,
        source_test: testId,
        source_file: file
      });
    });
  });

  return questions;
}

// Convert test question to source format
function convertToSourceFormat(q, id) {
  // Determine difficulty from max_points
  let difficulty = 1;
  if (q.max_points >= 3) difficulty = 3;
  else if (q.max_points >= 2) difficulty = 2;

  return {
    id: id,
    topic: TOPIC_MAP[q.topic] || 'unknown',
    tags: [q.topic.toLowerCase().replace(/\s+/g, '-')],
    difficulty: difficulty,
    question: {
      stem: q.task,
      context: q.task,
      image: null
    },
    answer: {
      correct: String(q.correct_answer),
      unit: null,
      variants: []
    },
    distractors: [],
    hints: q.error_detail ? [
      { level: 1, text: `Častá chyba: ${q.error_detail}` }
    ] : [],
    solution: {
      steps: q.student_work && q.is_correct ? [q.student_work] : [],
      strategy: null
    },
    meta: {
      type_id: `TEST-${q.topic_id}`,
      type_label: q.topic,
      source: q.source_test,
      original_type: q.type
    }
  };
}

// Main extraction
function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('Extracting unique questions from tests...\n');

  // Load data
  const existing = loadExistingQuestions();
  const testQuestions = loadTestQuestions();

  console.log(`Existing questions in source: ${existing.size}`);
  console.log(`Questions in test files: ${testQuestions.length}\n`);

  // Find unique questions by topic
  const byTopic = new Map();
  const duplicates = [];
  const skipped = { construction: 0, multipleChoice: 0, noAnswer: 0 };

  testQuestions.forEach(q => {
    // Skip construction questions (can't be practiced digitally)
    if (q.type === 'construction') {
      skipped.construction++;
      return;
    }

    // Skip if no clear correct answer
    if (!q.correct_answer || q.correct_answer === null) {
      skipped.noAnswer++;
      return;
    }

    // Check for duplicates
    const normalized = normalizeTask(q.task);
    if (existing.has(normalized)) {
      duplicates.push(q.task);
      return;
    }

    // Add to topic group
    const topic = TOPIC_MAP[q.topic] || 'unknown';
    if (!byTopic.has(topic)) {
      byTopic.set(topic, []);
    }

    // Check for duplicates within tests
    const topicQuestions = byTopic.get(topic);
    const isDuplicate = topicQuestions.some(tq =>
      normalizeTask(tq.task) === normalized
    );

    if (!isDuplicate) {
      topicQuestions.push(q);
    }
  });

  // Report
  console.log('=== Extraction Report ===\n');
  console.log(`Skipped: ${skipped.construction} constructions, ${skipped.noAnswer} without answer`);
  console.log(`Duplicates with existing: ${duplicates.length}`);
  console.log('');

  console.log('New questions by topic:');
  let totalNew = 0;
  const sortedTopics = [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length);

  sortedTopics.forEach(([topic, questions]) => {
    const topicName = TOPIC_NAMES[topic] || topic;
    console.log(`  ${topicName} (${topic}): ${questions.length} new`);
    totalNew += questions.length;
  });

  console.log(`\nTotal new questions: ${totalNew}`);

  if (dryRun) {
    console.log('\n[DRY RUN] No files modified.');
    console.log('Run without --dry-run to create/update source files.');
    return;
  }

  // Write new questions to source files
  console.log('\n=== Writing to source files ===\n');

  sortedTopics.forEach(([topic, questions]) => {
    if (questions.length === 0) return;

    const fileName = `${topic}.json`;
    const filePath = path.join(SOURCE_DIR, fileName);
    const topicName = TOPIC_NAMES[topic] || topic;

    let data;
    let startIndex = 1;

    if (fs.existsSync(filePath)) {
      // Append to existing file
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      startIndex = data.questions.length + 1;
    } else {
      // Create new file
      data = {
        topic: topic,
        name: topicName,
        version: '1.0',
        migrated: new Date().toISOString().split('T')[0],
        questions: []
      };
    }

    // Convert and add questions
    questions.forEach((q, i) => {
      const id = generateId(topic, startIndex + i);
      const converted = convertToSourceFormat(q, id);
      converted.topic = topic;
      data.questions.push(converted);
    });

    // Update version
    data.version = '1.1';
    data.migrated = new Date().toISOString().split('T')[0];

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✓ ${fileName}: added ${questions.length} questions (total: ${data.questions.length})`);
  });

  console.log('\nExtraction complete!');
  console.log('Run `npm run sync-data` to update the app.');
}

main();
