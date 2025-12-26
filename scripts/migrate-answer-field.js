#!/usr/bin/env node
/**
 * Migration script: ADR-016 - Unified Answer Field
 *
 * Migrates from:
 *   "answer": { "correct": "1,2", "numeric": 1.2, "unit": null }
 *
 * To:
 *   "answer": { "value": 1.2, "unit": null }
 *
 * Logic:
 *   - If numeric is not null → value = numeric
 *   - If numeric is null → value = correct (string)
 */

const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '../app/src/data/questions.json');
const BACKUP_PATH = path.join(__dirname, '../app/src/data/questions.backup.json');

function migrate() {
  console.log('📦 ADR-016 Migration: Unified Answer Field\n');

  // Read the file
  const raw = fs.readFileSync(QUESTIONS_PATH, 'utf-8');
  const data = JSON.parse(raw);

  // Create backup
  fs.writeFileSync(BACKUP_PATH, raw);
  console.log(`✅ Backup created: ${BACKUP_PATH}\n`);

  let migratedCount = 0;
  let numericCount = 0;
  let stringCount = 0;

  // Migrate each question
  data.questions.forEach((q, idx) => {
    if (!q.answer) return;

    const { correct, numeric, unit } = q.answer;

    // Determine the value
    let value;
    if (numeric !== null && numeric !== undefined) {
      value = numeric;
      numericCount++;
    } else {
      value = correct;
      stringCount++;
    }

    // Replace answer object
    q.answer = {
      value,
      unit: unit || null
    };

    migratedCount++;
  });

  // Write the migrated data
  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(data, null, 2));

  console.log('📊 Migration Summary:');
  console.log(`   Total questions migrated: ${migratedCount}`);
  console.log(`   Numeric values: ${numericCount}`);
  console.log(`   String values: ${stringCount}`);
  console.log(`\n✅ Migration complete!`);
  console.log(`\n⚠️  Don't forget to update ProblemCard.jsx to use answer.value`);
}

// Run migration
migrate();
