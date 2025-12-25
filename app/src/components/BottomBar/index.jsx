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

import { CONTAINER_CLASS, WRAPPER_CLASS, GRID_CLASS } from '../../constants/bottomBar'
import Slot from './Slot'

/**
 * @param {object} props
 * @param {object} props.slots - Configuration for each slot (1-5)
 *   Each slot can be:
 *   - null/undefined: Empty slot
 *   - { onClick, disabled?, active?, action? }: Rendered slot
 * @param {boolean} props.contained - If true, renders without fixed positioning
 *   Use contained mode when BottomBar is inside another fixed container
 */
function BottomBar({ slots = {}, contained = false }) {
  const grid = (
    <div className={GRID_CLASS}>
      {[1, 2, 3, 4, 5].map((position) => {
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
