"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { cn } from "cn"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  LiquidSurfaceBackdrop,
  liquidFieldGlassClassName,
  useLiquidFieldRefraction,
  useOverGlass,
} from "@/components/ui/liquid-surface"

interface ComboboxMobileContextValue {
  isMobile: boolean
  open: boolean
  setOpen: (next: boolean) => void
  multiple: boolean
  disabled: boolean
  value: unknown
  selectItem: (itemValue: unknown) => void
  removeItem: (itemValue: unknown) => void
  clearValue: () => void
  search: string
  setSearch: (next: string) => void
  items: readonly unknown[] | undefined
  filteredItems: readonly unknown[]
  placeholder: string
  setPlaceholder: (text: string) => void
}

const ComboboxMobileContext =
  React.createContext<ComboboxMobileContextValue | null>(null)

function useComboboxMobile() {
  return React.useContext(ComboboxMobileContext)
}

function getItemSearchText(item: unknown): string {
  if (typeof item === "string" || typeof item === "number") {
    return String(item)
  }
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>
    if (typeof obj.label === "string") return obj.label
    if (typeof obj.name === "string") return obj.name
    if (typeof obj.title === "string") return obj.title
    if (typeof obj.value === "string") return obj.value
  }
  return ""
}

function isGroupObject(
  item: unknown
): item is { value?: unknown; label?: unknown; items: readonly unknown[] } {
  return (
    Boolean(item) &&
    typeof item === "object" &&
    Array.isArray((item as { items?: unknown }).items)
  )
}

function filterItemsByQuery(
  items: readonly unknown[] | undefined,
  query: string
): readonly unknown[] {
  if (!items) return []
  const q = query.trim().toLowerCase()
  if (!q) return items

  const result: unknown[] = []
  for (const entry of items) {
    if (isGroupObject(entry)) {
      const groupTitle = getItemSearchText(entry).toLowerCase()
      const matchedChildren = groupTitle.includes(q)
        ? entry.items
        : entry.items.filter((child) =>
            getItemSearchText(child).toLowerCase().includes(q)
          )
      if (matchedChildren.length > 0) {
        result.push({ ...entry, items: matchedChildren })
      }
    } else if (getItemSearchText(entry).toLowerCase().includes(q)) {
      result.push(entry)
    }
  }
  return result
}

function Combobox<Value, Multiple extends boolean | undefined = false>({
  children,
  items,
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  multiple,
  disabled = false,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  const isMobile = useIsMobile()
  const isMultiple = Boolean(multiple)

  const isValueControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<unknown>(
    defaultValue ?? (isMultiple ? [] : null)
  )
  const currentValue = isValueControlled ? controlledValue : uncontrolledValue

  const isOpenControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isOpenControlled ? Boolean(controlledOpen) : uncontrolledOpen

  const [search, setSearch] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("搜索选项…")

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (!isOpenControlled) {
        setUncontrolledOpen(next)
      }
      if (!next) {
        setSearch("")
      }
      ;(onOpenChange as ((open: boolean) => void) | undefined)?.(next)
    },
    [disabled, isOpenControlled, onOpenChange]
  )

  const commitValue = React.useCallback(
    (next: unknown) => {
      if (!isValueControlled) {
        setUncontrolledValue(next)
      }
      ;(onValueChange as ((val: unknown) => void) | undefined)?.(next)
    },
    [isValueControlled, onValueChange]
  )

  const selectItem = React.useCallback(
    (itemValue: unknown) => {
      if (disabled) return
      if (isMultiple) {
        const list = Array.isArray(currentValue) ? [...currentValue] : []
        const idx = list.findIndex((v) => Object.is(v, itemValue))
        if (idx >= 0) {
          list.splice(idx, 1)
        } else {
          list.push(itemValue)
        }
        commitValue(list)
      } else {
        commitValue(itemValue)
        setOpen(false)
      }
    },
    [commitValue, currentValue, disabled, isMultiple, setOpen]
  )

  const removeItem = React.useCallback(
    (itemValue: unknown) => {
      if (disabled) return
      if (isMultiple) {
        const list = Array.isArray(currentValue)
          ? currentValue.filter((v) => !Object.is(v, itemValue))
          : []
        commitValue(list)
      } else {
        commitValue(null)
      }
    },
    [commitValue, currentValue, disabled, isMultiple]
  )

  const clearValue = React.useCallback(() => {
    if (disabled) return
    commitValue(isMultiple ? [] : null)
  }, [commitValue, disabled, isMultiple])

  const filteredItems = React.useMemo(
    () => filterItemsByQuery(items as readonly unknown[] | undefined, search),
    [items, search]
  )

  const ctxValue = React.useMemo<ComboboxMobileContextValue>(
    () => ({
      isMobile,
      open: currentOpen,
      setOpen,
      multiple: isMultiple,
      disabled,
      value: currentValue,
      selectItem,
      removeItem,
      clearValue,
      search,
      setSearch,
      items: items as readonly unknown[] | undefined,
      filteredItems,
      placeholder,
      setPlaceholder,
    }),
    [
      clearValue,
      currentOpen,
      currentValue,
      disabled,
      filteredItems,
      isMobile,
      isMultiple,
      items,
      placeholder,
      removeItem,
      search,
      selectItem,
      setOpen,
    ]
  )

  if (isMobile) {
    return (
      <ComboboxMobileContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={setOpen}
          swipeDirection="down"
          showSwipeHandle
        >
          {children}
        </Drawer>
      </ComboboxMobileContext.Provider>
    )
  }

  return (
    <ComboboxMobileContext.Provider value={ctxValue}>
      <ComboboxPrimitive.Root
        items={items}
        value={controlledValue}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        open={controlledOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        multiple={multiple}
        disabled={disabled}
        {...props}
      >
        {children}
      </ComboboxPrimitive.Root>
    </ComboboxMobileContext.Provider>
  )
}

function ComboboxValue({ children, ...props }: ComboboxPrimitive.Value.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    if (typeof children === "function") {
      return <>{children(ctx.value as never)}</>
    }
    return <>{children ?? (ctx.value != null ? String(ctx.value) : null)}</>
  }

  return (
    <ComboboxPrimitive.Value data-slot="combobox-value" {...props}>
      {children}
    </ComboboxPrimitive.Value>
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <DrawerTrigger
        data-slot="combobox-trigger"
        className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
        {...(props as React.ComponentProps<typeof DrawerTrigger>)}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </DrawerTrigger>
    )
  }

  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="清除已选"
        data-slot="combobox-clear"
        className={cn("size-6 rounded-full p-0", className)}
        onClick={(e) => {
          e.stopPropagation()
          ctx.clearValue()
        }}
      >
        <XIcon className="pointer-events-none size-3.5" />
      </Button>
    )
  }

  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn("rounded-full", className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

export interface ComboboxInputProps extends ComboboxPrimitive.Input.Props {
  showTrigger?: boolean
  showClear?: boolean
  /**
   * Enable Apple 27 Liquid Glass field surface.
   * @default true
   */
  glass?: boolean
  /**
   * Placement context; detected automatically inside Liquid Glass surfaces
   * (`over-glass` renders the kit's flat Over-Glass well instead of glass).
   */
  surface?: "default" | "over-glass"
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  glass,
  surface: surfaceProp,
  placeholder,
  ...props
}: ComboboxInputProps) {
  const ctx = useComboboxMobile()
  const onGlass = useOverGlass()
  const surface = surfaceProp ?? (onGlass ? "over-glass" : "default")
  const isGlass = surface !== "over-glass" && (glass ?? true)
  const refraction = useLiquidFieldRefraction<HTMLDivElement>(isGlass)

  React.useEffect(() => {
    if (ctx?.isMobile && placeholder) {
      ctx.setPlaceholder(placeholder)
    }
  }, [ctx, placeholder])

  if (ctx?.isMobile) {
    const hasValue =
      ctx.value !== null &&
      ctx.value !== undefined &&
      ctx.value !== "" &&
      (!Array.isArray(ctx.value) || ctx.value.length > 0)
    const displayLabel = hasValue
      ? Array.isArray(ctx.value)
        ? ctx.value.map(getItemSearchText).join("、")
        : getItemSearchText(ctx.value)
      : (placeholder ?? "请选择…")

    return (
      <>
        <div
          ref={refraction.ref}
          data-slot="combobox-input-shell"
          data-glass={isGlass ? "true" : undefined}
          style={isGlass ? refraction.style : undefined}
          className={cn(
            "relative flex h-11 w-full items-center rounded-full pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-180 ease-out",
            isGlass
              ? liquidFieldGlassClassName
              : surface === "over-glass"
                ? "bg-black/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.08)] dark:bg-white/[0.08] dark:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.1)]"
                : "bg-white/92 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.12)] dark:bg-[#1e1e1e]/88 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.34),0_0_0_0.5px_rgba(255,255,255,0.12)]",
            (disabled || ctx.disabled) && "pointer-events-none opacity-45",
            className
          )}
        >
          <DrawerTrigger
            type="button"
            disabled={disabled || ctx.disabled}
            className={cn(
              "flex h-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left text-[16px] outline-none",
              hasValue ? "text-foreground" : "text-muted-foreground/80"
            )}
          >
            <span className="truncate">{displayLabel}</span>
            {showTrigger && (!showClear || !hasValue) && (
              <ChevronDownIcon className="mr-1.5 size-4 shrink-0 text-muted-foreground" />
            )}
          </DrawerTrigger>
          {showClear && hasValue && <ComboboxClear />}
        </div>
        {isGlass ? refraction.portal : null}
      </>
    )
  }

  return (
    <>
      <div
        ref={refraction.ref}
        data-slot="combobox-input-shell"
        data-glass={isGlass ? "true" : undefined}
        style={isGlass ? refraction.style : undefined}
        className={cn(
          "relative w-full rounded-full transition-[background-color,border-color,box-shadow] duration-180 ease-out",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-[3.5px] has-[[data-slot=input-group-control]:focus-visible]:ring-(--apple-blue)/30",
          isGlass
            ? liquidFieldGlassClassName
            : surface === "over-glass"
              ? "bg-black/[0.05] shadow-[inset_0_1px_1px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.08)] dark:bg-white/[0.08] dark:shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.1)]"
              : "bg-white/92 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.12)] dark:bg-[#1e1e1e]/88 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.34),0_0_0_0.5px_rgba(255,255,255,0.12)]",
          className
        )}
      >
        <InputGroup className="h-11 w-full rounded-full border-transparent bg-transparent shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 md:h-8.5 dark:bg-transparent">
          <ComboboxPrimitive.Input
            placeholder={placeholder}
            render={
              <InputGroupInput
                disabled={disabled}
                className="h-full px-4 text-[16px] md:px-3.5 md:text-[13px]"
              />
            }
            {...props}
          />
          <InputGroupAddon align="inline-end" className="pr-2">
            {showTrigger && (
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                render={<ComboboxTrigger />}
                data-slot="input-group-button"
                className="rounded-full group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
                disabled={disabled}
              />
            )}
            {showClear && <ComboboxClear disabled={disabled} />}
          </InputGroupAddon>
          {children}
        </InputGroup>
      </div>
      {isGlass ? refraction.portal : null}
    </>
  )
}

export interface ComboboxContentProps
  extends Omit<ComboboxPrimitive.Popup.Props, "title">,
    Pick<
      ComboboxPrimitive.Positioner.Props,
      "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
    > {
  /**
   * Enable Apple 27 Liquid Glass optical refraction backdrop.
   * @default true
   */
  glass?: boolean
  /**
   * Optional centered header title displayed inside the iOS 27 bottom drawer on mobile viewports.
   */
  mobileTitle?: React.ReactNode
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  anchor,
  glass = true,
  mobileTitle,
  children,
  ...props
}: ComboboxContentProps) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <DrawerContent
        data-slot="combobox-content"
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
          "after:hidden",
          className
        )}
      >
        <DrawerHeader className="items-center px-5 pt-3 pb-2 text-center">
          <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
            {mobileTitle ?? (ctx.multiple ? "选择多项" : "搜索并选择")}
          </DrawerTitle>
        </DrawerHeader>

        {/* iOS 27 Integrated Search Field inside Bottom Sheet */}
        <div className="px-4 pb-2.5">
          <div className="flex h-10 items-center gap-2 rounded-full bg-black/[0.06] px-3.5 dark:bg-white/[0.1]">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={ctx.search}
              onChange={(e) => ctx.setSearch(e.target.value)}
              placeholder={ctx.placeholder}
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-foreground caret-(--apple-blue) outline-none placeholder:text-muted-foreground/80"
            />
            {ctx.search && (
              <button
                type="button"
                aria-label="清空搜索"
                onClick={() => ctx.setSearch("")}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-black/[0.12] text-foreground/75 dark:bg-white/[0.18] dark:text-white/80"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div
          role="listbox"
          className={cn(
            "flex max-h-[58dvh] flex-col gap-3 overflow-y-auto px-4 pt-0.5",
            ctx.multiple
              ? "pb-3"
              : "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          )}
        >
          {children}
        </div>

        {ctx.multiple && (
          <DrawerFooter className="px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <DrawerClose render={<Button variant="default">完成</Button>} />
          </DrawerFooter>
        )}
      </DrawerContent>
    )
  }

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          data-glass={glass ? "true" : "false"}
          className={cn(
            "group/combobox-content relative isolate max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(6))] origin-(--transform-origin) overflow-hidden rounded-[22px] outline-none md:rounded-[18px]",
            "data-[chips=true]:min-w-(--anchor-width)",
            glass
              ? [
                  "bg-transparent text-neutral-900 dark:text-white",
                  "shadow-[0_18px_46px_-8px_rgba(0,0,0,0.22),0_4px_14px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-0.5px_0_rgba(255,255,255,0.35)]",
                  "dark:shadow-[0_20px_52px_-8px_rgba(0,0,0,0.62),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-0.5px_0_rgba(255,255,255,0.06)]",
                ]
              : "border border-border/60 bg-popover text-popover-foreground shadow-lg",
            "transition-[transform,opacity] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "data-starting-style:scale-[0.96] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.97] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {glass && (
            <LiquidSurfaceBackdrop radius={20} bezel={16} size="menu" />
          )}
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({
  className,
  children,
  ...props
}: ComboboxPrimitive.List.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    const rendered =
      typeof children === "function"
        ? ctx.filteredItems.map((item, idx) =>
            (children as (item: unknown, index: number) => React.ReactNode)(
              item,
              idx
            )
          )
        : children

    const childArray = React.Children.toArray(rendered)
    if (childArray.length === 0) return null

    const hasGroups = childArray.some(
      (child) =>
        React.isValidElement(child) &&
        (child.type as { displayName?: string } | null)?.displayName ===
          "ComboboxGroup"
    )

    if (hasGroups) {
      return (
        <div
          data-slot="combobox-list"
          className={cn("flex flex-col gap-3", className)}
        >
          {rendered}
        </div>
      )
    }

    return (
      <div
        data-slot="combobox-list"
        className={cn(
          "overflow-hidden rounded-2xl bg-black/[0.04] divide-y divide-black/[0.06] dark:bg-white/[0.07] dark:divide-white/[0.08]",
          className
        )}
      >
        {rendered}
      </div>
    )
  }

  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0",
        className
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.List>
  )
}

function ComboboxItem({
  className,
  children,
  value,
  disabled,
  ...props
}: ComboboxPrimitive.Item.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    const isSelected = ctx.multiple
      ? Array.isArray(ctx.value) &&
        ctx.value.some((v) => Object.is(v, value))
      : Object.is(ctx.value, value)

    return (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={disabled}
        data-slot="combobox-item"
        data-selected={isSelected ? "" : undefined}
        onClick={() => ctx.selectItem(value)}
        className={cn(
          "flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          isSelected && "font-medium text-(--apple-blue)",
          "disabled:pointer-events-none disabled:opacity-40",
          className
        )}
      >
        <span className="flex flex-1 items-center gap-2.5 truncate">
          {children}
        </span>
        {isSelected ? (
          <CheckIcon className="size-[18px] shrink-0 text-(--apple-blue) stroke-[2.25]" />
        ) : null}
      </button>
    )
  }

  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex min-h-10 w-full cursor-default items-center gap-2 rounded-[12px] py-2 pr-9 pl-3 text-[15px] outline-hidden select-none transition-colors duration-120 md:min-h-7.5 md:rounded-[9px] md:py-1.5 md:pr-8 md:pl-2.5 md:text-[13px]",
        "data-highlighted:bg-(--apple-blue) data-highlighted:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-45",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none size-4 stroke-[2.2]" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

const ComboboxGroupItemsContext = React.createContext<readonly unknown[] | null>(
  null
)

function ComboboxGroup({
  className,
  items,
  children,
  ...props
}: ComboboxPrimitive.Group.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    const labelNodes: React.ReactNode[] = []
    const bodyNodes: React.ReactNode[] = []

    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.type as { displayName?: string } | null)?.displayName ===
          "ComboboxLabel"
      ) {
        labelNodes.push(child)
      } else {
        bodyNodes.push(child)
      }
    })

    return (
      <ComboboxGroupItemsContext.Provider
        value={(items as readonly unknown[] | undefined) ?? null}
      >
        <div
          data-slot="combobox-group"
          role="group"
          className={cn("flex flex-col gap-1.5", className)}
        >
          {labelNodes}
          <div className="overflow-hidden rounded-2xl bg-black/[0.04] divide-y divide-black/[0.06] dark:bg-white/[0.07] dark:divide-white/[0.08]">
            {bodyNodes}
          </div>
        </div>
      </ComboboxGroupItemsContext.Provider>
    )
  }

  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      items={items}
      className={cn(className)}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Group>
  )
}
ComboboxGroup.displayName = "ComboboxGroup"

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <div
        data-slot="combobox-label"
        className={cn(
          "px-2 pt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-foreground/85",
          className
        )}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }

  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        "px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground/85",
        className
      )}
      {...props}
    />
  )
}
ComboboxLabel.displayName = "ComboboxLabel"

function ComboboxCollection({
  children,
  ...props
}: ComboboxPrimitive.Collection.Props) {
  const ctx = useComboboxMobile()
  const groupItems = React.useContext(ComboboxGroupItemsContext)

  if (ctx?.isMobile) {
    if (typeof children === "function" && groupItems) {
      return (
        <>
          {groupItems.map((item, idx) =>
            (children as (item: unknown, index: number) => React.ReactNode)(
              item,
              idx
            )
          )}
        </>
      )
    }
    return <>{typeof children === "function" ? null : children}</>
  }

  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props}>
      {children}
    </ComboboxPrimitive.Collection>
  )
}

function ComboboxEmpty({
  className,
  children,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    if (ctx.filteredItems.length > 0) return null
    return (
      <div
        data-slot="combobox-empty"
        className={cn(
          "w-full py-8 text-center text-[14px] text-muted-foreground",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-6 text-center text-[13px] text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Empty>
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <div
        data-slot="combobox-separator"
        role="separator"
        className={cn("h-px bg-black/[0.06] dark:bg-white/[0.08]", className)}
      />
    )
  }

  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn(
        "mx-2 my-1 h-px bg-black/[0.07] dark:bg-white/[0.1]",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  glass = true,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props & {
    glass?: boolean
  }) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <div
        role="button"
        tabIndex={ctx.disabled ? -1 : 0}
        data-slot="combobox-chips"
        data-glass={glass ? "true" : "false"}
        onClick={() => ctx.setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            ctx.setOpen(true)
          }
        }}
        className={cn(
          "flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-[22px] px-3 py-1.5 text-[15px] transition-[background-color,border-color,box-shadow] duration-180",
          glass
            ? [
                "bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]",
                "shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_0_0_0.5px_rgba(0,0,0,0.1),0_4px_12px_-4px_rgba(0,0,0,0.08)]",
                "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_0_0.5px_rgba(255,255,255,0.14)]",
              ]
            : "border border-input bg-white/92 dark:bg-[#1e1e1e]/88",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      data-glass={glass ? "true" : "false"}
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-1.5 rounded-[22px] px-3 py-1.5 text-[15px] transition-[background-color,border-color,box-shadow] duration-180 md:min-h-9 md:rounded-[18px] md:px-2.5 md:text-[13px]",
        "focus-within:ring-[3.5px] focus-within:ring-(--apple-blue)/30",
        "has-aria-invalid:ring-[3px] has-aria-invalid:ring-(--apple-red)/25",
        glass
          ? [
              "bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]",
              "shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_0_0_0.5px_rgba(0,0,0,0.1),0_4px_12px_-4px_rgba(0,0,0,0.08)]",
              "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_0_0.5px_rgba(255,255,255,0.14)]",
            ]
          : "border border-input bg-white/92 dark:bg-[#1e1e1e]/88",
        className
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Chips>
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}) {
  const ctx = useComboboxMobile()

  if (ctx?.isMobile) {
    return (
      <span
        data-slot="combobox-chip"
        className={cn(
          "inline-flex h-7 w-fit items-center justify-center gap-1 rounded-full bg-black/[0.07] px-2.5 text-[13px] font-medium whitespace-nowrap text-foreground dark:bg-white/[0.14]",
          showRemove && "pr-1",
          className
        )}
      >
        {children}
        {showRemove && (
          <button
            type="button"
            aria-label="移除标签"
            data-slot="combobox-chip-remove"
            onClick={(e) => {
              e.stopPropagation()
              ctx.removeItem(children)
            }}
            className="inline-flex size-5 items-center justify-center rounded-full opacity-65 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/15"
          >
            <XIcon className="pointer-events-none size-3" />
          </button>
        )}
      </span>
    )
  }

  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "inline-flex h-6.5 w-fit items-center justify-center gap-1 rounded-full bg-black/[0.07] px-2.5 text-[12px] font-medium whitespace-nowrap text-foreground dark:bg-white/[0.14]",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-data-[slot=combobox-chip-remove]:pr-1",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="size-4.5 rounded-full opacity-60 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/15"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none size-3" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  placeholder,
  ...props
}: ComboboxPrimitive.Input.Props) {
  const ctx = useComboboxMobile()

  React.useEffect(() => {
    if (ctx?.isMobile && placeholder) {
      ctx.setPlaceholder(placeholder)
    }
  }, [ctx, placeholder])

  if (ctx?.isMobile) {
    const isEmpty = !Array.isArray(ctx.value) || ctx.value.length === 0
    return (
      <span
        data-slot="combobox-chip-input"
        className={cn(
          "min-w-16 flex-1 px-1 text-[15px] text-muted-foreground/80",
          className
        )}
      >
        {isEmpty ? (placeholder || "点击选择…") : "添加…"}
      </span>
    )
  }

  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      placeholder={placeholder}
      className={cn(
        "min-w-20 flex-1 bg-transparent caret-(--apple-blue) outline-none placeholder:text-muted-foreground/75",
        className
      )}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxClear,
  useComboboxAnchor,
}
