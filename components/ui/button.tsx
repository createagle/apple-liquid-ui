"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { LiquiGlass, type LiquiGlassProps } from "@liqui-design/glass"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { motion, useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_PRESS_SCALE, LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { useLiquidGlass } from "@/components/ui/liquid-glass-provider"
import { getLiquidControlMaterial } from "@/components/ui/liquid-surface"

const MotionButtonPrimitive = motion.create(ButtonPrimitive)
const MotionLiquiGlass = motion.create(LiquiGlass)

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
        default: [
          "bg-(--apple-blue) text-white",
          "shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.28)]",
          "hover:brightness-[1.05] active:bg-(--apple-blue-pressed) active:brightness-95",
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
  LiquiGlassProps,
  | "material"
  | "profile"
  | "finish"
  | "lightAngle"
  | "edgeShade"
  | "hairline"
  | "brightness"
  | "tintFloor"
  | "frost"
  | "refraction"
  | "bezel"
  | "blur"
  | "dispersion"
  | "specular"
  | "saturation"
  | "elevated"
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
   * Enables Apple Liquid Glass optical refraction material orthogonally on top of
   * any semantic `variant` (`default` -> blue glass, `secondary`/`outline`/`ghost`
   * -> clear luminous glass, `destructive` -> clear glass with a red label).
   */
  glass?: boolean
  /**
   * Placement context from Apple macOS 27 UI Kit (`content` area vs `over-glass` surface).
   */
  surface?: "content" | "over-glass"
  /**
   * Disables Motion spring scale animations.
   */
  disableMotion?: boolean
  /**
   * Optional fine-tuning overrides forwarded to `@liqui-design/glass` (`LiquiGlass`)
   * when `glass` is enabled.
   */
  glassProps?: GlassOpticsOverrides
}

function getGlassTone(
  variant: NonNullable<ButtonProps["variant"]>
): GlassTone {
  // `destructive` follows the iOS 27 kit "Glass / Destructive": clear glass + red label.
  return variant === "default" ? "prominent" : "clear"
}

function getGlassTintStyle(
  tone: GlassTone,
  tint: number
): React.CSSProperties | undefined {
  if (tone === "clear") return undefined
  const primaryPct = Math.round(68 + tint * 30)
  const deepPct = Math.round(58 + tint * 32)
  const colorVar = "var(--lq-accent, #0088ff)"

  return {
    ["--lq-tint" as string]: `color-mix(in srgb, ${colorVar} ${primaryPct}%, transparent)`,
    ["--lq-tint-deep" as string]: `color-mix(in srgb, ${colorVar} ${deepPct}%, transparent)`,
  }
}

function getGlassOptics(
  tone: GlassTone,
  size: ButtonProps["size"],
  isMobile: boolean,
  tint: number
): GlassOpticsOverrides {
  const isCompact =
    size === "xs" || size === "sm" || size === "icon-xs" || size === "icon-sm"
  const bezel = isCompact ? (isMobile ? 10 : 8) : isMobile ? 14 : 11
  const refraction = isCompact ? (isMobile ? 42 : 34) : isMobile ? 56 : 46

  if (tone === "clear") {
    // Clean luminous glass with zero dark edge-shade smudges on corners;
    // responds continuously to global LiquidGlassProvider tint (0 = Clear, 1 = Tinted).
    // The material is shared with glass Input / Textarea so they match side by side.
    return {
      profile: "squircle",
      finish: "classic",
      lightAngle: -45,
      edgeShade: 0,
      hairline: 0.08,
      ...getLiquidControlMaterial(tint),
      refraction: Math.round(refraction * 0.65),
      bezel,
      elevated: true,
    }
  }

  // Tinted prominent glass: vibrant Apple System Blue (accent)
  return {
    profile: "squircle",
    finish: "classic",
    lightAngle: -45,
    edgeShade: 0,
    hairline: 0.06,
    brightness: 1.02,
    tintFloor: Number((0.35 + tint * 0.35).toFixed(2)),
    blur: Number((1.5 + tint * 4.5).toFixed(1)),
    frost: Number((0.55 + tint * 0.41).toFixed(2)),
    refraction: Math.round(refraction * 0.55),
    bezel,
    specular: Number((0.26 - tint * 0.1).toFixed(2)),
    saturation: 1.75,
    elevated: true,
  }
}

function Button({
  className,
  variant = "default",
  size = "default",
  glass = false,
  surface = "content",
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

  const resolvedVariant = variant ?? "default"
  const useGlass = Boolean(glass && resolvedVariant !== "link")
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
    const isIconSize =
      size === "icon" ||
      size === "icon-xs" ||
      size === "icon-sm" ||
      size === "icon-lg"
    const optics = {
      ...getGlassOptics(tone, size, isMobile, tint),
      ...glassProps,
    }

    return (
      <MotionLiquiGlass
        radius={999}
        {...optics}
        whileHover={shouldAnimate && !isMobile ? { scale: 1.02 } : undefined}
        whileTap={shouldAnimate ? { scale: tapScale } : undefined}
        transition={pressTransition}
        className={cn(
          "inline-flex shrink-0 align-middle",
          disabled && "pointer-events-none opacity-45",
          className
        )}
        contentClassName="flex size-full items-center justify-center"
        style={{
          ...getGlassTintStyle(tone, tint),
          ["--lq-shadow" as string]:
            tone === "clear"
              ? "0 8px 20px -4px rgba(10, 15, 40, 0.14), 0 2px 6px rgba(10, 15, 40, 0.08)"
              : "0 8px 20px -4px rgba(0, 136, 255, 0.28), 0 2px 6px rgba(0, 0, 0, 0.1)",
          ...style,
        }}
      >
        <ButtonPrimitive
          data-slot="button"
          data-variant={resolvedVariant}
          data-glass=""
          data-size={size ?? "default"}
          data-surface={surface}
          disabled={disabled}
          className={cn(
            // The glass material replaces the variant's own fills, borders and
            // shadows (incl. `md:` / `dark:` ones), so only base + size classes apply.
            buttonVariants({ variant: null, size }),
            !isIconSize && "w-full",
            "rounded-full border-0",
            tone === "clear"
              ? "text-(--lq-text) hover:bg-white/14 active:bg-black/6 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/16"
              : "text-white hover:bg-white/10 active:bg-black/12",
            resolvedVariant === "destructive" &&
              "text-(--apple-red) focus-visible:ring-(--apple-red)/40 dark:text-(--apple-red)"
          )}
          {...props}
        >
          {children}
        </ButtonPrimitive>
      </MotionLiquiGlass>
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
