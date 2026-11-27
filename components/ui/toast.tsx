"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

const toast = ToastPrimitive.createToastManager()

export type ToastPosition = "top-right" | "top-center" | "bottom-right"

const ToastPositionContext = React.createContext<ToastPosition>("top-right")

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({
  className,
  position,
  ...props
}: ToastPrimitive.Viewport.Props & {
  position?: ToastPosition
}) {
  const ctxPosition = React.useContext(ToastPositionContext)
  const resolved = position ?? ctxPosition
  const isTop = resolved !== "bottom-right"

  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      data-position={resolved}
      className={cn(
        "pointer-events-none fixed z-50 mx-auto w-[calc(100%-1.5rem)] max-w-[366px] outline-none",
        isTop
          ? resolved === "top-center"
            ? "inset-x-3 top-3 md:top-4"
            : "inset-x-3 top-3 md:right-4 md:left-auto md:mx-0 md:top-4 md:w-[360px]"
          : "inset-x-3 bottom-4 md:right-4 md:left-auto md:mx-0 md:w-[360px]",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  glass = true,
  children,
  ...props
}: ToastPrimitive.Root.Props & {
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop.
   * @default true
   */
  glass?: boolean
}) {
  const position = React.useContext(ToastPositionContext)
  const isTop = position !== "bottom-right"

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-glass={glass ? "true" : "false"}
      data-anchor={isTop ? "top" : "bottom"}
      className={cn(
        "group/toast pointer-events-auto absolute right-0 isolate z-[calc(1000-var(--toast-index))] w-full rounded-[24px] will-change-transform outline-none select-none md:rounded-[20px]",
        "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40",
        glass
          ? [
              "bg-transparent text-neutral-900 dark:text-white",
              "shadow-[0_18px_46px_-8px_rgba(0,0,0,0.22),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
              "dark:shadow-[0_22px_54px_-8px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
            ]
          : "border border-border/60 bg-popover text-popover-foreground shadow-lg",
        // Shared stacking variables
        "[--gap:0.625rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--peek:0.625rem] [--scale:calc(max(0,1-(var(--toast-index)*0.06)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transition:transform_460ms_cubic-bezier(0.22,1,0.36,1),opacity_400ms,height_160ms] motion-reduce:transition-none",
        // Top-anchored stacking (Apple macOS 27 / iOS 27 Notification Banner)
        isTop
          ? [
              "top-0 origin-top",
              "[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
              "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
              "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+2px)] after:w-full after:content-['']",
              "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
              "data-limited:opacity-0 data-starting-style:opacity-0 data-starting-style:[transform:translateY(-130%)_scale(0.96)]",
              "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:opacity-0 [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-130%)_scale(0.96)]",
            ]
          : [
              "bottom-0 origin-bottom",
              "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
              "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
              "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+2px)] after:w-full after:content-['']",
              "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
              "data-limited:opacity-0 data-starting-style:opacity-0 data-starting-style:[transform:translateY(140%)_scale(0.96)]",
              "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:opacity-0 [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(140%)_scale(0.96)]",
            ],
        // Swipe dismissal
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    >
      {glass && <LiquidSurfaceBackdrop radius={22} bezel={18} tone="sheet" />}
      {children}
    </ToastPrimitive.Root>
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden px-3.5 py-3 transition-opacity duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "text-[14px] leading-snug font-semibold tracking-[-0.01em] text-foreground md:text-[13px]",
        className
      )}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        "text-[13px] leading-snug text-muted-foreground md:text-[12.5px]",
        className
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="secondary" surface="over-glass" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="关闭通知"
      className={cn(
        "relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none",
        "bg-black/[0.06] text-foreground/65 transition-colors hover:bg-black/[0.12] hover:text-foreground",
        "dark:bg-white/[0.12] dark:text-white/70 dark:hover:bg-white/[0.2] dark:hover:text-white",
        "after:absolute after:-inset-2 after:content-['']",
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="size-3.5 stroke-[2.2]" aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null
  let badgeClass = ""

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />
    badgeClass =
      "bg-[#34C759]/15 text-[#248A3D] dark:bg-[#30D158]/20 dark:text-[#30D158]"
  } else if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />
    badgeClass =
      "bg-(--apple-blue)/15 text-(--apple-blue) dark:bg-(--apple-blue)/22"
  } else if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />
    badgeClass =
      "bg-[#FF9500]/16 text-[#C96B00] dark:bg-[#FF9F0A]/22 dark:text-[#FF9F0A]"
  } else if (type === "error") {
    icon = <OctagonXIcon aria-hidden="true" />
    badgeClass =
      "bg-[#FF3B30]/15 text-[#D70015] dark:bg-[#FF453A]/22 dark:text-[#FF453A]"
  } else if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />
    badgeClass =
      "bg-black/[0.07] text-foreground/75 dark:bg-white/[0.12] dark:text-white/80"
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:pointer-events-none [&_svg]:size-4",
        badgeClass
      )}
    >
      {icon}
    </span>
  )
}

function ToastList({ glass = true }: { glass?: boolean }) {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} glass={glass}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

export interface ToasterProps extends ToastPrimitive.Provider.Props {
  /**
   * Notification banner position.
   * Defaults to `"top-right"` (macOS 27 top-right banner on desktop, iOS 27 top-center banner on mobile).
   * @default "top-right"
   */
  position?: ToastPosition
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop on toasts.
   * @default true
   */
  glass?: boolean
}

function Toaster({
  children,
  toastManager = toast,
  position = "top-right",
  glass = true,
  ...props
}: ToasterProps) {
  return (
    <ToastPositionContext.Provider value={position}>
      <ToastProvider toastManager={toastManager} {...props}>
        {children}
        <ToastPortal>
          <ToastViewport position={position}>
            <ToastList glass={glass} />
          </ToastViewport>
        </ToastPortal>
      </ToastProvider>
    </ToastPositionContext.Provider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
