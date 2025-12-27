/**
 * BottomBar Component
 * ADR-009: Centralized UI Controls
 *
 * Renders a consistent bottom navigation bar across all screens.
 *
 * Usage:
 * <BottomBar
 *   slots={{
 *     1: { onClick: handleHome },
 *     2: { onClick: handleProgress },
 *     3: { onClick: handleToggle, active: isToggleOn },  // or null for empty
 *     4: { onClick: handleHint, disabled: noMoreHints }, // or null for empty
 *     5: { action: 'submit', onClick: handleSubmit, disabled: !canSubmit }
 *   }}
 * />
 */

import { CONTAINER_CLASS, WRAPPER_CLASS, GRID_CLASS, SlotPosition, ActionKey } from '../../constants/bottomBar'
import Slot from './Slot'

interface SlotConfig {
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  action?: ActionKey
}

type SlotsConfig = Partial<Record<SlotPosition, SlotConfig | null>>

interface BottomBarProps {
  slots?: SlotsConfig
  contained?: boolean
}

function BottomBar({ slots = {}, contained = false }: BottomBarProps) {
  const positions: SlotPosition[] = [1, 2, 3, 4, 5]

  const grid = (
    <div className={GRID_CLASS}>
      {positions.map((position) => {
        const slotConfig = slots[position]

        // Empty slot
        if (!slotConfig) {
          return <div key={position} />
        }

        return (
          <Slot
            key={position}
            position={position}
            onClick={slotConfig.onClick}
            disabled={slotConfig.disabled}
            active={slotConfig.active}
            action={slotConfig.action}
          />
        )
      })}
    </div>
  )

  // Contained mode: just the grid with wrapper, no fixed positioning
  if (contained) {
    return (
      <div className={WRAPPER_CLASS}>
        {grid}
      </div>
    )
  }

  // Default: full fixed layout
  return (
    <div className={CONTAINER_CLASS}>
      <div className={WRAPPER_CLASS}>
        {grid}
      </div>
    </div>
  )
}

export default BottomBar
