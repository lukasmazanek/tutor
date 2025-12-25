function EquilateralTriangleDiagram({ labels = {}, highlight }) {
  const side = labels.side || 'a'
  const height = labels.height || 'v'

  const normalColor = '#475569'
  const highlightColor = '#7c3aed'
  const labelColor = '#334155'

  const getColor = (part) => highlight === part ? highlightColor : normalColor
  const getLabelColor = (part) => highlight === part ? highlightColor : labelColor

  // Triangle points (equilateral)
  const top = [100, 20]
  const bottomLeft = [30, 140]
  const bottomRight = [170, 140]
  const bottomCenter = [100, 140]

  return (
    <svg
      viewBox="0 0 200 170"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Triangle sides */}
      <line
        x1={bottomLeft[0]} y1={bottomLeft[1]}
        x2={bottomRight[0]} y2={bottomRight[1]}
        stroke={normalColor}
        strokeWidth="2"
      />
      <line
        x1={bottomLeft[0]} y1={bottomLeft[1]}
        x2={top[0]} y2={top[1]}
        stroke={getColor('side')}
        strokeWidth={highlight === 'side' ? 3 : 2}
      />
      <line
        x1={bottomRight[0]} y1={bottomRight[1]}
        x2={top[0]} y2={top[1]}
        stroke={normalColor}
        strokeWidth="2"
      />

      {/* Height (altitude) */}
      <line
        x1={top[0]} y1={top[1]}
        x2={bottomCenter[0]} y2={bottomCenter[1]}
        stroke={getColor('height')}
        strokeWidth={highlight === 'height' ? 3 : 2}
        strokeDasharray={highlight === 'height' ? 'none' : '5 3'}
      />

      {/* Right angle marker at base */}
      <path
        d="M 100 125 L 115 125 L 115 140"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />

      {/* Half-base indicator */}
      <line
        x1={bottomLeft[0]} y1="150"
        x2={bottomCenter[0]} y2="150"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <text
        x="65"
        y="165"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="12"
      >
        a/2
      </text>

      {/* Labels */}
      {/* Side - left side */}
      <text
        x="50"
        y="75"
        textAnchor="middle"
        fill={getLabelColor('side')}
        fontSize="14"
        fontWeight={highlight === 'side' ? 'bold' : 'normal'}
        transform="rotate(-60, 50, 75)"
      >
        {side}
      </text>

      {/* Height - next to altitude line */}
      <text
        x="115"
        y="80"
        textAnchor="start"
        fill={getLabelColor('height')}
        fontSize="14"
        fontWeight={highlight === 'height' ? 'bold' : 'normal'}
      >
        {height}
      </text>
    </svg>
  )
}

export default EquilateralTriangleDiagram
