"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { motion, useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_PRESS_SCALE, LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { useLiquidGlass } from "@/components/ui/liquid-glass-provider"
import {
  LiquidSurfaceBackdrop,
  useOverGlass,
  type LiquidSurfaceBackdropProps,
} from "@/components/ui/liquid-surface"

const MotionButtonPrimitive = motion.create(ButtonPrimitive)

type GlassTone = "clear" | "prominent"

const sizeClasses = {
  // Mobile iOS 27 Small (28px, 14px) -> Desktop macOS 27 (24px, 11.5px)
  xs: "h-7 gap-1 px-3 text-[14px] [&_svg:not([class*='size-'])]:size-3.5 md:h-6 md:px-2.5 md:text-[11.5px]",

  // Mobile iOS 27 Regular/Medium (34px, 15px) -> Desktop macOS 27 (28px, 12.5px)
  sm: "h-[34px] gap-1.5 px-3.5 text-[15px] [&_svg:not([class*='size-'])]:size-3.5 md:h-7 md:px-3 md:text-[12.5px]",

  // Mobile iOS 27 Large Glass (46px, 17px) -> Desktop macOS 27 (32px, 13.5px)
  default:
    "h-[46px] gap-2 px-5 text-[17px] [&_svg:not([class*='size-'])]:size-[18px] md:h-8 md:gap-1.5 md:px-3.5 md:text-[13.5px] md:[&_svg:not([class*='size-'])]:size-4",

  // Mobile iOS 27 Large Prominent (50px, 17px) -> Desktop macOS 27 XL (36px, 14px)
  lg: "h-[50px] gap-2 px-6 text-[17px] [&_svg:not([class*='size-'])]:size-5 md:h-9 md:px-4.5 md:text-[14px] md:[&_svg:not([class*='size-'])]:size-4",

  "icon-xs":
    "size-7 [&_svg:not([class*='size-'])]:size-3.5 md:size-6",

  "icon-sm":
    "size-[34px] [&_svg:not([class*='size-'])]:size-3.5 md:size-7",

  // Mobile iOS 27 HIG touch target (44px circle) -> Desktop macOS 27 (32px circle)
  icon: "size-11 [&_svg:not([class*='size-'])]:size-5 md:size-8 md:[&_svg:not([class*='size-'])]:size-4",

  "icon-lg":
    "size-[50px] [&_svg:not([class*='size-'])]:size-5 md:size-9 md:[&_svg:not([class*='size-'])]:size-4",
} as const

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border border-transparent bg-clip-padding font-medium whitespace-nowrap outline-none select-none",
    "transition-[background-color,color,border-color,box-shadow,filter,opacity] duration-200 ease-out",
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-(--apple-red) aria-invalid:ring-3 aria-invalid:ring-(--apple-red)/25",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "rounded-full tracking-[-0.015em] md:tracking-[-0.005em]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary action: Solid Apple Blue (combines with `glass` for blue Liquid Glass)
        // Over-Glass: kit `Over-Glass / Prominent (Default)` is a flat accent fill (no bevel shadow)
        default: [
          "bg-(--apple-blue) text-white",
          "shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.28)]",
          "hover:brightness-[1.05] active:bg-(--apple-blue-pressed) active:brightness-95",
          "data-[surface=over-glass]:shadow-none",
        ].join(" "),

        // Secondary action: iOS 27 Tertiary Fill -> macOS 27 Neutral Fill (combines with `glass` for clear Liquid Glass)
        secondary: [
          "bg-(--apple-fill-bordered-ios) text-(--apple-blue) active:bg-(--apple-fill-bordered-ios-pressed)",
          "md:bg-(--apple-fill-bordered-mac) md:text-neutral-800 md:hover:bg-(--apple-fill-bordered-mac-hover) md:active:bg-(--apple-fill-bordered-mac-pressed) md:dark:text-white/95",
          "data-[surface=over-glass]:bg-(--apple-fill-over-glass) data-[surface=over-glass]:active:bg-(--apple-fill-over-glass-pressed)",
        ].join(" "),

        // Subtle translucent glass-edged outline
        outline: [
          "border-border/80 bg-background/60 text-foreground backdrop-blur-md",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]",
          "hover:bg-muted/70 active:bg-muted",
          "dark:border-white/15 dark:bg-white/6 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:hover:bg-white/12",
        ].join(" "),

        // Borderless action (subtle bezel on hover/press)
        ghost: [
          "bg-transparent text-(--apple-blue) active:bg-(--apple-fill-bordered-ios)",
          "md:text-foreground md:hover:bg-(--apple-fill-bordered-mac) md:active:bg-(--apple-fill-bordered-mac-pressed)",
        ].join(" "),

        // Destructive action: tinted red fill + red label
        // iOS 27 Bordered Destructive (14%) -> macOS 27 Alert Destructive (23% / 25%)
        // (combines with `glass` for clear Liquid Glass with a red label)
        destructive: [
          "bg-(--apple-fill-destructive-ios) text-(--apple-red) active:bg-(--apple-fill-destructive-ios-pressed)",
          "md:bg-(--apple-fill-destructive-mac) md:text-(--apple-label-destructive-mac) md:active:bg-(--apple-fill-destructive-mac-pressed)",
          "focus-visible:ring-(--apple-red)/40",
        ].join(" "),

        link: "text-(--apple-blue) underline-offset-4 hover:underline",
      },
      size: sizeClasses,
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type GlassOpticsOverrides = Pick<
  LiquidSurfaceBackdropProps,
  "refraction" | "bezel" | "dispersion"
>

type ButtonBaseProps = Omit<
  ButtonPrimitive.Props,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
> & {
  style?: React.CSSProperties
}

export interface ButtonProps
  extends ButtonBaseProps,
    VariantProps<typeof buttonVariants> {
  /**
   * Enables the Apple Liquid Glass `Regular - Small` control material orthogonally
   * on top of any semantic `variant` (`default` -> blue glass,
   * `secondary`/`outline`/`ghost` -> clear glass, `destructive` -> clear glass
   * with a red label). Apple never stacks glass on glass: on an Over-Glass
   * surface the button renders the kit's flat Over-Glass fill instead.
   */
  glass?: boolean
  /**
   * Placement context from the Apple 27 UI Kits: `content` (on app content) or
   * `over-glass` (on a Liquid Glass surface). Detected automatically from the
   * enclosing glass surface (Dialog, Popover, Sheet, Drawer, glass Card, ...);
   * pass it explicitly to override.
   */
  surface?: "content" | "over-glass"
  /**
   * Disables Motion spring scale animations.
   */
  disableMotion?: boolean
  /**
   * Optional optics overrides for the glass layer when `glass` is enabled.
   */
  glassProps?: GlassOpticsOverrides
}

function getGlassTone(
  variant: NonNullable<ButtonProps["variant"]>
): GlassTone {
  // `destructive` follows the iOS 27 kit "Glass / Destructive": clear glass + red label.
  return variant === "default" ? "prominent" : "clear"
}

/**
 * Prominent glass (kit `Liquid Glass / Regular - Small - Tinted`): the shared
 * control material densely washed with the accent color, so it stays a vivid
 * accent capsule even at Clear.
 */
function getProminentGlassStyle(tint: number): React.CSSProperties {
  const t = Math.max(0, Math.min(1, tint))
  const colorVar = "var(--lq-accent, #0088ff)"
  return {
    ["--lq-tint" as string]: `color-mix(in srgb, ${colorVar} ${Math.round(90 + t * 10)}%, transparent)`,
    ["--lq-tint-deep" as string]: `color-mix(in srgb, ${colorVar} ${Math.round(82 + t * 16)}%, transparent)`,
    ["--lq-glass-fill" as string]: Number((0.84 + t * 0.14).toFixed(3)),
  }
}

function Button({
  className,
  variant = "default",
  size = "default",
  glass = false,
  surface: surfaceProp,
  disableMotion = false,
  glassProps,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const isMobile = useIsMobile()
  const { tint } = useLiquidGlass()
  const prefersReducedMotion = useReducedMotion()
  const onGlass = useOverGlass()
  const surface = surfaceProp ?? (onGlass ? "over-glass" : "content")

  const resolvedVariant = variant ?? "default"
  const useGlass = Boolean(
    glass && resolvedVariant !== "link" && surface !== "over-glass"
  )
  const shouldAnimate =
    !disableMotion &&
    !prefersReducedMotion &&
    !disabled &&
    resolvedVariant !== "link"

  const pressTransition = isMobile
    ? LIQUID_SPRINGS.iosPress
    : LIQUID_SPRINGS.macosPress

  const tapScale = isMobile
    ? LIQUID_PRESS_SCALE.ios
    : LIQUID_PRESS_SCALE.macos

  if (useGlass) {
    const tone = getGlassTone(resolvedVariant)

    return (
      <MotionButtonPrimitive
        data-slot="button"
        data-variant={resolvedVariant}
        data-glass=""
        data-size={size ?? "default"}
        data-surface={surface}
        disabled={disabled}
        style={style}
        className={cn(
          // The glass layer replaces the variant's own fills, borders and
          // shadows (incl. `md:` / `dark:` ones), so only base + size classes apply.
          buttonVariants({ variant: null, size }),
          // `isolate` keeps the -z-10 glass layer inside the button; the glass
          // layer clips itself, so the drop shadow may overflow the capsule
          "isolate overflow-visible rounded-full border-0",
          // Hover / press wash between the glass layer and the label
          "after:pointer-events-none after:absolute after:inset-0 after:-z-5 after:rounded-[inherit] after:transition-colors after:duration-200",
          tone === "clear"
            ? "text-(--lq-text) hover:after:bg-white/14 active:after:bg-black/6 dark:text-white dark:hover:after:bg-white/10 dark:active:after:bg-white/16"
            : "text-white hover:after:bg-white/10 active:after:bg-black/12",
          resolvedVariant === "destructive" &&
            "text-(--apple-red) focus-visible:ring-(--apple-red)/40 dark:text-(--apple-red)",
          // Opacity on the host would make it a Backdrop Root and blank the
          // glass, so disabled dims the layer and the label instead
          "disabled:opacity-100 disabled:*:opacity-45",
          tone === "clear"
            ? "disabled:text-(--lq-text-dim)"
            : "disabled:text-white/60",
          className
        )}
        whileHover={shouldAnimate && !isMobile ? { scale: 1.02 } : undefined}
        whileTap={shouldAnimate ? { scale: tapScale } : undefined}
        transition={pressTransition}
        {...props}
      >
        <LiquidSurfaceBackdrop
          size="small"
          {...glassProps}
          className={
            tone === "prominent"
              ? "shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_-1px_-1px_1px_rgba(255,255,255,0.18),0_8px_20px_-4px_rgba(0,136,255,0.28),0_2px_6px_rgba(0,0,0,0.1)]"
              : undefined
          }
          style={tone === "prominent" ? getProminentGlassStyle(tint) : undefined}
        />
        {children}
      </MotionButtonPrimitive>
    )
  }

  return (
    <MotionButtonPrimitive
      data-slot="button"
      data-variant={resolvedVariant}
      data-size={size ?? "default"}
      data-surface={surface}
      disabled={disabled}
      style={style}
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      whileTap={shouldAnimate ? { scale: tapScale } : undefined}
      transition={pressTransition}
      {...props}
    >
      {children}
    </MotionButtonPrimitive>
  )
}

export { Button, buttonVariants }
