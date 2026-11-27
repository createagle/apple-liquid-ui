"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

import { useLiquidGlass } from "@/components/ui/liquid-glass-provider"
import {
  buildLensMaps,
  CONVEX,
  LENS_LIGHT_ANGLE,
  LensFilter,
  supportsRefraction,
} from "@/components/ui/liquid-lens"

export interface LiquidSurfaceBackdropProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Corner radius of the host surface in CSS px (matched to container's `rounded-[...]`).
   * @default 26
   */
  radius?: number
  /**
   * Width of the sculpted optical refraction bezel band in CSS px.
   * @default 22
   */
  bezel?: number
  /**
   * Refraction intensity multiplier (scaled down smoothly as `tint` approaches 1).
   * @default 1
   */
  refraction?: number
  /**
   * Subtle chromatic dispersion along the curved bezel rim.
   * @default 0.055
   */
  dispersion?: number
  /**
   * Surface tone variant:
   * - `sheet`: large floating surfaces (Dialog, AlertDialog, Mobile Drawer Sheet)
   * - `menu`: compact floating menus & popovers (Select, DropdownMenu, Popover)
   * @default "sheet"
   */
  tone?: "sheet" | "menu"
  /**
   * Keep the bottom edge square/open (no bottom-left/bottom-right corner radius or bottom rim).
   * Useful for bottom-docked edge-to-edge mobile Drawers.
   * @default false
   */
  openBottom?: boolean
}

export interface LiquidRefractionOptions {
  /**
   * Corner radius in CSS px, or `"auto"` to read the element's computed
   * `border-top-left-radius` (clamped to a capsule).
   * @default 26
   */
  radius?: number | "auto"
  /** Width of the sculpted bezel band in CSS px. @default 22 */
  bezel?: number
  /** Refraction intensity multiplier. @default 1 */
  refraction?: number
  /** Chromatic dispersion along the bezel rim. @default 0.055 */
  dispersion?: number
  /** Keep the bottom edge square/open. @default false */
  openBottom?: boolean
  /** Peak displacement in CSS px at `tint = 0`. @default 32 */
  scale?: number
  /**
   * Caps the peak displacement to `height * heightRatio` so short controls
   * (e.g. a 34px text field) bend proportionally instead of warping.
   */
  heightRatio?: number
  /** Snap the measured size to this step (px) before rebuilding maps. @default 4 */
  quantize?: number
  /** Map resolution multiplier. @default 1 */
  dpr?: number
  /** @default true */
  enabled?: boolean
}

export interface LiquidRefraction {
  /** SVG filter id to reference from `backdrop-filter: url(#id)`. */
  filterId: string
  /** `true` once the SDF filter is ready (Chromium only). */
  refracting: boolean
  /** The `<LensFilter>` SVG node to mount (in place or via a portal). */
  filter: React.ReactNode
  /** Tint-driven blur radius in px (also used for the CSS fallback). */
  blurPx: number
}

/**
 * Measures an element and builds its rounded-rect SDF bezel refraction filter,
 * continuously driven by `LiquidGlassProvider` (`tint`: 0 Clear <-> 1 Tinted).
 * Shared by `LiquidSurfaceBackdrop` (panels) and glass text fields.
 */
export function useLiquidRefraction(
  element: HTMLElement | null,
  {
    radius = 26,
    bezel = 22,
    refraction = 1,
    dispersion = 0.055,
    openBottom = false,
    scale = 32,
    heightRatio,
    quantize = 4,
    dpr = 1,
    enabled = true,
  }: LiquidRefractionOptions = {}
): LiquidRefraction {
  const { tint } = useLiquidGlass()
  const filterId = `apple-surface-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const [box, setBox] = React.useState<{
    w: number
    h: number
    r: number
  } | null>(null)
  const [canRefract, setCanRefract] = React.useState(false)

  React.useLayoutEffect(() => {
    if (!enabled || !element) return
    setCanRefract(supportsRefraction())
    const step = Math.max(1, quantize)

    const update = () => {
      // Layout (border-box) size: unaffected by padding or open/close transforms
      const qw = Math.max(2, Math.round(element.offsetWidth / step) * step)
      const qh = Math.max(2, Math.round(element.offsetHeight / step) * step)
      if (qw <= 4 || qh <= 4) return
      const r =
        radius === "auto"
          ? Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) ||
            0
          : radius
      setBox((prev) =>
        prev && prev.w === qw && prev.h === qh && prev.r === r
          ? prev
          : { w: qw, h: qh, r }
      )
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(element)
    return () => ro.disconnect()
  }, [element, enabled, quantize, radius])

  const maps = React.useMemo(() => {
    if (!enabled || !box || !canRefract) return null
    const clampedR = Math.min(
      box.r,
      box.w / 2,
      openBottom ? box.h : box.h / 2
    )
    const clampedB = Math.min(bezel, Math.min(box.w, box.h) / 3)
    return buildLensMaps({
      width: box.w,
      height: box.h,
      radius: clampedR,
      bezel: Math.max(8, clampedB),
      surface: CONVEX,
      curvature: 0,
      lightAngle: LENS_LIGHT_ANGLE,
      openBottom,
      dpr,
    })
  }, [bezel, box, canRefract, dpr, enabled, openBottom])

  // Continuous Clear (0) <-> Tinted (1) optical parameters:
  // At tint=0: crystal clear (low blur 2.5px, strong bezel bend)
  // At tint=1: frosted tinted glass (higher blur 18px, subtle bezel bend)
  const clampedTint = Math.max(0, Math.min(1, tint))
  const blurPx = Number((2.5 + clampedTint * 15.5).toFixed(1))
  const peak =
    heightRatio && box ? Math.min(scale, box.h * heightRatio) : scale
  const scalePx = Number(
    (peak * refraction * (1 - clampedTint * 0.65)).toFixed(1)
  )
  const specularOpacity = Number((0.42 - clampedTint * 0.24).toFixed(2))
  const colouredRimOpacity = Number((0.75 - clampedTint * 0.5).toFixed(2))
  const activeDispersion =
    clampedTint < 0.85
      ? Number((dispersion * (1 - clampedTint * 0.65)).toFixed(3))
      : 0

  const filter =
    maps && box ? (
      <LensFilter
        id={filterId}
        maps={maps}
        width={box.w}
        height={box.h}
        scale={scalePx}
        blur={blurPx}
        specularOpacity={specularOpacity}
        specularSaturation={5}
        colouredRimOpacity={colouredRimOpacity}
        dispersion={activeDispersion}
      />
    ) : null

  return { filterId, refracting: filter !== null, filter, blurPx }
}

export interface LiquidFieldRefraction<T extends HTMLElement> {
  /** Callback ref for the field (also forwards to the caller's own `ref`). */
  ref: React.RefCallback<T>
  /** Inline `backdrop-filter` while refracting; `undefined` keeps the CSS blur fallback. */
  style: React.CSSProperties | undefined
  /** Portaled SVG `<filter>`; render it next to the field. */
  portal: React.ReactNode
}

/**
 * SDF bezel refraction for glass text fields (`Input`, `Textarea`).
 *
 * `<input>` / `<textarea>` cannot host a backdrop layer, so the filter is applied
 * straight onto the field via `backdrop-filter: url(#id)` and the SVG `<filter>`
 * is portaled to `document.body`: the DOM stays a single form element. The
 * displacement is capped to the field height so a 34px capsule bends cleanly.
 */
export function useLiquidFieldRefraction<T extends HTMLElement>(
  enabled: boolean,
  forwardedRef?: React.Ref<T>
): LiquidFieldRefraction<T> {
  const [node, setNode] = React.useState<T | null>(null)
  const { filterId, refracting, filter } = useLiquidRefraction(node, {
    radius: "auto",
    bezel: 12,
    heightRatio: 0.6,
    // 1px steps keep the thin rim aligned with the field edge
    quantize: 1,
    dpr: 2,
    enabled,
  })

  const ref = React.useCallback(
    (element: T | null) => {
      // Ignore detach (`null`) so a changing caller ref never toggles state
      if (element) setNode(element)
      if (typeof forwardedRef === "function") {
        forwardedRef(element)
      } else if (forwardedRef) {
        forwardedRef.current = element
      }
    },
    [forwardedRef]
  )

  const value = `url(#${filterId}) saturate(var(--liquid-saturate, 1.75))`

  return {
    ref,
    style: refracting
      ? { backdropFilter: value, WebkitBackdropFilter: value }
      : undefined,
    portal: filter ? createPortal(filter, document.body) : null,
  }
}

/**
 * Shared Apple Liquid Glass optical refraction backdrop for large floating
 * containers (Dialog, AlertDialog, Select, Drawer, Popover, DropdownMenu).
 *
 * Renders as an independent `-z-10` sibling layer so:
 * 1. The container's curved bezel refracts the live background with a true
 *    SVG `<feDisplacementMap>` SDF lens (while keeping the center flat & crisp
 *    for text legibility).
 * 2. The parent element never needs `backdrop-filter`, preventing nested
 *    Backdrop Root conflicts for child `LiquidLens` controls (Switch, Slider, Tabs).
 * 3. Continuously responds to `LiquidGlassProvider` (`tint`: 0 Clear <-> 1 Tinted)
 *    and degrades gracefully to translucent CSS glass on Safari / Firefox.
 */
export function LiquidSurfaceBackdrop({
  radius = 26,
  bezel = 22,
  refraction = 1,
  dispersion = 0.055,
  tone = "sheet",
  openBottom = false,
  className,
  style,
  ...props
}: LiquidSurfaceBackdropProps) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const { filterId, refracting, filter, blurPx } = useLiquidRefraction(node, {
    radius,
    bezel,
    refraction,
    dispersion,
    openBottom,
    // DPR 1 is visually identical for smooth large-surface displacement maps and keeps canvas build < 3ms
    dpr: 1,
  })

  const backdropFilterValue = refracting
    ? `url(#${filterId}) saturate(var(--liquid-saturate, 1.75))`
    : `blur(var(--liquid-blur, ${blurPx}px)) saturate(var(--liquid-saturate, 1.75))`

  return (
    <div
      ref={setNode}
      aria-hidden="true"
      data-slot="liquid-surface-backdrop"
      data-tone={tone}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]",
        openBottom && "rounded-b-none",
        tone === "menu"
          ? "bg-(--liquid-surface-menu)"
          : "bg-(--liquid-surface-sheet)",
        className
      )}
      style={{
        backdropFilter: backdropFilterValue,
        WebkitBackdropFilter: backdropFilterValue,
        ...style,
      }}
      {...props}
    >
      {filter}
    </div>
  )
}
