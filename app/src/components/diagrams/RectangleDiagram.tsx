import { DiagramProps } from './types'

function RectangleDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}
  const width = safeLabels.width || 'a'
  const height = safeLabels.height || 'b'
  const diagonal = safeLabels.diagonal || 'd'

  const normalColor = '#475569'
  const highlightColor = '#7c3aed'
  const labelColor = '#334155'

  const getColor = (part: string) => highlight === part ? highlightColor : normalColor
  const getLabelColor = (part: string) => highlight === part ? highlightColor : labelColor

  return (
    <svg
      viewBox="0 0 200 140"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Rectangle */}
      <rect
        x="30" y="30"
        width="140" height="80"
        fill="none"
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Diagonal */}
      <line
        x1="30" y1="110"
        x2="170" y2="30"
        stroke={getColor('diagonal')}
        strokeWidth={highlight === 'diagonal' ? 3 : 2}
        strokeDasharray={highlight === 'diagonal' ? 'none' : '5 3'}
      />

      {/* Right angle marker at bottom-left */}
      <path
        d="M 45 110 L 45 95 L 30 95"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />

      {/* Labels */}
      {/* Width - bottom */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fill={getLabelColor('width')}
        fontSize="14"
        fontWeight={highlight === 'width' ? 'bold' : 'normal'}
      >
        {width}
      </text>

      {/* Height - right */}
      <text
        x="185"
        y="75"
        textAnchor="start"
        fill={getLabelColor('height')}
        fontSize="14"
        fontWeight={highlight === 'height' ? 'bold' : 'normal'}
      >
        {height}
      </text>

      {/* Diagonal - center */}
      <text
        x="90"
        y="60"
        textAnchor="middle"
        fill={getLabelColor('diagonal')}
        fontSize="14"
        fontWeight={highlight === 'diagonal' ? 'bold' : 'normal'}
        transform="rotate(-30, 90, 60)"
      >
        {diagonal}
      </text>
    </svg>
  )
}

export default RectangleDiagram
