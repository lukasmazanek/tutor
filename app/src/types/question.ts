/**
 * Core type definitions for the tutor app
 * Single source of truth - all components use these types directly
 *
 * ADR-022: Multi-mode questions with keyboard enhancement
 */

// Diagram configuration for geometry problems
export interface DiagramConfig {
  type: 'right_triangle' | 'rectangle' | 'square' | 'cube' | 'ladder' | 'equilateral_triangle'
    | 'triangle' | 'parallel_lines' | 'cylinder' | 'trapezoid' | 'prism'
  labels?: Record<string, string | number> | null
  highlight?: string
  [key: string]: unknown
}

// Topic metadata
export interface TopicMeta {
  id: string
  name_cs: string
  is_strength: boolean
  is_critical: boolean
}

// ADR-022: Numeric mode answer
export interface NumericMode {
  answer: string | number
  unit?: string | null
  variants?: string[]
  distractors?: string[]
}

// ADR-022: Type recognition mode answer
export interface TypeRecognitionMode {
  answer: string
  distractors?: string[]
}

// ADR-022: Modes structure - one question can support multiple modes
export interface QuestionModes {
  numeric?: NumericMode
  type_recognition?: TypeRecognitionMode
}

// ADR-022: Keyboard configuration
export interface KeyboardConfig {
  variable: string | null
}

// ADR-033: Common error for smart feedback
export interface CommonError {
  value: string
  variants: string[]
  feedback: string
  misconception: string | null
}

/**
 * UnifiedQuestion - the core data type
 * ADR-022: Mode-based structure replaces single answer
 * ADR-033: Smart error feedback
 */
export interface UnifiedQuestion {
  id: string
  topic: string
  difficulty: 1 | 2 | 3

  question: {
    stem: string | null
    context: string | null
  }

  // ADR-022: Modes replace answer + distractors
  modes: QuestionModes

  // ADR-022: Keyboard configuration
  keyboard: KeyboardConfig

  hints: string[]

  solution: {
    steps: string[]
    strategy: string | null
  }

  meta: {
    type_id: string | null
    type_label: string | null
    original_type?: string | null
  }

  diagram?: DiagramConfig

  // ADR-033: Common errors for targeted feedback
  common_errors?: CommonError[]
}

// Root structure of questions.json
export interface QuestionsData {
  version: string
  generated: string
  description: string
  topics: Record<string, TopicMeta>
  questions: UnifiedQuestion[]
}

// Topic type mapping for strategy prompts
export interface TopicTypeMapping {
  type_id: string
  type_label: string
  strategy: string
  distractors_type: Array<{ id: string; label: string }>
  distractors_strategy: string[]
}

export interface TopicTypeMappingData {
  mappings: Record<string, TopicTypeMapping>
}

// Answer type for mathParser
export type AnswerType = 'numeric' | 'symbolic'

// What mathParser expects
export interface ParsedAnswer {
  type?: AnswerType
  value: string | number
  unit?: string | null
}

export interface ParsedProblem {
  question?: {
    originalValue?: number | null
  }
  answer: ParsedAnswer
}

// Helper to get display text for a question
export function getQuestionText(q: UnifiedQuestion): string {
  return q.question.context || q.question.stem || ''
}

// Helper to format answer for display
export function formatAnswerDisplay(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('cs-CZ')
  }
  return value
}

// ADR-022: Helper to check if question supports a mode
export function supportsNumeric(q: UnifiedQuestion): boolean {
  return !!q.modes.numeric
}

export function supportsTypeRecognition(q: UnifiedQuestion): boolean {
  return !!q.modes.type_recognition
}

// ADR-022: Helper to get numeric answer (for ProblemCard, LightningRound)
export function getNumericAnswer(q: UnifiedQuestion): { value: string | number; unit: string | null } | null {
  if (!q.modes.numeric) return null
  return {
    value: q.modes.numeric.answer,
    unit: q.modes.numeric.unit || null
  }
}

// ADR-022: Helper to get distractors for numeric mode
export function getNumericDistractors(q: UnifiedQuestion): string[] {
  return q.modes.numeric?.distractors || []
}

// ADR-033: Helper to check if answer matches a common error
export function findMatchingCommonError(
  userAnswer: string,
  commonErrors?: CommonError[]
): CommonError | null {
  if (!commonErrors || commonErrors.length === 0) return null

  const normalized = userAnswer.trim().toLowerCase().replace(',', '.')

  for (const error of commonErrors) {
    // Check main value
    const mainValue = error.value.toLowerCase().replace(',', '.')
    if (normalized === mainValue) return error

    // Check variants
    for (const variant of error.variants) {
      const variantNorm = variant.toLowerCase().replace(',', '.')
      if (normalized === variantNorm) return error
    }

    // Check numeric tolerance (within 1%)
    const userNum = parseFloat(normalized)
    const errorNum = parseFloat(mainValue)
    if (!isNaN(userNum) && !isNaN(errorNum)) {
      const tolerance = Math.abs(errorNum) * 0.01 || 0.01
      if (Math.abs(userNum - errorNum) <= tolerance) return error
    }
  }

  return null
}
