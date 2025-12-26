/**
 * Testy pro mathParser
 * Spustit: node lib/mathParser.test.js
 */

import {
  normalize,
  extractUnit,
  toJSExpression,
  safeEval,
  containsOriginalValue,
  numbersEqual,
  expressionsEquivalent,
  evaluateAnswer
} from './mathParser.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (e) {
    console.log(`✗ ${name}`)
    console.log(`  ${e.message}`)
    failed++
  }
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg} Expected ${expected}, got ${actual}`)
  }
}

function assertTrue(value, msg = '') {
  if (!value) {
    throw new Error(`${msg} Expected true, got ${value}`)
  }
}

function assertFalse(value, msg = '') {
  if (value) {
    throw new Error(`${msg} Expected false, got ${value}`)
  }
}

// ==================== normalize ====================

console.log('\n--- normalize ---')

test('normalize: desetinná čárka → tečka', () => {
  assertEqual(normalize('1,3'), '1.3')
  assertEqual(normalize('500,8'), '500.8')
})

test('normalize: odstranit mezery', () => {
  assertEqual(normalize('500 × 0,8'), '500×0.8')
  assertEqual(normalize(' 400 '), '400')
})

test('normalize: lowercase', () => {
  assertEqual(normalize('1,3X'), '1.3x')
  assertEqual(normalize('X²'), 'x²')
})

// ==================== extractUnit ====================

console.log('\n--- extractUnit ---')

test('extractUnit: s jednotkou', () => {
  const result = extractUnit('400kč', 'Kč')
  assertEqual(result.value, '400')
  assertEqual(result.unit.toLowerCase(), 'kč')
})

test('extractUnit: s mezerou', () => {
  const result = extractUnit('400 kč', 'Kč')
  assertEqual(result.value, '400')
})

test('extractUnit: bez jednotky', () => {
  const result = extractUnit('400', 'Kč')
  assertEqual(result.value, '400')
  assertEqual(result.unit, null)
})

test('extractUnit: žádná očekávaná', () => {
  const result = extractUnit('400kč', null)
  assertEqual(result.value, '400kč')
  assertEqual(result.unit, null)
})

// ==================== toJSExpression ====================

console.log('\n--- toJSExpression ---')

test('toJSExpression: × → *', () => {
  assertEqual(toJSExpression('500×0.8'), '500*0.8')
})

test('toJSExpression: · → *', () => {
  assertEqual(toJSExpression('6·5'), '6*5')
})

test('toJSExpression: ÷ → /', () => {
  assertEqual(toJSExpression('500÷5'), '500/5')
})

test('toJSExpression: : → /', () => {
  assertEqual(toJSExpression('500:5'), '500/5')
})

test('toJSExpression: ² → **2', () => {
  assertEqual(toJSExpression('x²'), 'x**2')
})

test('toJSExpression: ³ → **3', () => {
  assertEqual(toJSExpression('x³'), 'x**3')
})

test('toJSExpression: ^ → **', () => {
  assertEqual(toJSExpression('2^3'), '2**3')
})

test('toJSExpression: √( → Math.sqrt(', () => {
  assertEqual(toJSExpression('√(16)'), 'Math.sqrt(16)')
})

test('toJSExpression: implicitní násobení 2x → 2*x', () => {
  assertEqual(toJSExpression('2x'), '2*x')
  assertEqual(toJSExpression('1.2x'), '1.2*x')
})

test('toJSExpression: implicitní násobení (...)x → (...)*x', () => {
  assertEqual(toJSExpression('(1+1/5)x'), '(1+1/5)*x')
})

test('toJSExpression: implicitní násobení 6/5x → 6/5*x', () => {
  assertEqual(toJSExpression('6/5x'), '6/5*x')
})

test('toJSExpression: x zůstává x (proměnná)', () => {
  const result = toJSExpression('x')
  assertTrue(result.includes('x'))
  assertFalse(result.includes('*x') && result.length === 2)
})

// ==================== safeEval ====================

console.log('\n--- safeEval ---')

test('safeEval: jednoduché číslo', () => {
  assertEqual(safeEval('400'), 400)
})

test('safeEval: násobení', () => {
  assertEqual(safeEval('500*0.8'), 400)
})

test('safeEval: dělení', () => {
  assertEqual(safeEval('500/5'), 100)
})

test('safeEval: závorky', () => {
  assertEqual(safeEval('(1+1/5)*10'), 12)
})

test('safeEval: mocnina', () => {
  assertEqual(safeEval('2**3'), 8)
})

test('safeEval: odmocnina', () => {
  assertEqual(safeEval('Math.sqrt(16)'), 4)
})

test('safeEval: s proměnnou', () => {
  assertEqual(safeEval('2*x', { x: 5 }), 10)
  assertEqual(safeEval('x**2', { x: 3 }), 9)
})

test('safeEval: neplatný výraz → null', () => {
  assertEqual(safeEval('abc'), null)
  assertEqual(safeEval('2+'), null)
})

// ==================== containsOriginalValue ====================

console.log('\n--- containsOriginalValue ---')

test('containsOriginalValue: obsahuje', () => {
  assertTrue(containsOriginalValue('500*0.8', 500))
  assertTrue(containsOriginalValue('500-100', 500))
})

test('containsOriginalValue: neobsahuje', () => {
  assertFalse(containsOriginalValue('200+200', 500))
})

test('containsOriginalValue: null → true', () => {
  assertTrue(containsOriginalValue('200+200', null))
})

// ==================== numbersEqual ====================

console.log('\n--- numbersEqual ---')

test('numbersEqual: stejná', () => {
  assertTrue(numbersEqual(400, 400))
})

test('numbersEqual: různá', () => {
  assertFalse(numbersEqual(400, 401))
})

test('numbersEqual: floating point', () => {
  assertTrue(numbersEqual(0.1 + 0.2, 0.3))
})

// ==================== expressionsEquivalent ====================

console.log('\n--- expressionsEquivalent ---')

test('expressionsEquivalent: 1.2*x = 6/5*x', () => {
  assertTrue(expressionsEquivalent('1.2*x', '6/5*x'))
})

test('expressionsEquivalent: (1+1/5)*x = 6/5*x', () => {
  assertTrue(expressionsEquivalent('(1+1/5)*x', '6/5*x'))
})

test('expressionsEquivalent: x*1.3 = 1.3*x', () => {
  assertTrue(expressionsEquivalent('x*1.3', '1.3*x'))
})

test('expressionsEquivalent: různé hodnoty', () => {
  assertFalse(expressionsEquivalent('1.2*x', '1.3*x'))
})

// ==================== evaluateAnswer - numeric ====================

console.log('\n--- evaluateAnswer: numeric ---')

test('numeric: přesná shoda', () => {
  const result = evaluateAnswer('400', {
    question: {},
    answer: { type: 'numeric', value: 400, unit: null }
  })
  assertTrue(result.isCorrect)
})

test('numeric: výraz 500×0,8 = 400', () => {
  const result = evaluateAnswer('500×0,8', {
    question: { originalValue: 500 },
    answer: { type: 'numeric', value: 400, unit: null }
  })
  assertTrue(result.isCorrect)
})

test('numeric: výraz 500*4/5 = 400', () => {
  const result = evaluateAnswer('500*4/5', {
    question: { originalValue: 500 },
    answer: { type: 'numeric', value: 400, unit: null }
  })
  assertTrue(result.isCorrect)
})

test('numeric: 200+200 neobsahuje original 500', () => {
  const result = evaluateAnswer('200+200', {
    question: { originalValue: 500 },
    answer: { type: 'numeric', value: 400, unit: null }
  })
  assertFalse(result.isCorrect)
  assertTrue(result.hint !== null)
})

test('numeric: s jednotkou', () => {
  const result = evaluateAnswer('400 Kč', {
    question: {},
    answer: { type: 'numeric', value: 400, unit: 'Kč' }
  })
  assertTrue(result.isCorrect)
})

test('numeric: chybějící jednotka', () => {
  const result = evaluateAnswer('400', {
    question: {},
    answer: { type: 'numeric', value: 400, unit: 'Kč' }
  })
  assertFalse(result.isCorrect)
  assertTrue(result.hint.includes('Správně'))
  assertTrue(result.hint.includes('Kč'))
})

test('numeric: chybějící jednotka + špatná hodnota', () => {
  const result = evaluateAnswer('401', {
    question: {},
    answer: { type: 'numeric', value: 400, unit: 'Kč' }
  })
  assertFalse(result.isCorrect)
  assertTrue(result.hint.includes('Pozor'))
  assertFalse(result.hint.includes('Správně'))
})

test('numeric: výraz bez jednotky 240/(2/3) = 360 Kč', () => {
  const result = evaluateAnswer('240/(2/3)', {
    question: {},
    answer: { type: 'numeric', value: 360, unit: 'Kč' }
  })
  assertFalse(result.isCorrect)
  assertTrue(result.hint.includes('Správně'))
  assertTrue(result.hint.includes('Kč'))
})

test('numeric: špatná hodnota', () => {
  const result = evaluateAnswer('401', {
    question: {},
    answer: { type: 'numeric', value: 400, unit: null }
  })
  assertFalse(result.isCorrect)
})

// ==================== evaluateAnswer - symbolic ====================

console.log('\n--- evaluateAnswer: symbolic ---')

test('symbolic: přesná shoda 1,3x', () => {
  const result = evaluateAnswer('1,3x', {
    question: {},
    answer: { type: 'symbolic', value: '1.3x', unit: null }
  })
  assertTrue(result.isCorrect)
})

test('symbolic: ekvivalent 6/5x = 1.2x', () => {
  const result = evaluateAnswer('6/5x', {
    question: {},
    answer: { type: 'symbolic', value: '1.2x', unit: null }
  })
  assertTrue(result.isCorrect)
})

test('symbolic: ekvivalent (1+1/5)x = 1.2x', () => {
  const result = evaluateAnswer('(1+1/5)x', {
    question: {},
    answer: { type: 'symbolic', value: '1.2x', unit: null }
  })
  assertTrue(result.isCorrect)
})

test('symbolic: ekvivalent x×6/5 = 1.2x', () => {
  const result = evaluateAnswer('x×6/5', {
    question: {},
    answer: { type: 'symbolic', value: '1.2x', unit: null }
  })
  assertTrue(result.isCorrect)
})

test('symbolic: chybí x → hint', () => {
  const result = evaluateAnswer('1,3', {
    question: {},
    answer: { type: 'symbolic', value: '1.3x', unit: null }
  })
  assertFalse(result.isCorrect)
  assertTrue(result.hint.includes('x'))
})

test('symbolic: špatná hodnota', () => {
  const result = evaluateAnswer('1,5x', {
    question: {},
    answer: { type: 'symbolic', value: '1.3x', unit: null }
  })
  assertFalse(result.isCorrect)
})

// ==================== Shrnutí ====================

console.log('\n==================')
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log('==================\n')

if (failed > 0) {
  process.exit(1)
}
