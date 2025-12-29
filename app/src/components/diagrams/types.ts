/**
 * Shared types for diagram components
 */

export interface DiagramProps {
  labels?: Record<string, string | number> | null
  highlight?: string
  type?: string
  transversals?: number  // For parallel_lines: 1 (default) or 2
}

export type DiagramType =
  | 'right_triangle'
  | 'ladder'
  | 'rectangle'
  | 'cube'
  | 'square'
  | 'equilateral_triangle'
  | 'triangle'  // General triangle for angle problems
  // New diagram types
  | 'parallel_lines'
  | 'cylinder'
  | 'trapezoid'
  | 'prism'
