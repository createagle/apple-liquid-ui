"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { cn } from "cn"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface SubmenuEntry {
  id: string
  title: React.ReactNode
}

interface ContextMenuContextValue {
  isMobile: boolean
  open: boolean
  setOpen: (next: boolean) => void
  subStack: SubmenuEntry[]
  pushSub: (id: string, title: React.ReactNode) => void
  popSub: () => void
  subSlotEl: HTMLDivElement | null
  setSubSlotEl: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(
  null
)

function useContextMenuContext() {
  const ctx = React.useContext(ContextMenuContext)
  if (!ctx) {
    throw new Error("ContextMenu components must be used within <ContextMenu>.")
  }
  return ctx
}

const MobileSubContext = React.createContext<{ subId: string } | null>(null)

interface MobileRadioGroupContextValue {
  value: unknown
  onValueChange: (next: unknown) => void
  disabled?: boolean
}

const MobileRadioGroupContext =
  React.createContext<MobileRadioGroupContextValue | null>(null)

function extractPlainTitle(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainTitle).join("").trim()
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractPlainTitle(node.props.children)
  }
  return ""
}

function flattenChildren(nodes: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = []
  React.Children.forEach(nodes, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return
    }
    if (
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      out.push(...flattenChildren(child.props.children))
    } else {
      out.push(child)
    }
  })
  return out
}

function renderMobileGroupedNodes(children: React.ReactNode): React.ReactNode[] {
  const flat = flattenChildren(children)
  const result: React.ReactNode[] = []
  let buffer: React.ReactNode[] = []
  let cardIndex = 0

  const flush = () => {
    if (buffer.length === 0) return
    result.push(
      <div
        key={`context-card-${cardIndex++}`}
        className="overflow-hidden rounded-2xl bg-black/[0.04] divide-y divide-black/[0.06] dark:bg-white/[0.07] dark:divide-white/[0.08]"
      >
        {buffer}
      </div>
    )
    buffer = []
  }

  for (const child of flat) {
    const displayName = React.isValidElement(child)
      ? ((child.type as { displayName?: string } | null)?.displayName ?? "")
      : ""

    if (displayName === "ContextMenuGroup") {
      flush()
      result.push(child)
    } else if (displayName === "ContextMenuLabel") {
      flush()
      result.push(child)
    } else if (displayName === "ContextMenuSeparator") {
      flush()
    } else {
      buffer.push(child)
    }
  }

  flush()
  return result
}

function ContextMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ContextMenuPrimitive.Root.Props) {
  const isMobile = useIsMobile()
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isControlled ? Boolean(controlledOpen) : uncontrolledOpen

  const [subStack, setSubStack] = React.useState<SubmenuEntry[]>([])
  const [subSlotEl, setSubSlotEl] = React.useState<HTMLDivElement | null>(null)

  const handleOpenChange = React.useCallback(
    (next: boolean, eventDetails?: unknown) => {
      if (next) {
        setSubStack([])
      }
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

  const setOpen = React.useCallback(
    (next: boolean) => {
      handleOpenChange(next, undefined)
    },
    [handleOpenChange]
  )

  const pushSub = React.useCallback((id: string, title: React.ReactNode) => {
    setSubStack((prev) => [...prev, { id, title }])
  }, [])

  const popSub = React.useCallback(() => {
    setSubStack((prev) => prev.slice(0, -1))
  }, [])

  const ctxValue = React.useMemo<ContextMenuContextValue>(
    () => ({
      isMobile,
      open: currentOpen,
      setOpen,
      subStack,
      pushSub,
      popSub,
      subSlotEl,
      setSubSlotEl,
    }),
    [currentOpen, isMobile, popSub, pushSub, setOpen, subSlotEl, subStack]
  )

  if (isMobile) {
    return (
      <ContextMenuContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={handleOpenChange}
          swipeDirection="down"
          showSwipeHandle
        >
          {children}
        </Drawer>
      </ContextMenuContext.Provider>
    )
  }

  return (
    <ContextMenuContext.Provider value={ctxValue}>
      <ContextMenuPrimitive.Root
        data-slot="context-menu"
        open={currentOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.Root>
    </ContextMenuContext.Provider>
  )
}

function ContextMenuPortal({
  children,
  ...props
}: ContextMenuPrimitive.Portal.Props) {
  const { isMobile } = useContextMenuContext()
  if (isMobile) {
    return <>{children}</>
  }
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props}>
      {children}
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuTrigger({
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onClickCapture,
  onContextMenu,
  children,
  ...props
}: ContextMenuPrimitive.Trigger.Props) {
  const { isMobile, setOpen } = useContextMenuContext()
  const timerRef = React.useRef<number | null>(null)
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null)
  const longPressedRef = React.useRef(false)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startPosRef.current = null
  }, [])

  React.useEffect(() => clearTimer, [clearTimer])

  if (isMobile) {
    return (
      <div
        data-slot="context-menu-trigger"
        className={cn("select-none [-webkit-touch-callout:none]", className)}
        onPointerDown={(e) => {
          ;(
            onPointerDown as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(e)
          if (e.button !== 0 && e.pointerType === "mouse") return
          longPressedRef.current = false
          startPosRef.current = { x: e.clientX, y: e.clientY }
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            longPressedRef.current = true
            timerRef.current = null
            setOpen(true)
          }, 450)
        }}
        onPointerMove={(e) => {
          ;(
            onPointerMove as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(e)
          if (timerRef.current !== null && startPosRef.current) {
            const dist = Math.hypot(
              e.clientX - startPosRef.current.x,
              e.clientY - startPosRef.current.y
            )
            if (dist > 10) {
              clearTimer()
            }
          }
        }}
        onPointerUp={(e) => {
          ;(
            onPointerUp as React.PointerEventHandler<HTMLDivElement> | undefined
          )?.(e)
          clearTimer()
        }}
        onPointerCancel={(e) => {
          ;(
            onPointerCancel as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(e)
          clearTimer()
        }}
        onPointerLeave={(e) => {
          ;(
            onPointerLeave as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(e)
          clearTimer()
        }}
        onClickCapture={(e) => {
          ;(
            onClickCapture as
              | React.MouseEventHandler<HTMLDivElement>
              | undefined
          )?.(e)
          if (longPressedRef.current) {
            e.preventDefault()
            e.stopPropagation()
            longPressedRef.current = false
          }
        }}
        onContextMenu={(e) => {
          ;(
            onContextMenu as React.MouseEventHandler<HTMLDivElement> | undefined
          )?.(e)
          if (!e.defaultPrevented) {
            e.preventDefault()
            clearTimer()
            setOpen(true)
          }
        }}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    )
  }

  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none [-webkit-touch-callout:none]", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      onClickCapture={onClickCapture}
      onContextMenu={onContextMenu}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Trigger>
  )
}

export interface ContextMenuContentProps
  extends Omit<ContextMenuPrimitive.Popup.Props, "title">,
    Pick<
      ContextMenuPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    > {
  /**
   * Optional sheet header title displayed inside the iOS 27 bottom drawer on mobile viewports.
   */
  title?: React.ReactNode
}

function ContextMenuContent({
  className,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 2,
  title,
  children,
  ...props
}: ContextMenuContentProps) {
  const { isMobile, subStack, popSub, setSubSlotEl } = useContextMenuContext()
  const activeSub = subStack[subStack.length - 1] ?? null

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="context-menu-content"
        backdrop={<LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />}
        className={cn(
          // Apple iOS 27 Edge-to-Edge Liquid Glass Bottom Sheet (r-top=32px, true optical bezel refraction)
          "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
          "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
          "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
          "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
          "[&_[data-slot=drawer-swipe-handle]]:h-4 [&_[data-slot=drawer-swipe-handle]]:after:h-[5px] [&_[data-slot=drawer-swipe-handle]]:after:w-9 [&_[data-slot=drawer-swipe-handle]]:after:bg-black/20 dark:[&_[data-slot=drawer-swipe-handle]]:after:bg-white/25",
          "after:hidden",
          className,
          "w-auto! max-w-none!"
        )}
      >
        {activeSub ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-2 pb-2.5">
            <button
              type="button"
              onClick={popSub}
              className="inline-flex w-fit cursor-pointer items-center gap-0.5 rounded-full py-1 pr-2.5 pl-1 text-[15px] font-medium text-(--apple-blue) transition-opacity outline-none active:opacity-60"
            >
              <ChevronLeftIcon className="-ml-0.5 size-5 stroke-[2.2]" />
              <span>返回</span>
            </button>
            <DrawerTitle className="truncate text-center text-[17px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
              {activeSub.title}
            </DrawerTitle>
            <span aria-hidden="true" />
          </div>
        ) : title ? (
          <DrawerHeader className="items-center px-5 pt-3 pb-2 text-center">
            <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
              {title}
            </DrawerTitle>
          </DrawerHeader>
        ) : (
          <DrawerTitle className="sr-only">上下文菜单</DrawerTitle>
        )}

        <div
          role="menu"
          className={cn(
            "flex flex-col gap-3 overflow-x-hidden overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            activeSub || title ? "pt-1" : "pt-3"
          )}
        >
          <div className={activeSub ? "hidden" : "flex flex-col gap-3"}>
            {renderMobileGroupedNodes(children)}
          </div>
          <div
            ref={setSubSlotEl}
            className={activeSub ? "flex flex-col gap-3" : "hidden"}
          />
        </div>
      </DrawerContent>
    )
  }

  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            // Apple macOS 27 Floating Liquid Glass Context Menu (r=14px, true optical bezel refraction)
            "relative isolate z-50 min-w-[11.5rem] max-w-[calc(100vw-2rem)] origin-(--transform-origin) overflow-hidden rounded-[14px] bg-transparent text-neutral-900 outline-none",
            "shadow-[0_18px_44px_-10px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
            "dark:text-white dark:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.58),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "transition-[transform,opacity] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.95] data-starting-style:opacity-0 data-ending-style:scale-[0.97] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          <LiquidSurfaceBackdrop radius={14} bezel={14} tone="menu" />
          <div className="flex max-h-(--available-height) flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-1.5">
            {children}
          </div>
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ContextMenuPrimitive.Group.Props) {
  const { isMobile } = useContextMenuContext()

  if (isMobile) {
    const labelNodes: React.ReactNode[] = []
    const itemNodes: React.ReactNode[] = []

    for (const child of flattenChildren(children)) {
      if (
        React.isValidElement(child) &&
        (child.type as { displayName?: string } | null)?.displayName ===
          "ContextMenuLabel"
      ) {
        labelNodes.push(child)
      } else {
        itemNodes.push(child)
      }
    }

    return (
      <div
        data-slot="context-menu-group"
        role="group"
        className={cn("flex flex-col gap-1.5", className)}
        {...(props as React.ComponentProps<"div">)}
      >
        {labelNodes}
        {itemNodes.length > 0 ? (
          <div className="overflow-hidden rounded-2xl bg-black/[0.04] divide-y divide-black/[0.06] dark:bg-white/[0.07] dark:divide-white/[0.08]">
            {itemNodes}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <ContextMenuPrimitive.Group
      data-slot="context-menu-group"
      className={className}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Group>
  )
}
ContextMenuGroup.displayName = "ContextMenuGroup"

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> &
  ContextMenuPrimitive.GroupLabel.Props & {
    inset?: boolean
  }) {
  const { isMobile } = useContextMenuContext()

  if (isMobile) {
    return (
      <div
        data-slot="context-menu-label"
        data-inset={inset}
        className={cn(
          "px-2 pt-1 text-[13px] font-semibold tracking-[-0.01em] text-foreground/85 data-inset:pl-10",
          className
        )}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }

  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-foreground/50 data-inset:pl-8",
        className
      )}
      {...props}
    />
  )
}
ContextMenuLabel.displayName = "ContextMenuLabel"

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  closeOnClick = true,
  disabled,
  onClick,
  children,
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const { isMobile, setOpen } = useContextMenuContext()

  if (isMobile) {
    return (
      <button
        type="button"
        role="menuitem"
        data-slot="context-menu-item"
        data-inset={inset}
        data-variant={variant}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={(e) => {
          ;(onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(
            e
          )
          if (!e.defaultPrevented && closeOnClick !== false) {
            setOpen(false)
          }
        }}
        className={cn(
          "flex min-h-[50px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          "data-inset:pl-11",
          "data-[variant=destructive]:text-(--apple-red) data-[variant=destructive]:active:bg-(--apple-red)/12 data-[variant=destructive]:[&_svg]:text-(--apple-red)",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      closeOnClick={closeOnClick}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group/context-menu-item relative flex min-h-[28px] w-full cursor-default items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium text-foreground/90 outline-hidden select-none",
        "transition-colors duration-75",
        "data-inset:pl-8",
        "not-data-[variant=destructive]:data-highlighted:bg-(--apple-blue) not-data-[variant=destructive]:data-highlighted:text-white dark:not-data-[variant=destructive]:data-highlighted:bg-(--apple-blue) dark:not-data-[variant=destructive]:data-highlighted:text-white",
        "data-[variant=destructive]:text-(--apple-red) data-[variant=destructive]:[&_svg]:text-(--apple-red)",
        "data-[variant=destructive]:data-highlighted:bg-(--apple-red) data-[variant=destructive]:data-highlighted:text-white data-[variant=destructive]:data-highlighted:[&_svg]:text-white dark:data-[variant=destructive]:data-highlighted:bg-(--apple-red)",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Item>
  )
}

function ContextMenuSub({
  children,
  ...props
}: ContextMenuPrimitive.SubmenuRoot.Props) {
  const { isMobile } = useContextMenuContext()
  const subId = React.useId()

  if (isMobile) {
    return (
      <MobileSubContext.Provider value={{ subId }}>
        {children}
      </MobileSubContext.Provider>
    )
  }

  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props}>
      {children}
    </ContextMenuPrimitive.SubmenuRoot>
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  disabled,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  const { isMobile, pushSub } = useContextMenuContext()
  const subCtx = React.useContext(MobileSubContext)

  if (isMobile) {
    const title = extractPlainTitle(children) || children
    return (
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        data-slot="context-menu-sub-trigger"
        data-inset={inset}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={() => {
          if (subCtx) {
            pushSub(subCtx.subId, title)
          }
        }}
        className={cn(
          "flex min-h-[50px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          "data-inset:pl-11",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
          className
        )}
      >
        {children}
        <ChevronRightIcon className="ml-auto size-[18px] text-foreground/40" />
      </button>
    )
  }

  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      disabled={disabled}
      className={cn(
        "group/context-menu-sub-trigger relative flex min-h-[28px] w-full cursor-default items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium text-foreground/90 outline-hidden select-none",
        "transition-colors duration-75",
        "data-inset:pl-8",
        "data-popup-open:bg-black/[0.07] dark:data-popup-open:bg-white/[0.11]",
        "data-highlighted:bg-(--apple-blue) data-highlighted:text-white dark:data-highlighted:bg-(--apple-blue) dark:data-highlighted:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-3.5 text-foreground/45 group-data-highlighted/context-menu-sub-trigger:text-white/90" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

function ContextMenuSubContent({
  align = "start",
  alignOffset = -6,
  side = "right",
  sideOffset = 4,
  className,
  children,
  ...props
}: ContextMenuContentProps) {
  const { isMobile, subStack, subSlotEl } = useContextMenuContext()
  const subCtx = React.useContext(MobileSubContext)
  const prefersReducedMotion = useReducedMotion()

  if (isMobile) {
    const subId = subCtx?.subId
    if (!subId) return null

    const activeSub = subStack[subStack.length - 1]
    const isActive = activeSub?.id === subId
    const isAncestor = !isActive && subStack.some((entry) => entry.id === subId)

    if (isActive && subSlotEl) {
      return createPortal(
        <motion.div
          key={subId}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={LIQUID_SPRINGS.iosPress}
          className="flex flex-col gap-3"
        >
          {renderMobileGroupedNodes(children)}
        </motion.div>,
        subSlotEl
      )
    }

    if (isAncestor) {
      return (
        <div hidden aria-hidden="true" className="hidden">
          {children}
        </div>
      )
    }

    return null
  }

  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className={cn("min-w-[10rem]", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      {children}
    </ContextMenuContent>
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  defaultChecked = false,
  onCheckedChange,
  closeOnClick = false,
  disabled,
  inset,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  const { isMobile, setOpen } = useContextMenuContext()
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(Boolean(defaultChecked))
  const isControlled = checked !== undefined
  const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked

  if (isMobile) {
    return (
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isChecked}
        data-slot="context-menu-checkbox-item"
        data-checked={isChecked ? "" : undefined}
        data-inset={inset}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={() => {
          const next = !isChecked
          if (!isControlled) {
            setUncontrolledChecked(next)
          }
          ;(
            onCheckedChange as
              | ((checked: boolean, eventDetails?: unknown) => void)
              | undefined
          )?.(next, undefined)
          if (closeOnClick === true) {
            setOpen(false)
          }
        }}
        className={cn(
          "flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          "data-inset:pl-11",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
          className
        )}
      >
        <span className="flex flex-1 items-center gap-3 truncate">
          {children}
        </span>
        {isChecked ? (
          <CheckIcon className="size-[18px] shrink-0 stroke-[2.25] text-(--apple-blue)" />
        ) : null}
      </button>
    )
  }

  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "group/context-menu-item relative flex min-h-[28px] w-full cursor-default items-center gap-2 rounded-[8px] py-1.5 pr-8 pl-2.5 text-[13px] font-medium text-foreground/90 outline-hidden select-none",
        "transition-colors duration-75",
        "data-inset:pl-8",
        "data-highlighted:bg-(--apple-blue) data-highlighted:text-white dark:data-highlighted:bg-(--apple-blue) dark:data-highlighted:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      closeOnClick={closeOnClick}
      disabled={disabled}
      {...props}
    >
      {children}
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center"
        data-slot="context-menu-checkbox-item-indicator"
      >
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-3.5 stroke-[2.25]" />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled,
  className,
  children,
  ...props
}: ContextMenuPrimitive.RadioGroup.Props) {
  const { isMobile } = useContextMenuContext()
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<unknown>(defaultValue)
  const currentValue = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (next: unknown) => {
      if (disabled) return
      if (!isControlled) {
        setUncontrolledValue(next)
      }
      ;(
        onValueChange as
          | ((value: unknown, eventDetails?: unknown) => void)
          | undefined
      )?.(next, undefined)
    },
    [disabled, isControlled, onValueChange]
  )

  if (isMobile) {
    return (
      <MobileRadioGroupContext.Provider
        value={{ value: currentValue, onValueChange: handleValueChange, disabled }}
      >
        <div
          role="radiogroup"
          data-slot="context-menu-radio-group"
          className={cn(
            "divide-y divide-black/[0.06] dark:divide-white/[0.08]",
            className
          )}
        >
          {children}
        </div>
      </MobileRadioGroupContext.Provider>
    )
  }

  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      value={controlledValue}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.RadioGroup>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  value,
  closeOnClick = false,
  disabled,
  onClick,
  inset,
  ...props
}: ContextMenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  const { isMobile, setOpen } = useContextMenuContext()
  const radioCtx = React.useContext(MobileRadioGroupContext)

  if (isMobile) {
    const isDisabled = Boolean(disabled || radioCtx?.disabled)
    const isChecked = radioCtx ? radioCtx.value === value : false

    return (
      <button
        type="button"
        role="menuitemradio"
        aria-checked={isChecked}
        data-slot="context-menu-radio-item"
        data-checked={isChecked ? "" : undefined}
        data-inset={inset}
        data-disabled={isDisabled ? "" : undefined}
        disabled={isDisabled}
        onClick={(e) => {
          ;(onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(
            e
          )
          if (!e.defaultPrevented) {
            radioCtx?.onValueChange(value)
            if (closeOnClick === true) {
              setOpen(false)
            }
          }
        }}
        className={cn(
          "flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          isChecked && "font-medium text-(--apple-blue)",
          "data-inset:pl-11",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
          className
        )}
      >
        <span className="flex flex-1 items-center gap-3 truncate">
          {children}
        </span>
        {isChecked ? (
          <CheckIcon className="size-[18px] shrink-0 stroke-[2.25] text-(--apple-blue)" />
        ) : null}
      </button>
    )
  }

  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      value={value}
      closeOnClick={closeOnClick}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group/context-menu-item relative flex min-h-[28px] w-full cursor-default items-center gap-2 rounded-[8px] py-1.5 pr-8 pl-2.5 text-[13px] font-medium text-foreground/90 outline-hidden select-none",
        "transition-colors duration-75",
        "data-inset:pl-8",
        "data-highlighted:bg-(--apple-blue) data-highlighted:text-white dark:data-highlighted:bg-(--apple-blue) dark:data-highlighted:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center"
        data-slot="context-menu-radio-item-indicator"
      >
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-3.5 stroke-[2.25]" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props) {
  const { isMobile } = useContextMenuContext()

  if (isMobile) {
    return (
      <div
        data-slot="context-menu-separator"
        role="separator"
        className={cn("h-px bg-black/[0.06] dark:bg-white/[0.08]", className)}
      />
    )
  }

  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(
        "mx-2 my-1 h-px bg-black/[0.08] dark:bg-white/[0.11]",
        className
      )}
      {...props}
    />
  )
}
ContextMenuSeparator.displayName = "ContextMenuSeparator"

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto hidden pl-4 text-[12px] tracking-[0.04em] text-foreground/45 md:inline-block md:group-data-highlighted/context-menu-item:text-white/85",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
