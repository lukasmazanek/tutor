import { DiagramProps } from './types'

function RightTriangleDiagram({ labels = {}, highlight }: DiagramProps) {
  // Default labels
  const a = labels.a || 'a'
  const b = labels.b || 'b'
  const c = labels.c || 'c'

  // Colors
  const normalColor = '#475569' // slate-600
  const highlightColor = '#7c3aed' // purple-600
  const labelColor = '#334155' // slate-700
  const rightAngleColor = '#94a3b8' // slate-400

  const getColor = (side: string) => highlight === side ? highlightColor : normalColor
  const getLabelColor = (side: string) => highlight === side ? highlightColor : labelColor

  return (
    <svg
      viewBox="0 0 200 160"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Triangle */}
      {/* Bottom side (b) - horizontal */}
      <line
        x1="30" y1="130"
        x2="170" y2="130"
        stroke={getColor('b')}
        strokeWidth={highlight === 'b' ? 3 : 2}
      />

      {/* Right side (a) - vertical */}
      <line
        x1="170" y1="130"
        x2="170" y2="30"
        stroke={getColor('a')}
        strokeWidth={highlight === 'a' ? 3 : 2}
      />

      {/* Hypotenuse (c) - diagonal */}
      <line
        x1="30" y1="130"
        x2="170" y2="30"
        stroke={getColor('c')}
        strokeWidth={highlight === 'c' ? 3 : 2}
      />

      {/* Right angle marker */}
      <path
        d="M 155 130 L 155 115 L 170 115"
        fill="none"
        stroke={rightAngleColor}
        strokeWidth="1.5"
      />

      {/* Labels */}
      {/* b - bottom */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill={getLabelColor('b')}
        fontSize="14"
        fontWeight={highlight === 'b' ? 'bold' : 'normal'}
      >
        {b}
      </text>

      {/* a - right side */}
      <text
        x="185"
        y="85"
        textAnchor="start"
        fill={getLabelColor('a')}
        fontSize="14"
        fontWeight={highlight === 'a' ? 'bold' : 'normal'}
      >
        {a}
      </text>

      {/* c - hypotenuse */}
      <text
        x="85"
        y="70"
        textAnchor="middle"
        fill={getLabelColor('c')}
        fontSize="14"
        fontWeight={highlight === 'c' ? 'bold' : 'normal'}
        transform="rotate(-35, 85, 70)"
      >
        {c}
      </text>
    </svg>
  )
}

export default RightTriangleDiagram
