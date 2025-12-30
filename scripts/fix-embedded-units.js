#!/usr/bin/env node
/**
 * Fix embedded units in answer.correct fields
 * Moves units from answer.correct to answer.unit
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'data/source/content');

// Pattern to extract answer and unit
// Handles: "35%", "48 cm", "C) 25%", "B) 210 Kč", "1,5 km"
function extractAnswerAndUnit(value) {
  if (!value || typeof value !== 'string') return null;

  // Pattern: optional letter prefix, number (with comma/dot), optional unit
  const match = value.match(/^([A-Z]\)\s*)?(-?[\d,\.]+)\s*(%|cm|m|km|kg|Kč|°|h|min|l|ml|dm³|cm³|m³)?$/i);

  if (match) {
    const prefix = match[1] || '';
    const number = match[2];
    const unit = match[3] || null;

    // If there's a unit or a prefix like "C)", it needs fixing
    if (unit || prefix) {
      return {
        answer: prefix ? value : number, // Keep full value for MC answers like "C) 25%"
        cleanAnswer: number,
        unit: unit
      };
    }
  }

  return null;
}

// Process a single file
function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fixes = 0;

  data.questions.forEach(q => {
    if (!q.answer || !q.answer.correct) return;

    const correct = String(q.answer.correct);
    const extracted = extractAnswerAndUnit(correct);

    if (extracted && extracted.unit && !q.answer.unit) {
      // Fix: extract unit
      q.answer.correct = extracted.cleanAnswer;
      q.answer.unit = extracted.unit;
      fixes++;
      console.log(`  Fixed: ${q.id}: "${correct}" → "${extracted.cleanAnswer}" + unit: ${extracted.unit}`);
    }
  });

  if (fixes > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  return fixes;
}

// Main
console.log('Fixing embedded units in answers...\n');

const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
let totalFixes = 0;

files.forEach(file => {
  const filePath = path.join(SOURCE_DIR, file);
  const fixes = processFile(filePath);
  if (fixes > 0) {
    console.log(`  ${file}: ${fixes} fixes\n`);
    totalFixes += fixes;
  }
});

console.log(`\nTotal fixes: ${totalFixes}`);
