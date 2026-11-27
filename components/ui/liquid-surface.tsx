"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"

import { useLiquidGlass } from "@/components/ui/liquid-glass-provider"
import {
  buildLensMaps,
  CONVEX,
  decodeLensMaps,
  isLensMapsReady,
  LENS_LIGHT_ANGLE,
  LensFilter,
  supportsRefraction,
  type LensFilterProps,
  type LensMaps,
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
  /**
   * Backdrop blur in px baked into the filter. Defaults to the tint-driven
   * panel blur (`2.5px` at Clear -> `18px` at Tinted).
   */
  blur?: number
  /**
   * In-filter material (`saturate`, `brightness`, tone curve) for control glass;
   * see `LensFilterProps`. Panels leave these off and grade via CSS instead.
   */
  material?: Pick<
    LensFilterProps,
    | "saturation"
    | "brightness"
    | "toneLift"
    | "toneRoll"
    | "specularOpacity"
    | "colouredRimOpacity"
  >
  /** @default true */
  enabled?: boolean
}

/**
 * Apple Liquid Glass "clear" control material, shared by glass `Button`s
 * (via `LiquiGlass`) and glass text fields (`Input`, `Textarea`) so a toolbar of
 * buttons next to a search field reads as one material, exactly like the
 * macOS 27 / iOS 27 system toolbars. Continuous in `tint` (0 Clear <-> 1 Tinted).
 *
 * The fields are tuned in `LiquiGlass` prop units (`tintFloor`, `frost`, ...).
 */
export function getLiquidControlMaterial(tint: number) {
  const t = Math.max(0, Math.min(1, tint))
  return {
    brightness: Number((1.08 - t * 0.04).toFixed(2)),
    tintFloor: Number((0.04 + t * 0.38).toFixed(2)),
    blur: Number((1.5 + t * 6.5).toFixed(1)),
    frost: Number((0.06 + t * 0.56).toFixed(2)),
    specular: Number((0.58 - t * 0.16).toFixed(2)),
    saturation: Number((1.7 + t * 0.3).toFixed(2)),
  }
}

/**
 * Resolves the control material the way `LiquiGlass` composites it, for
 * surfaces that cannot host its layer stack (a bare `<input>` / `<textarea>`).
 */
function resolveControlMaterial(tint: number) {
  const m = getLiquidControlMaterial(tint)
  return {
    // LiquiGlass: `blur + frost * 14`, and the tint layer's opacity
    blurPx: Math.round((m.blur + m.frost * 14) * 100) / 100,
    tintOpacity: Number((m.tintFloor + (1 - m.tintFloor) * m.frost).toFixed(3)),
    tone: `saturate(${m.saturation}) brightness(${m.brightness})`,
    filter: {
      saturation: m.saturation,
      brightness: m.brightness,
      // LiquiGlass refract-layer tone curve, eased off as the frost thickens
      toneLift: Math.round(180 * (1 - 0.45 * m.frost)) / 1e3,
      toneRoll: Math.round(140 * (1 - 0.45 * m.frost)) / 1e3,
      // LiquiGlass controls carry a white specular rim only, no coloured rim
      specularOpacity: m.specular,
      colouredRimOpacity: 0,
    },
  }
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
    blur,
    material,
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

  const [committedMaps, setCommittedMaps] = React.useState<LensMaps | null>(null)

  React.useEffect(() => {
    if (!maps) {
      setCommittedMaps(null)
      return
    }
    if (isLensMapsReady(maps)) {
      setCommittedMaps(maps)
      return
    }
    let cancelled = false
    void decodeLensMaps(maps).then(() => {
      if (!cancelled) {
        setCommittedMaps(maps)
      }
    })
    return () => {
      cancelled = true
    }
  }, [maps])

  const activeMaps = !maps ? null : isLensMapsReady(maps) ? maps : committedMaps

  // Continuous Clear (0) <-> Tinted (1) optical parameters:
  // At tint=0: crystal clear (low blur 2.5px, strong bezel bend)
  // At tint=1: frosted tinted glass (higher blur 18px, subtle bezel bend)
  const clampedTint = Math.max(0, Math.min(1, tint))
  const blurPx = blur ?? Number((2.5 + clampedTint * 15.5).toFixed(1))
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
    activeMaps && box ? (
      <LensFilter
        id={filterId}
        maps={activeMaps}
        width={box.w}
        height={box.h}
        scale={scalePx}
        blur={blurPx}
        specularOpacity={specularOpacity}
        specularSaturation={5}
        colouredRimOpacity={colouredRimOpacity}
        dispersion={activeDispersion}
        {...material}
      />
    ) : null

  return { filterId, refracting: filter !== null, filter, blurPx }
}

export interface LiquidFieldRefraction<T extends HTMLElement> {
  /** Callback ref for the field (also forwards to the caller's own `ref`). */
  ref: React.RefCallback<T>
  /**
   * Inline control material: `backdrop-filter` (SDF refraction on Chromium,
   * frosted blur elsewhere) plus `--lq-field-tint`, the tint layer opacity
   * consumed by `liquidFieldGlassClassName`. `undefined` when disabled.
   */
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
 *
 * The material (blur, saturation, brightness, tint density) is the same
 * `getLiquidControlMaterial()` a glass `Button` renders with, so fields and
 * buttons side by side are indistinguishable glass at every `tint`.
 */
export function useLiquidFieldRefraction<T extends HTMLElement>(
  enabled: boolean,
  forwardedRef?: React.Ref<T>
): LiquidFieldRefraction<T> {
  const { tint } = useLiquidGlass()
  const material = resolveControlMaterial(tint)
  const [node, setNode] = React.useState<T | null>(null)
  const { filterId, refracting, filter } = useLiquidRefraction(node, {
    radius: "auto",
    bezel: 12,
    heightRatio: 0.6,
    // 1px steps keep the thin rim aligned with the field edge
    quantize: 1,
    dpr: 2,
    blur: material.blurPx,
    material: material.filter,
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

  // Same tiers as LiquiGlass: refraction on Chromium (material graded inside
  // the filter, tone curve included), 2x frosted blur elsewhere
  const backdrop = refracting
    ? `url(#${filterId})`
    : `blur(${Math.max(material.blurPx * 2, 10)}px) ${material.tone}`

  return {
    ref,
    style: enabled
      ? {
          backdropFilter: backdrop,
          WebkitBackdropFilter: backdrop,
          ["--lq-field-tint" as string]: material.tintOpacity,
        }
      : undefined,
    portal: filter ? createPortal(filter, document.body) : null,
  }
}

/**
 * Surface classes for glass text fields, mirroring a clear glass `Button`:
 * the `--lq-tint` -> `--lq-tint-deep` wash at the button's tint-layer opacity,
 * a top-left catch-light rim and the same floating `--lq-shadow` elevation.
 * Pair with the inline style from `useLiquidFieldRefraction()`.
 */
export const liquidFieldGlassClassName = cn(
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--lq-tint)_calc(var(--lq-field-tint,0.45)*100%),transparent),color-mix(in_srgb,var(--lq-tint-deep)_calc(var(--lq-field-tint,0.45)*100%),transparent))]",
  "shadow-[inset_0_1px_1px_var(--lq-rim-hi,rgba(255,255,255,0.85)),inset_-1px_-1px_1px_var(--lq-rim-lo,rgba(255,255,255,0.28)),0_8px_20px_-4px_rgba(10,15,40,0.14),0_2px_6px_rgba(10,15,40,0.08)]",
  "hover:bg-white/14 focus-visible:bg-white/10 dark:hover:bg-white/10 dark:focus-visible:bg-white/8",
  // Same secondary label as glass Button content, legible at every tint
  "placeholder:text-(--lq-text-dim)"
)

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
