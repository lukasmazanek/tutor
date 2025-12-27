import { DiagramProps } from './types'

function LadderDiagram({ labels, highlight }: DiagramProps) {
  const safeLabels = labels ?? {}
  const wallHeight = safeLabels.wall_height || '?'
  const groundDistance = safeLabels.ground_distance || '?'
  const ladderLength = safeLabels.ladder_length || '?'

  const normalColor = '#475569'
  const highlightColor = '#7c3aed'
  const labelColor = '#334155'
  const wallColor = '#64748b'

  const getColor = (part: string) => highlight === part ? highlightColor : normalColor
  const getLabelColor = (part: string) => highlight === part ? highlightColor : labelColor

  return (
    <svg
      viewBox="0 0 200 180"
      className="w-auto h-full max-w-[200px]"
    >
      {/* Wall - thick line on left */}
      <line
        x1="40" y1="20"
        x2="40" y2="150"
        stroke={wallColor}
        strokeWidth="6"
      />

      {/* Ground */}
      <line
        x1="30" y1="150"
        x2="180" y2="150"
        stroke={wallColor}
        strokeWidth="3"
      />

      {/* Ladder */}
      <line
        x1="40" y1="40"
        x2="150" y2="150"
        stroke={getColor('ladder_length')}
        strokeWidth={highlight === 'ladder_length' ? 3 : 2}
      />

      {/* Height indicator (dotted) */}
      <line
        x1="50" y1="40"
        x2="50" y2="150"
        stroke={getColor('wall_height')}
        strokeWidth={highlight === 'wall_height' ? 2 : 1}
        strokeDasharray="4 2"
      />

      {/* Distance indicator (dotted) */}
      <line
        x1="40" y1="160"
        x2="150" y2="160"
        stroke={getColor('ground_distance')}
        strokeWidth={highlight === 'ground_distance' ? 2 : 1}
        strokeDasharray="4 2"
      />

      {/* Right angle marker */}
      <path
        d="M 40 135 L 55 135 L 55 150"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />

      {/* Labels */}
      {/* Wall height - left */}
      <text
        x="25"
        y="95"
        textAnchor="end"
        fill={getLabelColor('wall_height')}
        fontSize="13"
        fontWeight={highlight === 'wall_height' ? 'bold' : 'normal'}
      >
        {wallHeight}
      </text>

      {/* Ground distance - bottom */}
      <text
        x="95"
        y="175"
        textAnchor="middle"
        fill={getLabelColor('ground_distance')}
        fontSize="13"
        fontWeight={highlight === 'ground_distance' ? 'bold' : 'normal'}
      >
        {groundDistance}
      </text>

      {/* Ladder length - on ladder */}
      <text
        x="110"
        y="85"
        textAnchor="middle"
        fill={getLabelColor('ladder_length')}
        fontSize="13"
        fontWeight={highlight === 'ladder_length' ? 'bold' : 'normal'}
        transform="rotate(45, 110, 85)"
      >
        {ladderLength}
      </text>
    </svg>
  )
}

export default LadderDiagram
