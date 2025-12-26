#!/usr/bin/env node
/**
 * Fix numeric values in o_x_vice.json source file
 * Converts decimal string answers to proper numeric values
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/source/content/o_x_vice.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

let fixed = 0;

data.questions.forEach(q => {
  const correct = q.answer.correct;

  // Check if it's a decimal string like "0,9" or "1,25"
  if (typeof correct === 'string' && /^[0-9]+,[0-9]+$/.test(correct)) {
    // Convert Czech decimal to JS number
    const numericValue = parseFloat(correct.replace(',', '.'));

    if (q.answer.numeric === null || q.answer.numeric === undefined) {
      console.log(`${q.id}: "${correct}" → numeric: ${numericValue}`);
      q.answer.numeric = numericValue;
      fixed++;
    } else if (q.answer.numeric !== numericValue) {
      console.log(`${q.id}: "${correct}" → numeric: ${numericValue} (was: ${q.answer.numeric})`);
      q.answer.numeric = numericValue;
      fixed++;
    }
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

console.log(`\n✅ Fixed ${fixed} questions`);
