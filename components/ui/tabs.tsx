"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { LiquidLens } from "@/components/ui/liquid-lens"

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
    "group/tabs-list relative inline-flex w-fit items-center justify-center select-none",
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
   * Disables interactive drag-scrubbing and liquid lens magnification.
   */
  disableMotion?: boolean
  /**
   * Chromatic prism dispersion intensity on the floating liquid glass droplet
   * while pressing, dragging, or gliding across tabs (`0` disables, default `0.36`).
   */
  dispersion?: number
  /**
   * Refraction strength in px for the floating liquid glass droplet (default `46`).
   */
  refraction?: number
}

interface TabRect {
  x: number
  y: number
  width: number
  height: number
}

function TabsList({
  className,
  variant = "default",
  disableMotion = false,
  dispersion = 0.055,
  refraction = 28,
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
  const canScrub =
    isMotionEnabled && isHorizontal && resolvedVariant !== "line"

  const listRef = React.useRef<HTMLDivElement | null>(null)
  const initializedRef = React.useRef(false)
  const glideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [hasRect, setHasRect] = React.useState(false)
  const [isPressing, setIsPressing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isGliding, setIsGliding] = React.useState(false)

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

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const width = useMotionValue(0)
  const height = useMotionValue(0)

  const springConfig = isMobile
    ? LIQUID_SPRINGS.iosPress
    : LIQUID_SPRINGS.morph

  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  const springW = useSpring(width, springConfig)
  const springH = useSpring(height, springConfig)

  // Velocity-driven liquid droplet stretch & squash while gliding / dragging
  const vx = useVelocity(springX)
  const stretchX = useTransform(vx, [-1500, 0, 1500], [1.14, 1, 1.14])
  const squashY = useTransform(vx, [-1500, 0, 1500], [0.92, 1, 0.92])

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

      const prevX = x.get()
      const prevY = y.get()
      const movedSignificantly =
        Math.abs(next.x - prevX) > 2 || Math.abs(next.y - prevY) > 2

      if (instant || !initializedRef.current || !isMotionEnabled) {
        x.jump(next.x)
        y.jump(next.y)
        width.jump(next.width)
        height.jump(next.height)
        springX.jump(next.x)
        springY.jump(next.y)
        springW.jump(next.width)
        springH.jump(next.height)
        initializedRef.current = true
      } else {
        x.set(next.x)
        y.set(next.y)
        width.set(next.width)
        height.set(next.height)

        if (movedSignificantly && resolvedVariant !== "line") {
          setIsGliding(true)
          if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
          glideTimerRef.current = setTimeout(() => {
            setIsGliding(false)
          }, 380)
        }
      }

      setHasRect(true)
    },
    [
      height,
      isMotionEnabled,
      resolvedVariant,
      springH,
      springW,
      springX,
      springY,
      width,
      x,
      y,
    ]
  )

  React.useLayoutEffect(() => {
    if (!isDragging) {
      measureActive(!initializedRef.current)
    }
  }, [ctx?.activeValue, isDragging, measureActive])

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
      if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
    }
  }, [measureActive])

  const handlePointerDown: NonNullable<
    TabsPrimitive.List.Props["onPointerDown"]
  > = (e) => {
    onPointerDown?.(e)
    if (!canScrub || e.button !== 0) return

    const container = listRef.current
    if (!container) return

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
    const targetEl =
      (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-slot="tabs-trigger"]'
      ) ?? activeEl

    if (!targetEl) return

    const first = triggers[0]
    const last = triggers[triggers.length - 1]
    const thumbW = activeEl ? activeEl.offsetWidth : targetEl.offsetWidth

    setIsPressing(true)
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startThumbX: activeEl ? activeEl.offsetLeft : targetEl.offsetLeft,
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

    x.set(clampedX)
    width.set(hovered.width)

    if (hovered.value && hovered.value !== String(ctx?.activeValue ?? "")) {
      ctx?.selectValue(hovered.value)
    }
  }

  const finishDrag = (pointerId: number) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== pointerId) return

    const wasDragged = drag.moved
    dragRef.current = null
    setIsPressing(false)
    setIsDragging(false)

    if (wasDragged) {
      try {
        listRef.current?.releasePointerCapture?.(pointerId)
      } catch {
        // Ignore if capture was already released
      }
      requestAnimationFrame(() => measureActive(false))
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

  const showLiquidLens =
    isMotionEnabled &&
    hasRect &&
    resolvedVariant !== "line" &&
    (isDragging || isGliding || isPressing)

  const pillRadiusClass =
    resolvedVariant === "default"
      ? "rounded-full md:rounded-[6.5px]"
      : "rounded-full"

  // Spotless Apple native resting active pill — constant tone unaffected by global
  // Liquid Glass transparency/tint so vivid wallpapers never bleed into the active indicator.
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
      {/* Dedicated sibling glass backdrop layer so TabsList itself is not a Backdrop Root
          and LiquidLens can cleanly sample the full scene even at tint = 0 (Clear) */}
      {isGlassSurface ? (
        <span
          aria-hidden="true"
          data-slot="tabs-glass-backdrop"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]"
        />
      ) : null}

      {/* Spotless resting active pill (sits cleanly above backdrop at z-0, behind labels at z-10) */}
      {hasRect && resolvedVariant !== "line" ? (
        <motion.span
          aria-hidden="true"
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-0 will-change-transform",
            pillRadiusClass,
            restingThumbClass
          )}
          style={{
            x: springX,
            y: springY,
            width: springW,
            height: springH,
            scaleX: isDragging || isGliding ? stretchX : 1,
            scaleY: isDragging || isGliding ? squashY : 1,
          }}
          animate={{
            opacity: showLiquidLens ? 0 : 1,
          }}
          transition={{ duration: 0.14 }}
        />
      ) : null}

      {/* Minimal underline indicator for variant="line" */}
      {hasRect && resolvedVariant === "line" ? (
        <motion.span
          aria-hidden="true"
          data-slot="tabs-line-indicator"
          className={cn(
            "pointer-events-none absolute z-10 rounded-full bg-(--apple-blue)",
            isHorizontal
              ? "bottom-0 left-0 h-[2px]"
              : "top-0 right-0 w-[2px]"
          )}
          style={
            isHorizontal
              ? { x: springX, width: springW }
              : { y: springY, height: springH }
          }
        />
      ) : null}

      {children}

      {/* Apple iOS 26/27 Floating Crystal Liquid Glass Droplet:
          Stays pre-mounted so the SVG displacement filter is warm on frame 0.
          Expands physically (-inset-x-2 -inset-y-1.5) so filterUnits="userSpaceOnUse"
          matches the protruding droplet 1:1 with crystal-clear center and vivid rainbow prism rim. */}
      {isMotionEnabled && hasRect && resolvedVariant !== "line" ? (
        <motion.div
          aria-hidden="true"
          data-slot="tabs-liquid-droplet"
          className="pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
          style={{
            x: springX,
            y: springY,
            width: springW,
            height: springH,
            scaleX: isDragging || isGliding ? stretchX : 1,
            scaleY: isDragging || isGliding ? squashY : 1,
          }}
          initial={false}
          animate={{
            opacity: showLiquidLens ? 1 : 0,
          }}
          transition={{ duration: showLiquidLens ? 0.12 : 0.18 }}
        >
          <LiquidLens
            radius={resolvedVariant === "default" && !isMobile ? 12 : 999}
            bezel={isMobile ? 14 : 11}
            refraction={refraction}
            dispersion={dispersion}
            blur={0}
            saturation={1.05}
            className="absolute -inset-x-2 -inset-y-1.5"
          />
        </motion.div>
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
