#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TESTS_DIR = '/Users/luke/claude/tutor/data/tests';
const files = ['M9PDD24C0T04.json', 'M9PCD23C0T03.json', 'M9PCD22C0T03.json', 'M9PBD24C0T02.json', 'M9PBD22C0T02.json', 'M9PAD23C0T01_new.json', 'M9PAD22C0T01.json', 'M9PAD17C0T01.json'];

const TOPIC_MAP = {
  'Zlomky': 'fractions',
  'Lineární rovnice': 'equations',
  'Vzorce (a+b)²': 'binomial_squares',
  'Umocňování (a+b)²': 'binomial_squares',
  'Pythagorova věta': 'pythagorean',
  'Posloupnosti': 'sequences',
  'Posloupnosti a řady': 'sequences',
  'Průměry': 'averages',
  'Společná práce': 'work_problems',
  'Procenta': 'percents',
  'Odmocniny': 'square_roots',
  'Obsah a obvod': 'area_perimeter',
  'Objem těles': 'volume',
  'Vytýkání a rozklad': 'factoring',
  'Výrazy s proměnnou': 'expressions',
  'Konstrukce': 'constructions',
  'Úhly a přímky': 'angles',
  'Kružnice a kruh': 'circles',
  'Převody jednotek': 'unit_conversions',
  'Poměr': 'ratios',
  'Přímá úměrnost': 'direct_proportion',
  'Nepřímá úměrnost': 'inverse_proportion',
  'Tabulky a grafy': 'tables_graphs',
  'Soustavy rovnic': 'systems_equations',
  'Mocniny': 'powers',
  'Celá čísla': 'integers',
  'Kombinatorika': 'combinatorics',
  'Pravděpodobnost': 'probability',
  'Desetinná čísla': 'decimals',
  'Nerovnice': 'inequalities',
};

const unknownTopics = new Map();

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(TESTS_DIR, file), 'utf8'));
  data.questions.forEach(q => {
    if (TOPIC_MAP[q.topic] === undefined) {
      const count = unknownTopics.get(q.topic) || 0;
      unknownTopics.set(q.topic, count + 1);
    }
  });
});

console.log('Nenamapovaná témata:');
[...unknownTopics.entries()]
  .sort((a,b) => b[1] - a[1])
  .forEach(([topic, count]) => console.log(`  ${topic}: ${count}`));
