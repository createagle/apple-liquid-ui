"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { motion, useReducedMotion } from "motion/react"

import { LIQUID_SPRINGS } from "@/lib/liquid-motion"

type RadioSize = "sm" | "default" | "lg"

interface RadioGroupContextValue {
  size: RadioSize
  glass: boolean
  disableMotion: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  size: "default",
  glass: false,
  disableMotion: false,
})

const radioItemVariants = cva(
  [
    "group/radio-group-item peer relative inline-flex aspect-square shrink-0 cursor-pointer items-center justify-center rounded-full outline-none select-none",
    "transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.9] motion-reduce:transition-none motion-reduce:active:scale-100",
    // Expanded touch hit target without affecting layout
    "after:absolute after:-inset-2.5 md:after:-inset-1.5",
    // Focus & validation
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-3 aria-invalid:ring-(--apple-red)/35",
    "group-has-disabled/field:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    // Checked (constant high-contrast Apple accent fill, never fades at tint=0)
    "data-checked:bg-(--apple-blue) data-checked:text-white data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_1px_3px_color-mix(in_srgb,var(--apple-blue)_36%,transparent)]",
    "dark:data-checked:bg-(--apple-blue) dark:data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_4px_color-mix(in_srgb,var(--apple-blue)_42%,transparent)]",
  ].join(" "),
  {
    variants: {
      size: {
        // Mobile iOS 27 touch target -> Desktop macOS 27 precision size
        sm: "size-[18px] md:size-[14px]",
        default: "size-[22px] md:size-4",
        lg: "size-[26px] md:size-5",
      },
      glass: {
        false:
          "not-data-checked:bg-black/[0.08] not-data-checked:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.14)] not-data-checked:hover:bg-black/[0.12] dark:not-data-checked:bg-white/[0.11] dark:not-data-checked:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.32),0_0_0_0.5px_rgba(255,255,255,0.18)] dark:not-data-checked:hover:bg-white/[0.16]",
        true:
          "not-data-checked:bg-(--liquid-surface) not-data-checked:[backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] not-data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.1)] not-data-checked:hover:bg-(--liquid-surface-hover) dark:not-data-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_4px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.18)]",
      },
    },
    defaultVariants: {
      size: "default",
      glass: false,
    },
  }
)

const dotSizeMap: Record<RadioSize, string> = {
  sm: "size-[7px] md:size-[5.5px]",
  default: "size-[8.5px] md:size-[6px]",
  lg: "size-[10px] md:size-[7.5px]",
}

export interface RadioGroupProps extends RadioGroupPrimitive.Props {
  /**
   * Default size inherited by all child `<RadioGroupItem>` controls.
   */
  size?: RadioSize
  /**
   * Applies translucent Liquid Glass surface styling to unchecked items.
   */
  glass?: boolean
  /**
   * Disables spring pop animations on selection dots.
   */
  disableMotion?: boolean
}

function RadioGroup({
  className,
  size = "default",
  glass = false,
  disableMotion = false,
  ...props
}: RadioGroupProps) {
  const ctxValue = React.useMemo(
    () => ({ size, glass, disableMotion }),
    [disableMotion, glass, size]
  )

  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <RadioGroupPrimitive
        data-slot="radio-group"
        className={cn("grid w-full gap-2.5 md:gap-2", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps
  extends Omit<RadioPrimitive.Root.Props, "size">,
    VariantProps<typeof radioItemVariants> {
  /**
   * Overrides group-level motion setting for this item.
   */
  disableMotion?: boolean
}

function RadioGroupItem({
  className,
  size,
  glass,
  disableMotion,
  ...props
}: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext)
  const prefersReducedMotion = useReducedMotion()

  const resolvedSize: RadioSize = size ?? ctx.size ?? "default"
  const resolvedGlass = glass ?? ctx.glass ?? false
  const animateIndicator =
    !(disableMotion ?? ctx.disableMotion) && !prefersReducedMotion

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      data-size={resolvedSize}
      data-glass={resolvedGlass ? "true" : undefined}
      className={cn(
        radioItemVariants({ size: resolvedSize, glass: Boolean(resolvedGlass) }),
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <motion.span
          initial={animateIndicator ? { scale: 0.35, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={LIQUID_SPRINGS.iosPress}
          className={cn(
            "rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22)]",
            dotSizeMap[resolvedSize]
          )}
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, radioItemVariants }
