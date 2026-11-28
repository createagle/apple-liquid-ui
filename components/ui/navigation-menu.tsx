"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { mergeProps } from "@base-ui/react/merge-props"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

interface NavigationMenuContextValue {
  glass: boolean
  isMobile: boolean
  activeValue: unknown
  renderedValue: unknown
  openItem: (value: unknown, title: React.ReactNode) => void
  closeMenu: () => void
  drawerSlotEl: HTMLDivElement | null
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue>({
  glass: true,
  isMobile: false,
  activeValue: null,
  renderedValue: null,
  openItem: () => {},
  closeMenu: () => {},
  drawerSlotEl: null,
})

function useNavigationMenuContext() {
  return React.useContext(NavigationMenuContext)
}

const NavigationMenuItemContext = React.createContext<{
  itemValue: unknown
} | null>(null)

const NavigationMenuInContentContext = React.createContext(false)

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

export interface NavigationMenuProps
  extends NavigationMenuPrimitive.Root.Props,
    Pick<NavigationMenuPrimitive.Positioner.Props, "align"> {
  /**
   * Renders Apple 27 Liquid Glass surfaces on the navigation pill bar, desktop popup viewport,
   * and mobile iOS 27 bottom Drawer. Pass `glass={false}` for solid elevated surfaces.
   * @default true
   */
  glass?: boolean
}

function NavigationMenu({
  align = "start",
  glass = true,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  delay,
  closeDelay,
  actionsRef,
  onOpenChangeComplete,
  orientation,
  className,
  children,
  ...props
}: NavigationMenuProps) {
  const isMobile = useIsMobile()
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<unknown>(defaultValue)
  const activeValue = isControlled ? controlledValue : uncontrolledValue

  const [renderedValue, setRenderedValue] = React.useState<unknown>(
    activeValue ?? null
  )
  const [renderedTitle, setRenderedTitle] =
    React.useState<React.ReactNode>(null)
  const [drawerSlotEl, setDrawerSlotEl] = React.useState<HTMLDivElement | null>(
    null
  )

  React.useEffect(() => {
    if (activeValue !== null && activeValue !== undefined) {
      setRenderedValue(activeValue)
    }
  }, [activeValue])

  const emitValueChange = React.useCallback(
    (next: unknown) => {
      if (!isControlled) {
        setUncontrolledValue(next)
      }
      ;(
        onValueChange as
          | ((value: unknown, eventDetails?: unknown) => void)
          | undefined
      )?.(next, undefined)
    },
    [isControlled, onValueChange]
  )

  const openItem = React.useCallback(
    (itemValue: unknown, title: React.ReactNode) => {
      setRenderedValue(itemValue)
      setRenderedTitle(title)
      emitValueChange(itemValue)
    },
    [emitValueChange]
  )

  const closeMenu = React.useCallback(() => {
    emitValueChange(null)
  }, [emitValueChange])

  const ctx = React.useMemo<NavigationMenuContextValue>(
    () => ({
      glass,
      isMobile,
      activeValue: activeValue ?? null,
      renderedValue,
      openItem,
      closeMenu,
      drawerSlotEl,
    }),
    [
      activeValue,
      closeMenu,
      drawerSlotEl,
      glass,
      isMobile,
      openItem,
      renderedValue,
    ]
  )

  if (isMobile) {
    const isDrawerOpen = activeValue !== null && activeValue !== undefined

    return (
      <NavigationMenuContext.Provider value={ctx}>
        <nav
          data-slot="navigation-menu"
          data-glass={glass ? "true" : "false"}
          data-orientation={orientation ?? "horizontal"}
          className={cn(
            "group/navigation-menu relative flex max-w-full flex-1 items-center justify-center",
            className
          )}
          {...(props as React.ComponentProps<"nav">)}
        >
          {children}
          <Drawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              if (!open) closeMenu()
            }}
            swipeDirection="down"
            showSwipeHandle
          >
            <DrawerContent
              data-slot="navigation-menu-drawer"
              glass={glass}
              backdrop={
                glass ? (
                  <LiquidSurfaceBackdrop radius={32} bezel={24} openBottom />
                ) : undefined
              }
              className={cn(
                glass && [
                  "[--drawer-inset:0px] [--drawer-bleed-background:transparent]",
                  "rounded-t-[32px]! rounded-b-none! border-0! bg-transparent! text-neutral-900",
                  "shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
                  "dark:text-white dark:shadow-[0_-20px_56px_-12px_rgba(0,0,0,0.68),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
                  "[&_[data-slot=drawer-swipe-handle]]:h-4 [&_[data-slot=drawer-swipe-handle]]:after:h-[5px] [&_[data-slot=drawer-swipe-handle]]:after:w-9 [&_[data-slot=drawer-swipe-handle]]:after:bg-black/20 dark:[&_[data-slot=drawer-swipe-handle]]:after:bg-white/25",
                  "after:hidden",
                ],
                "w-auto! max-w-none!"
              )}
            >
              {renderedTitle ? (
                <DrawerHeader className="items-center px-5 pt-3 pb-2 text-center">
                  <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
                    {renderedTitle}
                  </DrawerTitle>
                </DrawerHeader>
              ) : (
                <DrawerTitle className="sr-only">导航菜单</DrawerTitle>
              )}
              <div
                ref={setDrawerSlotEl}
                className={cn(
                  "no-scrollbar flex max-h-[calc(100dvh-8.5rem)] flex-col overflow-x-hidden overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
                  renderedTitle ? "pt-1" : "pt-3"
                )}
              />
            </DrawerContent>
          </Drawer>
        </nav>
      </NavigationMenuContext.Provider>
    )
  }

  return (
    <NavigationMenuContext.Provider value={ctx}>
      <NavigationMenuPrimitive.Root
        data-slot="navigation-menu"
        data-glass={glass ? "true" : "false"}
        value={controlledValue}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        delay={delay}
        closeDelay={closeDelay}
        actionsRef={actionsRef}
        onOpenChangeComplete={onOpenChangeComplete}
        orientation={orientation}
        className={cn(
          "group/navigation-menu relative flex max-w-full flex-1 items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
        <NavigationMenuPositioner align={align} />
      </NavigationMenuPrimitive.Root>
    </NavigationMenuContext.Provider>
  )
}

function NavigationMenuList({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  const { glass, isMobile } = useNavigationMenuContext()

  const listClassName = cn(
    "group relative isolate flex max-w-full flex-1 list-none flex-wrap items-center justify-center gap-0.5 overflow-hidden rounded-full p-1",
    glass
      ? [
          "bg-transparent text-neutral-900 dark:text-white",
          "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.16),0_2px_8px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
          "dark:shadow-[0_16px_38px_-10px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
        ]
      : "border border-border/70 bg-background/95 text-foreground shadow-xs",
    className
  )

  if (isMobile) {
    return (
      <ul
        data-slot="navigation-menu-list"
        className={listClassName}
        {...(props as React.ComponentProps<"ul">)}
      >
        {glass ? (
          <LiquidSurfaceBackdrop
            radius={999}
            bezel={12}
            refraction={0.8}
            tone="menu"
          />
        ) : null}
        {children}
      </ul>
    )
  }

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={listClassName}
      {...props}
    >
      {glass ? (
        <LiquidSurfaceBackdrop
          radius={999}
          bezel={12}
          refraction={0.8}
          tone="menu"
        />
      ) : null}
      {children}
    </NavigationMenuPrimitive.List>
  )
}

function NavigationMenuItem({
  className,
  value,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  const { isMobile } = useNavigationMenuContext()
  const fallbackId = React.useId()
  const itemValue = value ?? fallbackId

  if (isMobile) {
    return (
      <NavigationMenuItemContext.Provider value={{ itemValue }}>
        <li
          data-slot="navigation-menu-item"
          className={cn("relative z-10", className)}
          {...(props as React.ComponentProps<"li">)}
        >
          {children}
        </li>
      </NavigationMenuItemContext.Provider>
    )
  }

  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      value={value}
      className={cn("relative z-10", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Item>
  )
}

const navigationMenuTriggerStyle = cva(
  [
    "group/navigation-menu-trigger inline-flex h-8.5 w-max cursor-pointer items-center justify-center rounded-full px-3 py-1 text-[14px] font-medium whitespace-nowrap text-foreground/90 outline-none select-none md:h-7.5 md:px-3 md:text-[13px]",
    "transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none",
    "focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45",
    "disabled:pointer-events-none disabled:opacity-45",
    "data-popup-open:bg-black/[0.09] data-popup-open:text-foreground dark:data-popup-open:bg-white/[0.16]",
    "data-active:bg-(--apple-blue)/14 data-active:font-semibold data-active:text-(--apple-blue) dark:data-active:bg-(--apple-blue)/22",
  ].join(" "),
  {
    variants: {
      glass: {
        false: "hover:bg-black/[0.06] dark:hover:bg-white/[0.11]",
        true: [
          "bg-(--liquid-surface) text-neutral-900 [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]",
          "shadow-[0_6px_18px_-4px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
          "hover:bg-(--liquid-surface-hover)",
          "dark:text-white dark:shadow-[0_8px_22px_-4px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      glass: false,
    },
  }
)

export interface NavigationMenuTriggerProps
  extends NavigationMenuPrimitive.Trigger.Props {
  /**
   * Renders this trigger as an individual floating Liquid Glass pill when the parent `<NavigationMenu glass={false}>` is not already glass.
   * Ignored when parent `<NavigationMenu>` has `glass={true}` to avoid nested backdrop-filter roots.
   * @default false
   */
  glass?: boolean
}

function NavigationMenuTrigger({
  className,
  glass = false,
  onClick,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  const { glass: barGlass, isMobile, activeValue, openItem } =
    useNavigationMenuContext()
  const itemCtx = React.useContext(NavigationMenuItemContext)
  const useGlass = Boolean(glass && !barGlass)

  if (isMobile) {
    const isOpen =
      itemCtx !== null &&
      activeValue !== null &&
      activeValue === itemCtx.itemValue
    const title = extractPlainTitle(children) || children

    return (
      <button
        type="button"
        data-slot="navigation-menu-trigger"
        data-glass={useGlass ? "true" : undefined}
        data-popup-open={isOpen ? "" : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={(e) => {
          ;(
            onClick as React.MouseEventHandler<HTMLButtonElement> | undefined
          )?.(e)
          if (!e.defaultPrevented && itemCtx) {
            openItem(itemCtx.itemValue, title)
          }
        }}
        className={cn(
          navigationMenuTriggerStyle({ glass: useGlass }),
          "group",
          className
        )}
        {...(props as React.ComponentProps<"button">)}
      >
        {children}{" "}
        <ChevronDownIcon
          className="relative top-px ml-1 size-3.5 opacity-70 transition-transform duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-data-popup-open/navigation-menu-trigger:rotate-180"
          aria-hidden="true"
        />
      </button>
    )
  }

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      data-glass={useGlass ? "true" : undefined}
      onClick={onClick}
      className={cn(
        navigationMenuTriggerStyle({ glass: useGlass }),
        "group",
        className
      )}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3.5 opacity-70 transition-transform duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-data-popup-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  const { isMobile, renderedValue, drawerSlotEl } = useNavigationMenuContext()
  const itemCtx = React.useContext(NavigationMenuItemContext)

  if (isMobile) {
    if (
      renderedValue === null ||
      !itemCtx ||
      itemCtx.itemValue !== renderedValue ||
      !drawerSlotEl
    ) {
      return null
    }

    return createPortal(
      <NavigationMenuInContentContext.Provider value={true}>
        <div
          data-slot="navigation-menu-content"
          data-mobile="true"
          className={cn("w-full", className)}
          {...(props as React.ComponentProps<"div">)}
        >
          {children}
        </div>
      </NavigationMenuInContentContext.Provider>,
      drawerSlotEl
    )
  }

  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "max-h-[calc(100dvh-7rem)] w-auto overflow-x-hidden overflow-y-auto p-2.5 data-starting-style:overflow-hidden data-ending-style:overflow-hidden",
        "transition-[opacity,transform,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-10 data-starting-style:data-[activation-direction=right]:translate-x-10",
        "data-ending-style:data-[activation-direction=left]:translate-x-10 data-ending-style:data-[activation-direction=right]:-translate-x-10",
        "group-data-[viewport=false]/navigation-menu:rounded-[20px] group-data-[viewport=false]/navigation-menu:bg-(--liquid-surface-menu) group-data-[viewport=false]/navigation-menu:text-foreground group-data-[viewport=false]/navigation-menu:shadow-lg group-data-[viewport=false]/navigation-menu:backdrop-blur-xl",
        "**:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  )
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 10,
  align = "start",
  alignOffset = 0,
  collisionPadding = 12,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  const { glass, isMobile } = useNavigationMenuContext()

  if (isMobile) {
    return null
  }

  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-[calc(100vw-1.5rem)] outline-none",
          "transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none data-instant:transition-none",
          "data-[side=bottom]:before:absolute data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:-top-3 data-[side=bottom]:before:h-3",
          className
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            "relative isolate h-(--popup-height) max-h-[calc(100dvh-7rem)] w-(--popup-width) max-w-[calc(100vw-1.5rem)] origin-(--transform-origin) overflow-hidden rounded-[22px] outline-none",
            "transition-[opacity,transform,width,height,scale,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.94] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:duration-160",
            glass
              ? [
                  "bg-transparent text-neutral-900 dark:text-white",
                  "shadow-[0_20px_52px_-10px_rgba(0,0,0,0.22),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                  "dark:shadow-[0_24px_58px_-10px_rgba(0,0,0,0.66),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
                ]
              : "border border-border/70 bg-popover text-popover-foreground shadow-xl"
          )}
        >
          {glass ? (
            <LiquidSurfaceBackdrop radius={22} bezel={18} tone="menu" />
          ) : null}
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

const navigationMenuLinkClassName = cn(
  "flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] font-medium text-foreground/90 transition-[background-color,color] duration-150 outline-none select-none md:text-[13px]",
  "hover:bg-black/[0.06] focus:bg-black/[0.06] dark:hover:bg-white/[0.11] dark:focus:bg-white/[0.11]",
  "focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45",
  "data-active:bg-(--apple-blue)/14 data-active:font-semibold data-active:text-(--apple-blue) dark:data-active:bg-(--apple-blue)/22",
  "in-data-[slot=navigation-menu-content]:flex-col in-data-[slot=navigation-menu-content]:items-start in-data-[slot=navigation-menu-content]:gap-1 in-data-[slot=navigation-menu-content]:rounded-[16px] in-data-[slot=navigation-menu-content]:bg-black/[0.04] in-data-[slot=navigation-menu-content]:p-3.5 in-data-[slot=navigation-menu-content]:hover:bg-black/[0.05] in-data-[slot=navigation-menu-content]:focus:bg-black/[0.05] in-data-[slot=navigation-menu-content]:active:bg-black/[0.08] md:in-data-[slot=navigation-menu-content]:rounded-[14px] md:in-data-[slot=navigation-menu-content]:bg-transparent md:in-data-[slot=navigation-menu-content]:p-2.5 dark:in-data-[slot=navigation-menu-content]:bg-white/[0.07] dark:in-data-[slot=navigation-menu-content]:hover:bg-white/[0.08] dark:in-data-[slot=navigation-menu-content]:focus:bg-white/[0.08] md:dark:in-data-[slot=navigation-menu-content]:bg-transparent",
  "[&_svg:not([class*='size-'])]:size-4"
)

function MobileNavigationMenuLink({
  className,
  active = false,
  closeOnClick = true,
  render,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  const { closeMenu } = useNavigationMenuContext()
  const inContent = React.useContext(NavigationMenuInContentContext)

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(navigationMenuLinkClassName, className),
        onClick: () => {
          if (inContent && closeOnClick !== false) {
            closeMenu()
          }
        },
      },
      props as React.ComponentProps<"a">
    ),
    render: render as useRender.ComponentProps<"a">["render"],
    state: {
      slot: "navigation-menu-link",
      active: Boolean(active),
    },
  })
}

function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  const { isMobile } = useNavigationMenuContext()

  if (isMobile) {
    return <MobileNavigationMenuLink className={className} {...props} />
  }

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navigationMenuLinkClassName, className)}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon>) {
  const { isMobile } = useNavigationMenuContext()
  if (isMobile) {
    return null
  }

  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-black/[0.12] shadow-md dark:bg-white/[0.2]" />
    </NavigationMenuPrimitive.Icon>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
