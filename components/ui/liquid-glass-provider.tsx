"use client"

import * as React from "react"
import { cn } from "cn"

export const LIQUID_GLASS_PRESETS = {
  clear: 0,
  regular: 0.5,
  tinted: 1,
} as const

export type LiquidGlassPreset = keyof typeof LIQUID_GLASS_PRESETS

export const LIQUID_GLASS_STORAGE_KEY = "apple-liquid-ui:glass-tint"
export const LIQUID_GLASS_MESSAGE_TYPE = "apple-liquid:set-glass-tint"
const DEFAULT_TINT: number = LIQUID_GLASS_PRESETS.regular

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
   * Persist user preference in `localStorage`. Pass `false` to disable persistence.
   * Automatically disabled when `syncToRoot={false}` unless explicitly provided.
   * @default "apple-liquid-ui:glass-tint"
   */
  storageKey?: string | false
  /**
   * When `true` (default), writes `--liquid-glass-tint` onto `document.documentElement`
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
  storageKey,
  syncToRoot = true,
  className,
}: LiquidGlassProviderProps) {
  const initialTint = resolveLiquidGlassTint(defaultTint, DEFAULT_TINT)
  const resolvedStorageKey =
    storageKey !== undefined
      ? storageKey
      : syncToRoot
        ? LIQUID_GLASS_STORAGE_KEY
        : false

  const isControlled = controlledTint !== undefined
  const [uncontrolledTint, setUncontrolledTint] =
    React.useState<number>(initialTint)

  const currentTint = isControlled
    ? clampLiquidGlassTint(controlledTint)
    : uncontrolledTint

  // Hydrate persisted preference and listen for cross-tab / iframe sync
  React.useEffect(() => {
    if (isControlled || !resolvedStorageKey) return

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

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== resolvedStorageKey || event.newValue === null) return
      const parsed = Number.parseFloat(event.newValue)
      if (Number.isFinite(parsed)) {
        setUncontrolledTint(clampLiquidGlassTint(parsed))
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data as
        | { type?: unknown; tint?: unknown }
        | null
        | undefined
      if (
        data &&
        data.type === LIQUID_GLASS_MESSAGE_TYPE &&
        typeof data.tint === "number" &&
        Number.isFinite(data.tint)
      ) {
        setUncontrolledTint(clampLiquidGlassTint(data.tint))
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("message", handleMessage)
    }
  }, [isControlled, resolvedStorageKey])

  // Sync CSS custom property to `:root` so portaled overlays inherit automatically
  React.useEffect(() => {
    if (!syncToRoot) return
    const root = document.documentElement
    root.style.setProperty("--liquid-glass-tint", String(currentTint))
  }, [currentTint, syncToRoot])

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

  const value = React.useMemo<LiquidGlassContextValue>(
    () => ({
      tint: currentTint,
      setTint,
      preset: getLiquidGlassPresetName(currentTint),
      setPreset,
      resetTint,
    }),
    [currentTint, resetTint, setPreset, setTint]
  )

  if (!syncToRoot) {
    return (
      <LiquidGlassContext.Provider value={value}>
        <div
          data-liquid-glass-scope=""
          style={
            { "--liquid-glass-tint": String(currentTint) } as React.CSSProperties
          }
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
 * Access and control the active Liquid Glass transparency / tint level.
 * Gracefully falls back to default `tint = 0.5` when used outside `<LiquidGlassProvider>`.
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
          <span
            className={cn(
              "font-mono tabular-nums",
              compact
                ? "text-[10px] text-muted-foreground"
                : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            )}
          >
            {modeLabel}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center",
          compact
            ? "gap-2 rounded-lg bg-background/70 px-2 py-1.5 ring-1 ring-border/70"
            : "gap-3 rounded-full bg-black/[0.06] px-4 py-2.5 dark:bg-white/[0.1]"
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

        <div className="relative flex flex-1 items-center py-1">
          {/* Background track */}
          <div
            aria-hidden="true"
            className={cn(
              "relative w-full overflow-hidden rounded-full bg-black/14 dark:bg-white/18",
              compact ? "h-1" : "h-1.5"
            )}
          >
            <div
              className="h-full rounded-full bg-(--apple-blue) transition-[width] duration-75"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Apple-style tick marks (Clear / Regular / Tinted) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-1 -bottom-0.5 flex justify-between"
          >
            <span className="size-[3px] rounded-full bg-foreground/25" />
            <span className="size-[3px] rounded-full bg-foreground/25" />
            <span className="size-[3px] rounded-full bg-foreground/25" />
          </div>

          {/* Visual Apple pill thumb */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08)] transition-[left] duration-75",
              compact ? "h-3.5 w-5" : "h-5 w-8"
            )}
            style={{
              left: `clamp(${compact ? "10px" : "16px"}, ${percent}%, calc(100% - ${compact ? "10px" : "16px"}))`,
            }}
          />

          {/* Accessible native range input overlay */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tint}
            aria-label="Liquid Glass 通透度（0 为透明，1 为色调）"
            aria-valuetext={`${modeLabel}（${percent}%）`}
            onChange={(e) => setTint(Number.parseFloat(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

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
