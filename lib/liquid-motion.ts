import type { Transition } from "motion/react"

/**
 * Shared Motion spring presets tuned to Apple macOS 27 & iOS 27 Liquid Glass physics.
 */
export const LIQUID_SPRINGS = {
  /** Crisp desktop macOS tactile press */
  macosPress: {
    type: "spring",
    stiffness: 520,
    damping: 32,
    mass: 0.65,
  },
  /** Elastic iOS 27 Liquid Glass gel-squish press and rebound */
  iosPress: {
    type: "spring",
    stiffness: 380,
    damping: 22,
    mass: 0.75,
  },
  /** Silky pointer-tracking specular highlight glide */
  specular: {
    stiffness: 340,
    damping: 28,
    mass: 0.35,
  },
  /** Smooth layoutId capsule morphing (Tabs, Segmented Controls, Dock) */
  morph: {
    type: "spring",
    stiffness: 420,
    damping: 30,
    mass: 0.8,
  },
} as const satisfies Record<string, Transition>

export const LIQUID_PRESS_SCALE = {
  macos: 0.97,
  ios: 0.935,
} as const
