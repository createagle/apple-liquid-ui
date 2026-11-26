"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  buildLensMaps,
  clamp,
  CONVEX,
  createSpringLoop,
  LensFilter,
  lerp,
  spring,
  supportsRefraction,
  type LensMaps,
  type LensScale,
} from "@/components/ui/liquid-lens"

type SliderSize = "sm" | "default" | "lg"
type SliderVariant = "default" | "glass"

const REST_SCALE = 0.6
const PRESS_SCALE = 1.0
const REST_RATIO = 0.4
const PRESS_RATIO = 0.9
const REST_FILL = 1
const PRESS_FILL = 0.14
const PRESS_FILL_NO_LENS = 0.72
const SPECULAR_OPACITY = 0.45
const SPECULAR_SATURATION = 7

const REST_THUMB_DIMS: Record<
  "mobile" | "desktop",
  Record<SliderSize, { w: number; h: number }>
> = {
  mobile: {
    sm: { w: 26, h: 17 },
    default: { w: 34, h: 22 },
    lg: { w: 40, h: 26 },
  },
  desktop: {
    sm: { w: 22, h: 14 },
    default: { w: 26, h: 16 },
    lg: { w: 32, h: 20 },
  },
}

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
          "bg-[rgba(137,137,143,0.38)] dark:bg-[rgba(137,137,143,0.44)]",
        glass:
          "bg-(--liquid-surface) shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_-0.5px_0_rgba(255,255,255,0.45)] [backdrop-filter:blur(4px)_saturate(1.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_0.5px_rgba(255,255,255,0.16)]",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface SliderLensThumbProps {
  index: number
  restW: number
  restH: number
  disabled?: boolean
  isMotionEnabled: boolean
  refraction: number
  dispersion: number
  curvature: number
}

function SliderLensThumb({
  index,
  restW,
  restH,
  disabled,
  isMotionEnabled,
  refraction,
  dispersion,
  curvature,
}: SliderLensThumbProps) {
  const filterId = `apple-slider-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const thumbRef = React.useRef<HTMLDivElement | null>(null)
  const lensRef = React.useRef<HTMLSpanElement | null>(null)
  const scaleRef = React.useRef<LensScale | null>(null)
  const pointerDownRef = React.useRef(false)
  const hasLens = React.useRef(false)
  const [maps, setMaps] = React.useState<LensMaps | null>(null)

  const lensW = Math.round(restW / REST_SCALE)
  const lensH = Math.round(restH / REST_SCALE)
  const minDim = Math.min(lensW, lensH)
  const lensR = minDim / 2
  const bezel = 0.417 * lensR
  const intensity =
    refraction > 4 ? refraction / 24 : Math.max(0.1, refraction)
  const peak = 1.178 * minDim * intensity

  React.useEffect(() => {
    if (!isMotionEnabled || !supportsRefraction()) {
      hasLens.current = false
      setMaps(null)
      return
    }
    hasLens.current = true
    setMaps(
      buildLensMaps({
        width: lensW,
        height: lensH,
        radius: lensR,
        bezel,
        surface: CONVEX,
        curvature,
        dpr: Math.min(window.devicePixelRatio || 1, 3),
      })
    )
  }, [bezel, curvature, isMotionEnabled, lensH, lensR, lensW])

  const press = React.useRef(spring(2000, 80)).current
  const peakRef = React.useRef(peak)
  peakRef.current = peak
  const motionRef = React.useRef(isMotionEnabled)
  motionRef.current = isMotionEnabled

  const paint = React.useCallback(() => {
    const t = motionRef.current ? press.value : 0
    const el = lensRef.current
    if (el) {
      el.style.scale = `${lerp(REST_SCALE, PRESS_SCALE, t)}`
      const floor = hasLens.current ? PRESS_FILL : PRESS_FILL_NO_LENS
      const alpha = clamp(lerp(REST_FILL, floor, t), 0, 1)
      el.style.backgroundColor = `rgba(255,255,255,${alpha})`
    }
    if (motionRef.current) {
      scaleRef.current?.set(peakRef.current * lerp(REST_RATIO, PRESS_RATIO, t))
    }
  }, [press])

  const paintRef = React.useRef(paint)
  paintRef.current = paint
  const loopRef = React.useRef<ReturnType<typeof createSpringLoop> | null>(null)
  loopRef.current ??= createSpringLoop([press], () => paintRef.current())
  const loop = loopRef.current

  const syncPressState = React.useCallback(() => {
    const node = thumbRef.current
    if (!node || disabled || !motionRef.current) {
      loop.settle(press, 0)
      return
    }
    const active =
      node.hasAttribute("data-dragging") || pointerDownRef.current
    loop.settle(press, active ? 1 : 0)
  }, [disabled, loop, press])

  React.useEffect(() => {
    loop.reduced = !isMotionEnabled
    paintRef.current()
  }, [isMotionEnabled, peak, loop])

  React.useEffect(() => {
    const node = thumbRef.current
    if (!node) return

    paintRef.current()
    const observer = new MutationObserver(() => {
      syncPressState()
    })
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-dragging"],
    })

    const onGlobalRelease = () => {
      if (!pointerDownRef.current) return
      pointerDownRef.current = false
      syncPressState()
    }
    window.addEventListener("pointerup", onGlobalRelease)
    window.addEventListener("pointercancel", onGlobalRelease)

    return () => {
      observer.disconnect()
      window.removeEventListener("pointerup", onGlobalRelease)
      window.removeEventListener("pointercancel", onGlobalRelease)
      loop.stop()
    }
  }, [loop, syncPressState])

  return (
    <SliderPrimitive.Thumb
      ref={thumbRef}
      index={index}
      data-slot="slider-thumb"
      onPointerDown={() => {
        if (disabled || !isMotionEnabled) return
        pointerDownRef.current = true
        syncPressState()
      }}
      style={{ width: restW, height: restH }}
      className={cn(
        "relative z-10 block shrink-0 cursor-grab rounded-full outline-none select-none active:cursor-grabbing",
        "after:absolute after:-inset-2.5",
        "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      {maps ? (
        <LensFilter
          id={filterId}
          maps={maps}
          width={lensW}
          height={lensH}
          scale={peak * REST_RATIO}
          blur={0}
          specularOpacity={SPECULAR_OPACITY}
          specularSaturation={SPECULAR_SATURATION}
          dispersion={dispersion}
          scaleRef={scaleRef}
        />
      ) : null}

      {/* Single pre-scaled CONVEX lens that swells and magnifies the rail underneath */}
      <span
        ref={lensRef}
        data-slot="slider-lens"
        aria-hidden="true"
        className="pointer-events-none will-change-transform"
        style={{
          position: "absolute",
          width: lensW,
          height: lensH,
          borderRadius: lensR,
          left: (restW - lensW) / 2,
          top: (restH - lensH) / 2,
          scale: REST_SCALE,
          backgroundColor: `rgba(255,255,255,${REST_FILL})`,
          boxShadow:
            "0 3px 14px rgba(0,0,0,0.12), inset 0 0.5px 1px rgba(255,255,255,0.45)",
          ...(maps
            ? {
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
              }
            : null),
        }}
      />
    </SliderPrimitive.Thumb>
  )
}

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
   * Optical Snell refraction intensity multiplier for the magnifying Convex droplet (default `1`).
   */
  refraction?: number
  /**
   * Chromatic prism dispersion intensity on the droplet bezel (default `0.04`).
   */
  dispersion?: number
  /**
   * Spherical dome curvature across the magnifying lens (`0..1`, default `0.4`).
   */
  curvature?: number
}

function Slider({
  className,
  size = "default",
  variant = "default",
  ticks = false,
  disableMotion = false,
  refraction = 1,
  dispersion = 0.04,
  curvature = 0.4,
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

  const baseDims = REST_THUMB_DIMS[isMobile ? "mobile" : "desktop"][resolvedSize]
  const restW = isVertical ? baseDims.h : baseDims.w
  const restH = isVertical ? baseDims.w : baseDims.h

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

        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderLensThumb
            key={index}
            index={index}
            restW={restW}
            restH={restH}
            disabled={disabled}
            isMotionEnabled={isMotionEnabled}
            refraction={refraction}
            dispersion={dispersion}
            curvature={curvature}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, sliderTrackVariants }
