"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CheckIcon, PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { LiquidSurfaceBackdrop, OverGlass } from "@/components/ui/liquid-surface"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.25rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

const SidebarInstanceContext = React.createContext<{
  side: "left" | "right"
  collapsible: "offcanvas" | "icon" | "none"
}>({
  side: "left",
  collapsible: "offcanvas",
})

const SidebarMenuItemContext = React.createContext<{
  hasSub: boolean
  dropdownOpen: boolean
  title: React.ReactNode
} | null>(null)

const SidebarCollapsedSubDepthContext = React.createContext(0)
const SidebarExpandedSubDepthContext = React.createContext(0)

const SidebarSubItemContext = React.createContext<{
  hasNestedSub: boolean
} | null>(null)

function extractPlainText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("").trim()
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractPlainText(node.props.children)
  }
  return ""
}

function hasSidebarMenuSub(nodes: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(nodes, (child) => {
    if (found || !React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return
    }
    const type = child.type as { displayName?: string } | string
    if (
      type === SidebarMenuSub ||
      (typeof type !== "string" && type?.displayName === "SidebarMenuSub")
    ) {
      found = true
      return
    }
    if (
      type === SidebarMenuItem ||
      (typeof type !== "string" && type?.displayName === "SidebarMenuItem") ||
      type === SidebarMenuSubItem ||
      (typeof type !== "string" && type?.displayName === "SidebarMenuSubItem")
    ) {
      return
    }
    if (child.props.children) {
      found = hasSidebarMenuSub(child.props.children)
    }
  })
  return found
}

function extractMenuItemTitle(nodes: React.ReactNode): string {
  let title = ""
  React.Children.forEach(nodes, (child) => {
    if (title || !React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return
    }
    const type = child.type as { displayName?: string } | string
    if (
      type === SidebarMenuButton ||
      (typeof type !== "string" && type?.displayName === "SidebarMenuButton")
    ) {
      const btnProps = child.props as {
        tooltip?: unknown
        children?: React.ReactNode
      }
      if (typeof btnProps.tooltip === "string" && btnProps.tooltip.trim()) {
        title = btnProps.tooltip.trim()
      } else {
        title = extractPlainText(btnProps.children)
      }
      return
    }
    if (child.type === React.Fragment && child.props.children) {
      title = extractMenuItemTitle(child.props.children)
    }
  })
  return title
}

function stripTrailingIcons(children: React.ReactNode): React.ReactNode {
  const arr = React.Children.toArray(children)
  const isTrailingIcon = (node: React.ReactNode) =>
    React.isValidElement(node) &&
    (node.type === "svg" ||
      (typeof node.type !== "string" &&
        typeof node.type !== "undefined"))

  let end = arr.length
  while (end > 1 && isTrailingIcon(arr[end - 1])) {
    end -= 1
  }
  return end === arr.length ? children : arr.slice(0, end)
}

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delay={120}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-transparent",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export interface SidebarProps extends React.ComponentProps<"div"> {
  /**
   * Side on which the sidebar is anchored.
   * @default "left"
   */
  side?: "left" | "right"
  /**
   * Visual layout style: macOS 27 `floating` glass pill panel, `inset` split-view, or docked `sidebar`.
   * @default "sidebar"
   */
  variant?: "sidebar" | "floating" | "inset"
  /**
   * Collapse behavior when toggled.
   * @default "offcanvas"
   */
  collapsible?: "offcanvas" | "icon" | "none"
  /**
   * Renders the Apple 27 translucent Liquid Glass sidebar surface (`LiquidSurfaceBackdrop` on floating).
   * @default true
   */
  glass?: boolean
}

function SidebarGlassLayer({
  glass,
  variant,
}: {
  glass: boolean
  variant: "sidebar" | "floating" | "inset"
}) {
  if (!glass) return null

  if (variant === "floating") {
    return <LiquidSurfaceBackdrop radius={22} bezel={20} size="large" />
  }

  return (
    <span
      aria-hidden="true"
      data-slot="sidebar-glass-backdrop"
      className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]"
    />
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  glass = true,
  className,
  children,
  dir,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const instanceCtx = React.useMemo(
    () => ({ side, collapsible }),
    [side, collapsible]
  )

  if (collapsible === "none") {
    return (
      <SidebarInstanceContext.Provider value={instanceCtx}>
        <div
          data-slot="sidebar"
          data-glass={glass ? "true" : "false"}
          className={cn(
            "relative isolate flex h-full w-(--sidebar-width) flex-col overflow-hidden text-sidebar-foreground",
            glass ? "bg-transparent" : "bg-sidebar",
            className
          )}
          {...props}
        >
          <SidebarGlassLayer glass={glass} variant={variant} />
          <OverGlass enabled={glass}>{children}</OverGlass>
        </div>
      </SidebarInstanceContext.Provider>
    )
  }

  if (isMobile) {
    return (
      <SidebarInstanceContext.Provider value={instanceCtx}>
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            dir={dir}
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            glass={glass}
            showCloseButton={false}
            className={cn(
              "w-(--sidebar-width) p-0 text-sidebar-foreground",
              !glass && "bg-sidebar"
            )}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">
              <OverGlass enabled={glass}>{children}</OverGlass>
            </div>
          </SheetContent>
        </Sheet>
      </SidebarInstanceContext.Provider>
    )
  }

  return (
    <SidebarInstanceContext.Provider value={instanceCtx}>
      <div
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-glass={glass ? "true" : "false"}
        data-slot="sidebar"
      >
        {/* Layout spacer matching desktop sidebar width */}
        <div
          data-slot="sidebar-gap"
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(5)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
          )}
        />
        <div
          data-slot="sidebar-container"
          data-side={side}
          className={cn(
            "fixed inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]",
            "data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
            variant === "floating" || variant === "inset"
              ? "p-2.5 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(5)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=left]:border-black/[0.07] group-data-[side=right]:border-l group-data-[side=right]:border-black/[0.07] dark:group-data-[side=left]:border-white/[0.1] dark:group-data-[side=right]:border-white/[0.1]",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className={cn(
              "relative isolate flex size-full flex-col overflow-hidden",
              glass ? "bg-transparent" : "bg-sidebar",
              "group-data-[variant=floating]:rounded-[22px]",
              glass &&
                "group-data-[variant=floating]:shadow-[0_18px_46px_-10px_rgba(0,0,0,0.2),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] dark:group-data-[variant=floating]:shadow-[0_22px_54px_-10px_rgba(0,0,0,0.64),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
              !glass &&
                "group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm",
              "group-data-[variant=inset]:rounded-[18px] group-data-[variant=inset]:shadow-[0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] dark:group-data-[variant=inset]:shadow-[0_0_0_0.5px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]"
            )}
          >
            <SidebarGlassLayer glass={glass} variant={variant} />
            <OverGlass enabled={glass}>{children}</OverGlass>
          </div>
        </div>
      </div>
    </SidebarInstanceContext.Provider>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn("rounded-full", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] after:rounded-full hover:after:bg-black/15 sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2 dark:hover:after:bg-white/25",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-black/[0.04] dark:hover:group-data-[collapsible=offcanvas]:bg-white/[0.06]",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background/85 backdrop-blur-md",
        "md:peer-data-[variant=inset]:m-2.5 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-[20px] md:peer-data-[variant=inset]:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)] dark:md:peer-data-[variant=inset]:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.48),0_0_0_0.5px_rgba(255,255,255,0.1)]",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2.5",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  surface = "over-glass",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      surface={surface}
      size={size}
      className={cn("w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2.5", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2.5", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "mx-3 w-auto bg-black/[0.07] dark:bg-white/[0.1]",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-7 shrink-0 items-center rounded-md px-2.5 text-[11.5px] font-semibold tracking-wide text-foreground/48 outline-hidden transition-[margin,opacity] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-7 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45 [&>svg]:size-3.5 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  })
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-3 right-3 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-full p-0 text-foreground/60 outline-hidden transition-colors group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-black/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45 md:after:hidden dark:hover:bg-white/[0.1] [&>svg]:size-3.5 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  const { isMobile, state } = useSidebar()
  const { collapsible } = React.useContext(SidebarInstanceContext)
  const isIconCollapsed =
    !isMobile && state === "collapsed" && collapsible === "icon"
  const hasSub = hasSidebarMenuSub(children)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isIconCollapsed || !hasSub) {
      setDropdownOpen(false)
    }
  }, [isIconCollapsed, hasSub])

  const title = React.useMemo(
    () => (isIconCollapsed && hasSub ? extractMenuItemTitle(children) : ""),
    [children, hasSub, isIconCollapsed]
  )

  const itemCtx = React.useMemo(
    () =>
      isIconCollapsed && hasSub
        ? { hasSub: true, dropdownOpen, title }
        : null,
    [dropdownOpen, hasSub, isIconCollapsed, title]
  )

  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    >
      {itemCtx ? (
        <SidebarMenuItemContext.Provider value={itemCtx}>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            {children}
          </DropdownMenu>
        </SidebarMenuItemContext.Provider>
      ) : (
        children
      )}
    </li>
  )
}
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  [
    "peer/menu-button group/menu-button flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-[12px] px-2.5 py-2 text-left text-[15px] outline-hidden select-none md:gap-2 md:rounded-[10px] md:px-2.5 md:py-1.5 md:text-[13px]",
    "transition-[width,height,padding,background-color,color] duration-150 ease-out motion-reduce:transition-none",
    "group-has-data-[sidebar=menu-action]/menu-item:pr-8",
    "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:text-[0px]! group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden",
    "text-foreground/85 hover:bg-black/[0.05] hover:text-foreground active:bg-black/[0.08] dark:hover:bg-white/[0.09] dark:active:bg-white/[0.13]",
    "data-popup-open:bg-black/[0.08] data-popup-open:text-foreground dark:data-popup-open:bg-white/[0.13]",
    "focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "data-open:bg-black/[0.05] data-open:text-foreground dark:data-open:bg-white/[0.09]",
    "data-active:bg-(--apple-blue)/14 data-active:font-semibold data-active:text-(--apple-blue) data-active:hover:bg-(--apple-blue)/18 dark:data-active:bg-(--apple-blue)/22 dark:data-active:hover:bg-(--apple-blue)/28",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 data-active:[&_svg]:text-(--apple-blue) [&>span:last-child]:truncate",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        outline:
          "bg-black/[0.03] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] hover:bg-black/[0.07] dark:bg-white/[0.05] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.12)] dark:hover:bg-white/[0.1]",
      },
      size: {
        default: "h-10 text-[15px] md:h-8 md:text-[13px]",
        sm: "h-8.5 text-[14px] md:h-7 md:text-[12px]",
        lg: "h-12 text-[15px] md:h-11 md:text-[13.5px] group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  onClick,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()
  const { collapsible } = React.useContext(SidebarInstanceContext)
  const itemCtx = React.useContext(SidebarMenuItemContext)
  const isIconCollapsed =
    !isMobile && state === "collapsed" && collapsible === "icon"
  const isCollapsedSubTrigger = Boolean(isIconCollapsed && itemCtx?.hasSub)

  const resolvedRender = isCollapsedSubTrigger
    ? tooltip
      ? <TooltipTrigger render={<DropdownMenuTrigger render={render} />} />
      : <DropdownMenuTrigger render={render} />
    : !tooltip
      ? render
      : <TooltipTrigger render={render} />

  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      isCollapsedSubTrigger ? props : { ...props, onClick }
    ),
    render: resolvedRender,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  })

  if (!tooltip) {
    return comp
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      {comp}
      <TooltipContent
        side="right"
        align="center"
        hidden={
          state !== "collapsed" || isMobile || Boolean(itemCtx?.dropdownOpen)
        }
        {...tooltip}
      />
    </Tooltip>
  )
}
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-2 right-1.5 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-full p-0 text-foreground/55 outline-hidden transition-colors group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-2.5 md:peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3.5 md:peer-data-[size=lg]/menu-button:top-3 peer-data-[size=sm]/menu-button:top-1.5 md:peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-black/[0.07] hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45 md:after:hidden dark:hover:bg-white/[0.12] [&>svg]:size-3.5 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-(--apple-blue) aria-expanded:opacity-100 md:opacity-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  })
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/[0.06] px-1.5 text-[11px] font-medium text-foreground/70 tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-2.5 md:peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3.5 md:peer-data-[size=lg]/menu-button:top-3 peer-data-[size=sm]/menu-button:top-1.5 md:peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:bg-(--apple-blue)/18 peer-data-active/menu-button:text-(--apple-blue) dark:bg-white/[0.1]",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-lg px-2.5", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({
  className,
  open = true,
  children,
  ...props
}: React.ComponentProps<"ul"> & {
  /**
   * Controls expanded visibility while keeping nested items mounted for collapsed icon Dropdown menus.
   * @default true
   */
  open?: boolean
}) {
  const { isMobile, state } = useSidebar()
  const { side, collapsible } = React.useContext(SidebarInstanceContext)
  const itemCtx = React.useContext(SidebarMenuItemContext)
  const subDepth = React.useContext(SidebarCollapsedSubDepthContext)
  const expandedDepth = React.useContext(SidebarExpandedSubDepthContext)
  const isIconCollapsed =
    !isMobile && state === "collapsed" && collapsible === "icon"

  if (isIconCollapsed && itemCtx?.hasSub) {
    const popupSide = side === "right" ? "left" : "right"

    if (subDepth === 0) {
      return (
        <SidebarCollapsedSubDepthContext.Provider value={1}>
          <DropdownMenuContent
            data-slot="sidebar-menu-sub"
            side={popupSide}
            align="start"
            sideOffset={10}
            className={cn("min-w-44", className)}
          >
            {itemCtx.title ? (
              <DropdownMenuGroup>
                <DropdownMenuLabel>{itemCtx.title}</DropdownMenuLabel>
                {children}
              </DropdownMenuGroup>
            ) : (
              children
            )}
          </DropdownMenuContent>
        </SidebarCollapsedSubDepthContext.Provider>
      )
    }

    return (
      <SidebarCollapsedSubDepthContext.Provider value={subDepth + 1}>
        <DropdownMenuSubContent
          data-slot="sidebar-menu-sub"
          side={popupSide}
          sideOffset={6}
          className={cn("min-w-40", className)}
        >
          {children}
        </DropdownMenuSubContent>
      </SidebarCollapsedSubDepthContext.Provider>
    )
  }

  if (!open) {
    return null
  }

  return (
    <SidebarExpandedSubDepthContext.Provider value={expandedDepth + 1}>
      <ul
        data-slot="sidebar-menu-sub"
        data-sidebar="menu-sub"
        className={cn(
          "flex min-w-0 flex-col gap-0.5 border-l border-black/[0.08] py-0.5 group-data-[collapsible=icon]:hidden dark:border-white/[0.1]",
          expandedDepth >= 1 ? "mr-0 ml-2.5 pr-0 pl-2.5" : "mr-0 ml-3.5 pr-0 pl-2.5",
          className
        )}
        {...props}
      >
        {children}
      </ul>
    </SidebarExpandedSubDepthContext.Provider>
  )
}
SidebarMenuSub.displayName = "SidebarMenuSub"

function SidebarMenuSubItem({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  const subDepth = React.useContext(SidebarCollapsedSubDepthContext)

  if (subDepth >= 1) {
    const hasNestedSub = hasSidebarMenuSub(children)

    if (hasNestedSub) {
      return (
        <SidebarSubItemContext.Provider value={{ hasNestedSub: true }}>
          <DropdownMenuSub>{children}</DropdownMenuSub>
        </SidebarSubItemContext.Provider>
      )
    }

    return (
      <SidebarSubItemContext.Provider value={{ hasNestedSub: false }}>
        {children}
      </SidebarSubItemContext.Provider>
    )
  }

  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    >
      {children}
    </li>
  )
}
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

function ExpandedSidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md"
    isActive?: boolean
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[9px] px-2.5 text-foreground/80 outline-hidden select-none group-data-[collapsible=icon]:hidden md:h-7",
          "hover:bg-black/[0.05] hover:text-foreground active:bg-black/[0.08] dark:hover:bg-white/[0.09]",
          "focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45",
          "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
          "data-[size=md]:text-[13.5px] md:data-[size=md]:text-[12.5px] data-[size=sm]:text-[12px]",
          "data-active:bg-(--apple-blue)/14 data-active:font-semibold data-active:text-(--apple-blue) dark:data-active:bg-(--apple-blue)/22",
          "[&>span:last-child]:truncate [&>svg]:size-3.5 [&>svg]:shrink-0 data-active:[&>svg]:text-(--apple-blue)",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  })
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  children,
  href,
  onClick,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md"
    isActive?: boolean
  }) {
  const subDepth = React.useContext(SidebarCollapsedSubDepthContext)
  const subItemCtx = React.useContext(SidebarSubItemContext)

  if (subDepth >= 1) {
    if (subItemCtx?.hasNestedSub) {
      return (
        <DropdownMenuSubTrigger
          data-active={isActive || undefined}
          className={cn(
            isActive &&
              "font-semibold text-(--apple-blue) data-highlighted:text-white data-popup-open:text-white dark:data-highlighted:text-white dark:data-popup-open:text-white",
            className
          )}
        >
          {stripTrailingIcons(children)}
        </DropdownMenuSubTrigger>
      )
    }

    const resolvedRender = render ?? (href ? <a href={href} /> : undefined)

    return (
      <DropdownMenuItem
        render={
          resolvedRender as React.ComponentProps<typeof DropdownMenuItem>["render"]
        }
        data-active={isActive || undefined}
        onClick={
          onClick as React.ComponentProps<typeof DropdownMenuItem>["onClick"]
        }
        className={cn(
          isActive &&
            "font-semibold text-(--apple-blue) data-highlighted:text-white dark:data-highlighted:text-white",
          className
        )}
      >
        <span className="flex flex-1 items-center gap-2 truncate">
          {children}
        </span>
        {isActive ? (
          <CheckIcon className="ml-auto size-3.5 shrink-0 stroke-[2.25]" />
        ) : null}
      </DropdownMenuItem>
    )
  }

  return (
    <ExpandedSidebarMenuSubButton
      render={render}
      size={size}
      isActive={isActive}
      className={className}
      href={href}
      onClick={onClick}
      {...props}
    >
      {children}
    </ExpandedSidebarMenuSubButton>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
