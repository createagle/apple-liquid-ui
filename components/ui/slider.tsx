"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { motion, useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { LiquidLens } from "@/components/ui/liquid-lens"

type SliderSize = "sm" | "default" | "lg"
type SliderVariant = "default" | "glass"

const sliderTrackVariants = cva(
  [
    "relative grow overflow-hidden rounded-full select-none",
    "data-horizontal:w-full data-vertical:h-full",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "data-horizontal:h-[5px] md:data-horizontal:h-[4px] data-vertical:w-[5px] md:data-vertical:w-[4px]",
        default:
          "data-horizontal:h-[7px] md:data-horizontal:h-[5px] data-vertical:w-[7px] md:data-vertical:w-[5px]",
        lg: "data-horizontal:h-[10px] md:data-horizontal:h-[7px] data-vertical:w-[10px] md:data-vertical:w-[7px]",
      },
      variant: {
        default:
          "bg-[rgba(120,120,128,0.22)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[rgba(120,120,128,0.34)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]",
        glass:
          "bg-(--liquid-surface) shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_-0.5px_0_rgba(255,255,255,0.5)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.16)]",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const sliderThumbSizeVariants = cva("", {
  variants: {
    size: {
      sm: [
        "data-horizontal:h-[18px] data-horizontal:w-[28px] md:data-horizontal:h-[14px] md:data-horizontal:w-[22px]",
        "data-vertical:h-[28px] data-vertical:w-[18px] md:data-vertical:h-[22px] md:data-vertical:w-[14px]",
      ].join(" "),
      default: [
        "data-horizontal:h-[22px] data-horizontal:w-[34px] md:data-horizontal:h-[16px] md:data-horizontal:w-[26px]",
        "data-vertical:h-[34px] data-vertical:w-[22px] md:data-vertical:h-[26px] md:data-vertical:w-[16px]",
      ].join(" "),
      lg: [
        "data-horizontal:h-[26px] data-horizontal:w-[40px] md:data-horizontal:h-[20px] md:data-horizontal:w-[32px]",
        "data-vertical:h-[40px] data-vertical:w-[26px] md:data-vertical:h-[32px] md:data-vertical:w-[20px]",
      ].join(" "),
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface SliderProps
  extends SliderPrimitive.Root.Props,
    VariantProps<typeof sliderTrackVariants> {
  /**
   * Optional macOS-style evenly spaced tick marks along the track.
   * Pass a number (e.g. `5`) for explicit tick count, or `true` to derive from `step`.
   */
  ticks?: boolean | number
  /**
   * Disables press/drag liquid lens refraction and spring physics.
   */
  disableMotion?: boolean
  /**
   * Optical Snell refraction intensity for the floating Lip glass droplet (default `1`).
   */
  refraction?: number
  /**
   * Chromatic prism dispersion intensity on the droplet bezel (default `0.055`).
   */
  dispersion?: number
}

function Slider({
  className,
  size = "default",
  variant = "default",
  ticks = false,
  disableMotion = false,
  refraction = 1,
  dispersion = 0.055,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  orientation = "horizontal",
  ...props
}: SliderProps) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const isMotionEnabled = !disableMotion && !prefersReducedMotion

  const resolvedSize: SliderSize = size ?? "default"
  const resolvedVariant: SliderVariant = variant ?? "default"
  const isVertical = orientation === "vertical"

  const thumbCount = React.useMemo(() => {
    if (Array.isArray(value)) return Math.max(1, value.length)
    if (typeof value === "number") return 1
    if (Array.isArray(defaultValue)) return Math.max(1, defaultValue.length)
    if (typeof defaultValue === "number") return 1
    return 1
  }, [value, defaultValue])

  const tickCount = React.useMemo(() => {
    if (!ticks) return 0
    if (typeof ticks === "number") {
      return Math.max(2, Math.min(25, Math.round(ticks)))
    }
    if (step > 0 && max > min) {
      const derived = Math.round((max - min) / step) + 1
      if (derived >= 2 && derived <= 21) return derived
    }
    return 5
  }, [ticks, step, max, min])

  const [activeThumbIndex, setActiveThumbIndex] = React.useState<number | null>(
    null
  )

  React.useEffect(() => {
    if (activeThumbIndex === null) return
    const clear = () => setActiveThumbIndex(null)
    window.addEventListener("pointerup", clear)
    window.addEventListener("pointercancel", clear)
    return () => {
      window.removeEventListener("pointerup", clear)
      window.removeEventListener("pointercancel", clear)
    }
  }, [activeThumbIndex])

  const springTransition = isMobile
    ? LIQUID_SPRINGS.iosPress
    : LIQUID_SPRINGS.macosPress

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
      thumbAlignment="edge"
      className={cn(
        "group/slider relative select-none data-horizontal:w-full data-vertical:h-full",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          "relative flex cursor-pointer touch-none items-center select-none data-disabled:cursor-not-allowed data-disabled:opacity-45",
          "data-horizontal:w-full data-horizontal:py-3 md:data-horizontal:py-2.5",
          "data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-vertical:px-3 md:data-vertical:px-2.5"
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            sliderTrackVariants({
              size: resolvedSize,
              variant: resolvedVariant,
            })
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "rounded-full select-none data-horizontal:h-full data-vertical:w-full",
              resolvedVariant === "glass"
                ? "bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.45)] dark:bg-white/85"
                : "bg-(--apple-blue)"
            )}
          />
        </SliderPrimitive.Track>

        {/* Optional macOS-style evenly spaced tick marks */}
        {tickCount > 0 ? (
          <span
            aria-hidden="true"
            data-slot="slider-ticks"
            className={cn(
              "pointer-events-none absolute flex justify-between",
              isVertical
                ? "inset-y-2 left-full ml-1.5 flex-col"
                : "inset-x-2 top-full -mt-1.5 flex-row"
            )}
          >
            {Array.from({ length: tickCount }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full bg-foreground/25 dark:bg-white/25",
                  isVertical ? "h-[1.5px] w-1.5" : "h-1.5 w-[1.5px]"
                )}
              />
            ))}
          </span>
        ) : null}

        {Array.from({ length: thumbCount }, (_, index) => {
          const isActive = activeThumbIndex === index && !disabled
          const showLiquidLens = isMotionEnabled && isActive

          return (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              data-slot="slider-thumb"
              data-active={isActive ? "true" : undefined}
              onPointerDown={() => {
                if (!disabled) setActiveThumbIndex(index)
              }}
              className={cn(
                "relative z-10 block shrink-0 cursor-grab rounded-full outline-none select-none active:cursor-grabbing",
                "after:absolute after:-inset-2.5",
                "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-50",
                sliderThumbSizeVariants({ size: resolvedSize })
              )}
            >
              {/* Resting Apple Solid White Capsule Thumb */}
              <motion.span
                aria-hidden="true"
                data-slot="slider-resting-thumb"
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-full bg-white",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.18),0_0.5px_2px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)]",
                  "dark:bg-white/95 dark:shadow-[0_3px_10px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.2)]"
                )}
                animate={{
                  opacity: showLiquidLens ? 0 : 1,
                  scale: isActive && !isMotionEnabled ? 1.05 : 1,
                }}
                transition={{ duration: 0.14 }}
              />

              {/* Apple iOS 27 / macOS 27 Floating Crystal Liquid Glass Droplet (pre-mounted so filter is warm) */}
              {isMotionEnabled ? (
                <motion.div
                  aria-hidden="true"
                  data-slot="slider-liquid-droplet"
                  className="pointer-events-none absolute inset-0 z-20 will-change-transform"
                  initial={false}
                  animate={{
                    opacity: showLiquidLens ? 1 : 0,
                    scale: showLiquidLens ? 1.04 : 0.94,
                  }}
                  transition={springTransition}
                >
                  <LiquidLens
                    profile="lip"
                    rim="crystal"
                    radius={999}
                    refraction={refraction}
                    dispersion={dispersion}
                    blur={0}
                    brightness={1.05}
                    saturation={1.1}
                    className={cn(
                      "absolute",
                      isVertical
                        ? "-inset-x-[5px] -inset-y-[7px]"
                        : "-inset-x-[7px] -inset-y-[5px]"
                    )}
                  />
                </motion.div>
              ) : null}
            </SliderPrimitive.Thumb>
          )
        })}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, sliderTrackVariants }
