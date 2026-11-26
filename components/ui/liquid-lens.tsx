"use client"

import * as React from "react"
import { cn } from "cn"

const mapCache = new Map<string, { href: string; scale: number }>()
const rimCache = new Map<string, string>()
const filterIds = new Map<string, string>()
const pinnedImages = new Map<string, HTMLImageElement>()
const MAX_CACHE = 64
const SVG_NS = "http://www.w3.org/2000/svg"
let nextFilterId = 1
let filterHost: SVGSVGElement | null = null

export type LiquidLensProfile = "lip" | "convex"

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
  const key = `${w}x${h}|r${refraction.toFixed(2)}|d${dispersion.toFixed(3)}|${mapHref.length}:${mapHref.slice(-24)}`
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

function convexSquircle(u: number): number {
  const clamped = Math.max(0, Math.min(1, u))
  const v = 1 - Math.pow(1 - clamped, 4)
  return Math.pow(Math.max(0, v), 0.25)
}

function smootherstep(u: number): number {
  const t = Math.max(0, Math.min(1, u))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * Apple Liquid Glass surface height profile h(u) for u in [0, 1]
 * (0 = outer glass edge, 1 = inner bezel boundary).
 * - `convex`: Convex Squircle (1 - (1 - u)^4)^(1/4)
 * - `lip`: Raised convex outer rim blended into a shallow concave bowl via
 *   smootherstep, producing crisp inward rim refraction + smooth zoomed-out interior.
 */
function surfaceHeight(u: number, profile: LiquidLensProfile): number {
  const convex = convexSquircle(u)
  if (profile === "convex") return convex
  const concave = 1 - convex
  const blend = smootherstep(u)
  return convex * (1 - blend) + concave * blend
}

/**
 * Precomputes a 1D Snell-Descartes Law refraction displacement table along
 * normalized bezel depth u in [0, 1] (n_air = 1.0, n_glass = 1.5).
 * Positive values displace INWARD (-normal); negative values displace OUTWARD (+normal).
 */
function buildSnellProfileTable(
  profile: LiquidLensProfile,
  bezelPx: number,
  thicknessPx: number,
  ior = 1.5
): Float32Array {
  const SAMPLES = 128
  const table = new Float32Array(SAMPLES)
  const delta = 1 / 512

  for (let i = 0; i < SAMPLES; i++) {
    const u = i / (SAMPLES - 1)
    if (u <= 0.002 || u >= 0.998) {
      table[i] = 0
      continue
    }

    const h = surfaceHeight(u, profile)
    const hPrev = surfaceHeight(Math.max(0, u - delta), profile)
    const hNext = surfaceHeight(Math.min(1, u + delta), profile)
    // Derivative dh/dx in physical pixel units (height in px / bezel distance in px)
    const dhdu = (hNext - hPrev) / (2 * delta)
    const slope = (dhdu * thicknessPx) / Math.max(1, bezelPx)

    // Orthogonal incident ray hitting surface of slope `slope`:
    // sin(theta1) = slope / sqrt(1 + slope^2)
    const sinTheta1 = slope / Math.hypot(1, slope)
    const sinTheta2 = Math.max(-0.999, Math.min(0.999, sinTheta1 / ior))
    const theta1 = Math.asin(Math.max(-0.999, Math.min(0.999, sinTheta1)))
    const theta2 = Math.asin(sinTheta2)
    const deflection = theta1 - theta2

    // Gentle 2% outer edge fade prevents sub-pixel jaggedness at the capsule silhouette
    const edgeFade = Math.min(1, u / 0.04)
    const smoothEdge = edgeFade * edgeFade * (3 - 2 * edgeFade)

    // Physical ray landing offset at background plane through glass height (h * thicknessPx)
    table[i] = Math.tan(deflection) * (h * thicknessPx) * smoothEdge
  }

  return table
}

/**
 * Generates a Snell's Law optical displacement map for a rounded capsule.
 * All sample coordinates are clamped inside [0.5, w - 0.5] x [0.5, h - 0.5]
 * so Chromium never produces out-of-bounds clamping artifacts.
 */
function buildSnellLensMap(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  profile: LiquidLensProfile,
  thickness: number
): { href: string; scale: number } {
  const w = Math.max(2, Math.round(width))
  const h = Math.max(2, Math.round(height))
  const r = Math.min(radius, w / 2, h / 2)
  const bz = Math.max(2, Math.min(bezel, Math.min(w, h) / 2))
  const th = Math.max(2, thickness)

  const key = `${w}x${h}r${Math.round(r)}b${bz.toFixed(1)}t${th.toFixed(1)}p${profile}`
  const cached = mapCache.get(key)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return { href: "", scale: 0 }

  const profileTable = buildSnellProfileTable(profile, bz, th, 1.5)
  const lastIdx = profileTable.length - 1

  const total = w * h
  const dxBuf = new Float32Array(total)
  const dyBuf = new Float32Array(total)
  let maxDisp = 1

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

      let dx = 0
      let dy = 0
      if (sd < 0) {
        const u = -sd / bz
        if (u > 0 && u < 1) {
          const fIdx = u * lastIdx
          const i0 = Math.floor(fIdx)
          const i1 = Math.min(lastIdx, i0 + 1)
          const frac = fIdx - i0
          const disp =
            profileTable[i0] * (1 - frac) + profileTable[i1] * frac

          // Positive disp bends INWARD (-nx, -ny); negative disp (concave dip) bends OUTWARD (+nx, +ny)
          dx = -nx * disp
          dy = -ny * disp

          // Clamp strictly inside the filter's SourceGraphic box
          dx = Math.max(0.5 - (x + 0.5), Math.min(w - 0.5 - (x + 0.5), dx))
          dy = Math.max(0.5 - (y + 0.5), Math.min(h - 0.5 - (y + 0.5), dy))
        }
      }

      const pIdx = y * w + x
      dxBuf[pIdx] = dx
      dyBuf[pIdx] = dy
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (absX > maxDisp) maxDisp = absX
      if (absY > maxDisp) maxDisp = absY
    }
  }

  const img = ctx.createImageData(w, h)
  const data = img.data
  for (let i = 0; i < total; i++) {
    const idx = i * 4
    data[idx] = Math.round(128 + (dxBuf[i] / maxDisp) * 127)
    data[idx + 1] = 128
    data[idx + 2] = Math.round(128 + (dyBuf[i] / maxDisp) * 127)
    data[idx + 3] = 255
  }

  ctx.putImageData(img, 0, 0)
  const result = { href: canvas.toDataURL(), scale: maxDisp * 2 }

  if (mapCache.size >= MAX_CACHE) {
    const oldest = mapCache.keys().next().value
    if (oldest) mapCache.delete(oldest)
  }
  mapCache.set(key, result)
  return result
}

/**
 * Generates Apple's directional diagonal specular rim highlight (-55° primary
 * top-left + +125° secondary bottom-right) directly from the capsule SDF normal,
 * giving crisp crystal-glass rim light instead of flat uniform borders.
 */
function buildSpecularRimMap(
  width: number,
  height: number,
  radius: number
): string {
  const w = Math.max(2, Math.round(width))
  const h = Math.max(2, Math.round(height))
  const r = Math.min(radius, w / 2, h / 2)

  const key = `rim:${w}x${h}r${Math.round(r)}`
  const cached = rimCache.get(key)
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

  // Primary light direction (-55° top-left) & opposing bounce (+125° bottom-right)
  const lx = -0.5736
  const ly = -0.8192
  const rimWidth = 2.4

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

      const idx = (y * w + x) * 4
      if (sd < 0 && -sd <= rimWidth) {
        const d = -sd
        // Sharp crystal rim band peaking near 0.75px inward
        const radial = Math.exp(-Math.pow((d - 0.7) / 0.85, 2))
        const dot = nx * lx + ny * ly
        const primary = Math.pow(Math.max(0, dot), 1.6) * 0.92
        const bounce = Math.pow(Math.max(0, -dot), 2.0) * 0.55
        const ambient = 0.2
        const alpha = Math.min(1, radial * (ambient + primary + bounce))

        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = Math.round(alpha * 255)
      } else {
        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = 0
      }
    }
  }

  ctx.putImageData(img, 0, 0)
  const href = canvas.toDataURL()

  if (rimCache.size >= MAX_CACHE) {
    const oldest = rimCache.keys().next().value
    if (oldest) rimCache.delete(oldest)
  }
  rimCache.set(key, href)
  return href
}

export interface LiquidLensProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px (use 999 for full capsule/circle). */
  radius?: number
  /** Optical bezel width in px (`0` = auto full half-height for Lip indicators). */
  bezel?: number
  /** Optical glass thickness / refraction intensity multiplier (default `1`). */
  refraction?: number
  /** Surface profile: `lip` (Apple Switch/Slider/Tabs raised rim + concave center) or `convex` (Convex Squircle). */
  profile?: LiquidLensProfile
  /** Subtle RGB chromatic aberration on the curved bezel (0 = off, ~0.055 = Apple native). */
  dispersion?: number
  /** Optional light backdrop blur in px (0 = crystal clear droplet center). */
  blur?: number
  /** Backdrop saturation boost. */
  saturation?: number
  /** Optional backdrop brightness boost for crystal glass light collection. */
  brightness?: number
  /** Visual rim style: `crystal` (Apple directional specular rim) or `default`. */
  rim?: "default" | "crystal"
}

/**
 * Physically-based Apple Liquid Glass optical lens driven by Snell–Descartes Law
 * (n_air = 1.0 -> n_glass = 1.5) with Apple's Lip & Convex Squircle surface profiles
 * and normal-mapped directional specular rim highlights.
 */
export function LiquidLens({
  radius = 999,
  bezel = 0,
  refraction = 1,
  profile = "lip",
  dispersion = 0.055,
  blur = 0,
  saturation = 1.08,
  brightness = 1.04,
  rim = "crystal",
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

  const { filterId, rimHref } = React.useMemo(() => {
    if (!size) return { filterId: null, rimHref: null }

    const specularHref =
      rim === "crystal" ? buildSpecularRimMap(size.w, size.h, radius) : null

    if (!canRefract) {
      return { filterId: null, rimHref: specularHref }
    }

    const minDim = Math.min(size.w, size.h)
    // Auto full-radius bezel for Lip droplets so outer convex lip transitions smoothly into concave center
    const resolvedBezel = bezel > 0 ? bezel : minDim / 2
    // Support both normalized intensity (e.g. 0.5..2.0) and legacy px scale values (e.g. 18..28)
    const intensity = refraction > 4 ? refraction / 24 : Math.max(0.1, refraction)
    const glassThickness = Math.max(4, minDim * 0.48)

    const { href: mapHref, scale: baseScale } = buildSnellLensMap(
      size.w,
      size.h,
      radius,
      resolvedBezel,
      profile,
      glassThickness
    )
    if (!mapHref) return { filterId: null, rimHref: specularHref }

    prewarmDataUrl(mapHref)
    const id = ensureCleanLensFilter({
      w: size.w,
      h: size.h,
      mapHref,
      refraction: baseScale * intensity,
      dispersion,
    })

    return { filterId: id, rimHref: specularHref }
  }, [bezel, canRefract, dispersion, profile, radius, refraction, rim, size])

  const filterParts: string[] = []
  if (blur > 0) filterParts.push(`blur(${blur}px)`)
  if (brightness !== 1) filterParts.push(`brightness(${brightness})`)
  if (saturation !== 1) filterParts.push(`saturate(${saturation})`)
  const fallbackFilter =
    filterParts.length > 0 ? filterParts.join(" ") : undefined

  return (
    <div
      ref={ref}
      data-slot="liquid-lens"
      data-profile={profile}
      className={cn(
        "relative isolate overflow-hidden",
        rim === "crystal"
          ? [
              "bg-transparent",
              "shadow-[0_6px_18px_-4px_rgba(0,0,0,0.16),0_1px_4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.06)]",
              "dark:shadow-[0_8px_22px_-4px_rgba(0,0,0,0.42),0_0_0_0.5px_rgba(255,255,255,0.16)]",
            ]
          : [
              "bg-white/[0.04] dark:bg-white/[0.06]",
              "shadow-[0_10px_28px_-6px_rgba(0,0,0,0.16),0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(255,255,255,0.65)]",
              "dark:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.48),inset_0_-1px_1.5px_rgba(255,255,255,0.22)]",
            ],
        className
      )}
      style={{
        borderRadius: radius >= 999 ? "9999px" : `${radius}px`,
        ...style,
      }}
      {...props}
    >
      {/* Layer 1: Optional subtle blur/brightness/saturation backdrop */}
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

      {/* Layer 2: Dedicated isolated SVG Snell's Law refraction & RGB prism layer */}
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

      {/* Layer 3: Apple normal-mapped directional diagonal specular rim light */}
      {rimHref ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage: `url(${rimHref})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : null}

      {children}
    </div>
  )
}
