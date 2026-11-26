"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  buildLensMaps,
  clamp,
  createSpringLoop,
  LensFilter,
  lerp,
  MENISCUS,
  spring,
  supportsRefraction,
  type LensMaps,
  type LensScale,
} from "@/components/ui/liquid-lens"

type SwitchSize = "sm" | "default" | "lg"
type SwitchVariant = "default" | "green" | "blue" | "glass"

interface SwitchGeometry {
  trackW: number
  trackH: number
  pad: number
  lensW: number
  lensH: number
  lensR: number
  travel: number
  thumbLeft: number
  bezel: number
  blur: number
}

const REST_SCALE = 0.65
const PRESS_SCALE = 0.9
const REST_RATIO = 0.4
const PRESS_RATIO = 0.9
const REST_FILL = 1
const PRESS_FILL = 0.07
const PRESS_FILL_NO_LENS = 0.72
const DRAG_SLOP = 4
const OVERDRAG = 22
const SPECULAR_OPACITY = 0.44
const SPECULAR_SATURATION = 1.8
const COLOURED_RIM_OPACITY = 0.18

function createGeometry(
  trackW: number,
  trackH: number,
  restThumbW: number,
  restThumbH: number
): SwitchGeometry {
  const pad = (trackH - restThumbH) / 2
  const lensW = Math.round(restThumbW / REST_SCALE)
  const lensH = Math.round(restThumbH / REST_SCALE)
  const lensR = lensH / 2
  const travel = trackW - restThumbW - pad * 2
  const thumbLeft = pad - (lensW * (1 - REST_SCALE)) / 2
  const k = trackH / 67

  return {
    trackW,
    trackH,
    pad,
    lensW,
    lensH,
    lensR,
    travel,
    thumbLeft,
    bezel: 0.54 * lensR,
    blur: Math.max(0.05, 0.2 * k),
  }
}

const SWITCH_GEOMETRY: Record<
  "mobile" | "desktop",
  Record<SwitchSize, SwitchGeometry>
> = {
  mobile: {
    sm: createGeometry(46, 22, 26, 18),
    default: createGeometry(60, 28, 36, 24),
    lg: createGeometry(68, 32, 40, 28),
  },
  desktop: {
    sm: createGeometry(36, 18, 20, 14),
    default: createGeometry(42, 22, 24, 18),
    lg: createGeometry(52, 26, 30, 22),
  },
}

const switchVariants = cva(
  [
    "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-3 aria-invalid:ring-destructive/30",
    "data-disabled:cursor-not-allowed data-disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[22px] w-[46px] md:h-[18px] md:w-[36px]",
        default: "h-[28px] w-[60px] md:h-[22px] md:w-[42px]",
        lg: "h-[32px] w-[68px] md:h-[26px] md:w-[52px]",
      },
      variant: {
        default: "",
        green: "",
        blue: "",
        glass: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SwitchProps
  extends Omit<SwitchPrimitive.Root.Props, "size">,
    VariantProps<typeof switchVariants> {
  /**
   * Optional subtle I / O accessibility glyphs inside the switch track.
   */
  showLabels?: boolean
  /**
   * Disables press/drag liquid lens refraction and spring physics.
   */
  disableMotion?: boolean
  /**
   * Optical Snell refraction intensity multiplier for the floating Lip droplet (default `1`).
   */
  refraction?: number
  /**
   * Chromatic prism dispersion intensity on the droplet bezel (default `0.015`).
   */
  dispersion?: number
  /**
   * Spherical dome curvature across the droplet window (`0..1`, default `0`).
   */
  curvature?: number
}

function Switch({
  className,
  size = "default",
  variant = "default",
  showLabels = false,
  disableMotion = false,
  refraction = 1,
  dispersion = 0.015,
  curvature = 0,
  disabled,
  readOnly,
  onPointerDown,
  ...props
}: SwitchProps) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const isMotionEnabled = !disableMotion && !prefersReducedMotion
  const isInteractive = !disabled && !readOnly

  const resolvedSize: SwitchSize = size ?? "default"
  const resolvedVariant: SwitchVariant = variant ?? "default"
  const geo = SWITCH_GEOMETRY[isMobile ? "mobile" : "desktop"][resolvedSize]
  const filterId = `apple-switch-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`

  const intensity =
    refraction > 4 ? refraction / 24 : Math.max(0.1, refraction)
  const peak = 0.28 * geo.lensH * intensity
  const kShadow = geo.trackH / 67
  const restShadow = `0 ${(9 * kShadow).toFixed(2)}px ${(49 * kShadow).toFixed(2)}px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.1)`
  const pressedShadow = `0 ${(10 * kShadow).toFixed(2)}px ${(36 * kShadow).toFixed(2)}px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.28)`
  const draggingShadow =
    `${pressedShadow}, inset ${(2 * kShadow).toFixed(2)}px ${(7 * kShadow).toFixed(2)}px ${(24 * kShadow).toFixed(2)}px rgba(0,0,0,0.09),` +
    ` inset ${(-2 * kShadow).toFixed(2)}px ${(-7 * kShadow).toFixed(2)}px ${(24 * kShadow).toFixed(2)}px rgba(255,255,255,0.12)`

  const rootRef = React.useRef<HTMLSpanElement | null>(null)
  const thumbRef = React.useRef<HTMLSpanElement | null>(null)
  const accentRef = React.useRef<HTMLSpanElement | null>(null)
  const labelOnRef = React.useRef<HTMLSpanElement | null>(null)
  const scaleRef = React.useRef<LensScale | null>(null)
  const hasLens = React.useRef(false)
  const [maps, setMaps] = React.useState<LensMaps | null>(null)

  React.useEffect(() => {
    if (!isMotionEnabled || !supportsRefraction()) {
      hasLens.current = false
      setMaps(null)
      return
    }
    hasLens.current = true
    setMaps(
      buildLensMaps({
        width: geo.lensW,
        height: geo.lensH,
        radius: geo.lensR,
        bezel: geo.bezel,
        surface: MENISCUS,
        curvature,
        lightAngle: 0,
        dpr: Math.min(window.devicePixelRatio || 1, 3),
      })
    )
  }, [curvature, geo.bezel, geo.lensH, geo.lensR, geo.lensW, isMotionEnabled])

  const engine = React.useRef({
    pos: spring(1000, 80),
    press: spring(2000, 80),
    tint: spring(1000, 80),
    dragging: false,
    moved: 0,
    startX: 0,
    startPos: 0,
  }).current

  const metricsRef = React.useRef({
    travel: geo.travel,
    peak,
    restShadow,
    pressedShadow,
    draggingShadow,
    isMotionEnabled,
  })
  metricsRef.current = {
    travel: geo.travel,
    peak,
    restShadow,
    pressedShadow,
    draggingShadow,
    isMotionEnabled,
  }

  const paint = React.useCallback(() => {
    const { pos, press, tint, dragging } = engine
    const m = metricsRef.current
    const thumb = thumbRef.current
    const p = m.isMotionEnabled ? press.value : 0

    if (thumb) {
      thumb.style.translate = `${pos.value * m.travel}px -50%`
      thumb.style.scale = `${lerp(REST_SCALE, PRESS_SCALE, p)}`
      const floor = hasLens.current ? PRESS_FILL : PRESS_FILL_NO_LENS
      const alpha = clamp(lerp(REST_FILL, floor, p), 0, 1)
      thumb.style.backgroundColor = `rgba(255,255,255,${alpha})`
      thumb.style.boxShadow = dragging
        ? m.draggingShadow
        : p > 0.05
          ? m.pressedShadow
          : m.restShadow
    }

    const tintAlpha = clamp(tint.value, 0, 1)
    if (accentRef.current) {
      accentRef.current.style.opacity = `${tintAlpha}`
    }
    if (labelOnRef.current) {
      labelOnRef.current.style.opacity = `${tintAlpha}`
    }
    if (m.isMotionEnabled) {
      scaleRef.current?.set(m.peak * lerp(REST_RATIO, PRESS_RATIO, p))
    }
  }, [engine])

  const paintRef = React.useRef(paint)
  paintRef.current = paint
  const loopRef = React.useRef<ReturnType<typeof createSpringLoop> | null>(null)
  loopRef.current ??= createSpringLoop(
    [engine.pos, engine.press, engine.tint],
    () => paintRef.current()
  )
  const loop = loopRef.current

  React.useEffect(() => {
    loop.reduced = !isMotionEnabled
    paintRef.current()
  }, [isMotionEnabled, geo.travel, peak, loop])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const read = () => (root.hasAttribute("data-checked") ? 1 : 0)
    engine.pos.value = engine.pos.target = read()
    engine.tint.value = engine.tint.target = engine.pos.value
    paintRef.current()

    const observer = new MutationObserver(() => {
      if (engine.dragging) return
      const next = read()
      loop.settle(engine.pos, next)
      loop.settle(engine.tint, next)
    })
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-checked"],
    })

    return () => {
      observer.disconnect()
      loop.stop()
    }
  }, [engine, loop])

  const onPointerMove = React.useCallback(
    (event: PointerEvent) => {
      const m = metricsRef.current
      const dx = event.clientX - engine.startX
      engine.moved = Math.max(engine.moved, Math.abs(dx))
      if (engine.moved < DRAG_SLOP || !m.isMotionEnabled) return

      engine.dragging = true
      engine.pos.held = true
      const raw = engine.startPos + dx / Math.max(1, m.travel)
      const over = raw < 0 ? -raw : raw > 1 ? raw - 1 : 0
      engine.pos.value =
        Math.min(1, Math.max(0, raw)) + Math.sign(raw) * (over / OVERDRAG)
      engine.pos.velocity = 0
      loop.settle(engine.tint, engine.pos.value > 0.5 ? 1 : 0)
      loop.wake()
    },
    [engine, loop]
  )

  const finishDrag = React.useCallback(
    (cancelled: boolean) => {
      const root = rootRef.current
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", handleGlobalUp)
      window.removeEventListener("pointercancel", handleGlobalCancel)
      loop.settle(engine.press, 0)

      if (!engine.dragging || !root) return
      engine.dragging = false
      engine.pos.held = false

      const wants = engine.pos.value > 0.5 ? 1 : 0
      const current = root.hasAttribute("data-checked") ? 1 : 0

      loop.settle(engine.pos, current)
      loop.settle(engine.tint, current)

      if (cancelled || wants === current) {
        const swallow = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
        }
        root.addEventListener("click", swallow, { capture: true, once: true })
        setTimeout(() => {
          root.removeEventListener("click", swallow, { capture: true })
        }, 60)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, loop, onPointerMove]
  )

  const handleGlobalUp = React.useCallback(() => {
    finishDrag(false)
  }, [finishDrag])

  const handleGlobalCancel = React.useCallback(() => {
    finishDrag(true)
  }, [finishDrag])

  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", handleGlobalUp)
      window.removeEventListener("pointercancel", handleGlobalCancel)
    }
  }, [handleGlobalCancel, handleGlobalUp, onPointerMove])

  const activeTrackColorClass =
    resolvedVariant === "blue"
      ? "bg-(--apple-blue)"
      : resolvedVariant === "green"
        ? "bg-(--apple-green)"
        : resolvedVariant === "glass"
          ? "bg-(--apple-green)/84 md:bg-(--apple-blue)/86 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
          : "bg-(--apple-green) md:bg-(--apple-blue)"

  return (
    <SwitchPrimitive.Root
      ref={rootRef}
      data-slot="switch"
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      disabled={disabled}
      readOnly={readOnly}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || !isInteractive || event.button !== 0) {
          return
        }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        engine.moved = 0
        engine.startX = event.clientX
        engine.startPos = engine.pos.value
        if (isMotionEnabled) {
          loop.settle(engine.press, 1)
        }
        window.addEventListener("pointermove", onPointerMove)
        window.addEventListener("pointerup", handleGlobalUp)
        window.addEventListener("pointercancel", handleGlobalCancel)
      }}
      className={cn(
        switchVariants({ size: resolvedSize, variant: resolvedVariant }),
        isInteractive && isMotionEnabled && "touch-pan-y",
        className
      )}
      {...props}
    >
      {/* Flat/low-blur track sibling so Root never traps Thumb backdrop-filter */}
      <span
        aria-hidden="true"
        data-slot="switch-track"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-full",
          resolvedVariant === "glass"
            ? "bg-(--liquid-surface) shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_-0.5px_0_rgba(255,255,255,0.5)] [backdrop-filter:blur(4px)_saturate(1.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.16)]"
            : "bg-[rgba(142,142,152,0.42)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[rgba(120,120,128,0.46)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
        )}
      >
        <span
          ref={accentRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            activeTrackColorClass
          )}
        />

        {showLabels ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[7px]">
            <span
              ref={labelOnRef}
              style={{ opacity: 0 }}
              className="h-[8px] w-[1.5px] rounded-full bg-white/90"
            />
            <span className="size-[7px] rounded-full border-[1.5px] border-neutral-500/65 dark:border-white/45" />
          </span>
        ) : null}
      </span>

      {maps ? (
        <LensFilter
          id={filterId}
          maps={maps}
          width={geo.lensW}
          height={geo.lensH}
          scale={peak * REST_RATIO}
          blur={geo.blur}
          specularOpacity={SPECULAR_OPACITY}
          specularSaturation={SPECULAR_SATURATION}
          colouredRimOpacity={COLOURED_RIM_OPACITY}
          dispersion={dispersion}
          scaleRef={scaleRef}
        />
      ) : null}

      {/* Single pre-scaled capsule thumb that swells and melts into a clean MENISCUS glass lens */}
      <SwitchPrimitive.Thumb
        ref={thumbRef}
        data-slot="switch-thumb"
        className="pointer-events-none absolute z-10 will-change-transform"
        style={{
          width: geo.lensW,
          height: geo.lensH,
          borderRadius: geo.lensR,
          left: geo.thumbLeft,
          top: geo.trackH / 2,
          translate: "0px -50%",
          scale: REST_SCALE,
          backgroundColor: `rgba(255,255,255,${REST_FILL})`,
          boxShadow: restShadow,
          ...(maps
            ? {
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
              }
            : null),
        }}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
