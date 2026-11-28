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
  type LensMaps,
} from "@/components/ui/liquid-lens"

/* -------------------------------------------------------------------------- */
/* Material                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Apple 27 UI Kit Liquid Glass size classes. Apple ships a single Liquid Glass
 * material whose optics scale with the surface: the larger it gets, the thicker
 * (more blur, softer scattering) it reads.
 *
 * - `small`: controls (glass `Button`, `Input`, `Textarea`) — `Regular - Small`
 * - `menu`: menus, popovers, tooltips, select lists — `Menus`
 * - `medium`: cards, toasts, calendars, command palette — `Regular - Medium`
 * - `large`: dialogs, sheets, drawers, sidebars — `Regular - Large`
 */
export type LiquidGlassSize = "small" | "menu" | "medium" | "large"

/**
 * Sketch glass-blur specs from `Apple macOS 27 UI Kit` / `Apple iOS 27 UI Kit`
 * (`Liquid Glass/{Light,Dark}/Regular - Small|Medium|Large`, `Menus`, `Clear`).
 * `blur` is the Sketch radius at Regular; `distortion` is the kit's lens
 * distortion. The kits set `chromaticAberrationMultiplier: 0` on every style.
 */
const GLASS_SPECS: Record<LiquidGlassSize, { blur: number; distortion: number }> = {
  small: { blur: 6, distortion: 0.4 },
  menu: { blur: 20, distortion: 0.3 },
  medium: { blur: 24, distortion: 0.3 },
  large: { blur: 30, distortion: 0.3 },
}
/**
 * Backdrop blur (CSS `stdDeviation`, px) at Clear and at Tinted.
 *
 * Like Apple's own Clear <-> Tinted setting, the tint mainly dials *opacity*
 * (the fill wash), not blur: the glass stays lightly frosted across the whole
 * range so the backdrop keeps reading through it — just lighter and lower
 * contrast — until the fill covers it near Tinted. Controls stay nearly
 * crystal clear like the Tabs / Slider lenses.
 */
const GLASS_BLUR: Record<LiquidGlassSize, { clear: number; tinted: number }> = {
  small: { clear: 0.5, tinted: 2 },
  menu: { clear: 1, tinted: 4.5 },
  medium: { clear: 1, tinted: 5 },
  large: { clear: 1, tinted: 6 },
}

export interface LiquidGlassMaterial {
  /** Gaussian blur (CSS `stdDeviation`, px) baked into the refraction filter. */
  blurPx: number
  /**
   * Refraction gain: `1.6` at Clear -> `1` at Regular -> `0.4` at Tinted.
   * Like Apple's native glass, the lens reads strongest when the glass is
   * clearest and fades out as the tint frosts it over.
   */
  refractionGain: number
  /** Peak bezel displacement per px of bezel width (panels). */
  displacementPerBezel: number
  /** White specular rim opacity. */
  specularOpacity: number
  /** Coloured (backdrop-saturated) rim opacity. */
  colouredRimOpacity: number
  /**
   * Opacity of the control fill layer (`small` only): the `--lq-tint` wash that
   * gives clear glass controls their body. Panels use `--liquid-surface-*`.
   */
  fillOpacity: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const round = (v: number, digits = 2) => Number(v.toFixed(digits))

/**
 * The single Liquid Glass material, continuous in `tint`
 * (`0` Clear -> `0.5` Regular (kit values) -> `1` Tinted) and scaled by size.
 * Every glass surface and control in the library resolves its optics here, so
 * a glass button, a glass field and the popover they sit next to are the same
 * material at every tint.
 */
export function getLiquidGlassMaterial(
  size: LiquidGlassSize,
  tint: number
): LiquidGlassMaterial {
  const t = clamp01(tint)
  const spec = GLASS_SPECS[size]
  // Sketch blur radius -> CSS stdDeviation (radius / 2)
  // Perceptual ease-in, shared with the CSS `--liquid-glass-ease` token: the
  // fill (opacity) grows slowly at first and covers the backdrop near Tinted,
  // so the transition spreads across the whole slider
  const ease = 0.3 * t + 0.7 * t * t
  const { clear, tinted } = GLASS_BLUR[size]
  const blurPx = clear + (tinted - clear) * t

  // Clear shows the most bend, Tinted frosts it away
  const refractionGain = 1.6 - 1.2 * t
  const displacementPerBezel = spec.distortion * 3 * refractionGain

  return {
    blurPx: round(blurPx, 1),
    refractionGain: round(refractionGain, 3),
    displacementPerBezel: round(displacementPerBezel, 3),
    specularOpacity: round(0.5 - t * 0.25),
    colouredRimOpacity: round(0.6 - t * 0.45),
    // Control body wash: thin at Clear, dense at Tinted
    fillOpacity: round(0.06 + 0.9 * ease, 3),
  }
}

/* -------------------------------------------------------------------------- */
/* Over-Glass context                                                         */
/* -------------------------------------------------------------------------- */

const OverGlassContext = React.createContext(false)

/**
 * Marks its subtree as sitting on a Liquid Glass surface ("Over-Glass" in the
 * Apple 27 UI Kits). Glass surfaces (Dialog, Popover, Sheet, Drawer, glass Card,
 * Toast, ...) wrap their content in it, so controls inside automatically switch
 * from their own glass to the kit's flat Over-Glass fills — Apple never stacks
 * glass on glass.
 */
function OverGlass({
  enabled = true,
  children,
}: {
  enabled?: boolean
  children?: React.ReactNode
}) {
  if (!enabled) return <>{children}</>
  return (
    <OverGlassContext.Provider value={true}>{children}</OverGlassContext.Provider>
  )
}

/** `true` when rendered inside a Liquid Glass surface (`<OverGlass>`). */
function useOverGlass() {
  return React.useContext(OverGlassContext)
}

/* -------------------------------------------------------------------------- */
/* Refraction                                                                 */
/* -------------------------------------------------------------------------- */

export interface LiquidRefractionOptions {
  /** Material size class. @default "large" */
  size?: LiquidGlassSize
  /**
   * Corner radius in CSS px, or `"auto"` to read the element's computed
   * `border-top-left-radius` (clamped to a capsule).
   * @default 26
   */
  radius?: number | "auto"
  /** Width of the sculpted bezel band in CSS px. @default 22 */
  bezel?: number
  /**
   * Bezel width as a fraction of the corner radius (overrides `bezel`), the
   * geometry of the Tabs / Slider / Switch lenses (`0.42..0.48 * r`).
   */
  bezelRatio?: number
  /**
   * Spherical dome across the whole lens (`-1..1`, `> 0` magnifies), so the
   * backdrop bends through the entire control, not only along the rim.
   * @default 0
   */
  curvature?: number
  /**
   * Peak displacement as a fraction of the shorter side at Regular (scaled by
   * the material's `refractionGain`). Defaults to the bezel-based panel optics.
   */
  peakRatio?: number
  /** Refraction intensity multiplier. @default 1 */
  refraction?: number
  /** Chromatic dispersion along the bezel rim (the kits use none). @default 0 */
  dispersion?: number
  /** Keep the bottom edge square/open. @default false */
  openBottom?: boolean
  /**
   * Caps the peak displacement to `height * heightRatio` so short controls
   * bend proportionally instead of warping.
   */
  heightRatio?: number
  /** Snap the measured size to this step (px) before rebuilding maps. @default 4 */
  quantize?: number
  /** Map resolution multiplier. @default 1 */
  dpr?: number
  /** @default true */
  enabled?: boolean
}

/** Tint quantization for the refraction filter (0.02 steps). */
const TINT_STEPS = 50

/** Tint-driven `<LensFilter>` attributes held by one double-buffer slot. */
interface FilterParams {
  key: string
  scale: number
  blur: number
  specularOpacity: number
  colouredRimOpacity: number
  dispersion: number
}

/**
 * Double-buffered SVG filter switching.
 *
 * Chromium does not repaint a `backdrop-filter: url(#id)` when the referenced
 * filter's attributes change, and re-pointing it at a *new* filter id repaints
 * with a frame or two of missing refraction (the fresh resource and its
 * `feImage` maps are not ready yet), which flickers while dragging the tint.
 * Two filters therefore stay mounted: new params are written into the idle one
 * (unreferenced, so it can change freely) and, once that has been painted, the
 * surface switches its reference to it. Every switch targets a filter that is
 * already resolved, so the glass updates smoothly without flashing.
 */
function useFilterDoubleBuffer(params: FilterParams) {
  const [slots, setSlots] = React.useState<{
    params: [FilterParams, FilterParams]
    active: 0 | 1
  }>(() => ({ params: [params, params], active: 0 }))
  const frameRef = React.useRef(0)
  const latest = React.useRef(params)
  latest.current = params

  React.useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  React.useEffect(() => {
    const { params: buffered, active } = slots
    if (buffered[active].key === params.key) return
    const idle = (1 - active) as 0 | 1
    if (buffered[idle].key !== params.key) {
      // Write the idle (unreferenced) filter first
      setSlots((s) => {
        const next: [FilterParams, FilterParams] = [s.params[0], s.params[1]]
        next[(1 - s.active) as 0 | 1] = latest.current
        return { ...s, params: next }
      })
      return
    }
    if (frameRef.current) return
    // Let the idle filter's new attributes paint once, then point at it
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        setSlots((s) => ({ ...s, active: (1 - s.active) as 0 | 1 }))
      })
    })
  }, [params.key, slots])

  return slots
}

export interface LiquidRefraction {
  /** SVG filter id to reference from `backdrop-filter: url(#id)`. */
  filterId: string
  /** `true` once the SDF filter is ready (Chromium only). */
  refracting: boolean
  /** The `<LensFilter>` SVG node to mount (in place or via a portal). */
  filter: React.ReactNode
  /** Resolved material for the current `tint`. */
  material: LiquidGlassMaterial
  /** `backdrop-filter` value: SDF refraction, or frosted blur where unsupported. */
  backdropFilter: string
}

/**
 * Measures an element and builds its rounded-rect SDF bezel refraction filter
 * from the shared Liquid Glass material, continuously driven by
 * `LiquidGlassProvider` (`tint`: 0 Clear <-> 1 Tinted).
 */
export function useLiquidRefraction(
  element: HTMLElement | null,
  {
    size = "large",
    radius = 26,
    bezel = 22,
    bezelRatio,
    curvature = 0,
    peakRatio,
    refraction = 1,
    dispersion = 0,
    openBottom = false,
    heightRatio,
    quantize = 4,
    dpr = 1,
    enabled = true,
  }: LiquidRefractionOptions = {}
): LiquidRefraction {
  const { tint: rawTint } = useLiquidGlass()
  // Quantized so a tint drag switches filters at most every 0.02
  const tint = Math.round(clamp01(rawTint) * TINT_STEPS) / TINT_STEPS
  const material = getLiquidGlassMaterial(size, tint)
  const baseId = `apple-surface-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
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

  const clampedR = box
    ? Math.min(box.r, box.w / 2, openBottom ? box.h : box.h / 2)
    : 0
  const clampedBezel = box
    ? bezelRatio
      ? Math.max(2, bezelRatio * clampedR)
      : Math.max(6, Math.min(bezel, Math.min(box.w, box.h) / 3))
    : bezel

  const maps = React.useMemo(() => {
    if (!enabled || !box || !canRefract) return null
    return buildLensMaps({
      width: box.w,
      height: box.h,
      radius: clampedR,
      bezel: clampedBezel,
      surface: CONVEX,
      curvature,
      lightAngle: LENS_LIGHT_ANGLE,
      openBottom,
      dpr,
    })
  }, [box, canRefract, clampedBezel, clampedR, curvature, dpr, enabled, openBottom])

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

  const peak =
    (peakRatio && box
      ? peakRatio * Math.min(box.w, box.h) * material.refractionGain
      : material.displacementPerBezel * clampedBezel) * refraction
  const scalePx = round(
    heightRatio && box ? Math.min(peak, box.h * heightRatio) : peak,
    1
  )
  const activeDispersion =
    tint < 0.85 ? round(dispersion * (1 - tint * 0.65), 3) : 0

  const { params: buffered, active } = useFilterDoubleBuffer({
    key: `${scalePx}|${material.blurPx}|${material.specularOpacity}|${material.colouredRimOpacity}|${activeDispersion}`,
    scale: scalePx,
    blur: material.blurPx,
    specularOpacity: material.specularOpacity,
    colouredRimOpacity: material.colouredRimOpacity,
    dispersion: activeDispersion,
  })
  const filterId = `${baseId}-${active}`

  const filter =
    activeMaps && box ? (
      <>
        {buffered.map((p, i) => (
          <LensFilter
            key={i}
            id={`${baseId}-${i}`}
            maps={activeMaps}
            width={box.w}
            height={box.h}
            scale={p.scale}
            blur={p.blur}
            specularOpacity={p.specularOpacity}
            specularSaturation={5}
            colouredRimOpacity={p.colouredRimOpacity}
            dispersion={p.dispersion}
          />
        ))}
      </>
    ) : null

  const refracting = filter !== null
  // Same saturation boost on every tier; frosted fallback doubles the blur to
  // stand in for the missing lens on Safari / Firefox
  const backdropFilter = refracting
    ? `url(#${filterId}) saturate(var(--liquid-saturate, 1.75))`
    : `blur(${Math.max(material.blurPx * 2, 6)}px) saturate(var(--liquid-saturate, 1.75))`

  return { filterId, refracting, filter, material, backdropFilter }
}

/* -------------------------------------------------------------------------- */
/* Control glass (Button / Input / Textarea)                                  */
/* -------------------------------------------------------------------------- */

/**
 * Shared optics for `small` control glass, matching the Tabs / Slider lenses:
 * a radius-proportional rim, a gentle magnifying dome across the whole control
 * and a peak displacement relative to its height (`0.67h` at Clear ->
 * `0.42h` Regular -> `0.17h` Tinted), with crisp 2x maps.
 */
const CONTROL_REFRACTION: LiquidRefractionOptions = {
  size: "small",
  radius: "auto",
  bezelRatio: 0.48,
  curvature: 0.18,
  peakRatio: 0.42,
  // 1px steps keep the thin rim aligned with the control edge
  quantize: 1,
  dpr: 2,
}

/**
 * Fill + rim classes for `small` control glass, shared by glass `Button`s and
 * glass text fields so they read as one material side by side: the
 * `--lq-tint` -> `--lq-tint-deep` wash at `--lq-glass-fill` opacity, a
 * top-left catch-light rim and the kit's soft `Regular - Small` drop shadow.
 */
export const liquidControlGlassClassName = cn(
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--lq-tint)_calc(var(--lq-glass-fill,0.45)*100%),transparent),color-mix(in_srgb,var(--lq-tint-deep)_calc(var(--lq-glass-fill,0.45)*100%),transparent))]",
  "shadow-[inset_0_1px_1px_var(--lq-rim-hi,rgba(255,255,255,0.85)),inset_-1px_-1px_1px_var(--lq-rim-lo,rgba(255,255,255,0.28)),0_8px_20px_-4px_rgba(10,15,40,0.14),0_2px_6px_rgba(10,15,40,0.08)]"
)

/**
 * Surface classes for glass text fields: control glass plus hover / focus washes
 * and the glass secondary label. Pair with `useLiquidFieldRefraction()`.
 */
export const liquidFieldGlassClassName = cn(
  liquidControlGlassClassName,
  "hover:bg-white/14 focus-visible:bg-white/10 dark:hover:bg-white/10 dark:focus-visible:bg-white/8",
  "placeholder:text-(--lq-text-dim)"
)

export interface LiquidFieldRefraction<T extends HTMLElement> {
  /** Callback ref for the field (also forwards to the caller's own `ref`). */
  ref: React.RefCallback<T>
  /**
   * Inline control material: `backdrop-filter` plus `--lq-glass-fill`, the
   * fill opacity consumed by `liquidFieldGlassClassName`. `undefined` when off.
   */
  style: React.CSSProperties | undefined
  /** Portaled SVG `<filter>`; render it next to the field. */
  portal: React.ReactNode
}

/**
 * Small-glass refraction applied straight onto a form element.
 *
 * `<input>` / `<textarea>` cannot host a backdrop layer, so the filter is applied
 * on the field itself via `backdrop-filter: url(#id)` and the SVG `<filter>` is
 * portaled to `document.body`: the DOM stays a single form element. The optics
 * are exactly those of `<LiquidSurfaceBackdrop size="small">` used by glass
 * buttons.
 */
export function useLiquidFieldRefraction<T extends HTMLElement>(
  enabled: boolean,
  forwardedRef?: React.Ref<T>
): LiquidFieldRefraction<T> {
  const [node, setNode] = React.useState<T | null>(null)
  const { filter, material, backdropFilter } = useLiquidRefraction(node, {
    ...CONTROL_REFRACTION,
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

  return {
    ref,
    style: enabled
      ? {
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          ["--lq-glass-fill" as string]: material.fillOpacity,
        }
      : undefined,
    portal: filter ? createPortal(filter, document.body) : null,
  }
}

/* -------------------------------------------------------------------------- */
/* Glass layer                                                                */
/* -------------------------------------------------------------------------- */

export interface LiquidSurfaceBackdropProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Material size class (Apple 27 UI Kit). Defaults from `tone`, else `"large"`.
   */
  size?: LiquidGlassSize
  /**
   * @deprecated Use `size`. `"menu"` -> `size="menu"`, `"sheet"` -> `size="large"`.
   */
  tone?: "sheet" | "menu"
  /**
   * Corner radius of the host in CSS px (matched to its `rounded-[...]`), or
   * `"auto"` to read it from the computed style.
   * @default 26 (`"auto"` for `small`)
   */
  radius?: number | "auto"
  /**
   * Width of the sculpted optical refraction bezel band in CSS px.
   * @default 22 (12 for `small`)
   */
  bezel?: number
  /** Refraction intensity multiplier. @default 1 */
  refraction?: number
  /** Chromatic dispersion along the rim (the Apple kits use none). @default 0 */
  dispersion?: number
  /**
   * Keep the bottom edge square/open (no bottom corner radius or bottom rim).
   * Useful for bottom-docked edge-to-edge mobile Drawers.
   * @default false
   */
  openBottom?: boolean
}

/**
 * The Liquid Glass layer: an independent `-z-10` child that turns its host into
 * glass. Used by every glass surface (Dialog, Popover, Select, Drawer, Card, ...)
 * and by glass `Button`s (`size="small"`).
 *
 * 1. The curved bezel refracts the live backdrop with a true SVG
 *    `<feDisplacementMap>` SDF lens while the center stays flat for legibility.
 * 2. The host never needs `backdrop-filter`, avoiding nested Backdrop Roots that
 *    would cut off child `LiquidLens` controls (Switch, Slider, Tabs).
 * 3. Optics come from `getLiquidGlassMaterial()`, continuous in `tint`, and fall
 *    back to frosted CSS glass on Safari / Firefox.
 */
export function LiquidSurfaceBackdrop({
  size: sizeProp,
  tone,
  radius,
  bezel,
  refraction = 1,
  dispersion = 0,
  openBottom = false,
  className,
  style,
  ...props
}: LiquidSurfaceBackdropProps) {
  const size: LiquidGlassSize =
    sizeProp ?? (tone === "menu" ? "menu" : "large")
  const isControl = size === "small"
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  const { filter, material, backdropFilter } = useLiquidRefraction(node, {
    ...(isControl ? CONTROL_REFRACTION : { size, dpr: 1 }),
    ...(radius !== undefined ? { radius } : isControl ? {} : { radius: 26 }),
    // An explicit bezel width replaces the radius-proportional control rim
    ...(bezel !== undefined ? { bezel, bezelRatio: undefined } : {}),
    refraction,
    dispersion,
    openBottom,
  })

  return (
    <div
      ref={setNode}
      aria-hidden="true"
      data-slot="liquid-surface-backdrop"
      data-size={size}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]",
        openBottom && "rounded-b-none",
        isControl
          ? liquidControlGlassClassName
          : size === "menu"
            ? "bg-(--liquid-surface-menu)"
            : "bg-(--liquid-surface-sheet)",
        className
      )}
      style={{
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        ...(isControl
          ? { ["--lq-glass-fill" as string]: material.fillOpacity }
          : null),
        ...style,
      }}
      {...props}
    >
      {filter}
    </div>
  )
}

export { OverGlass, useOverGlass }
