"use client"

import * as React from "react"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { cn } from "cn"

import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MenubarContext = React.createContext<{ glass: boolean }>({ glass: true })

export interface MenubarProps extends MenubarPrimitive.Props {
  /**
   * Renders the Apple 27 floating Liquid Glass bar surface with subtle bezel refraction.
   * Pass `glass={false}` for a crisp solid or transparent container (allowing individual `MenubarTrigger` items to enable `glass`).
   * @default true
   */
  glass?: boolean
}

function Menubar({
  className,
  glass = true,
  children,
  ...props
}: MenubarProps) {
  const ctx = React.useMemo(() => ({ glass }), [glass])

  return (
    <MenubarContext.Provider value={ctx}>
      <MenubarPrimitive
        data-slot="menubar"
        data-glass={glass ? "true" : "false"}
        className={cn(
          "relative isolate inline-flex h-auto min-h-10 max-w-full flex-wrap items-center gap-0.5 overflow-hidden rounded-full p-1 md:min-h-8.5",
          glass
            ? [
                "bg-transparent text-neutral-900 dark:text-white",
                "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.16),0_2px_8px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                "dark:shadow-[0_16px_38px_-10px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
              ]
            : "border border-border/70 bg-background/95 text-foreground shadow-xs",
          className
        )}
        {...props}
      >
        {glass ? (
          <LiquidSurfaceBackdrop
            radius={999}
            bezel={12}
            refraction={0.8}
            size="menu"
          />
        ) : null}
        {children}
      </MenubarPrimitive>
    </MenubarContext.Provider>
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}
MenubarGroup.displayName = "MenubarGroup"

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />
}

export interface MenubarTriggerProps
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  /**
   * Renders this trigger as an individual floating Liquid Glass pill when the parent `<Menubar glass={false}>` is not already glass.
   * Ignored when parent `<Menubar>` has `glass={true}` to avoid nested backdrop-filter roots.
   * @default false
   */
  glass?: boolean
}

function MenubarTrigger({
  className,
  glass = false,
  ...props
}: MenubarTriggerProps) {
  const { glass: barGlass } = React.useContext(MenubarContext)
  const useGlass = Boolean(glass && !barGlass)

  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      data-glass={useGlass ? "true" : undefined}
      className={cn(
        "relative z-10 inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-[14px] font-medium whitespace-nowrap text-foreground/90 outline-none select-none md:h-6.5 md:px-2.5 md:text-[13px]",
        "transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        useGlass
          ? [
              "bg-(--liquid-surface) text-neutral-900 [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]",
              "shadow-[0_6px_18px_-4px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
              "hover:bg-(--liquid-surface-hover)",
              "dark:text-white dark:shadow-[0_8px_22px_-4px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
            ]
          : "hover:bg-black/[0.06] dark:hover:bg-white/[0.11]",
        "focus-visible:ring-2 focus-visible:ring-(--apple-blue)/45",
        "data-popup-open:bg-(--apple-blue) data-popup-open:text-white data-popup-open:hover:bg-(--apple-blue) dark:data-popup-open:bg-(--apple-blue) dark:data-popup-open:text-white",
        "aria-expanded:bg-(--apple-blue) aria-expanded:text-white aria-expanded:hover:bg-(--apple-blue) dark:aria-expanded:bg-(--apple-blue) dark:aria-expanded:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-45",
        className
      )}
      {...props}
    />
  )
}

export type MenubarContentProps = DropdownMenuContentProps

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarContentProps) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={className}
      {...props}
    />
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      inset={inset}
      variant={variant}
      className={className}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
  return (
    <DropdownMenuCheckboxItem
      data-slot="menubar-checkbox-item"
      className={className}
      {...props}
    />
  )
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return (
    <DropdownMenuRadioItem
      data-slot="menubar-radio-item"
      className={className}
      {...props}
    />
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      inset={inset}
      className={className}
      {...props}
    />
  )
}
MenubarLabel.displayName = "MenubarLabel"

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={className}
      {...props}
    />
  )
}
MenubarSeparator.displayName = "MenubarSeparator"

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={className}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger>) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      inset={inset}
      className={className}
      {...props}
    />
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={className}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
