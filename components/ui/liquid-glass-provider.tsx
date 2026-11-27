"use client"

import * as React from "react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

export const LIQUID_GLASS_PRESETS = {
  clear: 0,
  regular: 0.5,
  tinted: 1,
} as const

export type LiquidGlassPreset = keyof typeof LIQUID_GLASS_PRESETS

// Apple 27 UI Kit "System Colors" (pressed = "Light Vibrant" / "Dark plus-lighter" swatches).
// Pink follows the macOS System Settings accent (`controlAccentColor` #F74F9E), since
// systemPink (#FF2D55) is nearly indistinguishable from systemRed next to it.
// Yellow light stays deepened (#F5A600 vs kit #FFCC00) to keep white labels legible.
export const LIQUID_GLASS_ACCENTS = {
  blue: {
    label: "蓝色",
    light: "#0088ff",
    dark: "#0091ff",
    pressedLight: "#0078f0",
    pressedDark: "#0a99ff",
  },
  purple: {
    label: "紫色",
    light: "#cb30e0",
    dark: "#db34f2",
    pressedLight: "#b72bc9",
    pressedDark: "#e647fc",
  },
  pink: {
    label: "粉色",
    light: "#f74f9e",
    dark: "#f74f9e",
    pressedLight: "#d93b86",
    pressedDark: "#ff59a8",
  },
  red: {
    label: "红色",
    light: "#ff383c",
    dark: "#ff4245",
    pressedLight: "#f52f32",
    pressedDark: "#ff4747",
  },
  orange: {
    label: "橙色",
    light: "#ff8d28",
    dark: "#ff9230",
    pressedLight: "#f58625",
    pressedDark: "#ff9e33",
  },
  yellow: {
    label: "黄色",
    light: "#f5a600",
    dark: "#ffd600",
    pressedLight: "#dc9200",
    pressedDark: "#ffe014",
  },
  green: {
    label: "绿色",
    light: "#34c759",
    dark: "#30d158",
    pressedLight: "#26bf4d",
    pressedDark: "#3bdb63",
  },
  graphite: {
    label: "石墨灰",
    light: "#8e8e93",
    dark: "#98989d",
    pressedLight: "#848489",
    pressedDark: "#a2a2a7",
  },
} as const

export type LiquidGlassAccentPreset = keyof typeof LIQUID_GLASS_ACCENTS
export type LiquidGlassAccent = LiquidGlassAccentPreset | (string & {})

export const LIQUID_GLASS_ACCENT_NAMES = Object.keys(
  LIQUID_GLASS_ACCENTS
) as LiquidGlassAccentPreset[]

export function isLiquidGlassAccentPreset(
  value: unknown
): value is LiquidGlassAccentPreset {
  return typeof value === "string" && value in LIQUID_GLASS_ACCENTS
}

export const LIQUID_GLASS_STORAGE_KEY = "apple-liquid-ui:glass-tint"
export const LIQUID_GLASS_MESSAGE_TYPE = "apple-liquid:set-glass-tint"
export const LIQUID_GLASS_ACCENT_STORAGE_KEY = "apple-liquid-ui:accent"
export const LIQUID_GLASS_ACCENT_MESSAGE_TYPE = "apple-liquid:set-accent"

const DEFAULT_TINT: number = LIQUID_GLASS_PRESETS.regular
const DEFAULT_ACCENT: LiquidGlassAccentPreset = "blue"

export function clampLiquidGlassTint(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TINT
  return Math.min(1, Math.max(0, Math.round(value * 100) / 100))
}

export function resolveLiquidGlassTint(
  value: number | LiquidGlassPreset | undefined,
  fallback: number = DEFAULT_TINT
): number {
  if (typeof value === "number") return clampLiquidGlassTint(value)
  if (typeof value === "string" && value in LIQUID_GLASS_PRESETS) {
    return LIQUID_GLASS_PRESETS[value]
  }
  return clampLiquidGlassTint(fallback)
}

export function resolveLiquidGlassAccent(
  value: LiquidGlassAccent | undefined,
  fallback: LiquidGlassAccent = DEFAULT_ACCENT
): LiquidGlassAccent {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return fallback
}

export function getLiquidGlassPresetName(
  tint: number
): LiquidGlassPreset | "custom" {
  if (tint <= 0.04) return "clear"
  if (Math.abs(tint - 0.5) <= 0.04) return "regular"
  if (tint >= 0.96) return "tinted"
  return "custom"
}

export interface LiquidGlassContextValue {
  /**
   * Current Liquid Glass tint opacity between `0` (Clear / 透明) and `1` (Tinted / 色调).
   */
  tint: number
  /**
   * Update tint continuously (`0`–`1`) or by preset (`"clear" | "regular" | "tinted"`).
   */
  setTint: (next: number | LiquidGlassPreset) => void
  /**
   * Active Apple preset if within tolerance, otherwise `"custom"`.
   */
  preset: LiquidGlassPreset | "custom"
  /**
   * Jump directly to a named preset (`"clear" | "regular" | "tinted"`).
   */
  setPreset: (preset: LiquidGlassPreset) => void
  /**
   * Reset tint back to the provider's `defaultTint`.
   */
  resetTint: () => void
  /**
   * Active Apple accent color preset name (e.g. `"blue"`, `"purple"`) or custom CSS color string.
   */
  accent: LiquidGlassAccent
  /**
   * Update the active accent color across all Liquid Glass components.
   */
  setAccent: (next: LiquidGlassAccent) => void
  /**
   * Reset accent color back to the provider's `defaultAccent`.
   */
  resetAccent: () => void
}

const LiquidGlassContext = React.createContext<LiquidGlassContextValue | null>(
  null
)

export interface LiquidGlassProviderProps {
  children: React.ReactNode
  /**
   * Initial Liquid Glass tint opacity (`0` = 透明 Clear, `0.5` = 标准 Regular, `1` = 色调 Tinted).
   * @default 0.5
   */
  defaultTint?: number | LiquidGlassPreset
  /**
   * Controlled tint value (`0`–`1`).
   */
  tint?: number
  /**
   * Callback fired whenever the tint value changes.
   */
  onTintChange?: (tint: number) => void
  /**
   * Initial Apple accent color preset or custom CSS color string.
   * @default "blue"
   */
  defaultAccent?: LiquidGlassAccent
  /**
   * Controlled accent color preset or custom CSS color string.
   */
  accent?: LiquidGlassAccent
  /**
   * Callback fired whenever the accent color changes.
   */
  onAccentChange?: (accent: LiquidGlassAccent) => void
  /**
   * Persist user tint preference in `localStorage`. Pass `false` to disable persistence.
   * Automatically disabled when `syncToRoot={false}` unless explicitly provided.
   * @default "apple-liquid-ui:glass-tint"
   */
  storageKey?: string | false
  /**
   * Persist user accent color preference in `localStorage`. Pass `false` to disable persistence.
   * Automatically disabled when `syncToRoot={false}` unless explicitly provided.
   * @default "apple-liquid-ui:accent"
   */
  accentStorageKey?: string | false
  /**
   * When `true` (default), writes `--liquid-glass-tint` & `data-apple-accent` onto `document.documentElement`
   * so all components and portaled overlays (Select dropdowns, Drawers, Dialogs, Popovers)
   * stay in sync. Set to `false` to isolate a local subtree (e.g. side-by-side comparison).
   * @default true
   */
  syncToRoot?: boolean
  /**
   * Optional className applied to the scoped wrapper `<div>` when `syncToRoot={false}`.
   */
  className?: string
}

export function LiquidGlassProvider({
  children,
  defaultTint = DEFAULT_TINT,
  tint: controlledTint,
  onTintChange,
  defaultAccent = DEFAULT_ACCENT,
  accent: controlledAccent,
  onAccentChange,
  storageKey,
  accentStorageKey,
  syncToRoot = true,
  className,
}: LiquidGlassProviderProps) {
  const initialTint = resolveLiquidGlassTint(defaultTint, DEFAULT_TINT)
  const initialAccent = resolveLiquidGlassAccent(defaultAccent, DEFAULT_ACCENT)

  const resolvedStorageKey =
    storageKey !== undefined
      ? storageKey
      : syncToRoot
        ? LIQUID_GLASS_STORAGE_KEY
        : false

  const resolvedAccentStorageKey =
    accentStorageKey !== undefined
      ? accentStorageKey
      : syncToRoot
        ? LIQUID_GLASS_ACCENT_STORAGE_KEY
        : false

  const isControlled = controlledTint !== undefined
  const [uncontrolledTint, setUncontrolledTint] =
    React.useState<number>(initialTint)

  const isAccentControlled = controlledAccent !== undefined
  const [uncontrolledAccent, setUncontrolledAccent] =
    React.useState<LiquidGlassAccent>(initialAccent)

  const currentTint = isControlled
    ? clampLiquidGlassTint(controlledTint)
    : uncontrolledTint

  const currentAccent = isAccentControlled
    ? resolveLiquidGlassAccent(controlledAccent, DEFAULT_ACCENT)
    : uncontrolledAccent

  // Hydrate persisted tint & accent preferences and listen for cross-tab / iframe sync
  React.useEffect(() => {
    if (!isControlled && resolvedStorageKey) {
      try {
        const saved = window.localStorage.getItem(resolvedStorageKey)
        if (saved !== null) {
          const parsed = Number.parseFloat(saved)
          if (Number.isFinite(parsed)) {
            setUncontrolledTint(clampLiquidGlassTint(parsed))
          }
        }
      } catch {
        // Ignore storage access errors
      }
    }

    if (!isAccentControlled && resolvedAccentStorageKey) {
      try {
        const savedAccent = window.localStorage.getItem(
          resolvedAccentStorageKey
        )
        if (savedAccent && savedAccent.trim().length > 0) {
          setUncontrolledAccent(savedAccent.trim())
        }
      } catch {
        // Ignore storage access errors
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        !isControlled &&
        resolvedStorageKey &&
        event.key === resolvedStorageKey &&
        event.newValue !== null
      ) {
        const parsed = Number.parseFloat(event.newValue)
        if (Number.isFinite(parsed)) {
          setUncontrolledTint(clampLiquidGlassTint(parsed))
        }
      }
      if (
        !isAccentControlled &&
        resolvedAccentStorageKey &&
        event.key === resolvedAccentStorageKey &&
        event.newValue
      ) {
        setUncontrolledAccent(event.newValue.trim())
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data as
        | { type?: unknown; tint?: unknown; accent?: unknown }
        | null
        | undefined
      if (!data) return

      if (
        !isControlled &&
        data.type === LIQUID_GLASS_MESSAGE_TYPE &&
        typeof data.tint === "number" &&
        Number.isFinite(data.tint)
      ) {
        setUncontrolledTint(clampLiquidGlassTint(data.tint))
      }

      if (
        !isAccentControlled &&
        data.type === LIQUID_GLASS_ACCENT_MESSAGE_TYPE &&
        typeof data.accent === "string" &&
        data.accent.trim().length > 0
      ) {
        setUncontrolledAccent(data.accent.trim())
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("message", handleMessage)
    }
  }, [
    isAccentControlled,
    isControlled,
    resolvedAccentStorageKey,
    resolvedStorageKey,
  ])

  // Sync tint CSS custom property to `:root` so portaled overlays inherit automatically
  React.useEffect(() => {
    if (!syncToRoot) return
    document.documentElement.style.setProperty(
      "--liquid-glass-tint",
      String(currentTint)
    )
  }, [currentTint, syncToRoot])

  // Sync accent color attribute / custom CSS property to `:root`
  React.useEffect(() => {
    if (!syncToRoot) return
    const root = document.documentElement
    if (isLiquidGlassAccentPreset(currentAccent)) {
      root.setAttribute("data-apple-accent", currentAccent)
      root.style.removeProperty("--apple-accent")
      root.style.removeProperty("--apple-accent-pressed")
    } else {
      root.setAttribute("data-apple-accent", "custom")
      root.style.setProperty("--apple-accent", currentAccent)
      root.style.setProperty(
        "--apple-accent-pressed",
        `color-mix(in srgb, ${currentAccent} 86%, black)`
      )
    }
  }, [currentAccent, syncToRoot])

  const setTint = React.useCallback(
    (next: number | LiquidGlassPreset) => {
      const clamped = resolveLiquidGlassTint(next, currentTint)
      if (!isControlled) {
        setUncontrolledTint(clamped)
      }
      if (resolvedStorageKey) {
        try {
          window.localStorage.setItem(resolvedStorageKey, String(clamped))
        } catch {
          // Ignore storage access errors
        }
      }
      onTintChange?.(clamped)
    },
    [currentTint, isControlled, onTintChange, resolvedStorageKey]
  )

  const setPreset = React.useCallback(
    (preset: LiquidGlassPreset) => {
      setTint(LIQUID_GLASS_PRESETS[preset])
    },
    [setTint]
  )

  const resetTint = React.useCallback(() => {
    setTint(initialTint)
  }, [initialTint, setTint])

  const setAccent = React.useCallback(
    (next: LiquidGlassAccent) => {
      const resolved = resolveLiquidGlassAccent(next, currentAccent)
      if (!isAccentControlled) {
        setUncontrolledAccent(resolved)
      }
      if (resolvedAccentStorageKey) {
        try {
          window.localStorage.setItem(resolvedAccentStorageKey, resolved)
        } catch {
          // Ignore storage access errors
        }
      }
      onAccentChange?.(resolved)
    },
    [
      currentAccent,
      isAccentControlled,
      onAccentChange,
      resolvedAccentStorageKey,
    ]
  )

  const resetAccent = React.useCallback(() => {
    setAccent(initialAccent)
  }, [initialAccent, setAccent])

  const value = React.useMemo<LiquidGlassContextValue>(
    () => ({
      tint: currentTint,
      setTint,
      preset: getLiquidGlassPresetName(currentTint),
      setPreset,
      resetTint,
      accent: currentAccent,
      setAccent,
      resetAccent,
    }),
    [
      currentAccent,
      currentTint,
      resetAccent,
      resetTint,
      setAccent,
      setPreset,
      setTint,
    ]
  )

  if (!syncToRoot) {
    const isPreset = isLiquidGlassAccentPreset(currentAccent)
    const scopedStyle: React.CSSProperties = {
      "--liquid-glass-tint": String(currentTint),
      ...(isPreset
        ? null
        : {
            "--apple-accent": currentAccent,
            "--apple-accent-pressed": `color-mix(in srgb, ${currentAccent} 86%, black)`,
          }),
    } as React.CSSProperties

    return (
      <LiquidGlassContext.Provider value={value}>
        <div
          data-liquid-glass-scope=""
          data-apple-accent={isPreset ? currentAccent : "custom"}
          style={scopedStyle}
          className={className}
        >
          {children}
        </div>
      </LiquidGlassContext.Provider>
    )
  }

  return (
    <LiquidGlassContext.Provider value={value}>
      {children}
    </LiquidGlassContext.Provider>
  )
}

/**
 * Access and control the active Liquid Glass transparency / tint level and Apple accent color.
 * Gracefully falls back to default `tint = 0.5` and `accent = "blue"` when used outside `<LiquidGlassProvider>`.
 */
export function useLiquidGlass(): LiquidGlassContextValue {
  const ctx = React.useContext(LiquidGlassContext)
  if (ctx) return ctx

  return {
    tint: DEFAULT_TINT,
    setTint: () => {},
    preset: "regular",
    setPreset: () => {},
    resetTint: () => {},
    accent: DEFAULT_ACCENT,
    setAccent: () => {},
    resetAccent: () => {},
  }
}

/** Hollow overlapping glass icon matching Apple Settings "Clear / 透明" */
function ClearGlassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
    >
      <rect
        x="2.25"
        y="3.5"
        width="10.5"
        height="8.5"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="7.25"
        y="8"
        width="10.5"
        height="8.5"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

/** Filled overlapping glass icon matching Apple Settings "Tinted / 色调" */
function TintedGlassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
    >
      <rect
        x="2.25"
        y="3.5"
        width="10.5"
        height="8.5"
        rx="2.75"
        fill="currentColor"
        fillOpacity="0.45"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="7.25"
        y="8"
        width="10.5"
        height="8.5"
        rx="2.75"
        fill="currentColor"
      />
    </svg>
  )
}

export interface LiquidGlassTintSliderProps {
  /**
   * Compact presentation for toolbars and sidebars.
   */
  compact?: boolean
  /**
   * Show the Apple Settings explanatory description underneath.
   */
  showDescription?: boolean
  /**
   * Show current percentage / preset label in the header.
   */
  showLabel?: boolean
  /**
   * Custom label text.
   * @default "Liquid Glass 通透度"
   */
  label?: React.ReactNode
  className?: string
}

/**
 * Ready-to-use Apple System Settings style "透明 (Clear) ↔ 色调 (Tinted)" slider.
 * Automatically reads and updates the nearest `<LiquidGlassProvider>`.
 */
export function LiquidGlassTintSlider({
  compact = false,
  showDescription = false,
  showLabel = true,
  label = "Liquid Glass 通透度",
  className,
}: LiquidGlassTintSliderProps) {
  const { tint, setTint, setPreset } = useLiquidGlass()
  const percent = Math.round(tint * 100)
  const modeLabel =
    percent <= 10 ? "透明" : percent >= 90 ? "色调" : `${percent}%`

  return (
    <div
      data-slot="liquid-glass-tint-slider"
      className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2.5", className)}
    >
      {showLabel ? (
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium",
              compact
                ? "text-[11px] text-muted-foreground"
                : "text-sm text-foreground"
            )}
          >
            {label}
          </span>
          {compact ? (
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {modeLabel}
            </span>
          ) : (
            <Badge
              variant="secondary"
              glass={false}
              size="sm"
              className="font-mono text-muted-foreground tabular-nums"
            >
              {modeLabel}
            </Badge>
          )}
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center",
          compact
            ? "gap-2 rounded-lg bg-background/70 px-2 py-0.5 ring-1 ring-border/70"
            : "gap-3 rounded-full bg-black/[0.06] px-4 py-1 dark:bg-white/[0.1]"
        )}
      >
        <button
          type="button"
          onClick={() => setPreset("clear")}
          aria-label="设为透明（更通透）"
          title="透明（Clear）"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
            tint <= 0.15
              ? "text-(--apple-blue)"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClearGlassIcon className={compact ? "size-3.5" : "size-5"} />
        </button>

        <Slider
          value={tint}
          onValueChange={(val) =>
            setTint(Array.isArray(val) ? (val[0] ?? DEFAULT_TINT) : val)
          }
          min={0}
          max={1}
          step={0.01}
          ticks={3}
          size={compact ? "sm" : "default"}
          aria-label="Liquid Glass 通透度（0 为透明，1 为色调）"
          className="flex-1"
        />

        <button
          type="button"
          onClick={() => setPreset("tinted")}
          aria-label="设为色调（更高不透明度）"
          title="色调（Tinted）"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
            tint >= 0.85
              ? "text-(--apple-blue)"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TintedGlassIcon className={compact ? "size-3.5" : "size-5"} />
        </button>
      </div>

      {showDescription ? (
        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          “透明”更通透，“色调”可增加不透明度，提升内容和控制项的对比度。
        </p>
      ) : null}
    </div>
  )
}

export interface LiquidGlassAccentPickerProps {
  /**
   * Compact presentation for toolbars and sidebars.
   */
  compact?: boolean
  /**
   * Show the header label and active color name.
   */
  showLabel?: boolean
  /**
   * Custom label text.
   * @default "强调色"
   */
  label?: React.ReactNode
  className?: string
}

/**
 * Ready-to-use Apple macOS System Settings style Accent Color swatch picker.
 * Automatically reads and updates the nearest `<LiquidGlassProvider>`.
 */
export function LiquidGlassAccentPicker({
  compact = false,
  showLabel = true,
  label = "强调色",
  className,
}: LiquidGlassAccentPickerProps) {
  const { accent, setAccent } = useLiquidGlass()
  const activeLabel = isLiquidGlassAccentPreset(accent)
    ? LIQUID_GLASS_ACCENTS[accent].label
    : "自定义"

  return (
    <div
      data-slot="liquid-glass-accent-picker"
      className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2.5", className)}
    >
      {showLabel ? (
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium",
              compact
                ? "text-[11px] text-muted-foreground"
                : "text-sm text-foreground"
            )}
          >
            {label}
          </span>
          {compact ? (
            <span className="text-[10px] text-muted-foreground">
              {activeLabel}
            </span>
          ) : (
            <Badge
              variant="secondary"
              glass={false}
              size="sm"
              className="text-muted-foreground"
            >
              {activeLabel}
            </Badge>
          )}
        </div>
      ) : null}

      <div
        role="radiogroup"
        aria-label="主题强调色"
        className={cn(
          "flex flex-wrap items-center justify-between",
          compact
            ? "gap-1 rounded-lg bg-background/70 px-2 py-1.5 ring-1 ring-border/70"
            : "gap-2 rounded-full bg-black/[0.06] px-3.5 py-2 dark:bg-white/[0.1]"
        )}
      >
        {LIQUID_GLASS_ACCENT_NAMES.map((name) => {
          const swatch = LIQUID_GLASS_ACCENTS[name]
          const isActive = accent === name
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`强调色：${swatch.label}`}
              title={swatch.label}
              onClick={() => setAccent(name)}
              className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 outline-none hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-(--apple-blue) focus-visible:ring-offset-1",
                compact ? "size-4" : "size-5.5"
              )}
              style={{
                backgroundColor: swatch.light,
                boxShadow: isActive
                  ? `0 0 0 2px var(--background), 0 0 0 3.5px ${swatch.light}`
                  : "inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.16)",
              }}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.28)]",
                    compact ? "size-1.5" : "size-2"
                  )}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
