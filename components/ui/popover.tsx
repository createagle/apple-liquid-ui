"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

import { useIsMobile } from "@/hooks/use-mobile"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface PopoverContextValue {
  isMobile: boolean
}

const PopoverContext = React.createContext<PopoverContextValue>({
  isMobile: false,
})

function usePopoverContext() {
  return React.useContext(PopoverContext)
}

function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: PopoverPrimitive.Root.Props) {
  const isMobile = useIsMobile()
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isControlled ? Boolean(controlledOpen) : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean, eventDetails?: unknown) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      ;(
        onOpenChange as
          | ((open: boolean, eventDetails?: unknown) => void)
          | undefined
      )?.(next, eventDetails)
    },
    [isControlled, onOpenChange]
  )

  const ctxValue = React.useMemo(() => ({ isMobile }), [isMobile])

  if (isMobile) {
    return (
      <PopoverContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={handleOpenChange}
          swipeDirection="down"
          showSwipeHandle
        >
          {children}
        </Drawer>
      </PopoverContext.Provider>
    )
  }

  return (
    <PopoverContext.Provider value={ctxValue}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={currentOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  const { isMobile } = usePopoverContext()
  if (isMobile) {
    return (
      <DrawerTrigger
        data-slot="popover-trigger"
        {...(props as React.ComponentProps<typeof DrawerTrigger>)}
      />
    )
  }
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  const { isMobile } = usePopoverContext()
  if (isMobile) {
    return (
      <DrawerClose
        data-slot="popover-close"
        {...(props as React.ComponentProps<typeof DrawerClose>)}
      />
    )
  }
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

export interface PopoverContentProps
  extends Omit<PopoverPrimitive.Popup.Props, "title">,
    Pick<
      PopoverPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    > {
  /**
   * Optional accessible sheet title for mobile drawer viewports when no `<PopoverTitle>` is rendered.
   */
  mobileTitle?: React.ReactNode
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  mobileTitle,
  children,
  ...props
}: PopoverContentProps) {
  const { isMobile } = usePopoverContext()

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="popover-content"
        backdrop={<LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />}
        className={cn(
          // Apple iOS 27 Edge-to-Edge Liquid Glass Bottom Sheet (Popovers adapt to Sheet on compact iPhone viewports)
          "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
          "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
          "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
          "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
          "[&_[data-slot=drawer-swipe-handle]]:h-4 [&_[data-slot=drawer-swipe-handle]]:after:h-[5px] [&_[data-slot=drawer-swipe-handle]]:after:w-9 [&_[data-slot=drawer-swipe-handle]]:after:bg-black/20 dark:[&_[data-slot=drawer-swipe-handle]]:after:bg-white/25",
          "after:hidden",
          className,
          "w-auto! max-w-none!"
        )}
        {...(props as React.ComponentProps<typeof DrawerContent>)}
      >
        {mobileTitle ? (
          <DrawerHeader className="items-center px-5 pt-3 pb-1 text-center">
            <DrawerTitle className="font-heading text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
              {mobileTitle}
            </DrawerTitle>
          </DrawerHeader>
        ) : null}
        <div className="relative flex max-h-[calc(100dvh-7.5rem)] flex-col gap-3.5 overflow-x-hidden overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    )
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            // Apple macOS 27 Floating Liquid Glass Popover (r=20px, true optical bezel refraction)
            "relative isolate z-50 flex w-80 max-w-[calc(100vw-2rem)] origin-(--transform-origin) flex-col gap-3 rounded-[20px] bg-transparent p-4 text-[13px] text-neutral-900 outline-none",
            "shadow-[0_18px_46px_-8px_rgba(0,0,0,0.22),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
            "dark:text-white dark:shadow-[0_20px_52px_-8px_rgba(0,0,0,0.62),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
            "transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.95] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.97] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          <LiquidSurfaceBackdrop radius={20} bezel={18} tone="menu" />
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function isPopoverTitleNode(node: React.ReactNode): boolean {
  if (!React.isValidElement(node)) return false
  const type = node.type as { displayName?: string; name?: string } | string
  if (type === PopoverTitle) return true
  if (typeof type === "function" || typeof type === "object") {
    const name = type?.displayName ?? type?.name
    if (name && /Title$/.test(name)) return true
  }
  return false
}

function PopoverHeader({
  className,
  leading,
  trailing,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  leading?: React.ReactNode
  trailing?: React.ReactNode
}) {
  const { isMobile } = usePopoverContext()

  if (isMobile) {
    return (
      <DrawerHeader
        data-slot="popover-header"
        leading={leading}
        trailing={trailing}
        className={cn("w-full items-center gap-1 p-0 text-center", className)}
        {...props}
      >
        {children}
      </DrawerHeader>
    )
  }

  if (leading !== undefined || trailing !== undefined) {
    const childArray = React.Children.toArray(children)
    const explicitTitles = childArray.filter(isPopoverTitleNode)
    const titleNodes =
      explicitTitles.length > 0 ? explicitTitles : childArray.slice(0, 1)
    const restNodes =
      explicitTitles.length > 0
        ? childArray.filter((child) => !isPopoverTitleNode(child))
        : childArray.slice(1)

    return (
      <div
        data-slot="popover-header"
        className={cn("flex w-full flex-col gap-1 text-left", className)}
        {...props}
      >
        <div className="flex min-h-6 w-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {leading}
            {titleNodes}
          </div>
          {trailing != null ? (
            <div className="flex shrink-0 items-center">{trailing}</div>
          ) : null}
        </div>
        {restNodes}
      </div>
    )
  }

  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-left", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  const { isMobile } = usePopoverContext()

  if (isMobile) {
    return (
      <DrawerTitle
        data-slot="popover-title"
        className={cn(
          "m-0 font-heading text-[18px] leading-[1.25] font-semibold tracking-[-0.015em] text-foreground",
          className
        )}
        {...(props as React.ComponentProps<typeof DrawerTitle>)}
      />
    )
  }

  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn(
        "m-0 font-heading text-[14px] leading-snug font-semibold tracking-[-0.01em] text-foreground",
        className
      )}
      {...props}
    />
  )
}
PopoverTitle.displayName = "PopoverTitle"

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  const { isMobile } = usePopoverContext()

  if (isMobile) {
    return (
      <DrawerDescription
        data-slot="popover-description"
        className={cn(
          "text-[15px] leading-relaxed text-muted-foreground",
          className
        )}
        {...(props as React.ComponentProps<typeof DrawerDescription>)}
      />
    )
  }

  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn(
        "text-[12.5px] leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
