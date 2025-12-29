import { DiagramProps } from './types'

/**
 * General triangle diagram for angle problems
 * Shows a triangle with angle labels at vertices A (top), B (bottom-left), C (bottom-right)
 *
 * Labels: a (angle at A/top), b (angle at B/bottom-left), c (angle at C/bottom-right)
 * Highlight: which angle to emphasize
 */
function TriangleDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}

  // Colors
  const lineColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const arcFill = 'rgba(124, 58, 237, 0.15)' // light purple fill

  const getAngleColor = (angle: string) =>
    highlight === angle ? highlightColor : labelColor

  const getArcFill = (angle: string) =>
    highlight === angle ? arcFill : 'none'

  // Only show angles that have explicit labels
  const hasExplicitLabels = Object.keys(safeLabels).length > 0
  const showA = !hasExplicitLabels || safeLabels.a !== undefined
  const showB = !hasExplicitLabels || safeLabels.b !== undefined
  const showC = !hasExplicitLabels || safeLabels.c !== undefined

  const angleA = safeLabels.a ?? 'α'
  const angleB = safeLabels.b ?? 'β'
  const angleC = safeLabels.c ?? 'γ'

  // Triangle vertices - slightly asymmetric for visual interest
  const A = { x: 100, y: 25 }   // top
  const B = { x: 30, y: 135 }   // bottom-left
  const C = { x: 175, y: 135 }  // bottom-right

  return (
    <svg
      viewBox="0 0 200 160"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Triangle sides */}
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Vertex labels */}
      <text x={A.x} y={A.y - 8} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="bold">A</text>
      <text x={B.x - 12} y={B.y + 5} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="bold">B</text>
      <text x={C.x + 12} y={C.y + 5} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="bold">C</text>

      {/* Angle arc at A (top) - curves DOWN into the triangle */}
      {showA && (
        <>
          <path
            d={`M ${A.x - 14} ${A.y + 18} A 18 18 0 0 0 ${A.x + 16} ${A.y + 16}`}
            fill={getArcFill('a')}
            stroke={getAngleColor('a')}
            strokeWidth={highlight === 'a' ? 2.5 : 2}
          />
          <text
            x={A.x + 2}
            y={A.y + 42}
            textAnchor="middle"
            fill={getAngleColor('a')}
            fontSize="13"
            fontWeight={highlight === 'a' ? 'bold' : 'normal'}
          >
            {angleA}
          </text>
        </>
      )}

      {/* Angle arc at B (bottom-left) */}
      {showB && (
        <>
          <path
            d={`M ${B.x + 25} ${B.y} A 20 20 0 0 0 ${B.x + 12} ${B.y - 22}`}
            fill={getArcFill('b')}
            stroke={getAngleColor('b')}
            strokeWidth={highlight === 'b' ? 2.5 : 2}
          />
          <text
            x={B.x + 30}
            y={B.y - 10}
            textAnchor="start"
            fill={getAngleColor('b')}
            fontSize="13"
            fontWeight={highlight === 'b' ? 'bold' : 'normal'}
          >
            {angleB}
          </text>
        </>
      )}

      {/* Angle arc at C (bottom-right) */}
      {showC && (
        <>
          <path
            d={`M ${C.x - 12} ${C.y - 20} A 20 20 0 0 0 ${C.x - 25} ${C.y}`}
            fill={getArcFill('c')}
            stroke={getAngleColor('c')}
            strokeWidth={highlight === 'c' ? 2.5 : 2}
          />
          <text
            x={C.x - 32}
            y={C.y - 10}
            textAnchor="end"
            fill={getAngleColor('c')}
            fontSize="13"
            fontWeight={highlight === 'c' ? 'bold' : 'normal'}
          >
            {angleC}
          </text>
        </>
      )}
    </svg>
  )
}

export default TriangleDiagram
