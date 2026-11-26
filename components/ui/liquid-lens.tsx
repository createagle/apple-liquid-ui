"use client"

import * as React from "react"
import { cn } from "cn"

const mapCache = new Map<string, string>()
const filterIds = new Map<string, string>()
const pinnedImages = new Map<string, HTMLImageElement>()
const MAX_CACHE = 48
const SVG_NS = "http://www.w3.org/2000/svg"
let nextFilterId = 1
let filterHost: SVGSVGElement | null = null

function ensureFilterHost(): SVGSVGElement {
  if (filterHost && filterHost.isConnected) return filterHost
  const svg = document.createElementNS(SVG_NS, "svg")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("data-liquid-lens-filters", "")
  svg.style.position = "fixed"
  svg.style.width = "0"
  svg.style.height = "0"
  svg.style.pointerEvents = "none"
  svg.style.overflow = "hidden"
  document.body.appendChild(svg)
  filterHost = svg
  return svg
}

function svgEl(tag: string, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v))
  }
  return node
}

function prewarmDataUrl(href: string) {
  if (pinnedImages.has(href)) return
  const img = new Image()
  img.src = href
  if (pinnedImages.size >= MAX_CACHE) {
    const oldest = pinnedImages.keys().next().value
    if (oldest) pinnedImages.delete(oldest)
  }
  pinnedImages.set(href, img)
}

/**
 * Registers an SVG refraction + chromatic dispersion filter that preserves
 * exact source alpha (`1×A` via the green channel, `0×A` on R/B channels)
 * instead of tripling alpha (`3×A`), completely eliminating dark charcoal
 * darkening when sampling semi-transparent backdrops.
 */
function ensureCleanLensFilter(params: {
  w: number
  h: number
  mapHref: string
  refraction: number
  dispersion: number
}): string {
  const { w, h, mapHref, refraction, dispersion } = params
  const key = `${w}x${h}|r${refraction}|d${dispersion}|${mapHref.length}:${mapHref.slice(-24)}`
  const existing = filterIds.get(key)
  if (existing) return existing

  const id = `apple-liquid-lens-${nextFilterId++}`
  const filter = svgEl("filter", {
    id,
    x: 0,
    y: 0,
    width: w,
    height: h,
    filterUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  })

  const feImg = svgEl("feImage", {
    x: 0,
    y: 0,
    width: w,
    height: h,
    result: "map",
  })
  feImg.setAttribute("href", mapHref)
  filter.appendChild(feImg)

  const makeDisp = (scale: number, result?: string) =>
    svgEl("feDisplacementMap", {
      in: "SourceGraphic",
      in2: "map",
      scale,
      xChannelSelector: "R",
      yChannelSelector: "B",
      ...(result ? { result } : {}),
    })

  if (dispersion > 0) {
    // Isolate each RGB channel with constant alpha=1 so premultiplied arithmetic
    // addition preserves full R/G/B intensity without tripling alpha (3×A), then
    // mask back by dispG's exact source alpha via operator="in" -> (R·A, G·A, B·A, A).
    filter.appendChild(makeDisp(refraction * (1 - dispersion), "dispR"))
    filter.appendChild(
      svgEl("feColorMatrix", {
        in: "dispR",
        type: "matrix",
        values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1",
        result: "chR",
      })
    )

    filter.appendChild(makeDisp(refraction, "dispG"))
    filter.appendChild(
      svgEl("feColorMatrix", {
        in: "dispG",
        type: "matrix",
        values: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1",
        result: "chG",
      })
    )

    filter.appendChild(makeDisp(refraction * (1 + dispersion), "dispB"))
    filter.appendChild(
      svgEl("feColorMatrix", {
        in: "dispB",
        type: "matrix",
        values: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0 1",
        result: "chB",
      })
    )

    filter.appendChild(
      svgEl("feComposite", {
        in: "chR",
        in2: "chG",
        operator: "arithmetic",
        k1: 0,
        k2: 1,
        k3: 1,
        k4: 0,
        result: "chRG",
      })
    )
    filter.appendChild(
      svgEl("feComposite", {
        in: "chRG",
        in2: "chB",
        operator: "arithmetic",
        k1: 0,
        k2: 1,
        k3: 1,
        k4: 0,
        result: "chRGB",
      })
    )
    filter.appendChild(
      svgEl("feComposite", {
        in: "chRGB",
        in2: "dispG",
        operator: "in",
      })
    )
  } else {
    filter.appendChild(makeDisp(refraction))
  }

  const host = ensureFilterHost()
  host.appendChild(filter)
  filterIds.set(key, id)

  if (filterIds.size > MAX_CACHE) {
    const oldest = filterIds.entries().next().value
    if (oldest) {
      const [oldKey, oldId] = oldest
      filterIds.delete(oldKey)
      host.querySelector(`#${oldId}`)?.remove()
    }
  }

  return id
}

/**
 * Generates an inward-only rounded-capsule SDF displacement map.
 *
 * Anti-artifact guarantees:
 * 1. Displacement vectors strictly point INWARD (-normal) toward the center,
 *    so samples never pull clamped/dirty pixels from outside the glass pill.
 * 2. Smooth edge taper at the outermost boundary keeps all four edges and
 *    corners spotless while producing crisp convex-lens bending + subtle prism
 *    dispersion across the curved bezel.
 */
function buildCleanLensMap(
  width: number,
  height: number,
  radius: number,
  bezel: number
): string {
  const w = Math.max(2, Math.round(width))
  const h = Math.max(2, Math.round(height))
  const r = Math.min(radius, w / 2, h / 2)
  const bz = Math.max(2, Math.min(bezel, Math.min(w, h) / 2))

  const key = `${w}x${h}r${Math.round(r)}b${Math.round(bz)}`
  const cached = mapCache.get(key)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const img = ctx.createImageData(w, h)
  const data = img.data

  const halfW = w / 2
  const halfH = h / 2
  const bx = halfW - r
  const by = halfH - r

  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - halfH
    const sy = py < 0 ? -1 : 1
    const qy = Math.abs(py) - by

    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - halfW
      const sx = px < 0 ? -1 : 1
      const qx = Math.abs(px) - bx

      let sd: number
      let nx: number
      let ny: number

      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy)
        sd = len - r
        nx = (sx * qx) / len
        ny = (sy * qy) / len
      } else if (qx > qy) {
        sd = qx - r
        nx = sx
        ny = 0
      } else {
        sd = qy - r
        nx = 0
        ny = sy
      }

      // Normalized inward depth from outer boundary: 0 at outer rim -> 1 at flat center
      const t = -sd / bz
      let mag = 0
      if (t > 0 && t < 1) {
        // Gentle 1px outer taper avoids edge clamping; steep rim-localized falloff
        // keeps the droplet interior crystal-clear and concentrates bending on the glass edge.
        const edgeFade = Math.min(1, t / 0.08)
        const easeEdge = edgeFade * edgeFade * (3 - 2 * edgeFade)
        const dome = Math.pow(1 - t, 2.25)
        mag = Math.min(1, easeEdge * dome)
      }

      const idx = (y * w + x) * 4
      // xChannelSelector="R", yChannelSelector="B"
      data[idx] = Math.round(128 - nx * mag * 127)
      data[idx + 1] = 128
      data[idx + 2] = Math.round(128 - ny * mag * 127)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const href = canvas.toDataURL()

  if (mapCache.size >= MAX_CACHE) {
    const oldest = mapCache.keys().next().value
    if (oldest) mapCache.delete(oldest)
  }
  mapCache.set(key, href)
  return href
}

export interface LiquidLensProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px (use 999 for full capsule/circle). */
  radius?: number
  /** Optical bezel width in px where bending and prism dispersion occur. */
  bezel?: number
  /** Displacement scale in px. */
  refraction?: number
  /** Subtle RGB chromatic aberration on the curved bezel (0 = off, ~0.055 = Apple native). */
  dispersion?: number
  /** Optional light backdrop blur in px (0 = crystal clear droplet center). */
  blur?: number
  /** Backdrop saturation boost. */
  saturation?: number
}

/**
 * Clean, zero-artifact optical convex lens droplet with exact alpha preservation
 * (never darkens over transparent backdrops) and isolated `backdrop-filter: url(#id)`
 * so Chromium always executes the SVG feDisplacementMap cleanly.
 */
export function LiquidLens({
  radius = 999,
  bezel = 12,
  refraction = 28,
  dispersion = 0.055,
  blur = 0,
  saturation = 1.05,
  className,
  style,
  children,
  ...props
}: LiquidLensProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const [canRefract, setCanRefract] = React.useState(false)

  React.useLayoutEffect(() => {
    const ua = navigator.userAgent
    const isChromium =
      /Chrome|Chromium|Edg|OPR|Brave/i.test(ua) && !/Firefox/i.test(ua)
    setCanRefract(isChromium)

    const el = ref.current
    if (!el) return

    const update = (w: number, h: number) => {
      if (w > 1 && h > 1) {
        setSize((prev) =>
          prev && prev.w === w && prev.h === h ? prev : { w, h }
        )
      }
    }

    update(Math.round(el.offsetWidth), Math.round(el.offsetHeight))
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) update(Math.round(rect.width), Math.round(rect.height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const filterId = React.useMemo(() => {
    if (!canRefract || !size) return null
    const mapHref = buildCleanLensMap(size.w, size.h, radius, bezel)
    if (!mapHref) return null

    prewarmDataUrl(mapHref)
    return ensureCleanLensFilter({
      w: size.w,
      h: size.h,
      mapHref,
      refraction,
      dispersion,
    })
  }, [bezel, canRefract, dispersion, radius, refraction, size])

  const fallbackFilter =
    blur > 0 || saturation !== 1
      ? `${blur > 0 ? `blur(${blur}px) ` : ""}saturate(${saturation})`
      : undefined

  return (
    <div
      ref={ref}
      data-slot="liquid-lens"
      className={cn(
        "relative isolate overflow-hidden",
        // Spotless clean crystal rim & ambient lift — zero dark grey edge shade
        "bg-white/[0.04] dark:bg-white/[0.06]",
        "shadow-[0_10px_28px_-6px_rgba(0,0,0,0.16),0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(255,255,255,0.65)]",
        "dark:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.48),inset_0_-1px_1.5px_rgba(255,255,255,0.22)]",
        className
      )}
      style={{
        borderRadius: radius >= 999 ? "9999px" : `${radius}px`,
        ...style,
      }}
      {...props}
    >
      {/* Layer 1: Optional subtle blur/saturation backdrop */}
      {fallbackFilter ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backdropFilter: fallbackFilter,
            WebkitBackdropFilter: fallbackFilter,
          }}
        />
      ) : null}

      {/* Layer 2: Dedicated isolated SVG url(#id) refraction & RGB prism layer */}
      {filterId ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backdropFilter: `url(#${filterId})`,
            WebkitBackdropFilter: `url(#${filterId})`,
          }}
        />
      ) : null}

      {children}
    </div>
  )
}
