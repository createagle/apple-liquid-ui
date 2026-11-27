"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CheckIcon, MinusIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { LIQUID_SPRINGS } from "@/lib/liquid-motion"

const checkboxVariants = cva(
  [
    "peer group/checkbox relative inline-flex shrink-0 cursor-pointer items-center justify-center outline-none select-none",
    "transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.9] motion-reduce:transition-none motion-reduce:active:scale-100",
    // Expanded touch hit target without affecting layout
    "after:absolute after:-inset-2.5 md:after:-inset-1.5",
    // Focus & validation
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-3 aria-invalid:ring-(--apple-red)/35",
    "group-has-disabled/field:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    // Checked / Indeterminate (constant high-contrast Apple accent fill, never fades at tint=0)
    "data-checked:bg-(--apple-blue) data-checked:text-white data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_1px_3px_color-mix(in_srgb,var(--apple-blue)_36%,transparent)]",
    "data-indeterminate:bg-(--apple-blue) data-indeterminate:text-white data-indeterminate:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_1px_3px_color-mix(in_srgb,var(--apple-blue)_36%,transparent)]",
    "dark:data-checked:bg-(--apple-blue) dark:data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_4px_color-mix(in_srgb,var(--apple-blue)_42%,transparent)]",
    "dark:data-indeterminate:bg-(--apple-blue) dark:data-indeterminate:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_4px_color-mix(in_srgb,var(--apple-blue)_42%,transparent)]",
  ].join(" "),
  {
    variants: {
      size: {
        // Unified rounded-square checkbox across mobile & desktop (square = multi-select, circle = radio)
        sm: "size-[18px] rounded-[5px] md:size-[14px] md:rounded-[4px]",
        default: "size-[22px] rounded-[6px] md:size-4 md:rounded-[5px]",
        lg: "size-[26px] rounded-[7px] md:size-5 md:rounded-[6px]",
      },
      glass: {
        false:
          "not-data-checked:not-data-indeterminate:bg-black/[0.08] not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.14)] not-data-checked:not-data-indeterminate:hover:bg-black/[0.12] dark:not-data-checked:not-data-indeterminate:bg-white/[0.11] dark:not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.32),0_0_0_0.5px_rgba(255,255,255,0.18)] dark:not-data-checked:not-data-indeterminate:hover:bg-white/[0.16]",
        true:
          "not-data-checked:not-data-indeterminate:bg-(--liquid-surface) not-data-checked:not-data-indeterminate:[backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.1)] not-data-checked:not-data-indeterminate:hover:bg-(--liquid-surface-hover) dark:not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_4px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.18)]",
      },
    },
    defaultVariants: {
      size: "default",
      glass: false,
    },
  }
)

const iconSizeMap = {
  sm: "size-[11px] md:size-[10px]",
  default: "size-[13px] md:size-[11px]",
  lg: "size-[15px] md:size-[13px]",
} as const

export interface CheckboxProps
  extends Omit<CheckboxPrimitive.Root.Props, "size">,
    VariantProps<typeof checkboxVariants> {
  /**
   * Disables the spring pop animation on the check / indeterminate indicator.
   */
  disableMotion?: boolean
}

function Checkbox({
  className,
  size = "default",
  glass = false,
  disableMotion = false,
  indeterminate,
  ...props
}: CheckboxProps) {
  const prefersReducedMotion = useReducedMotion()
  const animateIndicator = !disableMotion && !prefersReducedMotion
  const resolvedSize = size ?? "default"

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={resolvedSize}
      data-glass={glass ? "true" : undefined}
      indeterminate={indeterminate}
      className={cn(
        checkboxVariants({ size: resolvedSize, glass: Boolean(glass) }),
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <motion.span
          key={indeterminate ? "indeterminate" : "checked"}
          initial={animateIndicator ? { scale: 0.45, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={LIQUID_SPRINGS.iosPress}
          className="flex items-center justify-center"
        >
          {indeterminate ? (
            <MinusIcon
              className={cn(iconSizeMap[resolvedSize], "stroke-[3]")}
            />
          ) : (
            <CheckIcon
              className={cn(iconSizeMap[resolvedSize], "stroke-[2.85]")}
            />
          )}
        </motion.span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
