"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import {
  liquidFieldGlassClassName,
  useLiquidFieldRefraction,
  useOverGlass,
} from "@/components/ui/liquid-surface"

const inputVariants = cva(
  [
    "flex w-full min-w-0 border border-transparent text-foreground caret-(--apple-blue) outline-none",
    "transition-[background-color,border-color,box-shadow] duration-180 ease-out motion-reduce:transition-none",
    "placeholder:text-muted-foreground/80",
    "selection:bg-(--apple-blue)/22 selection:text-foreground",
    // File input styling
    "file:mr-2.5 file:inline-flex file:h-6 file:cursor-pointer file:items-center file:rounded-full file:border-0 file:bg-black/[0.06] file:px-2.5 file:text-xs file:font-medium file:text-foreground file:transition-colors hover:file:bg-black/[0.1] dark:file:bg-white/[0.12] dark:hover:file:bg-white/[0.18]",
    // Apple macOS 27 / iOS 27 focus ring (3.5px crisp Apple Blue glow)
    "focus-visible:border-(--apple-blue)/85 focus-visible:ring-[3.5px] focus-visible:ring-(--apple-blue)/30",
    // Validation error state
    "aria-invalid:border-(--apple-red)/80 aria-invalid:ring-[3px] aria-invalid:ring-(--apple-red)/22",
    // Disabled state
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      size: {
        // Mobile iOS 27 touch ergonomics (16px font prevents Safari auto-zoom) -> Desktop macOS 27 precision
        sm: "h-9 rounded-full px-3.5 text-[15px] md:h-7 md:px-3 md:text-[12.5px]",
        default:
          "h-11 rounded-full px-4 text-[16px] md:h-8.5 md:px-3.5 md:text-[13px]",
        lg: "h-12 rounded-full px-4.5 text-[16px] md:h-10 md:px-4 md:text-[14px]",
      },
      appearance: {
        default:
          "bg-white/92 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] hover:bg-white dark:bg-[#1e1e1e]/88 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.34),0_0_0_0.5px_rgba(255,255,255,0.12)] dark:hover:bg-[#242424]/92",
        "over-glass":
          "bg-black/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.08)] hover:bg-black/[0.07] focus-visible:bg-white/85 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.1)] dark:hover:bg-white/[0.11] dark:focus-visible:bg-white/[0.12]",
        glass: liquidFieldGlassClassName,
      },
    },
    defaultVariants: {
      size: "default",
      appearance: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    Pick<VariantProps<typeof inputVariants>, "size"> {
  /**
   * Placement context: `default` (on content) or `over-glass` (on a Liquid Glass
   * surface, rendered as the kit's flat Over-Glass well). Detected automatically
   * inside glass surfaces (Dialog, Popover, Sheet, Drawer, glass Card, ...).
   */
  surface?: "default" | "over-glass"
  /**
   * Applies the shared Apple Liquid Glass `Regular - Small` control material
   * (same as glass `Button`), with SDF bezel refraction on Chromium (frosted
   * fallback elsewhere). On by default when standalone; never stacked on an
   * Over-Glass surface. Pass `glass={false}` for a solid surface.
   */
  glass?: boolean
}

function Input({
  className,
  type,
  size = "default",
  surface: surfaceProp,
  glass,
  ref,
  style,
  ...props
}: InputProps) {
  const onGlass = useOverGlass()
  const surface = surfaceProp ?? (onGlass ? "over-glass" : "default")
  const isGlass = surface !== "over-glass" && (glass ?? true)
  const appearance = isGlass ? "glass" : (surface ?? "default")
  const refraction = useLiquidFieldRefraction<HTMLInputElement>(isGlass, ref)

  return (
    <>
      <InputPrimitive
        ref={refraction.ref}
        type={type}
        data-slot="input"
        data-size={size ?? "default"}
        data-surface={surface ?? "default"}
        data-glass={isGlass ? "true" : undefined}
        className={cn(
          inputVariants({
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

export { Input, inputVariants }
