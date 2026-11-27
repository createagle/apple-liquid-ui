"use client"

import * as React from "react"
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
  className,
  style,
  ...props
}: LiquidSurfaceBackdropProps) {
  const { tint } = useLiquidGlass()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const filterId = `apple-surface-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const [canRefract, setCanRefract] = React.useState(false)

  React.useLayoutEffect(() => {
    setCanRefract(supportsRefraction())
    const el = ref.current
    if (!el) return

    const update = (w: number, h: number) => {
      // Quantize to 4px increments to avoid regenerating maps on sub-pixel layout jitter
      const qw = Math.max(2, Math.round(w / 4) * 4)
      const qh = Math.max(2, Math.round(h / 4) * 4)
      if (qw > 4 && qh > 4) {
        setSize((prev) =>
          prev && prev.w === qw && prev.h === qh ? prev : { w: qw, h: qh }
        )
      }
    }

    update(el.offsetWidth, el.offsetHeight)
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) update(rect.width, rect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const maps = React.useMemo(() => {
    if (!size || !canRefract) return null
    const clampedR = Math.min(radius, size.w / 2, size.h / 2)
    const clampedB = Math.min(bezel, Math.min(size.w, size.h) / 3)
    return buildLensMaps({
      width: size.w,
      height: size.h,
      radius: clampedR,
      bezel: Math.max(8, clampedB),
      surface: CONVEX,
      curvature: 0,
      lightAngle: LENS_LIGHT_ANGLE,
      // DPR 1 is visually identical for smooth large-surface displacement maps and keeps canvas build < 3ms
      dpr: 1,
    })
  }, [bezel, canRefract, radius, size])

  // Continuous Clear (0) <-> Tinted (1) optical parameters:
  // At tint=0: crystal clear (low blur 2.5px, strong bezel bend ~30px, vivid rim)
  // At tint=1: frosted tinted glass (higher blur 18px, subtle bezel bend ~10px)
  const clampedTint = Math.max(0, Math.min(1, tint))
  const blurPx = Number((2.5 + clampedTint * 15.5).toFixed(1))
  const scalePx = Number(
    (32 * refraction * (1 - clampedTint * 0.65)).toFixed(1)
  )
  const specularOpacity = Number((0.42 - clampedTint * 0.24).toFixed(2))
  const colouredRimOpacity = Number((0.75 - clampedTint * 0.5).toFixed(2))
  const activeDispersion =
    clampedTint < 0.85
      ? Number((dispersion * (1 - clampedTint * 0.65)).toFixed(3))
      : 0

  const backdropFilterValue = maps
    ? `url(#${filterId}) saturate(var(--liquid-saturate, 1.75))`
    : `blur(var(--liquid-blur, ${blurPx}px)) saturate(var(--liquid-saturate, 1.75))`

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="liquid-surface-backdrop"
      data-tone={tone}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]",
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
      {maps && size ? (
        <LensFilter
          id={filterId}
          maps={maps}
          width={size.w}
          height={size.h}
          scale={scalePx}
          blur={blurPx}
          specularOpacity={specularOpacity}
          specularSaturation={5}
          colouredRimOpacity={colouredRimOpacity}
          dispersion={activeDispersion}
        />
      ) : null}
    </div>
  )
}
