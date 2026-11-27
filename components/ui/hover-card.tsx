"use client"

import * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"
import { cn } from "cn"

import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

export interface HoverCardContentProps
  extends PreviewCardPrimitive.Popup.Props,
    Pick<
      PreviewCardPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    > {
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop.
   * @default true
   */
  glass?: boolean
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  glass = true,
  children,
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          data-glass={glass ? "true" : "false"}
          className={cn(
            "relative isolate z-50 w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-[22px] p-4 text-[13px] outline-none",
            glass
              ? [
                  "bg-transparent text-neutral-900 dark:text-white",
                  "shadow-[0_18px_46px_-8px_rgba(0,0,0,0.22),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                  "dark:shadow-[0_20px_52px_-8px_rgba(0,0,0,0.62),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
                ]
              : "border border-border/60 bg-popover text-popover-foreground shadow-lg",
            "transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.95] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.97] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {glass && <LiquidSurfaceBackdrop radius={22} bezel={18} tone="menu" />}
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
