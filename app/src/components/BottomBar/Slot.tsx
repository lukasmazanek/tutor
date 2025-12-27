/**
 * BottomBar Slot Component
 * ADR-009: Centralized UI Controls
 *
 * Renders a single slot in the bottom bar.
 * Handles: icon, style, disabled state, onClick
 */

import {
  SLOTS,
  ACTIONS,
  ICON_CLASS,
  getButtonClass,
  getToggleStyle,
  SlotPosition,
  ActionKey,
  HeroIcon
} from '../../constants/bottomBar'

interface SlotProps {
  position: SlotPosition
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  action?: ActionKey | null
}

function Slot({ position, onClick, disabled = false, active = false, action = null }: SlotProps) {
  const slotDef = SLOTS[position]

  if (!slotDef) {
    // Empty slot
    return <div />
  }

  // Determine icon and style based on slot type
  let Icon: HeroIcon | null = slotDef.icon
  let style = slotDef.style
  let title = slotDef.title

  // Handle toggle slot (position 3)
  if (position === 3) {
    style = getToggleStyle(active)
  }

  // Handle action override (any slot can use actions)
  if (action && ACTIONS[action]) {
    const actionDef = ACTIONS[action]
    Icon = actionDef.icon
    style = actionDef.style
    title = actionDef.title
  }

  // No icon = can't render button
  if (!Icon) {
    return <div />
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={getButtonClass(style, disabled)}
      title={title ?? undefined}
    >
      <Icon className={ICON_CLASS} />
    </button>
  )
}

export default Slot
