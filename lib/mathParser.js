/**
 * Math Parser Module
 * ADR-017: Meta-jazyk pro matematický vstup
 *
 * Dva režimy vyhodnocení:
 * - numeric: JS eval → přesná shoda čísel
 * - symbolic: normalizace → porovnání s dosazením x=10
 */

/**
 * Normalizuje vstup - základní transformace
 * @param {string} input
 * @returns {string}
 */
export function normalize(input) {
  let result = input.trim()

  // Desetinná čárka → tečka
  result = result.replace(/,/g, '.')

  // Odstranit mezery
  result = result.replace(/\s+/g, '')

  // Lowercase
  result = result.toLowerCase()

  return result
}

/**
 * Odstraní jednotku z konce vstupu
 * @param {string} input
 * @param {string|null} expectedUnit
 * @returns {{ value: string, unit: string|null }}
 */
export function extractUnit(input, expectedUnit) {
  if (!expectedUnit) {
    return { value: input, unit: null }
  }

  const unitPattern = new RegExp(`(${expectedUnit})$`, 'i')
  const match = input.match(unitPattern)

  if (match) {
    return {
      value: input.slice(0, -match[1].length).trim(),
      unit: match[1]
    }
  }

  return { value: input, unit: null }
}

/**
 * Převede vstup na JS výraz pro evaluaci
 * @param {string} input - normalizovaný vstup
 * @returns {string}
 */
export function toJSExpression(input) {
  let expr = input

  // Násobení: × · → *
  expr = expr.replace(/×/g, '*')
  expr = expr.replace(/·/g, '*')

  // Dělení: ÷ : → /
  expr = expr.replace(/÷/g, '/')
  expr = expr.replace(/:/g, '/')

  // Mocniny: ² ³ → **2 **3
  expr = expr.replace(/²/g, '**2')
  expr = expr.replace(/³/g, '**3')
  expr = expr.replace(/\^/g, '**')

  // Odmocnina: √(...) → Math.sqrt(...)
  expr = expr.replace(/√\(/g, 'Math.sqrt(')
  // sqrt( pouze pokud není už Math.sqrt(
  expr = expr.replace(/(?<!Math\.)sqrt\(/gi, 'Math.sqrt(')

  // Implicitní násobení před x: 2x → 2*x, (...)x → (...)*x
  expr = expr.replace(/([\d.)])x/g, '$1*x')

  // Implicitní násobení za x: x2 → x*2 (pro případy jako x6/5)
  expr = expr.replace(/x([\d(])/g, 'x*$1')

  return expr
}

/**
 * Bezpečně vyhodnotí JS výraz
 * @param {string} expr - JS výraz
 * @param {object} vars - proměnné k dosazení { x: 10 }
 * @returns {number|null}
 */
export function safeEval(expr, vars = {}) {
  try {
    // Nahradit proměnné hodnotami
    let evalExpr = expr
    for (const [name, value] of Object.entries(vars)) {
      evalExpr = evalExpr.replace(new RegExp(name, 'g'), String(value))
    }

    // Bezpečná evaluace
    const result = Function('"use strict"; return (' + evalExpr + ')')()

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * Zkontroluje, zda výraz obsahuje původní hodnotu
 * @param {string} expr
 * @param {number|null} originalValue
 * @returns {boolean}
 */
export function containsOriginalValue(expr, originalValue) {
  if (originalValue === null || originalValue === undefined) {
    return true // Není vyžadováno
  }
  return expr.includes(String(originalValue))
}

/**
 * Porovná dvě čísla s přesnou shodou
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function numbersEqual(a, b) {
  // Přesná shoda, ale tolerujeme floating point errors
  return Math.abs(a - b) < 1e-10
}

/**
 * Porovná dva symbolické výrazy pomocí dosazení
 * @param {string} userExpr - uživatelský výraz (JS formát)
 * @param {string} expectedExpr - očekávaný výraz (JS formát)
 * @returns {boolean}
 */
export function expressionsEquivalent(userExpr, expectedExpr) {
  const testValue = 10

  const userResult = safeEval(userExpr, { x: testValue })
  const expectedResult = safeEval(expectedExpr, { x: testValue })

  if (userResult === null || expectedResult === null) {
    return false
  }

  return numbersEqual(userResult, expectedResult)
}

/**
 * Generuje hint pro chybnou odpověď
 * @param {string} errorType
 * @param {object} context
 * @returns {string}
 */
export function generateHint(errorType, context = {}) {
  const hints = {
    'missing_variable': `Vyjádři jako výraz s x: ${context.expected || '?'}`,
    'missing_unit_correct': `Správně! Nezapomeň na jednotku: ${context.unit || '?'}`,
    'missing_unit': `Pozor na jednotky: ${context.unit || '?'}`,
    'missing_original': 'Výraz musí vycházet z původní hodnoty',
    'wrong_value': null, // Žádný hint, prostě špatně
    'parse_error': 'Neplatný matematický výraz'
  }

  return hints[errorType] || null
}

/**
 * Hlavní funkce - vyhodnotí odpověď uživatele
 * @param {string} userInput - vstup od uživatele
 * @param {object} problem - { question, answer } z dat
 * @returns {{ isCorrect: boolean, hint: string|null, normalized: string }}
 */
export function evaluateAnswer(userInput, problem) {
  const { question, answer } = problem
  const type = answer.type || 'numeric'
  const expectedValue = answer.value
  const expectedUnit = answer.unit
  const originalValue = question?.originalValue

  // 1. Základní normalizace
  let normalized = normalize(userInput)

  // 2. Extrahovat jednotku
  const { value: valueWithoutUnit, unit: foundUnit } = extractUnit(normalized, expectedUnit)
  normalized = valueWithoutUnit

  // 3. Převést na JS výraz
  const jsExpr = toJSExpression(normalized)

  // 4. Vyhodnotit podle typu
  if (type === 'numeric') {
    // Numeric: vyhodnotit a porovnat čísla

    // Zkontrolovat, zda obsahuje původní hodnotu (pokud je výraz)
    if (originalValue !== null && originalValue !== undefined) {
      const isSimpleNumber = /^-?\d+\.?\d*$/.test(normalized)
      if (!isSimpleNumber && !containsOriginalValue(normalized, originalValue)) {
        return {
          isCorrect: false,
          hint: generateHint('missing_original'),
          normalized
        }
      }
    }

    const userResult = safeEval(jsExpr)

    if (userResult === null) {
      return {
        isCorrect: false,
        hint: generateHint('parse_error'),
        normalized
      }
    }

    const valueCorrect = numbersEqual(userResult, expectedValue)

    // Zkontrolovat jednotku (pokud vyžadována)
    if (expectedUnit && !foundUnit) {
      // Hodnota správná ale chybí jednotka → povzbudivý hint
      const hintType = valueCorrect ? 'missing_unit_correct' : 'missing_unit'
      return {
        isCorrect: false,
        hint: generateHint(hintType, { unit: expectedUnit }),
        normalized: String(userResult)
      }
    }

    return {
      isCorrect: valueCorrect,
      hint: valueCorrect ? null : generateHint('wrong_value'),
      normalized: String(userResult)
    }

  } else if (type === 'symbolic') {
    // Symbolic: porovnat výrazy pomocí dosazení

    // Zkontrolovat, zda obsahuje proměnnou x
    if (!normalized.includes('x')) {
      return {
        isCorrect: false,
        hint: generateHint('missing_variable', { expected: expectedValue }),
        normalized
      }
    }

    // Převést očekávanou hodnotu na JS výraz
    const expectedNormalized = normalize(String(expectedValue))
    const expectedJsExpr = toJSExpression(expectedNormalized)

    const isCorrect = expressionsEquivalent(jsExpr, expectedJsExpr)

    return {
      isCorrect,
      hint: isCorrect ? null : generateHint('wrong_value'),
      normalized
    }
  }

  // Neznámý typ
  return {
    isCorrect: false,
    hint: 'Neznámý typ odpovědi',
    normalized
  }
}
