/**
 * Type declarations for mathParser module
 */

export interface UnitExtraction {
  value: string
  unit: string | null
}

export interface EvaluationResult {
  isCorrect: boolean
  hint: string | null
  normalized: string
}

export interface ParsedAnswer {
  type?: 'numeric' | 'symbolic'
  value: string | number
  unit?: string | null
}

export interface ParsedProblem {
  question?: {
    originalValue?: number | null
  }
  answer: ParsedAnswer
}

export type ErrorType =
  | 'missing_variable'
  | 'missing_unit_correct'
  | 'missing_unit'
  | 'missing_original'
  | 'wrong_value'
  | 'parse_error'

export interface HintContext {
  expected?: string | number
  unit?: string
  [key: string]: unknown
}

export function normalize(input: string): string
export function extractUnit(input: string, expectedUnit: string | null): UnitExtraction
export function toJSExpression(input: string): string
export function safeEval(expr: string, vars?: Record<string, number>): number | null
export function containsOriginalValue(expr: string, originalValue: number | null): boolean
export function numbersEqual(a: number, b: number): boolean
export function expressionsEquivalent(userExpr: string, expectedExpr: string): boolean
export function generateHint(errorType: ErrorType, context?: HintContext): string | null
export function evaluateAnswer(userInput: string, problem: ParsedProblem): EvaluationResult
