"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "cn"
import { CheckIcon, ChevronUpIcon, SearchIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  LiquidSurfaceBackdrop,
  liquidFieldGlassClassName,
  useLiquidFieldRefraction,
} from "@/components/ui/liquid-surface"

interface CommandContextValue {
  inDialog: boolean
  isMobileSheet: boolean
  closeMobileSheet?: () => void
}

const CommandContext = React.createContext<CommandContextValue>({
  inDialog: false,
  isMobileSheet: false,
})

function useCommandContext() {
  return React.useContext(CommandContext)
}

export interface CommandProps
  extends React.ComponentProps<typeof CommandPrimitive> {
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop for standalone Command panels.
   * Automatically disabled inside `<CommandDialog>` (which already hosts a `LiquidSurfaceBackdrop`).
   * @default true
   */
  glass?: boolean
  /**
   * On mobile viewports (`< 768px`), collapse standalone `<Command>` into an iOS 27 Liquid Glass
   * search trigger that opens the command palette inside a bottom swipeable Drawer.
   * @default true
   */
  mobileDrawer?: boolean
  /**
   * Placeholder text shown on the mobile search bar trigger when `mobileDrawer` is active.
   * @default "搜索命令或应用…"
   */
  mobileTriggerPlaceholder?: string
  /**
   * Centered title shown at the top of the mobile bottom Drawer.
   * @default "命令面板"
   */
  mobileTitle?: React.ReactNode
}

function Command({
  className,
  glass = true,
  mobileDrawer = true,
  mobileTriggerPlaceholder = "搜索命令或应用…",
  mobileTitle = "命令面板",
  children,
  ...props
}: CommandProps) {
  const isMobile = useIsMobile()
  const parentCtx = useCommandContext()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const shouldWrapMobileDrawer = isMobile && !parentCtx.inDialog && mobileDrawer
  const refraction = useLiquidFieldRefraction<HTMLButtonElement>(
    shouldWrapMobileDrawer && glass
  )

  const mobileSheetCtx = React.useMemo<CommandContextValue>(
    () => ({
      inDialog: true,
      isMobileSheet: true,
      closeMobileSheet: () => setDrawerOpen(false),
    }),
    []
  )

  if (shouldWrapMobileDrawer) {
    return (
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        swipeDirection="down"
        showSwipeHandle
      >
        <DrawerTrigger
          ref={refraction.ref}
          type="button"
          data-slot="command-mobile-trigger"
          style={glass ? refraction.style : undefined}
          className={cn(
            "flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-full px-4 text-left text-[15px] text-muted-foreground/85 outline-none transition-colors",
            glass
              ? liquidFieldGlassClassName
              : "border border-border/60 bg-white/92 dark:bg-[#1e1e1e]/88",
            className
          )}
        >
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{mobileTriggerPlaceholder}</span>
          <ChevronUpIcon className="size-4 shrink-0 text-muted-foreground/70" />
        </DrawerTrigger>
        {glass ? refraction.portal : null}
        <DrawerContent
          data-slot="command-mobile-content"
          glass={glass}
          backdrop={
            glass ? (
              <LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />
            ) : undefined
          }
          className={cn(
            "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
            "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
            "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
            "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
            "after:hidden"
          )}
        >
          <DrawerHeader className="items-center px-5 pt-3 pb-1 text-center">
            <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
              {mobileTitle}
            </DrawerTitle>
          </DrawerHeader>
          <CommandContext.Provider value={mobileSheetCtx}>
            <CommandPrimitive
              data-slot="command"
              data-mobile-sheet="true"
              className="flex size-full flex-col overflow-hidden bg-transparent text-inherit outline-none"
              {...props}
            >
              {children}
            </CommandPrimitive>
          </CommandContext.Provider>
        </DrawerContent>
      </Drawer>
    )
  }

  const useBackdrop = glass && !parentCtx.inDialog

  return (
    <CommandPrimitive
      data-slot="command"
      data-glass={useBackdrop ? "true" : "false"}
      data-mobile-sheet={parentCtx.isMobileSheet ? "true" : undefined}
      className={cn(
        "relative isolate flex size-full flex-col overflow-hidden outline-none",
        parentCtx.inDialog
          ? "rounded-none bg-transparent text-inherit"
          : useBackdrop
            ? [
                "rounded-[22px] bg-transparent text-neutral-900 dark:text-white",
                "shadow-[0_18px_46px_-8px_rgba(0,0,0,0.2),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                "dark:shadow-[0_22px_54px_-8px_rgba(0,0,0,0.65),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
              ]
            : "rounded-[20px] border border-border/60 bg-popover text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    >
      {useBackdrop && (
        <LiquidSurfaceBackdrop radius={22} bezel={20} tone="sheet" />
      )}
      {children}
    </CommandPrimitive>
  )
}

function CommandDialog({
  title = "命令面板",
  description = "输入关键词以快速搜索或执行命令…",
  children,
  className,
  showCloseButton = false,
  shortcut,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  /**
   * Optional global `⌘ / Ctrl + <key>` shortcut to toggle the command dialog
   * (e.g. `"l"` for `⌘L / Ctrl+L`, or `false` to disable).
   */
  shortcut?: string | false
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const isControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isControlled ? Boolean(open) : uncontrolledOpen

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

  React.useEffect(() => {
    if (!shortcut) return
    const parts = shortcut
      .toLowerCase()
      .split("+")
      .map((p) => p.trim())
      .filter(Boolean)
    const targetKey = parts[parts.length - 1]
    if (!targetKey) return

    const needShift = parts.includes("shift")
    const needAlt = parts.includes("alt") || parts.includes("option")

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.shiftKey !== needShift || e.altKey !== needAlt) return

      const keyMatch =
        e.key.toLowerCase() === targetKey ||
        (targetKey.length === 1 &&
          /^[a-z]$/.test(targetKey) &&
          e.code.toLowerCase() === `key${targetKey}`)

      if (keyMatch) {
        e.preventDefault()
        e.stopPropagation()
        handleOpenChange(!currentOpen)
      }
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [currentOpen, handleOpenChange, shortcut])

  const ctxValue = React.useMemo<CommandContextValue>(
    () => ({
      inDialog: true,
      isMobileSheet: isMobile,
      closeMobileSheet: () => handleOpenChange(false),
    }),
    [handleOpenChange, isMobile]
  )

  if (isMobile) {
    return (
      <CommandContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={handleOpenChange}
          swipeDirection="down"
          showSwipeHandle
        >
          <DrawerContent
            data-slot="command-dialog-content"
            backdrop={<LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />}
            className={cn(
              "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
              "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
              "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
              "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
              "after:hidden",
              className
            )}
          >
            <DrawerHeader className="items-center px-5 pt-3 pb-1 text-center">
              <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
                {title}
              </DrawerTitle>
            </DrawerHeader>
            {children}
          </DrawerContent>
        </Drawer>
      </CommandContext.Provider>
    )
  }

  return (
    <CommandContext.Provider value={ctxValue}>
      <Dialog
        open={currentOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        <DialogContent
          className={cn(
            "top-[16vh] translate-y-0 origin-top overflow-hidden p-0! md:max-w-[540px] md:gap-0",
            className
          )}
          showCloseButton={showCloseButton}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </CommandContext.Provider>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const { isMobileSheet } = useCommandContext()

  if (isMobileSheet) {
    return (
      <div data-slot="command-input-wrapper" className="px-4 pt-1 pb-2.5">
        <div className="flex h-10 items-center gap-2 rounded-full bg-black/[0.06] px-3.5 dark:bg-white/[0.1]">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <CommandPrimitive.Input
            data-slot="command-input"
            className={cn(
              "h-full w-full bg-transparent text-[16px] text-foreground caret-(--apple-blue) outline-hidden placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2.5 border-b border-black/[0.07] px-4 dark:border-white/[0.1]"
    >
      <SearchIcon className="size-4.5 shrink-0 text-muted-foreground/80" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-12 w-full bg-transparent text-[16px] text-foreground caret-(--apple-blue) outline-hidden placeholder:text-muted-foreground/75 disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:text-[14px]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  const { isMobileSheet } = useCommandContext()

  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        isMobileSheet
          ? "no-scrollbar max-h-[62dvh] scroll-py-2 overflow-x-hidden overflow-y-auto px-4 pt-0.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none"
          : "no-scrollbar max-h-80 scroll-py-1.5 overflow-x-hidden overflow-y-auto p-1.5 outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "py-8 text-center text-[13.5px] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  const { isMobileSheet } = useCommandContext()

  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        isMobileSheet
          ? [
              "mb-3 overflow-visible text-foreground last:mb-0",
              "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-1.5 **:[[cmdk-group-heading]]:text-[13px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-[-0.01em] **:[[cmdk-group-heading]]:text-foreground/85",
              "**:[[cmdk-group-items]]:overflow-hidden **:[[cmdk-group-items]]:rounded-2xl **:[[cmdk-group-items]]:bg-black/[0.04] **:[[cmdk-group-items]]:divide-y **:[[cmdk-group-items]]:divide-black/[0.06] dark:**:[[cmdk-group-items]]:bg-white/[0.07] dark:**:[[cmdk-group-items]]:divide-white/[0.08]",
            ]
          : "overflow-hidden p-0.5 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-wide **:[[cmdk-group-heading]]:text-muted-foreground/85",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  const { isMobileSheet } = useCommandContext()

  if (isMobileSheet) {
    return null
  }

  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(
        "mx-2 my-1 h-px bg-black/[0.07] dark:bg-white/[0.1]",
        className
      )}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const { isMobileSheet, closeMobileSheet } = useCommandContext()

  const handleSelect = React.useCallback(
    (value: string) => {
      onSelect?.(value)
      if (isMobileSheet) {
        closeMobileSheet?.()
      }
    },
    [closeMobileSheet, isMobileSheet, onSelect]
  )

  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      onSelect={handleSelect}
      className={cn(
        isMobileSheet
          ? [
              "group/command-item relative flex min-h-[50px] cursor-pointer items-center gap-3 px-4 py-3 text-[16px] text-foreground outline-hidden select-none transition-colors",
              "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
              "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:text-muted-foreground",
            ]
          : [
              "group/command-item relative flex min-h-8.5 cursor-default items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-[13.5px] outline-hidden select-none transition-colors duration-120",
              "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
              "data-selected:bg-(--apple-blue) data-selected:text-white",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground data-selected:[&_svg]:text-white",
            ],
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto size-4 opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { isMobileSheet } = useCommandContext()

  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        isMobileSheet
          ? "ml-auto font-mono text-[12px] tracking-wider text-muted-foreground/75"
          : "ml-auto font-mono text-[11px] tracking-wider text-muted-foreground/80 group-data-selected/command-item:text-white/85",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
