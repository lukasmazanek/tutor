import { DiagramProps } from './types'

/**
 * Diagram showing two parallel lines cut by a transversal
 * Used for angle problems (corresponding, alternate, co-interior angles)
 *
 * Angles at top intersection:
 *   alpha = LEFT of transversal (acute angle on left)
 *   beta = RIGHT of transversal (obtuse angle on right)
 *
 * Angles at bottom intersection:
 *   gamma = LEFT of transversal
 *   delta = RIGHT of transversal
 */
function ParallelLinesDiagram({ labels, highlight, transversals = 1 }: DiagramProps) {
  const safeLabels = labels ?? {}
  const twoTransversals = transversals === 2

  // Colors
  const lineColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const parallelMarkColor = '#94a3b8' // slate-400
  const arcFill = 'rgba(124, 58, 237, 0.1)' // light purple fill

  const getAngleColor = (angle: string) =>
    highlight === angle ? highlightColor : labelColor

  const getArcFill = (angle: string) =>
    highlight === angle ? arcFill : 'none'

  // Only show angles that have explicit labels
  const hasExplicitLabels = Object.keys(safeLabels).length > 0
  const showAlpha = !hasExplicitLabels || safeLabels.alpha !== undefined
  const showBeta = !hasExplicitLabels || safeLabels.beta !== undefined
  const showGamma = !hasExplicitLabels || safeLabels.gamma !== undefined
  const showDelta = !hasExplicitLabels || safeLabels.delta !== undefined

  const alpha = safeLabels.alpha ?? 'α'
  const beta = safeLabels.beta ?? 'β'
  const gamma = safeLabels.gamma ?? 'γ'
  const delta = safeLabels.delta ?? 'δ'

  const topY = 50
  const bottomY = 110

  // Single transversal: centered at x=100
  // Two transversals: left at ~64, right at ~124
  const singleX = 100
  const leftTopX = twoTransversals ? 64 : singleX
  const leftBottomX = twoTransversals ? 78 : singleX + 14
  const rightTopX = twoTransversals ? 124 : singleX
  const rightBottomX = twoTransversals ? 138 : singleX + 14

  return (
    <svg
      viewBox="0 0 200 160"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Parallel line 1 (top) */}
      <line
        x1="10" y1={topY}
        x2="190" y2={topY}
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Parallel line 2 (bottom) */}
      <line
        x1="10" y1={bottomY}
        x2="190" y2={bottomY}
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Transversal 1 (single or left diagonal) */}
      <line
        x1={twoTransversals ? "50" : "86"}
        y1="10"
        x2={twoTransversals ? "90" : "114"}
        y2="150"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* Transversal 2 (right diagonal) - only for two transversals */}
      {twoTransversals && (
        <line
          x1="110" y1="10"
          x2="150" y2="150"
          stroke={lineColor}
          strokeWidth="2"
        />
      )}

      {/* Parallel markers on line 1 */}
      <path
        d="M 38 45 L 42 50 L 38 55"
        fill="none"
        stroke={parallelMarkColor}
        strokeWidth="1.5"
      />
      <path
        d="M 44 45 L 48 50 L 44 55"
        fill="none"
        stroke={parallelMarkColor}
        strokeWidth="1.5"
      />

      {/* Parallel markers on line 2 */}
      <path
        d="M 155 105 L 159 110 L 155 115"
        fill="none"
        stroke={parallelMarkColor}
        strokeWidth="1.5"
      />
      <path
        d="M 161 105 L 165 110 L 161 115"
        fill="none"
        stroke={parallelMarkColor}
        strokeWidth="1.5"
      />

      {/* ALPHA - angle at LEFT transversal, TOP intersection */}
      {showAlpha && (
        <>
          <path
            d={`M ${leftTopX - 16} ${topY} A 16 16 0 0 1 ${leftTopX - 6} ${topY - 14}`}
            fill={getArcFill('alpha')}
            stroke={getAngleColor('alpha')}
            strokeWidth={highlight === 'alpha' ? 2.5 : 2}
          />
          <text
            x={leftTopX - 22}
            y={topY - 10}
            textAnchor="middle"
            fill={getAngleColor('alpha')}
            fontSize="11"
            fontWeight={highlight === 'alpha' ? 'bold' : 'normal'}
          >
            {alpha}
          </text>
        </>
      )}

      {/* BETA - angle at RIGHT transversal, TOP intersection */}
      {showBeta && (
        <>
          <path
            d={`M ${rightTopX + 6} ${topY - 14} A 16 16 0 0 1 ${rightTopX + 16} ${topY}`}
            fill={getArcFill('beta')}
            stroke={getAngleColor('beta')}
            strokeWidth={highlight === 'beta' ? 2.5 : 2}
          />
          <text
            x={rightTopX + 24}
            y={topY - 10}
            textAnchor="middle"
            fill={getAngleColor('beta')}
            fontSize="11"
            fontWeight={highlight === 'beta' ? 'bold' : 'normal'}
          >
            {beta}
          </text>
        </>
      )}

      {/* GAMMA - angle at LEFT transversal, BOTTOM intersection */}
      {showGamma && (
        <>
          <path
            d={`M ${leftBottomX - 6} ${bottomY + 14} A 16 16 0 0 1 ${leftBottomX + 16} ${bottomY}`}
            fill={getArcFill('gamma')}
            stroke={getAngleColor('gamma')}
            strokeWidth={highlight === 'gamma' ? 2.5 : 2}
          />
          <text
            x={leftBottomX + 8}
            y={bottomY + 26}
            textAnchor="middle"
            fill={getAngleColor('gamma')}
            fontSize="11"
            fontWeight={highlight === 'gamma' ? 'bold' : 'normal'}
          >
            {gamma}
          </text>
        </>
      )}

      {/* DELTA - angle at RIGHT transversal, BOTTOM intersection */}
      {showDelta && (
        <>
          <path
            d={`M ${rightBottomX + 6} ${bottomY + 14} A 16 16 0 0 1 ${rightBottomX + 16} ${bottomY}`}
            fill={getArcFill('delta')}
            stroke={getAngleColor('delta')}
            strokeWidth={highlight === 'delta' ? 2.5 : 2}
          />
          <text
            x={rightBottomX + 24}
            y={bottomY + 20}
            textAnchor="middle"
            fill={getAngleColor('delta')}
            fontSize="11"
            fontWeight={highlight === 'delta' ? 'bold' : 'normal'}
          >
            {delta}
          </text>
        </>
      )}
    </svg>
  )
}

export default ParallelLinesDiagram
