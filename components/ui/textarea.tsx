"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { useLiquidFieldRefraction } from "@/components/ui/liquid-surface"

const textareaVariants = cva(
  [
    "flex field-sizing-content w-full min-w-0 border border-transparent text-foreground caret-(--apple-blue) outline-none",
    "transition-[background-color,border-color,box-shadow] duration-180 ease-out motion-reduce:transition-none",
    "placeholder:text-muted-foreground/80",
    "selection:bg-(--apple-blue)/22 selection:text-foreground",
    // Apple macOS 27 / iOS 27 focus ring
    "focus-visible:border-(--apple-blue)/85 focus-visible:ring-[3.5px] focus-visible:ring-(--apple-blue)/30",
    // Validation error state
    "aria-invalid:border-(--apple-red)/80 aria-invalid:ring-[3px] aria-invalid:ring-(--apple-red)/22",
    // Disabled state
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-[72px] rounded-xl px-3 py-2 text-[15px] leading-relaxed md:min-h-[64px] md:rounded-[9px] md:px-2.5 md:py-1.5 md:text-[12.5px]",
        default:
          "min-h-[96px] rounded-[16px] px-3.5 py-2.5 text-[16px] leading-relaxed md:min-h-[84px] md:rounded-[12px] md:px-3 md:py-2 md:text-[13px]",
        lg: "min-h-[120px] rounded-[20px] px-4 py-3 text-[16px] leading-relaxed md:min-h-[108px] md:rounded-[14px] md:px-3.5 md:py-2.5 md:text-[14px]",
      },
      appearance: {
        default:
          "bg-white/92 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] hover:bg-white dark:bg-[#1e1e1e]/88 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.34),0_0_0_0.5px_rgba(255,255,255,0.12)] dark:hover:bg-[#242424]/92",
        "over-glass":
          "bg-black/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.08)] hover:bg-black/[0.07] focus-visible:bg-white/85 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.1)] dark:hover:bg-white/[0.11] dark:focus-visible:bg-white/[0.12]",
        glass:
          "bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_2px_10px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08)] hover:bg-(--liquid-surface-hover) focus-visible:bg-(--liquid-surface-hover) dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_-2px_rgba(0,0,0,0.38),0_0_0_0.5px_rgba(255,255,255,0.16)]",
      },
    },
    defaultVariants: {
      size: "default",
      appearance: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    Pick<VariantProps<typeof textareaVariants>, "size"> {
  /**
   * Adapts the textarea fill when placed inside a glass container (`over-glass`).
   */
  surface?: "default" | "over-glass"
  /**
   * Applies translucent Apple Liquid Glass backdrop surface (responds to `--liquid-glass-tint`)
   * with SDF bezel refraction on Chromium (CSS blur fallback elsewhere).
   * Enabled by default; pass `glass={false}` for a solid surface.
   * @default true
   */
  glass?: boolean
}

function Textarea({
  className,
  size = "default",
  surface = "default",
  glass,
  ref,
  style,
  ...props
}: TextareaProps) {
  const isGlass = glass ?? surface !== "over-glass"
  const appearance = isGlass ? "glass" : (surface ?? "default")
  const refraction = useLiquidFieldRefraction<HTMLTextAreaElement>(isGlass, ref)

  return (
    <>
      <textarea
        ref={refraction.ref}
        data-slot="textarea"
        data-size={size ?? "default"}
        data-surface={surface ?? "default"}
        data-glass={isGlass ? "true" : undefined}
        className={cn(
          textareaVariants({
            size: size ?? "default",
            appearance,
          }),
          className
        )}
        style={isGlass ? { ...refraction.style, ...style } : style}
        {...props}
      />
      {isGlass ? refraction.portal : null}
    </>
  )
}

export { Textarea, textareaVariants }
