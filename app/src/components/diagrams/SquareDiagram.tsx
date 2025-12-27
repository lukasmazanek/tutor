import { DiagramProps } from './types'

function SquareDiagram({ labels = {}, highlight }: DiagramProps) {
  const side = labels.side || 'a'
  const diagonal = labels.diagonal || 'd'

  const normalColor = '#475569'
  const highlightColor = '#7c3aed'
  const labelColor = '#334155'

  const getColor = (part: string) => highlight === part ? highlightColor : normalColor
  const getLabelColor = (part: string) => highlight === part ? highlightColor : labelColor

  return (
    <svg
      viewBox="0 0 180 160"
      className="w-auto h-full max-w-[180px]"
    >
      {/* Square */}
      <rect
        x="30" y="20"
        width="120" height="120"
        fill="none"
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Diagonal */}
      <line
        x1="30" y1="140"
        x2="150" y2="20"
        stroke={getColor('diagonal')}
        strokeWidth={highlight === 'diagonal' ? 3 : 2}
      />

      {/* Right angle markers */}
      <path
        d="M 45 140 L 45 125 L 30 125"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />

      {/* Labels */}
      {/* Side - bottom */}
      <text
        x="90"
        y="155"
        textAnchor="middle"
        fill={getLabelColor('side')}
        fontSize="14"
        fontWeight={highlight === 'side' ? 'bold' : 'normal'}
      >
        {side}
      </text>

      {/* Diagonal - center */}
      <text
        x="80"
        y="70"
        textAnchor="middle"
        fill={getLabelColor('diagonal')}
        fontSize="14"
        fontWeight={highlight === 'diagonal' ? 'bold' : 'normal'}
        transform="rotate(-45, 80, 70)"
      >
        {diagonal}
      </text>
    </svg>
  )
}

export default SquareDiagram
