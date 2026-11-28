"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"
import { XIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { LiquidSurfaceBackdrop, OverGlass } from "@/components/ui/liquid-surface"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface DialogContextValue {
  isMobile: boolean
}

const DialogContext = React.createContext<DialogContextValue>({
  isMobile: false,
})

function useDialogContext() {
  return React.useContext(DialogContext)
}

function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DialogPrimitive.Root.Props) {
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
      <DialogContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={handleOpenChange}
          swipeDirection="down"
          showSwipeHandle
        >
          {children}
        </Drawer>
      </DialogContext.Provider>
    )
  }

  return (
    <DialogContext.Provider value={ctxValue}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={currentOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  )
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  const { isMobile } = useDialogContext()
  if (isMobile) {
    return (
      <DrawerTrigger
        data-slot="dialog-trigger"
        {...(props as React.ComponentProps<typeof DrawerTrigger>)}
      />
    )
  }
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  const { isMobile } = useDialogContext()
  if (isMobile) {
    return (
      <DrawerPortal
        data-slot="dialog-portal"
        {...(props as React.ComponentProps<typeof DrawerPortal>)}
      />
    )
  }
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  const { isMobile } = useDialogContext()
  if (isMobile) {
    return (
      <DrawerClose
        data-slot="dialog-close"
        {...(props as React.ComponentProps<typeof DrawerClose>)}
      />
    )
  }
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  const { isMobile } = useDialogContext()
  if (isMobile) {
    return (
      <DrawerOverlay
        data-slot="dialog-overlay"
        className={cn("bg-black/18 dark:bg-black/42", className)}
        {...(props as React.ComponentProps<typeof DrawerOverlay>)}
      />
    )
  }

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/18 dark:bg-black/42",
        "transition-opacity duration-220 ease-out motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  /**
   * Whether to render the top-right circular Apple Liquid Glass close button.
   * Defaults to `true` on desktop and `false` on mobile (where swipe-down & backdrop dismiss are native).
   */
  showCloseButton?: boolean
}

function DialogContent({
  className,
  children,
  showCloseButton,
  ...props
}: DialogContentProps) {
  const { isMobile } = useDialogContext()
  const shouldShowCloseButton = showCloseButton ?? !isMobile

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="dialog-content"
        backdrop={<LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />}
        className={cn(
          // Apple iOS 27 Edge-to-Edge Liquid Glass Bottom Sheet (r-top=32px, flush left/right/bottom, true optical bezel refraction)
          "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
          "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
          "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
          "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
          "[&_[data-slot=drawer-swipe-handle]]:h-4 [&_[data-slot=drawer-swipe-handle]]:after:h-[5px] [&_[data-slot=drawer-swipe-handle]]:after:w-9 [&_[data-slot=drawer-swipe-handle]]:after:bg-black/20 dark:[&_[data-slot=drawer-swipe-handle]]:after:bg-white/25",
          "after:hidden",
          className
        )}
        {...(props as React.ComponentProps<typeof DrawerContent>)}
      >
        <div className="relative flex max-h-[calc(100dvh-7.5rem)] flex-col gap-4 overflow-x-hidden overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {shouldShowCloseButton && (
            <DrawerClose
              data-slot="dialog-close"
              aria-label="关闭"
              className={cn(
                "absolute top-3 right-4 z-10 inline-flex size-8 cursor-pointer items-center justify-center rounded-full",
                "bg-black/[0.06] text-foreground/75 transition-colors active:bg-black/[0.14]",
                "dark:bg-white/[0.12] dark:text-white/80 dark:active:bg-white/[0.22]"
              )}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          )}
          {children}
        </div>
      </DrawerContent>
    )
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // Apple macOS 27 Centered Liquid Glass Dialog (r=26px, true optical bezel refraction)
          "fixed top-1/2 left-1/2 isolate z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[26px] bg-transparent p-5 text-[13.5px] text-neutral-900 outline-none md:max-w-md",
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
          "dark:text-white dark:shadow-[0_28px_68px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
          "transition-[transform,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "data-starting-style:scale-[0.94] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0",
          className
        )}
        {...props}
      >
        <LiquidSurfaceBackdrop radius={26} bezel={22} />
        <OverGlass>{children}</OverGlass>
        {shouldShowCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="关闭"
            className={cn(
              "absolute top-4 right-4 inline-flex size-7 cursor-pointer items-center justify-center rounded-full outline-none",
              "bg-black/[0.06] text-foreground/70 transition-colors hover:bg-black/[0.11] hover:text-foreground active:bg-black/[0.16]",
              "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40",
              "dark:bg-white/[0.12] dark:text-white/75 dark:hover:bg-white/[0.18] dark:hover:text-white dark:active:bg-white/[0.24]"
            )}
          >
            <XIcon className="size-3.5 stroke-[2.2]" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  leading,
  trailing,
  ...props
}: React.ComponentProps<"div"> & {
  leading?: React.ReactNode
  trailing?: React.ReactNode
}) {
  const { isMobile } = useDialogContext()

  if (isMobile) {
    return (
      <DrawerHeader
        data-slot="dialog-header"
        leading={leading}
        trailing={trailing}
        className={cn("w-full items-center gap-1.5 p-0 text-center", className)}
        {...props}
      />
    )
  }

  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-8 text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const { isMobile } = useDialogContext()

  if (isMobile) {
    return (
      <DrawerFooter
        data-slot="dialog-footer"
        className={cn("mt-1 flex flex-col-reverse gap-2.5 p-0", className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DrawerClose
            render={<Button variant="secondary" surface="over-glass" />}
          >
            关闭
          </DrawerClose>
        )}
      </DrawerFooter>
    )
  }

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 pt-1 md:flex-row md:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          render={<Button variant="secondary" surface="over-glass" />}
        >
          关闭
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  const { isMobile } = useDialogContext()

  if (isMobile) {
    return (
      <DrawerTitle
        data-slot="dialog-title"
        className={cn(
          "m-0 font-heading text-[18px] leading-[1.25] font-semibold tracking-[-0.015em] text-foreground",
          className
        )}
        {...(props as React.ComponentProps<typeof DrawerTitle>)}
      />
    )
  }

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "m-0 font-heading text-[16px] leading-snug font-semibold tracking-[-0.01em] text-foreground",
        className
      )}
      {...props}
    />
  )
}
DialogTitle.displayName = "DialogTitle"

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  const { isMobile } = useDialogContext()

  if (isMobile) {
    return (
      <DrawerDescription
        data-slot="dialog-description"
        className={cn(
          "text-[15px] leading-relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
          className
        )}
        {...(props as React.ComponentProps<typeof DrawerDescription>)}
      />
    )
  }

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-[13px] leading-relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
