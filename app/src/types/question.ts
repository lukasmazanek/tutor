/**
 * Core type definitions for the tutor app
 * Single source of truth - all components use these types directly
 */

// Diagram configuration for geometry problems
export interface DiagramConfig {
  type: 'right_triangle' | 'rectangle' | 'square' | 'cube' | 'ladder' | 'equilateral_triangle'
  labels?: Record<string, string | number>
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

/**
 * UnifiedQuestion - the core data type
 * All components work with this format directly, no transformations needed
 */
export interface UnifiedQuestion {
  id: string
  topic: string
  difficulty: 1 | 2 | 3

  question: {
    stem: string | null
    context: string | null
  }

  answer: {
    value: string | number
    unit: string | null
  }

  distractors: string[]
  hints: string[]

  solution: {
    steps: string[]
    strategy: string | null
  }

  meta: {
    type_id: string | null
    type_label: string | null
    original_type?: string | null
    supports_mc: boolean
    supports_open: boolean
  }

  diagram?: DiagramConfig
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
