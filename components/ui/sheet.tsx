"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { XIcon } from "lucide-react"

import { LiquidSurfaceBackdrop, OverGlass } from "@/components/ui/liquid-surface"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/18 dark:bg-black/42",
        "transition-opacity duration-240 ease-out motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export interface SheetContentProps extends SheetPrimitive.Popup.Props {
  /**
   * Edge from which the sheet enters.
   * @default "right"
   */
  side?: "top" | "right" | "bottom" | "left"
  /**
   * Whether to render the top-right circular Apple Liquid Glass close button.
   * @default true
   */
  showCloseButton?: boolean
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop.
   * @default true
   */
  glass?: boolean
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  glass = true,
  ...props
}: SheetContentProps) {
  const isBottom = side === "bottom"
  const backdropRadius = isBottom ? 32 : 26

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        data-glass={glass ? "true" : "false"}
        className={cn(
          "fixed isolate z-50 flex flex-col gap-4 text-[14px] outline-none md:text-[13.5px]",
          "transition-[transform,opacity] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "data-starting-style:opacity-0 data-ending-style:opacity-0",
          // Surface: Apple 27 Liquid Glass vs Solid
          glass
            ? [
                "bg-transparent text-neutral-900 dark:text-white",
                "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.24),0_4px_16px_-4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                "dark:shadow-[0_28px_68px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
              ]
            : "border border-border/60 bg-popover text-popover-foreground shadow-xl",
          // Right side: mobile edge-docked r-l-28px <-> desktop macOS 27 floating glass panel r-26px
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-[86vw] data-[side=right]:max-w-sm data-[side=right]:rounded-l-[28px]",
          "md:data-[side=right]:inset-y-3 md:data-[side=right]:right-3 md:data-[side=right]:h-[calc(100dvh-1.5rem)] md:data-[side=right]:w-96 md:data-[side=right]:max-w-[calc(100vw-1.5rem)] md:data-[side=right]:rounded-[26px]",
          "data-[side=right]:data-starting-style:translate-x-10 data-[side=right]:data-ending-style:translate-x-10",
          // Left side
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-[86vw] data-[side=left]:max-w-sm data-[side=left]:rounded-r-[28px]",
          "md:data-[side=left]:inset-y-3 md:data-[side=left]:left-3 md:data-[side=left]:h-[calc(100dvh-1.5rem)] md:data-[side=left]:w-96 md:data-[side=left]:max-w-[calc(100vw-1.5rem)] md:data-[side=left]:rounded-[26px]",
          "data-[side=left]:data-starting-style:-translate-x-10 data-[side=left]:data-ending-style:-translate-x-10",
          // Bottom side: iOS 27 edge-to-edge bottom sheet <-> desktop floating bottom panel
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:max-h-[85dvh] data-[side=bottom]:rounded-t-[32px] data-[side=bottom]:pb-[env(safe-area-inset-bottom)]",
          "md:data-[side=bottom]:inset-x-4 md:data-[side=bottom]:bottom-4 md:data-[side=bottom]:mx-auto md:data-[side=bottom]:max-w-2xl md:data-[side=bottom]:rounded-[26px]",
          "data-[side=bottom]:data-starting-style:translate-y-10 data-[side=bottom]:data-ending-style:translate-y-10",
          // Top side
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:max-h-[85dvh] data-[side=top]:rounded-b-[32px]",
          "md:data-[side=top]:inset-x-4 md:data-[side=top]:top-4 md:data-[side=top]:mx-auto md:data-[side=top]:max-w-2xl md:data-[side=top]:rounded-[26px]",
          "data-[side=top]:data-starting-style:-translate-y-10 data-[side=top]:data-ending-style:-translate-y-10",
          className
        )}
        {...props}
      >
        {glass && (
          <LiquidSurfaceBackdrop
            radius={backdropRadius}
            bezel={22}
            openBottom={isBottom}
          />
        )}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <OverGlass enabled={glass}>{children}</OverGlass>
        </div>
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            aria-label="关闭"
            className={cn(
              "absolute top-4 right-4 z-10 inline-flex size-8 cursor-pointer items-center justify-center rounded-full outline-none md:size-7",
              "bg-black/[0.06] text-foreground/70 transition-colors hover:bg-black/[0.11] hover:text-foreground active:bg-black/[0.16]",
              "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40",
              "dark:bg-white/[0.12] dark:text-white/75 dark:hover:bg-white/[0.18] dark:hover:text-white dark:active:bg-white/[0.24]"
            )}
          >
            <XIcon className="size-4 stroke-[2.2] md:size-3.5" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1 px-5 pt-5 pr-12 pb-0", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex shrink-0 flex-col-reverse gap-2.5 px-5 pt-2 pb-5 md:flex-row md:justify-end",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-[17px] leading-snug font-semibold tracking-[-0.015em] text-foreground md:text-[16px]",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(
        "text-[14px] leading-relaxed text-muted-foreground md:text-[13px]",
        className
      )}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
