"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

function TooltipProvider({
  delay = 250,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export interface TooltipContentProps
  extends TooltipPrimitive.Popup.Props,
    Pick<
      TooltipPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    > {
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop.
   * @default true
   */
  glass?: boolean
  /**
   * Render a subtle directional pointer arrow (disabled by default to match macOS 27 floating pills).
   * @default false
   */
  showArrow?: boolean
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 7,
  align = "center",
  alignOffset = 0,
  glass = true,
  showArrow = false,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          data-glass={glass ? "true" : "false"}
          className={cn(
            "relative isolate z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-[11px] px-2.5 py-1.5 text-[12px] leading-snug font-medium outline-none",
            "has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-10 **:data-[slot=kbd]:rounded-[5px]",
            glass
              ? [
                  "bg-transparent text-neutral-900 dark:text-white",
                  "**:data-[slot=kbd]:bg-black/[0.08] **:data-[slot=kbd]:text-foreground/80 dark:**:data-[slot=kbd]:bg-white/[0.14] dark:**:data-[slot=kbd]:text-white/85",
                  "shadow-[0_10px_28px_-6px_rgba(0,0,0,0.2),0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-0.5px_0_rgba(255,255,255,0.3)]",
                  "dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.62),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
                ]
              : "bg-foreground text-background shadow-md",
            "transition-[transform,opacity] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.94] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.96] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {glass && (
            <LiquidSurfaceBackdrop
              radius={11}
              bezel={10}
              refraction={0.75}
              tone="menu"
            />
          )}
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow
              className={cn(
                "z-50 size-2 translate-y-[calc(-50%-1px)] rotate-45 rounded-[2px]",
                glass
                  ? "bg-(--liquid-surface-menu) shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.16)]"
                  : "bg-foreground fill-foreground",
                "data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2"
              )}
            />
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
