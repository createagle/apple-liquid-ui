"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
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

type TabValue = TabsPrimitive.Tab.Value

interface TabsContextValue {
  orientation: "horizontal" | "vertical"
  activeValue: TabValue | undefined
  selectValue: (value: TabValue) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsPrimitive.Root.Props) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    TabValue | undefined
  >(defaultValue)
  const activeValue = isControlled ? value : uncontrolledValue

  const handleValueChange: NonNullable<
    TabsPrimitive.Root.Props["onValueChange"]
  > = React.useCallback(
    (nextValue, eventDetails) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(nextValue, eventDetails)
    },
    [isControlled, onValueChange]
  )

  const selectValue = React.useCallback(
    (nextValue: TabValue) => {
      if (nextValue === activeValue) return
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(nextValue, {
        reason: "none",
        event: new Event("change"),
        cancel: () => {},
        allowPropagation: () => {},
        isCanceled: false,
        isPropagationAllowed: false,
        trigger: undefined,
      } as Parameters<NonNullable<TabsPrimitive.Root.Props["onValueChange"]>>[1])
    },
    [activeValue, isControlled, onValueChange]
  )

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      orientation: orientation ?? "horizontal",
      activeValue,
      selectValue,
    }),
    [orientation, activeValue, selectValue]
  )

  return (
    <TabsContext.Provider value={ctx}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        {...(activeValue !== undefined ? { value: activeValue } : {})}
        onValueChange={handleValueChange}
        className={cn(
          "group/tabs flex gap-3 data-horizontal:flex-col",
          className
        )}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  [
    // `isolate` keeps the pill / label / droplet z-layers inside the list so they
    // never paint over the host page's sticky headers or popovers
    "group/tabs-list relative isolate inline-flex w-fit items-center justify-center select-none",
    "group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch",
  ].join(" "),
  {
    variants: {
      variant: {
        // Apple iOS 27 (44px pill) <-> macOS 27 (32px rounded rect) Segmented Control
        default: [
          "rounded-full p-[3px] text-foreground/70",
          "bg-(--apple-fill-bordered-ios) dark:bg-[rgba(118,118,128,0.24)]",
          "group-data-horizontal/tabs:h-11",
          "md:rounded-[9px] md:bg-(--apple-fill-bordered-mac) md:group-data-horizontal/tabs:h-8",
          "group-data-vertical/tabs:rounded-2xl md:group-data-vertical/tabs:rounded-xl",
        ].join(" "),

        // Floating Apple Liquid Glass Capsule Bar (glass fill/blur lives on sibling backdrop layer
        // so TabsList does not create a Backdrop Root that traps LiquidLens refraction)
        glass: [
          "rounded-full p-1 text-neutral-800/75 dark:text-white/75",
          "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.5)]",
          "dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.48),0_0_0_0.5px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.08)]",
          "group-data-horizontal/tabs:min-h-12 md:group-data-horizontal/tabs:min-h-10",
          "group-data-vertical/tabs:rounded-[24px] group-data-vertical/tabs:p-1.5",
        ].join(" "),

        // Apple iOS 27 Floating Tab Bar (62px stacked icon+label) <-> iPad/macOS 27 (44px inline)
        "tab-bar": [
          "rounded-full p-1.5 text-neutral-800/75 dark:text-white/75",
          "shadow-[0_12px_34px_-8px_rgba(0,0,0,0.14),0_2px_8px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-0.5px_0_rgba(255,255,255,0.55)]",
          "dark:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.52),0_0_0_0.5px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.08)]",
          "group-data-horizontal/tabs:h-[62px] md:p-1 md:group-data-horizontal/tabs:h-11",
        ].join(" "),

        // Minimal borderless underline tabs
        line: [
          "gap-1 rounded-none border-b border-border/70 bg-transparent p-0 text-muted-foreground",
          "group-data-horizontal/tabs:h-10 md:group-data-horizontal/tabs:h-9",
          "group-data-vertical/tabs:border-r group-data-vertical/tabs:border-b-0",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {
  /**
   * Disables interactive drag-scrubbing and liquid lens refraction.
   */
  disableMotion?: boolean
  /**
   * Chromatic prism dispersion intensity on the floating liquid glass droplet
   * while pressing, dragging, or gliding across tabs (default `0.18`).
   */
  dispersion?: number
  /**
   * Optical Snell refraction intensity multiplier for the floating liquid glass droplet (default `1`).
   */
  refraction?: number
  /**
   * Spherical dome curvature across the droplet window (`0..1`, default `0.18`).
   */
  curvature?: number
}

interface TabRect {
  x: number
  y: number
  width: number
  height: number
}

const REST_RATIO = 0.14
const PRESS_RATIO = 1.0
const STRETCH_MAX = 0.18
const STRETCH_SPEED = 2400
const SPECULAR_OPACITY = 0.52
const SPECULAR_SATURATION = 4.2
const COLOURED_RIM_OPACITY = 0.65

function getSwellPad(
  variant: NonNullable<TabsListProps["variant"]>,
  isMobile: boolean
): { padX: number; padY: number } {
  if (variant === "tab-bar") {
    return isMobile ? { padX: 12, padY: 12 } : { padX: 12, padY: 10 }
  }
  if (variant === "glass") {
    return { padX: 11, padY: 9 }
  }
  return isMobile ? { padX: 9, padY: 7 } : { padX: 8, padY: 6 }
}

function TabsList({
  className,
  variant = "default",
  disableMotion = false,
  dispersion = 0.18,
  refraction = 1,
  curvature = 0.18,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: TabsListProps) {
  const ctx = React.useContext(TabsContext)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const isMotionEnabled = !disableMotion && !prefersReducedMotion

  const resolvedVariant = variant ?? "default"
  const isHorizontal = (ctx?.orientation ?? "horizontal") === "horizontal"
  const isLine = resolvedVariant === "line"
  const canScrub = isMotionEnabled && isHorizontal && !isLine
  const filterId = `apple-tabs-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`

  const listRef = React.useRef<HTMLDivElement | null>(null)
  const indicatorRef = React.useRef<HTMLSpanElement | null>(null)
  const lineIndicatorRef = React.useRef<HTMLSpanElement | null>(null)
  const dropletRef = React.useRef<HTMLSpanElement | null>(null)
  const scaleRef = React.useRef<LensScale | null>(null)
  const initializedRef = React.useRef(false)
  const glideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [hasRect, setHasRect] = React.useState(false)
  const [mapSize, setMapSize] = React.useState<{ w: number; h: number } | null>(
    null
  )
  const [maps, setMaps] = React.useState<LensMaps | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const dragRef = React.useRef<{
    pointerId: number
    startClientX: number
    startThumbX: number
    thumbW: number
    minX: number
    maxX: number
    moved: boolean
    triggers: { el: HTMLElement; value: string; left: number; width: number }[]
  } | null>(null)

  const engine = React.useRef({
    x: spring(520, 40),
    y: spring(520, 40),
    w: spring(520, 40),
    h: spring(520, 40),
    press: spring(900, 46),
    stretch: spring(520, 44),
  }).current

  const swellPad = getSwellPad(resolvedVariant, isMobile)
  const expandedMapW = mapSize ? mapSize.w + swellPad.padX * 2 : 0
  const expandedMapH = mapSize ? mapSize.h + swellPad.padY * 2 : 0
  const intensity =
    refraction > 4 ? refraction / 24 : Math.max(0.1, refraction)
  const minDim =
    expandedMapW > 0 && expandedMapH > 0
      ? Math.min(expandedMapW, expandedMapH)
      : 48
  const peak = 0.68 * minDim * intensity

  const metricsRef = React.useRef({
    isMotionEnabled,
    isHorizontal,
    isLine,
    peak,
    padX: swellPad.padX,
    padY: swellPad.padY,
  })
  metricsRef.current = {
    isMotionEnabled,
    isHorizontal,
    isLine,
    peak,
    padX: swellPad.padX,
    padY: swellPad.padY,
  }

  const paint = React.useCallback(() => {
    const m = metricsRef.current
    const { x, y, w, h, press, stretch } = engine

    if (m.isLine) {
      const lineEl = lineIndicatorRef.current
      if (lineEl) {
        if (m.isHorizontal) {
          lineEl.style.translate = `${x.value}px 0px`
          lineEl.style.width = `${w.value}px`
        } else {
          lineEl.style.translate = `0px ${y.value}px`
          lineEl.style.height = `${h.value}px`
        }
      }
      return
    }

    const p01 = clamp(press.value, 0, 1.35)
    const speed = m.isHorizontal ? Math.abs(x.velocity) : Math.abs(y.velocity)
    stretch.target = m.isMotionEnabled
      ? Math.min(speed / STRETCH_SPEED, STRETCH_MAX)
      : 0
    const s = m.isMotionEnabled ? clamp(stretch.value, 0, 0.22) : 0
    const stretchSX = m.isHorizontal ? 1 + s : 1 - s * 0.42
    const stretchSY = m.isHorizontal ? 1 - s * 0.42 : 1 + s

    const expW = w.value + m.padX * 2
    const expH = h.value + m.padY * 2
    const restScaleX = w.value / Math.max(1, expW)
    const restScaleY = h.value / Math.max(1, expH)

    const indicator = indicatorRef.current
    if (indicator) {
      const indScaleX = m.isMotionEnabled
        ? lerp(1, expW / Math.max(1, w.value), press.value) * stretchSX
        : 1
      const indScaleY = m.isMotionEnabled
        ? lerp(1, expH / Math.max(1, h.value), press.value) * stretchSY
        : 1
      indicator.style.translate = `${x.value}px ${y.value}px`
      indicator.style.width = `${w.value}px`
      indicator.style.height = `${h.value}px`
      indicator.style.scale = `${indScaleX} ${indScaleY}`
      indicator.style.opacity = m.isMotionEnabled
        ? `${clamp(1 - p01 * 1.6, 0, 1)}`
        : "1"
    }

    const droplet = dropletRef.current
    if (droplet) {
      const swellScaleX = m.isMotionEnabled
        ? lerp(restScaleX, 1, press.value)
        : restScaleX
      const swellScaleY = m.isMotionEnabled
        ? lerp(restScaleY, 1, press.value)
        : restScaleY
      droplet.style.translate = `${x.value - m.padX}px ${y.value - m.padY}px`
      droplet.style.width = `${expW}px`
      droplet.style.height = `${expH}px`
      droplet.style.scale = `${swellScaleX * stretchSX} ${swellScaleY * stretchSY}`
      const dropOpacity = m.isMotionEnabled ? clamp(p01 * 1.6, 0, 1) : 0
      droplet.style.opacity = `${dropOpacity}`
      droplet.style.visibility =
        p01 < 0.005 && press.target === 0 ? "hidden" : "visible"
      const fillPct = (clamp(p01, 0, 1) * 100).toFixed(2)
      droplet.style.backgroundColor = `color-mix(in srgb, var(--tabs-droplet-fill) ${fillPct}%, transparent)`
    }

    if (m.isMotionEnabled) {
      scaleRef.current?.set(m.peak * lerp(REST_RATIO, PRESS_RATIO, p01))
    }
  }, [engine])

  const paintRef = React.useRef(paint)
  paintRef.current = paint
  const loopRef = React.useRef<ReturnType<typeof createSpringLoop> | null>(null)
  loopRef.current ??= createSpringLoop(
    [engine.x, engine.y, engine.w, engine.h, engine.press, engine.stretch],
    () => paintRef.current()
  )
  const loop = loopRef.current

  React.useEffect(() => {
    loop.reduced = !isMotionEnabled
    paintRef.current()
  }, [
    isMotionEnabled,
    isHorizontal,
    isLine,
    peak,
    swellPad.padX,
    swellPad.padY,
    loop,
  ])

  const mapRadius =
    resolvedVariant === "default" && !isMobile
      ? 12
      : expandedMapH > 0
        ? expandedMapH / 2
        : 24

  React.useEffect(() => {
    if (
      !isMotionEnabled ||
      isLine ||
      expandedMapW <= 0 ||
      expandedMapH <= 0 ||
      !supportsRefraction()
    ) {
      setMaps(null)
      return
    }
    const dim = Math.min(expandedMapW, expandedMapH)
    const r = Math.min(mapRadius, expandedMapW / 2, expandedMapH / 2)
    setMaps(
      buildLensMaps({
        width: expandedMapW,
        height: expandedMapH,
        radius: r,
        bezel: 0.48 * (dim / 2),
        surface: CONVEX,
        curvature,
        lightAngle: 0,
        dpr: Math.min(window.devicePixelRatio || 1, 3),
      })
    )
  }, [
    curvature,
    expandedMapH,
    expandedMapW,
    isLine,
    isMotionEnabled,
    mapRadius,
  ])

  const triggerGlide = React.useCallback(() => {
    if (!metricsRef.current.isMotionEnabled || metricsRef.current.isLine) return
    loop.settle(engine.press, 1)
    if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
    glideTimerRef.current = setTimeout(() => {
      glideTimerRef.current = null
      if (!dragRef.current) {
        loop.settle(engine.press, 0)
      }
    }, 260)
  }, [engine, loop])

  const measureActive = React.useCallback(
    (instant = false) => {
      const container = listRef.current
      if (!container) return
      const activeEl = container.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-active]'
      )
      if (!activeEl) return

      const next: TabRect = {
        x: activeEl.offsetLeft,
        y: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
      }
      if (next.width === 0 || next.height === 0) return

      const prevX = engine.x.target
      const prevY = engine.y.target
      const movedSignificantly =
        Math.abs(next.x - prevX) > 2 || Math.abs(next.y - prevY) > 2

      setMapSize((prev) =>
        prev && prev.w === next.width && prev.h === next.height
          ? prev
          : { w: next.width, h: next.height }
      )

      if (instant || !initializedRef.current || !metricsRef.current.isMotionEnabled) {
        engine.x.value = engine.x.target = next.x
        engine.y.value = engine.y.target = next.y
        engine.w.value = engine.w.target = next.width
        engine.h.value = engine.h.target = next.height
        engine.x.velocity = 0
        engine.y.velocity = 0
        engine.w.velocity = 0
        engine.h.velocity = 0
        initializedRef.current = true
        paintRef.current()
      } else {
        loop.settle(engine.x, next.x)
        loop.settle(engine.y, next.y)
        loop.settle(engine.w, next.width)
        loop.settle(engine.h, next.height)

        if (movedSignificantly && !metricsRef.current.isLine) {
          triggerGlide()
        }
      }

      setHasRect(true)
    },
    [engine, loop, triggerGlide]
  )

  React.useLayoutEffect(() => {
    if (!isDragging) {
      measureActive(!initializedRef.current)
    }
  }, [ctx?.activeValue, isDragging, measureActive])

  React.useLayoutEffect(() => {
    if (hasRect) {
      paintRef.current()
    }
  }, [hasRect, resolvedVariant, isMobile])

  React.useEffect(() => {
    const container = listRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      if (!dragRef.current) {
        measureActive(true)
      }
    })
    ro.observe(container)

    const mo = new MutationObserver(() => {
      if (!dragRef.current) {
        measureActive(false)
      }
    })
    mo.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active"],
    })

    return () => {
      ro.disconnect()
      mo.disconnect()
      loop.stop()
      if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
    }
  }, [loop, measureActive])

  const handlePointerDown: NonNullable<
    TabsPrimitive.List.Props["onPointerDown"]
  > = (e) => {
    onPointerDown?.(e)
    if (!canScrub || e.button !== 0) return

    const container = listRef.current
    if (!container) return

    const targetEl = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-slot="tabs-trigger"]'
    )
    if (
      targetEl &&
      (targetEl.hasAttribute("disabled") ||
        targetEl.hasAttribute("data-disabled"))
    ) {
      return
    }

    const triggerEls = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-slot="tabs-trigger"]:not([disabled]):not([data-disabled])'
      )
    )
    if (triggerEls.length < 2) return

    const triggers = triggerEls.map((el) => ({
      el,
      value: el.getAttribute("data-tab-value") ?? "",
      left: el.offsetLeft,
      width: el.offsetWidth,
    }))

    const activeEl = container.querySelector<HTMLElement>(
      '[data-slot="tabs-trigger"][data-active]'
    )
    const anchorEl = activeEl ?? targetEl
    if (!anchorEl) return

    const first = triggers[0]
    const last = triggers[triggers.length - 1]
    const thumbW = anchorEl.offsetWidth

    if (glideTimerRef.current) {
      clearTimeout(glideTimerRef.current)
      glideTimerRef.current = null
    }
    loop.settle(engine.press, 1)

    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startThumbX: anchorEl.offsetLeft,
      thumbW,
      minX: first.left,
      maxX: last.left + last.width - thumbW,
      moved: false,
      triggers,
    }
  }

  const handlePointerMove: NonNullable<
    TabsPrimitive.List.Props["onPointerMove"]
  > = (e) => {
    onPointerMove?.(e)
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const dx = e.clientX - drag.startClientX
    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true
      setIsDragging(true)
      listRef.current?.setPointerCapture?.(e.pointerId)
    }

    if (!drag.moved) return

    const clampedX = Math.max(
      drag.minX - 6,
      Math.min(drag.maxX + 6, drag.startThumbX + dx)
    )
    const dropletCenter = clampedX + drag.thumbW / 2

    let hovered = drag.triggers[0]
    let bestDist = Infinity
    for (const t of drag.triggers) {
      const center = t.left + t.width / 2
      const dist = Math.abs(dropletCenter - center)
      if (dist < bestDist) {
        bestDist = dist
        hovered = t
      }
    }

    loop.settle(engine.x, clampedX)
    loop.settle(engine.w, hovered.width)
    setMapSize((prev) =>
      prev && prev.w === hovered.width
        ? prev
        : prev
          ? { w: hovered.width, h: prev.h }
          : null
    )

    if (hovered.value && hovered.value !== String(ctx?.activeValue ?? "")) {
      ctx?.selectValue(hovered.value)
    }
  }

  const finishDrag = (pointerId: number) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== pointerId) return

    const wasDragged = drag.moved
    dragRef.current = null
    setIsDragging(false)

    if (wasDragged) {
      try {
        listRef.current?.releasePointerCapture?.(pointerId)
      } catch {
        // Ignore if capture was already released
      }
      requestAnimationFrame(() => measureActive(false))
      loop.settle(engine.press, 0)
    } else if (!glideTimerRef.current) {
      loop.settle(engine.press, 0)
    }
  }

  const handlePointerUp: NonNullable<TabsPrimitive.List.Props["onPointerUp"]> =
    (e) => {
      onPointerUp?.(e)
      finishDrag(e.pointerId)
    }

  const handlePointerCancel: NonNullable<
    TabsPrimitive.List.Props["onPointerCancel"]
  > = (e) => {
    onPointerCancel?.(e)
    finishDrag(e.pointerId)
  }

  const pillRadiusClass =
    resolvedVariant === "default"
      ? "rounded-full md:rounded-[6.5px]"
      : "rounded-full"

  // Constant-tone resting active pill unaffected by global Liquid Glass tint
  const restingThumbClass =
    resolvedVariant === "tab-bar"
      ? "bg-[#ebebf0]/92 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_0.5px_0_rgba(255,255,255,0.85)] dark:bg-[#424248]/92 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_0.5px_0_rgba(255,255,255,0.18)]"
      : "bg-white shadow-[0_2px_10px_-1px_rgba(0,0,0,0.11),0_0.5px_2px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,1)] dark:bg-[#48484e]/95 dark:shadow-[0_2px_10px_rgba(0,0,0,0.34),inset_0_0.5px_0_rgba(255,255,255,0.22)]"

  const isGlassSurface =
    resolvedVariant === "glass" || resolvedVariant === "tab-bar"

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={resolvedVariant}
      data-dragging={isDragging ? "true" : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={cn(
        tabsListVariants({ variant: resolvedVariant }),
        canScrub && "touch-pan-y",
        className
      )}
      {...props}
    >
      {/* Low-blur sibling glass backdrop so background edges survive for the droplet to refract */}
      {isGlassSurface ? (
        <span
          aria-hidden="true"
          data-slot="tabs-glass-backdrop"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) [backdrop-filter:blur(calc(1.5px_+_var(--liquid-glass-tint,0.5)_*_6px))_saturate(var(--liquid-saturate))]"
        />
      ) : null}

      {/* Resting active pill at z-0 behind tab labels */}
      {hasRect && !isLine ? (
        <span
          ref={indicatorRef}
          aria-hidden="true"
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-0 will-change-transform",
            pillRadiusClass,
            restingThumbClass
          )}
        />
      ) : null}

      {/* Minimal underline indicator for variant="line" */}
      {hasRect && isLine ? (
        <span
          ref={lineIndicatorRef}
          aria-hidden="true"
          data-slot="tabs-line-indicator"
          className={cn(
            "pointer-events-none absolute z-10 rounded-full bg-(--apple-blue) will-change-transform",
            isHorizontal
              ? "bottom-0 left-0 h-[2px]"
              : "top-0 right-0 w-[2px]"
          )}
        />
      ) : null}

      {children}

      {maps && expandedMapW > 0 && expandedMapH > 0 ? (
        <LensFilter
          id={filterId}
          maps={maps}
          width={expandedMapW}
          height={expandedMapH}
          scale={peak * REST_RATIO}
          blur={0}
          specularOpacity={SPECULAR_OPACITY}
          specularSaturation={SPECULAR_SATURATION}
          colouredRimOpacity={COLOURED_RIM_OPACITY}
          dispersion={dispersion}
          scaleRef={scaleRef}
        />
      ) : null}

      {/* Scheme A: Pre-expanded CONVEX Crystal Droplet above icons/labels (z-20) */}
      {isMotionEnabled && hasRect && !isLine ? (
        <span
          ref={dropletRef}
          aria-hidden="true"
          data-slot="tabs-liquid-droplet"
          className="pointer-events-none absolute top-0 left-0 z-20 will-change-transform [--tabs-droplet-fill:rgba(255,255,255,0.16)] dark:[--tabs-droplet-fill:rgba(255,255,255,0.10)]"
          style={{
            borderRadius:
              resolvedVariant === "default" && !isMobile ? "12px" : "9999px",
            opacity: 0,
            visibility: "hidden",
            boxShadow:
              "0 10px 28px -4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.12), inset 0 1px 1.5px rgba(255,255,255,0.55), inset 0 -1px 1.5px rgba(255,255,255,0.28)",
            ...(maps
              ? {
                  backdropFilter: `url(#${filterId})`,
                  WebkitBackdropFilter: `url(#${filterId})`,
                }
              : null),
          }}
        />
      ) : null}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  value,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-tab-value={String(value ?? "")}
      value={value}
      className={cn(
        [
          "relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center font-medium whitespace-nowrap outline-none select-none",
          "transition-colors duration-200 ease-out",
          "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40",
          "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",

          // Vertical orientation defaults
          "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",

          // Variant: default (Apple Segmented Control: iOS 27 pill -> macOS 27 rounded)
          "group-data-[variant=default]/tabs-list:h-full group-data-[variant=default]/tabs-list:gap-1.5 group-data-[variant=default]/tabs-list:rounded-full group-data-[variant=default]/tabs-list:px-4 group-data-[variant=default]/tabs-list:text-[14px] md:group-data-[variant=default]/tabs-list:rounded-[6.5px] md:group-data-[variant=default]/tabs-list:px-3 md:group-data-[variant=default]/tabs-list:text-[13px]",
          "group-data-[variant=default]/tabs-list:text-foreground/75 group-data-[variant=default]/tabs-list:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:font-semibold group-data-[variant=default]/tabs-list:data-active:text-foreground",
          "group-data-[variant=default]/tabs-list:[&_svg:not([class*='size-'])]:size-4 md:group-data-[variant=default]/tabs-list:[&_svg:not([class*='size-'])]:size-3.5",

          // Variant: glass (Floating Liquid Glass Capsule Tabs)
          "group-data-[variant=glass]/tabs-list:min-h-10 group-data-[variant=glass]/tabs-list:gap-1.5 group-data-[variant=glass]/tabs-list:rounded-full group-data-[variant=glass]/tabs-list:px-4 group-data-[variant=glass]/tabs-list:text-[15px] md:group-data-[variant=glass]/tabs-list:min-h-8 md:group-data-[variant=glass]/tabs-list:px-3.5 md:group-data-[variant=glass]/tabs-list:text-[13.5px]",
          "group-data-[variant=glass]/tabs-list:text-neutral-700 group-data-[variant=glass]/tabs-list:hover:text-neutral-950 group-data-[variant=glass]/tabs-list:data-active:font-semibold group-data-[variant=glass]/tabs-list:data-active:text-neutral-950 dark:group-data-[variant=glass]/tabs-list:text-white/75 dark:group-data-[variant=glass]/tabs-list:hover:text-white dark:group-data-[variant=glass]/tabs-list:data-active:text-white",
          "group-data-[variant=glass]/tabs-list:[&_svg:not([class*='size-'])]:size-4",

          // Variant: tab-bar (iOS 27 stacked icon+label <-> macOS/iPad 27 inline pill)
          "group-data-[variant=tab-bar]/tabs-list:h-full group-data-[variant=tab-bar]/tabs-list:min-w-[64px] group-data-[variant=tab-bar]/tabs-list:flex-col group-data-[variant=tab-bar]/tabs-list:gap-0.5 group-data-[variant=tab-bar]/tabs-list:rounded-full group-data-[variant=tab-bar]/tabs-list:px-3 group-data-[variant=tab-bar]/tabs-list:text-[11px] group-data-[variant=tab-bar]/tabs-list:leading-tight",
          "md:group-data-[variant=tab-bar]/tabs-list:min-w-0 md:group-data-[variant=tab-bar]/tabs-list:flex-row md:group-data-[variant=tab-bar]/tabs-list:gap-2 md:group-data-[variant=tab-bar]/tabs-list:px-4 md:group-data-[variant=tab-bar]/tabs-list:text-[13.5px]",
          "group-data-[variant=tab-bar]/tabs-list:text-neutral-600 group-data-[variant=tab-bar]/tabs-list:hover:text-neutral-950 group-data-[variant=tab-bar]/tabs-list:data-active:font-semibold group-data-[variant=tab-bar]/tabs-list:data-active:text-neutral-950 dark:group-data-[variant=tab-bar]/tabs-list:text-white/70 dark:group-data-[variant=tab-bar]/tabs-list:hover:text-white dark:group-data-[variant=tab-bar]/tabs-list:data-active:text-white",
          "group-data-[variant=tab-bar]/tabs-list:[&_svg:not([class*='size-'])]:size-5 md:group-data-[variant=tab-bar]/tabs-list:[&_svg:not([class*='size-'])]:size-4",

          // Variant: line (Minimal underline)
          "group-data-[variant=line]/tabs-list:h-full group-data-[variant=line]/tabs-list:gap-1.5 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:text-[15px] md:group-data-[variant=line]/tabs-list:text-[13.5px]",
          "group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:data-active:font-semibold group-data-[variant=line]/tabs-list:data-active:text-(--apple-blue)",
          "group-data-[variant=line]/tabs-list:[&_svg:not([class*='size-'])]:size-4",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none data-[hidden]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
