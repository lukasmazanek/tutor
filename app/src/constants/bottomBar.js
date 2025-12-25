/**
 * Centralized Bottom Bar UI Controls
 * ADR-009: Centralized UI Controls
 *
 * Single source of truth for:
 * - Slot positions (1-5)
 * - Icons
 * - Styles (colors, states)
 * - Action variants
 */

import {
  HomeIcon,
  ChartBarIcon,
  TagIcon,
  LightBulbIcon,
  CheckIcon,
  ArrowRightIcon,
  ForwardIcon
} from '@heroicons/react/24/outline'

// ============================================
// STYLE PRESETS
// ============================================

export const STYLES = {
  // Navigation buttons (Home, Progress)
  default: 'bg-slate-200 text-slate-700 hover:bg-slate-300',

  // Toggle button states
  toggle_off: 'bg-slate-200 text-slate-400 hover:bg-slate-300',
  toggle_on: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',

  // Hint button
  hint: 'bg-purple-100 text-purple-700 hover:bg-purple-200',

  // Primary action button (Submit, Continue)
  primary: 'bg-safe-blue text-white hover:bg-blue-600',

  // Secondary action (Skip)
  secondary: 'bg-slate-200 text-slate-400 hover:bg-slate-300',

  // Disabled state (applied additively)
  disabled: 'opacity-50 cursor-not-allowed'
}

// ============================================
// BASE CLASSES
// ============================================

// All buttons share these classes
export const BASE_BUTTON_CLASS = `
  py-3 rounded-xl flex items-center justify-center
  transition-gentle active:scale-[0.98]
`.trim().replace(/\s+/g, ' ')

// Icon size
export const ICON_CLASS = 'w-6 h-6'

// Grid container
export const GRID_CLASS = 'grid grid-cols-5 gap-2'

// Bottom bar container
export const CONTAINER_CLASS = 'fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb'

// Inner wrapper with max-width
export const WRAPPER_CLASS = 'max-w-2xl mx-auto px-4 py-2'

// ============================================
// SLOT DEFINITIONS
// ============================================

/**
 * Bottom bar slot positions:
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  [1]      [2]      [3]      [4]      [5]           │
 * │  Home   Progress  Toggle   Hint    Action          │
 * │  ALWAYS  ALWAYS   opt.     opt.    variable        │
 * └─────────────────────────────────────────────────────┘
 */

export const SLOTS = {
  1: {
    id: 'home',
    name: 'Home',
    icon: HomeIcon,
    style: 'default',
    title: 'Zpět domů',
    required: true
  },
  2: {
    id: 'progress',
    name: 'Progress',
    icon: ChartBarIcon,
    style: 'default',
    title: 'Můj pokrok',
    required: true
  },
  3: {
    id: 'toggle',
    name: 'Toggle',
    icon: TagIcon,
    style: 'toggle_off',  // Use toggle_on when active
    title: 'Typ úlohy',
    required: false
  },
  4: {
    id: 'hint',
    name: 'Hint',
    icon: LightBulbIcon,
    style: 'hint',
    title: 'Nápověda',
    required: false
  },
  5: {
    id: 'action',
    name: 'Action',
    icon: null,  // Determined by action type
    style: 'primary',
    title: null,  // Determined by action type
    required: true
  }
}

// ============================================
// ACTION VARIANTS (for Slot 5)
// ============================================

export const ACTIONS = {
  // Submit answer (checkmark)
  submit: {
    id: 'submit',
    icon: CheckIcon,
    title: 'Odeslat',
    style: 'primary'
  },

  // Continue to next (arrow right)
  continue: {
    id: 'continue',
    icon: ArrowRightIcon,
    title: 'Pokračovat',
    style: 'primary'
  },

  // Skip current (forward)
  skip: {
    id: 'skip',
    icon: ForwardIcon,
    title: 'Přeskočit',
    style: 'secondary'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get combined class names for a button
 * @param {string} style - Style preset key from STYLES
 * @param {boolean} disabled - Whether button is disabled
 * @returns {string} Combined class names
 */
export function getButtonClass(style, disabled = false) {
  const styleClass = STYLES[style] || STYLES.default
  const disabledClass = disabled ? STYLES.disabled : ''
  return `${BASE_BUTTON_CLASS} ${styleClass} ${disabledClass}`.trim()
}

/**
 * Get slot configuration with action override
 * @param {number} position - Slot position (1-5)
 * @param {string} actionType - For slot 5: 'submit' | 'continue' | 'skip'
 * @returns {object} Slot configuration
 */
export function getSlotConfig(position, actionType = null) {
  const slot = SLOTS[position]
  if (!slot) return null

  // For slot 5 (action), merge with action variant
  if (position === 5 && actionType && ACTIONS[actionType]) {
    const action = ACTIONS[actionType]
    return {
      ...slot,
      icon: action.icon,
      title: action.title,
      style: action.style
    }
  }

  return slot
}

/**
 * Get toggle style based on active state
 * @param {boolean} active - Whether toggle is active
 * @returns {string} Style key
 */
export function getToggleStyle(active) {
  return active ? 'toggle_on' : 'toggle_off'
}
