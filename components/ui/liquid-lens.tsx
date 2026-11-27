"use client"

import * as React from "react"
import { cn } from "cn"

export type LiquidLensProfile = "lip" | "convex" | "meniscus"

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export interface LensSurface {
  /** Stable id — keys the profile and map caches. */
  id: string
  /** Height of the glass over normalized depth `t` in `[0, 1]` from outer edge. */
  height: (t: number) => number
  /** Relief thickness relative to the flat glass slab beneath it. */
  relief: number
  /** Flat slab thickness beneath the relief so flat regions still refract. */
  slab: number
  /** Normalization reference: `"edge"` (default) or `"max"` across the band. */
  normalize?: "edge" | "max"
}

const superellipse = (p: number) => (t: number) => {
  const clamped = Math.max(0, Math.min(1, t))
  return Math.pow(Math.max(0, 1 - Math.pow(Math.max(0, 1 - clamped), p)), 1 / p)
}

const squircle = (x: number) =>
  Math.pow(Math.max(0, 1 - Math.pow(1 - x, 4)), 0.25)

const circle = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t))
  return Math.sqrt(Math.max(0, 1 - (1 - clamped) * (1 - clamped)))
}

const smootherstep = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t))
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10)
}

/**
 * Raised convex outer crest crossfaded into a shallow concave bowl lifted by
 * a glass slab — edges pull backdrop inward while the center reads zoomed out.
 */
export const LIP: LensSurface = {
  id: "lip",
  height: (t) => {
    const k = smootherstep(t)
    return squircle(t * 2) * (1 - k) + (1 - circle(t) + 0.1) * k
  },
  relief: 2.776,
  slab: 6.776,
}

/**
 * Fitted superellipse dome (`p = 3.25`) for magnifying underlying content such
 * as Slider tracks and progress fills.
 */
export const CONVEX: LensSurface = {
  id: "convex",
  height: superellipse(3.25),
  relief: 1.608,
  slab: 5.945,
}

/**
 * Pure outward-refracting concave meniscus (`slope = 0` at `t = 0` and `t = 1`),
 * keeping the outer protruding rim clean while crisply zooming out the interior.
 */
export const MENISCUS: LensSurface = {
  id: "meniscus",
  height: (t) => {
    const c = Math.max(0, Math.min(1, t))
    return (1 - c) * (1 - c) * (1 + 2 * c)
  },
  relief: 2.8,
  slab: 5.5,
  normalize: "max",
}

/* -------------------------------------------------------------------------- */
/* Vector Snell Profile                                                       */
/* -------------------------------------------------------------------------- */

const PROFILE_SIZE = 128
const IOR = 1.5
const profileCache = new Map<string, Float32Array>()

function lensProfile(surface: LensSurface): Float32Array {
  const cached = profileCache.get(surface.id)
  if (cached) return cached

  const shift = new Float32Array(PROFILE_SIZE)
  const a = 1 / IOR
  const h = 1e-4

  for (let i = 0; i < PROFILE_SIZE; i++) {
    const t = i / PROFILE_SIZE
    const height = surface.height(t)
    const slope = (surface.height(t + h) - height) / h
    const len = Math.hypot(slope, 1)
    const nx = -slope / len
    const ny = -1 / len
    const inside = 1 - a * a * (1 - ny * ny)
    if (inside < 0) continue
    const k = a * ny + Math.sqrt(inside)
    const dirX = -k * nx
    const dirY = a - k * ny
    const depth = height * surface.relief + surface.slab
    shift[i] = dirY !== 0 ? dirX * (depth / dirY) : 0
  }

  let norm = Math.abs(shift[0]) || 1
  if (surface.normalize === "max") {
    let maxAbs = 0
    for (let i = 0; i < PROFILE_SIZE; i++) {
      const abs = Math.abs(shift[i])
      if (abs > maxAbs) maxAbs = abs
    }
    norm = maxAbs || 1
  }

  for (let i = 0; i < PROFILE_SIZE; i++) {
    shift[i] = Math.max(-1, Math.min(1, shift[i] / norm))
  }

  profileCache.set(surface.id, shift)
  return shift
}

/* -------------------------------------------------------------------------- */
/* Maps                                                                       */
/* -------------------------------------------------------------------------- */

export interface LensMaps {
  displacement: string
  specular: string
}

export const LENS_LIGHT_ANGLE = 30

export interface LensMapOptions {
  /** Lens element box width in CSS px. */
  width: number
  /** Lens element box height in CSS px. */
  height: number
  /** Corner radius in CSS px (`height / 2` for a capsule). */
  radius: number
  /** Width of the sculpted optical band in CSS px measured inward from edge. */
  bezel: number
  /** Surface height profile (`LIP` or `CONVEX`). */
  surface: LensSurface
  /** Device pixel ratio (caller should clamp, e.g. `<= 3`). */
  dpr: number
  /** Spherical-cap dome strength across the entire lens (`-1..1`; `> 0` magnifies, `< 0` zooms out). */
  curvature?: number
  /** Key light direction in degrees clockwise from straight up. */
  lightAngle?: number
  /** Keep the bottom edge flat/open without bottom corner curves (e.g. bottom-docked Drawer). */
  openBottom?: boolean
}

export interface LensOptics {
  /** Spherical-cap dome strength (`-1..1`; `> 0` magnifies, `< 0` zooms out). */
  curvature?: number
  dispersion?: number
}

export function resolveLens(
  lens: boolean | LensOptics | undefined,
  defaults: Required<LensOptics>
): Required<LensOptics> | null {
  if (lens === false) return null
  if (typeof lens !== "object") return defaults
  return {
    curvature: lens.curvature ?? defaults.curvature,
    dispersion: lens.dispersion ?? defaults.dispersion,
  }
}

const DOME_CAP = 0.6
const DOME_RADIUS = (1 + DOME_CAP * DOME_CAP) / (2 * DOME_CAP)
const DOME_EDGE = 1 / Math.sqrt(DOME_RADIUS * DOME_RADIUS - 1)

function domeShift(u: number): number {
  const a = Math.min(Math.abs(u), 1)
  return (
    (Math.sign(u) * (a / Math.sqrt(DOME_RADIUS * DOME_RADIUS - a * a))) /
    DOME_EDGE
  )
}

const MAX_CACHE = 96
const mapCache = new Map<string, LensMaps>()
const pinnedImages = new Map<string, HTMLImageElement>()

function prewarmDataUrl(href: string) {
  if (typeof window === "undefined" || !href || pinnedImages.has(href)) return
  const img = new Image()
  img.src = href
  if (pinnedImages.size >= MAX_CACHE * 2) {
    const oldest = pinnedImages.keys().next().value
    if (oldest) pinnedImages.delete(oldest)
  }
  pinnedImages.set(href, img)
}

function toPng(image: ImageData): string {
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

/**
 * Generates high-DPR displacement (`R=x, G=y`) and directional hairline specular
 * rim PNG maps for rounded-rect / capsule lenses.
 * Small-control indicator lenses are intentionally constant and independent of
 * the global `--liquid-glass-tint` transparency setting.
 */
export function buildLensMaps(options: LensMapOptions): LensMaps {
  const {
    width,
    height,
    radius,
    bezel,
    surface,
    dpr,
    curvature = 0,
    lightAngle = LENS_LIGHT_ANGLE,
    openBottom = false,
  } = options

  const safeDpr = Math.max(1, Math.min(3, dpr || 1))
  const safeW = Math.max(2, width)
  const safeH = Math.max(2, height)
  const clampedR = Math.min(radius, safeW / 2, openBottom ? safeH : safeH / 2)
  const clampedB = Math.max(1, Math.min(bezel, Math.min(safeW, safeH) / 2))

  const key =
    `${surface.id}|${safeW.toFixed(1)}x${safeH.toFixed(1)}r${clampedR.toFixed(1)}` +
    `b${clampedB.toFixed(2)}c${curvature.toFixed(3)}l${Math.round(lightAngle)}@${safeDpr.toFixed(2)}${openBottom ? "|ob" : ""}`

  const hit = mapCache.get(key)
  if (hit) {
    mapCache.delete(key)
    mapCache.set(key, hit)
    return hit
  }

  const lightRad = (lightAngle * Math.PI) / 180
  const light = Math.atan2(-Math.cos(lightRad), Math.sin(lightRad))

  const W = Math.max(2, Math.round(safeW * safeDpr))
  const H = Math.max(2, Math.round(safeH * safeDpr))
  const R = clampedR * safeDpr
  const B = clampedB * safeDpr
  const innerW = Math.max(0, W - R * 2)
  const innerH = Math.max(0, H - R * 2)
  const shift = lensProfile(surface)

  const disp = new ImageData(W, H)
  const spec = new ImageData(W, H)
  // Neutral RGBA (128, 128, 0, 255) across the buffer
  new Uint32Array(disp.data.buffer).fill(0xff008080)

  const rSq = R * R
  const outerSq = (R + 1) * (R + 1)
  const innerSq = Math.max(0, R - B) * Math.max(0, R - B)
  const dome = Math.max(-1, Math.min(1, curvature))
  const halfW = W / 2
  const halfH = H / 2

  for (let y = 0; y < H; y++) {
    const py = y + 0.5
    const ly =
      py < R ? py - R : !openBottom && py > H - R ? py - R - innerH : 0

    for (let x = 0; x < W; x++) {
      const px = x + 0.5
      const lx = px < R ? px - R : px > W - R ? px - R - innerW : 0
      const sq = lx * lx + ly * ly
      if (sq > outerSq) continue

      const inBand = sq >= innerSq
      if (!inBand && dome === 0) continue

      const dist = Math.sqrt(sq) || 1e-6
      const depth = R - dist
      const nx = lx / dist
      const ny = ly / dist
      const aa = sq < rSq ? 1 : Math.max(0, 1 - (dist - R))

      let sx = 0
      let sy = 0
      if (inBand) {
        const idx = Math.max(
          0,
          Math.min(PROFILE_SIZE - 1, Math.floor((depth / B) * PROFILE_SIZE))
        )
        const mag = shift[idx] ?? 0
        sx = nx * mag
        sy = ny * mag
      }
      if (dome !== 0) {
        sx += dome * domeShift((px - halfW) / halfW)
        sy += dome * domeShift((py - halfH) / halfH)
      }
      sx = Math.max(-1, Math.min(1, sx))
      sy = Math.max(-1, Math.min(1, sy))

      const i = (y * W + x) * 4
      disp.data[i] = Math.round(128 - sx * 127 * aa)
      disp.data[i + 1] = Math.round(128 - sy * 127 * aa)
      disp.data[i + 2] = 0
      disp.data[i + 3] = 255

      if (!inBand) continue

      const theta = Math.atan2(ny, nx)
      const lit = Math.cos(theta - light) ** 2
      const across = Math.abs(depth / safeDpr - 0.5)
      const rim = across >= 1 ? 0 : Math.cos((Math.PI / 2) * across)
      const value = Math.max(0, Math.min(1, lit * rim * aa))

      const rgb = Math.round(Math.sqrt(value) * 255)
      spec.data[i] = rgb
      spec.data[i + 1] = rgb
      spec.data[i + 2] = rgb
      spec.data[i + 3] = Math.round(value * 255)
    }
  }

  const maps: LensMaps = {
    displacement: toPng(disp),
    specular: toPng(spec),
  }

  prewarmDataUrl(maps.displacement)
  prewarmDataUrl(maps.specular)

  if (mapCache.size >= MAX_CACHE) {
    const oldest = mapCache.keys().next().value
    if (oldest) mapCache.delete(oldest)
  }
  mapCache.set(key, maps)

  return maps
}

/* -------------------------------------------------------------------------- */
/* SVG Filter                                                                 */
/* -------------------------------------------------------------------------- */

export interface LensScale {
  set: (scale: number) => void
}

export interface LensFilterProps {
  id: string
  maps: LensMaps
  width: number
  height: number
  scale: number
  blur: number
  specularOpacity: number
  specularSaturation: number
  colouredRimOpacity?: number
  dispersion?: number
  /**
   * Optional material applied in-filter before displacement (after `blur`),
   * matching the `LiquiGlass` backdrop chain `blur -> saturate -> brightness`.
   */
  saturation?: number
  brightness?: number
  /**
   * `LiquiGlass` tone curve on the displaced backdrop (shadows lifted,
   * highlights rolled off) that gives clear control glass its luminous look.
   */
  toneLift?: number
  toneRoll?: number
  scaleRef?: React.Ref<LensScale>
}

/** Samples the `LiquiGlass` tone curve into an `feFunc*` lookup table. */
function toneTable(lift: number, roll: number) {
  const steps = 17
  return Array.from({ length: steps }, (_, i) => {
    const v = i / (steps - 1)
    const lifted = v + lift * (1 - v) ** 3
    return String(Math.round((lifted - roll * lifted ** 3) * 1e3) / 1e3)
  }).join(" ")
}

const ISOLATE = {
  r: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1",
  g: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1",
  b: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0 1",
} as const

/**
 * SVG refraction + wet coloured specular rim filter.
 * Deliberately omits fixed `x/y/width/height/filterUnits` so Chromium retains
 * the default 10% overflow margin for outward-sampling concave / high-scale rims.
 */
export function LensFilter({
  id,
  maps,
  width,
  height,
  scale,
  blur,
  specularOpacity,
  specularSaturation,
  colouredRimOpacity = 1,
  dispersion = 0,
  saturation = 1,
  brightness = 1,
  toneLift = 0,
  toneRoll = 0,
  scaleRef,
}: LensFilterProps) {
  const passes = React.useRef<(SVGFEDisplacementMapElement | null)[]>([])
  const spread =
    dispersion > 0 ? [1 - dispersion, 1, 1 + dispersion] : [1]
  const toned = toneLift > 0 || toneRoll > 0
  const base = toned ? "toned" : "bent"

  React.useImperativeHandle(
    scaleRef,
    () => ({
      set(next: number) {
        const multipliers =
          dispersion > 0 ? [1 - dispersion, 1, 1 + dispersion] : [1]
        multipliers.forEach((k, i) => {
          passes.current[i]?.setAttribute("scale", `${next * k}`)
        })
      },
    }),
    [dispersion]
  )

  const graded = saturation !== 1 || brightness !== 1
  const inputSource = graded
    ? "graded"
    : blur > 0
      ? "softened"
      : "SourceGraphic"

  const renderPass = (k: number, i: number, result: string) => (
    <feDisplacementMap
      key={result}
      ref={(node) => {
        passes.current[i] = node
      }}
      in={inputSource}
      in2="map"
      scale={scale * k}
      xChannelSelector="R"
      yChannelSelector="G"
      result={result}
    />
  )

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute size-0"
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          {blur > 0 ? (
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blur}
              result="softened"
            />
          ) : null}

          {graded ? (
            <>
              <feColorMatrix
                in={blur > 0 ? "softened" : "SourceGraphic"}
                type="saturate"
                values={String(saturation)}
                result="saturated"
              />
              <feComponentTransfer in="saturated" result="graded">
                <feFuncR type="linear" slope={brightness} />
                <feFuncG type="linear" slope={brightness} />
                <feFuncB type="linear" slope={brightness} />
              </feComponentTransfer>
            </>
          ) : null}

          <feImage
            href={maps.displacement}
            x={0}
            y={0}
            width={width}
            height={height}
            result="map"
          />

          {dispersion > 0 ? (
            <>
              {renderPass(spread[0], 0, "bentR")}
              <feColorMatrix
                in="bentR"
                type="matrix"
                values={ISOLATE.r}
                result="onlyR"
              />
              {renderPass(spread[1], 1, "bentG")}
              <feColorMatrix
                in="bentG"
                type="matrix"
                values={ISOLATE.g}
                result="onlyG"
              />
              {renderPass(spread[2], 2, "bentB")}
              <feColorMatrix
                in="bentB"
                type="matrix"
                values={ISOLATE.b}
                result="onlyB"
              />
              <feComposite
                in="onlyR"
                in2="onlyG"
                operator="arithmetic"
                k1={0}
                k2={1}
                k3={1}
                k4={0}
                result="rg"
              />
              <feComposite
                in="rg"
                in2="onlyB"
                operator="arithmetic"
                k1={0}
                k2={1}
                k3={1}
                k4={0}
                result="rgb"
              />
              <feComposite
                in="rgb"
                in2="bentG"
                operator="in"
                result="bent"
              />
            </>
          ) : (
            renderPass(1, 0, "bent")
          )}

          {toned ? (
            <feComponentTransfer in="bent" result="toned">
              <feFuncR type="table" tableValues={toneTable(toneLift, toneRoll)} />
              <feFuncG type="table" tableValues={toneTable(toneLift, toneRoll)} />
              <feFuncB type="table" tableValues={toneTable(toneLift, toneRoll)} />
            </feComponentTransfer>
          ) : null}

          <feColorMatrix
            in={base}
            type="saturate"
            values={String(specularSaturation)}
            result="vivid"
          />
          <feImage
            href={maps.specular}
            x={0}
            y={0}
            width={width}
            height={height}
            result="rim"
          />
          <feComposite
            in="vivid"
            in2="rim"
            operator="in"
            result="colouredRim"
          />
          <feComponentTransfer in="rim" result="whiteRim">
            <feFuncA type="linear" slope={specularOpacity} />
          </feComponentTransfer>
          {colouredRimOpacity < 1 ? (
            <>
              <feComponentTransfer in="colouredRim" result="softColouredRim">
                <feFuncA type="linear" slope={colouredRimOpacity} />
              </feComponentTransfer>
              <feBlend in="softColouredRim" in2={base} result="withColour" />
            </>
          ) : (
            <feBlend in="colouredRim" in2={base} result="withColour" />
          )}
          <feBlend in="whiteRim" in2="withColour" />
        </filter>
      </defs>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* 240Hz Sub-Stepped Spring Integrator                                        */
/* -------------------------------------------------------------------------- */

export interface Spring {
  value: number
  velocity: number
  target: number
  stiffness: number
  damping: number
  held?: boolean
}

export function spring(stiffness: number, damping: number, value = 0): Spring {
  return {
    value,
    velocity: 0,
    target: value,
    stiffness,
    damping,
  }
}

export function advance(s: Spring, dt: number): boolean {
  const steps = Math.min(Math.ceil(dt / (1 / 240)), 16)
  const h = dt / steps
  for (let i = 0; i < steps; i++) {
    s.velocity +=
      (s.stiffness * (s.target - s.value) - s.damping * s.velocity) * h
    s.value += s.velocity * h
  }
  return Math.abs(s.target - s.value) < 0.0005 && Math.abs(s.velocity) < 0.005
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value

export interface SpringLoop {
  settle: (s: Spring, target: number) => void
  wake: () => void
  snap: () => void
  stop: () => void
  reduced: boolean
}

export function createSpringLoop(
  springs: Spring[],
  paint: () => void
): SpringLoop {
  let raf = 0
  let last = 0

  const loop: SpringLoop = {
    reduced: false,
    settle(s, target) {
      s.target = target
      if (loop.reduced) {
        s.value = target
        s.velocity = 0
        paint()
        return
      }
      loop.wake()
    },
    wake() {
      if (raf) return
      last = performance.now()
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 15)
        last = now
        let settled = true
        for (const s of springs) {
          settled = (s.held ? false : advance(s, dt)) && settled
        }
        paint()
        raf = settled ? 0 : requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    },
    snap() {
      for (const s of springs) {
        s.value = s.target
        s.velocity = 0
      }
      paint()
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
  }

  return loop
}

export function supportsRefraction(): boolean {
  if (typeof window === "undefined") return false
  if (!CSS.supports("backdrop-filter", "blur(1px)")) return false
  const ua = navigator.userAgent
  if (/^((?!chrome|chromium|edg|android).)*safari/i.test(ua)) return false
  if (/firefox/i.test(ua)) return false
  return true
}

/* -------------------------------------------------------------------------- */
/* Backward-Compatible <LiquidLens> Wrapper                                   */
/* -------------------------------------------------------------------------- */

export interface LiquidLensProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px (use 999 for full capsule/circle). */
  radius?: number
  /** Optical bezel width in px (`0` = auto Apple bezel ratio). */
  bezel?: number
  /** Optical refraction intensity multiplier (default `1`). */
  refraction?: number
  /** Surface profile: `lip` (raised rim + zoomed-out bowl) or `convex` (magnifying dome). */
  profile?: LiquidLensProfile
  /** Spherical dome strength (`-1..1`; `> 0` magnifies, `< 0` zooms out). */
  curvature?: number
  /** Subtle RGB chromatic aberration on the curved bezel. */
  dispersion?: number
  /** Optional light backdrop blur in px (`0` = crystal clear). */
  blur?: number
  /** Backdrop saturation boost. */
  saturation?: number
  /** Optional backdrop brightness boost. */
  brightness?: number
  /** Specular white rim opacity (`0..1`). */
  specularOpacity?: number
  /** Coloured specular saturation boost. */
  specularSaturation?: number
  /** Light angle in degrees clockwise from top. */
  lightAngle?: number
  /** Visual rim style: `crystal` (wet coloured + specular rim) or `default`. */
  rim?: "default" | "crystal"
}

export function LiquidLens({
  radius = 999,
  bezel = 0,
  refraction = 1,
  profile = "lip",
  curvature,
  dispersion = 0.08,
  blur = 0,
  saturation = 1.08,
  brightness = 1.04,
  specularOpacity = 0.45,
  specularSaturation = 6,
  lightAngle = LENS_LIGHT_ANGLE,
  rim = "crystal",
  className,
  style,
  children,
  ...props
}: LiquidLensProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const filterId = `apple-lens-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const [canRefract, setCanRefract] = React.useState(false)

  React.useLayoutEffect(() => {
    setCanRefract(supportsRefraction())
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

  const { maps, scalePx } = React.useMemo(() => {
    if (!size || !canRefract) return { maps: null, scalePx: 0 }

    const minDim = Math.min(size.w, size.h)
    const r = Math.min(radius, size.w / 2, size.h / 2)
    const resolvedBezel = bezel > 0 ? bezel : 0.413 * r
    const intensity =
      refraction > 4 ? refraction / 24 : Math.max(0.05, refraction)
    const surface =
      profile === "convex"
        ? CONVEX
        : profile === "meniscus"
          ? MENISCUS
          : LIP
    const resolvedCurvature =
      curvature ??
      (profile === "convex" ? 0.4 : profile === "meniscus" ? 0 : 0.25)
    const peakFactor =
      profile === "convex" ? 0.54 : profile === "meniscus" ? 0.28 : 0.34

    const nextMaps = buildLensMaps({
      width: size.w,
      height: size.h,
      radius: r,
      bezel: resolvedBezel,
      surface,
      curvature: resolvedCurvature,
      lightAngle,
      dpr: Math.min(window.devicePixelRatio || 1, 3),
    })

    return {
      maps: nextMaps,
      scalePx: peakFactor * minDim * intensity,
    }
  }, [
    bezel,
    canRefract,
    curvature,
    lightAngle,
    profile,
    radius,
    refraction,
    size,
  ])

  const backdropAdjust: string[] = []
  if (!maps && blur > 0) backdropAdjust.push(`blur(${blur}px)`)
  if (brightness !== 1) backdropAdjust.push(`brightness(${brightness})`)
  if (saturation !== 1) backdropAdjust.push(`saturate(${saturation})`)
  const adjustFilter =
    backdropAdjust.length > 0 ? backdropAdjust.join(" ") : undefined

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
      {maps && size ? (
        <LensFilter
          id={filterId}
          maps={maps}
          width={size.w}
          height={size.h}
          scale={scalePx}
          blur={blur}
          specularOpacity={rim === "crystal" ? specularOpacity : 0.65}
          specularSaturation={specularSaturation}
          dispersion={dispersion}
        />
      ) : null}

      {adjustFilter ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backdropFilter: adjustFilter,
            WebkitBackdropFilter: adjustFilter,
          }}
        />
      ) : null}

      {maps ? (
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
