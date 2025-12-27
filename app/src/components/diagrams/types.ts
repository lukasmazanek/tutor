/**
 * Shared types for diagram components
 */

export interface DiagramProps {
  labels?: Record<string, string | number> | null
  highlight?: string
  type?: string
}

export type DiagramType = 'right_triangle' | 'ladder' | 'rectangle' | 'cube' | 'square' | 'equilateral_triangle'
