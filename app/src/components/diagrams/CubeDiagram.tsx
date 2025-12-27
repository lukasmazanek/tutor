import { DiagramProps } from './types'

function CubeDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}
  const edge = safeLabels.edge || 'a'
  const diagonal = safeLabels.diagonal || 'd'

  const normalColor = '#475569'
  const highlightColor = '#7c3aed'
  const labelColor = '#334155'
  const backColor = '#94a3b8'

  const getColor = (part: string) => highlight === part ? highlightColor : normalColor
  const getLabelColor = (part: string) => highlight === part ? highlightColor : labelColor

  // Cube vertices (isometric-ish projection)
  const front = {
    bl: [40, 130],   // bottom-left
    br: [140, 130],  // bottom-right
    tl: [40, 50],    // top-left
    tr: [140, 50]    // top-right
  }

  const back = {
    bl: [80, 100],   // bottom-left
    br: [180, 100],  // bottom-right
    tl: [80, 20],    // top-left
    tr: [180, 20]    // top-right
  }

  return (
    <svg
      viewBox="0 0 220 160"
      className="w-auto h-full max-w-[220px]"
    >
      {/* Back edges (dashed) */}
      <line
        x1={back.bl[0]} y1={back.bl[1]}
        x2={back.br[0]} y2={back.br[1]}
        stroke={backColor}
        strokeWidth="1"
        strokeDasharray="4 2"
      />
      <line
        x1={back.bl[0]} y1={back.bl[1]}
        x2={back.tl[0]} y2={back.tl[1]}
        stroke={backColor}
        strokeWidth="1"
        strokeDasharray="4 2"
      />
      <line
        x1={back.bl[0]} y1={back.bl[1]}
        x2={front.bl[0]} y2={front.bl[1]}
        stroke={backColor}
        strokeWidth="1"
        strokeDasharray="4 2"
      />

      {/* Front face */}
      <line
        x1={front.bl[0]} y1={front.bl[1]}
        x2={front.br[0]} y2={front.br[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={front.bl[0]} y1={front.bl[1]}
        x2={front.tl[0]} y2={front.tl[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={front.tl[0]} y1={front.tl[1]}
        x2={front.tr[0]} y2={front.tr[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={front.br[0]} y1={front.br[1]}
        x2={front.tr[0]} y2={front.tr[1]}
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Right face */}
      <line
        x1={front.br[0]} y1={front.br[1]}
        x2={back.br[0]} y2={back.br[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={front.tr[0]} y1={front.tr[1]}
        x2={back.tr[0]} y2={back.tr[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={back.br[0]} y1={back.br[1]}
        x2={back.tr[0]} y2={back.tr[1]}
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Top face */}
      <line
        x1={front.tl[0]} y1={front.tl[1]}
        x2={back.tl[0]} y2={back.tl[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={back.tl[0]} y1={back.tl[1]}
        x2={back.tr[0]} y2={back.tr[1]}
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Space diagonal (main feature) */}
      <line
        x1={front.bl[0]} y1={front.bl[1]}
        x2={back.tr[0]} y2={back.tr[1]}
        stroke={getColor('diagonal')}
        strokeWidth={highlight === 'diagonal' ? 3 : 2}
      />

      {/* Dots at diagonal endpoints */}
      <circle cx={front.bl[0]} cy={front.bl[1]} r="4" fill={getColor('diagonal')} />
      <circle cx={back.tr[0]} cy={back.tr[1]} r="4" fill={getColor('diagonal')} />

      {/* Labels */}
      {/* Edge label - front bottom */}
      <text
        x="90"
        y="145"
        textAnchor="middle"
        fill={getLabelColor('edge')}
        fontSize="14"
        fontWeight={highlight === 'edge' ? 'bold' : 'normal'}
      >
        {edge}
      </text>

      {/* Diagonal label */}
      <text
        x="120"
        y="65"
        textAnchor="middle"
        fill={getLabelColor('diagonal')}
        fontSize="14"
        fontWeight={highlight === 'diagonal' ? 'bold' : 'normal'}
      >
        {diagonal}
      </text>
    </svg>
  )
}

export default CubeDiagram
