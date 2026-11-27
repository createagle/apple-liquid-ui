"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { cn } from "cn"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/18 dark:bg-black/42",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  children,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm"
}) {
  const isMobile = useIsMobile()

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          // Mobile iOS 27 Centered Liquid Glass Alert (300px, r=34px, p=14px)
          // Desktop macOS 27 Centered Liquid Glass Alert (340px/300px, r=26px, p=20px)
          "group/alert-dialog-content fixed top-1/2 left-1/2 isolate z-50 grid w-[min(calc(100%-2.5rem),300px)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[34px] bg-transparent p-3.5 text-neutral-900 outline-none",
          "md:gap-5 md:rounded-[26px] md:p-5",
          "data-[size=sm]:md:w-[300px] data-[size=default]:md:w-[340px]",
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.24),0_4px_16px_-4px_rgba(0,0,0,0.09),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.94),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
          "dark:text-white dark:shadow-[0_28px_68px_-12px_rgba(0,0,0,0.72),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
          "transition-[transform,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "data-starting-style:scale-[0.92] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.95] data-ending-style:opacity-0",
          className
        )}
        {...props}
      >
        <LiquidSurfaceBackdrop
          radius={isMobile ? 34 : 26}
          bezel={isMobile ? 24 : 22}
        />
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        // iOS 27 Alert: centered text block with 8px inner inset -> macOS 27 Alert: left-aligned crisp hierarchy
        "flex flex-col items-center gap-2 px-2 pt-2 text-center md:items-start md:gap-1.5 md:px-1.5 md:pt-1 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        // Mobile (<768px): full-width stacked 48px capsule buttons (Action on top, Cancel on bottom for 2 actions; natural top-down order for 3+ actions)
        // Desktop (>=768px): macOS 27 side-by-side 28px capsule buttons for 2 actions, auto-stacked for 3+ actions
        "flex flex-col-reverse gap-2.5 has-[>:nth-child(3)]:flex-col",
        "md:grid md:grid-cols-2 md:gap-2 md:has-[>:nth-child(3)]:grid-cols-1",
        "[&>[data-slot=alert-dialog-action]]:w-full [&>[data-slot=alert-dialog-cancel]]:w-full",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-1.5 inline-flex size-12 items-center justify-center rounded-[14px] bg-black/[0.06] text-foreground shadow-[inset_0_0.5px_0_rgba(255,255,255,0.6)] md:size-11 md:rounded-[12px] dark:bg-white/[0.1] dark:shadow-[inset_0_0.5px_0_rgba(255,255,255,0.16)] *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-heading text-[17px] leading-[1.3] font-semibold tracking-[-0.015em] text-foreground md:text-[15px] md:leading-[1.35] md:font-semibold md:tracking-[-0.01em]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-[15px] leading-[1.4] text-balance text-muted-foreground md:text-[13.5px] md:leading-[1.5] md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  glass,
  surface,
  disableMotion,
  children,
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<
    React.ComponentProps<typeof Button>,
    "variant" | "size" | "glass" | "surface" | "disableMotion"
  >) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      render={
        <Button
          variant={variant}
          size={size}
          glass={glass}
          surface={surface}
          disableMotion={disableMotion}
          className={cn(
            "h-12 w-full text-[17px] font-semibold md:h-9 md:text-[13.5px] md:font-medium",
            className
          )}
        />
      }
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Close>
  )
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size = "default",
  glass,
  disableMotion,
  children,
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<
    React.ComponentProps<typeof Button>,
    "variant" | "size" | "glass" | "disableMotion"
  >) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={
        <Button
          variant={variant}
          surface="over-glass"
          size={size}
          glass={glass}
          disableMotion={disableMotion}
          className={cn(
            "h-12 w-full text-[17px] font-medium md:h-9 md:text-[13.5px] md:font-medium",
            className
          )}
        />
      }
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Close>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
