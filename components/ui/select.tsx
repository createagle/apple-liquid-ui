"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_PRESS_SCALE, LIQUID_SPRINGS } from "@/lib/liquid-motion"
import {
  LiquidSurfaceBackdrop,
  useOverGlass,
} from "@/components/ui/liquid-surface"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const MotionSelectTriggerPrimitive = motion.create(SelectPrimitive.Trigger)
const MotionDrawerTrigger = motion.create(DrawerTrigger)

interface SelectContextValue {
  isMobile: boolean
  value: string | null
  selectValue: (next: string) => void
  open: boolean
  setOpen: (next: boolean) => void
  disabled: boolean
  labels: Map<string, React.ReactNode>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) {
    throw new Error("Select components must be used within <Select>.")
  }
  return ctx
}

/**
 * Synchronously collects `<SelectItem value="...">{children}</SelectItem>` labels
 * from the JSX tree so both Desktop `SelectPrimitive.Root` (`items`) and Mobile
 * `Drawer` display the human-readable label immediately before opening.
 */
function collectSelectLabels(
  node: React.ReactNode,
  map: Map<string, React.ReactNode>
) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as {
      value?: unknown
      children?: React.ReactNode
    }
    const displayName =
      (child.type as { displayName?: string } | null)?.displayName ?? ""
    if (
      displayName === "SelectItem" &&
      props.value !== undefined &&
      props.value !== null
    ) {
      map.set(String(props.value), props.children)
      return
    }
    if (props.children) {
      collectSelectLabels(props.children, map)
    }
  })
}

export interface SelectProps {
  children?: React.ReactNode
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  name?: string
  required?: boolean
  readOnly?: boolean
  items?: Record<string, React.ReactNode>
}

function Select({
  children,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  name,
  required,
  readOnly,
  items,
}: SelectProps) {
  const isMobile = useIsMobile()

  const isValueControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | null
  >(defaultValue)
  const currentValue = isValueControlled
    ? (controlledValue ?? null)
    : uncontrolledValue

  const isOpenControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isOpenControlled ? Boolean(controlledOpen) : uncontrolledOpen

  const labels = React.useMemo(() => {
    const map = new Map<string, React.ReactNode>()
    if (items) {
      for (const [k, v] of Object.entries(items)) {
        map.set(k, v)
      }
    }
    collectSelectLabels(children, map)
    return map
  }, [children, items])

  const itemsRecord = React.useMemo(() => {
    const record: Record<string, React.ReactNode> = {}
    labels.forEach((label, key) => {
      record[key] = label
    })
    return record
  }, [labels])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (!isOpenControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [disabled, isOpenControlled, onOpenChange]
  )

  const handleDesktopValueChange = React.useCallback(
    (next: string | null) => {
      if (readOnly) return
      if (!isValueControlled) {
        setUncontrolledValue(next)
      }
      onValueChange?.(next)
    },
    [isValueControlled, onValueChange, readOnly]
  )

  const selectValue = React.useCallback(
    (next: string) => {
      if (disabled || readOnly) return
      if (!isValueControlled) {
        setUncontrolledValue(next)
      }
      onValueChange?.(next)
      setOpen(false)
    },
    [disabled, isValueControlled, onValueChange, readOnly, setOpen]
  )

  const ctxValue = React.useMemo<SelectContextValue>(
    () => ({
      isMobile,
      value: currentValue,
      selectValue,
      open: currentOpen,
      setOpen,
      disabled,
      labels,
    }),
    [currentOpen, currentValue, disabled, isMobile, labels, selectValue, setOpen]
  )

  if (isMobile) {
    return (
      <SelectContext.Provider value={ctxValue}>
        <Drawer
          open={currentOpen}
          onOpenChange={setOpen}
          swipeDirection="down"
          showSwipeHandle
        >
          {name ? (
            <input
              type="hidden"
              name={name}
              value={currentValue ?? ""}
              required={required}
              readOnly
            />
          ) : null}
          {children}
        </Drawer>
      </SelectContext.Provider>
    )
  }

  return (
    <SelectContext.Provider value={ctxValue}>
      <SelectPrimitive.Root
        value={currentValue}
        onValueChange={handleDesktopValueChange}
        open={currentOpen}
        onOpenChange={setOpen}
        disabled={disabled}
        name={name}
        required={required}
        readOnly={readOnly}
        items={itemsRecord}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

function SelectGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & SelectPrimitive.Group.Props) {
  const { isMobile } = useSelectContext()

  if (isMobile) {
    const labelNodes: React.ReactNode[] = []
    const itemNodes: React.ReactNode[] = []

    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.type as { displayName?: string } | null)?.displayName ===
          "SelectLabel"
      ) {
        labelNodes.push(child)
      } else {
        itemNodes.push(child)
      }
    })

    return (
      <div
        data-slot="select-group"
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
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Group>
  )
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: SelectPrimitive.Value.Props) {
  const { isMobile, value, labels } = useSelectContext()

  if (isMobile) {
    const resolved =
      typeof children === "function"
        ? children(value)
        : children !== undefined
          ? children
          : value !== null && value !== ""
            ? (labels.get(value) ?? value)
            : null

    const isPlaceholder = resolved === null || resolved === undefined

    return (
      <span
        data-slot="select-value"
        data-placeholder={isPlaceholder ? "" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 truncate text-left",
          isPlaceholder && "text-muted-foreground",
          className
        )}
      >
        {isPlaceholder ? placeholder : resolved}
      </span>
    )
  }

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      placeholder={placeholder}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 truncate text-left",
        className
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  )
}

const selectTriggerVariants = cva(
  [
    "group/select-trigger relative inline-flex w-fit cursor-pointer items-center justify-between gap-2 font-medium whitespace-nowrap outline-none select-none",
    "transition-[background-color,color,border-color,box-shadow,filter,opacity] duration-200 ease-out",
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-(--apple-red) aria-invalid:ring-3 aria-invalid:ring-(--apple-red)/25",
    "data-placeholder:text-muted-foreground",
    "*:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 md:[&_svg:not([class*='size-'])]:size-3.5",
  ].join(" "),
  {
    variants: {
      variant: {
        // Apple macOS 27 Pop-up Button <-> iOS 27 Rounded Input Pill
        default: [
          "bg-(--apple-fill-bordered-ios) text-foreground",
          "shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5)]",
          "active:bg-(--apple-fill-bordered-ios-pressed)",
          "md:bg-(--apple-fill-bordered-mac) md:hover:bg-(--apple-fill-bordered-mac-hover) md:active:bg-(--apple-fill-bordered-mac-pressed)",
          "dark:shadow-[inset_0_0.5px_0_rgba(255,255,255,0.12)]",
        ].join(" "),

        // Apple Liquid Glass `Regular - Small` control (shared material, same as glass Button);
        // the glass itself is a `<LiquidSurfaceBackdrop size="small">` child layer
        glass: [
          "isolate bg-transparent text-(--lq-text) dark:text-white",
          // Hover / press wash between the glass layer and the label
          "after:pointer-events-none after:absolute after:inset-0 after:-z-5 after:rounded-[inherit] after:transition-colors after:duration-200",
          "hover:after:bg-white/14 active:after:bg-black/6 dark:hover:after:bg-white/10 dark:active:after:bg-white/16",
          // Opacity on the host would blank the glass (Backdrop Root): dim children instead
          "disabled:opacity-100 disabled:*:opacity-45",
        ].join(" "),

        // Apple 27 UI Kit `Over-Glass / Bordered`: flat fill on a Liquid Glass surface
        "over-glass": [
          "bg-(--apple-fill-over-glass) text-foreground active:bg-(--apple-fill-over-glass-pressed)",
        ].join(" "),
      },
      size: {
        // Mobile iOS 27 (46px pill, 16px) -> Desktop macOS 27 (32px, r=8px, 13.5px)
        default:
          "h-[46px] rounded-2xl pr-3.5 pl-4 text-[16px] md:h-8 md:rounded-[8px] md:pr-2.5 md:pl-3 md:text-[13.5px]",
        // Mobile iOS 27 (38px pill, 15px) -> Desktop macOS 27 (28px, r=7px, 12.5px)
        sm: "h-[38px] rounded-xl pr-3 pl-3.5 text-[15px] md:h-7 md:rounded-[7px] md:pr-2 md:pl-2.5 md:text-[12.5px]",
      },
    },
    compoundVariants: [
      {
        variant: "glass",
        class: "rounded-full md:rounded-full",
      },
    ],
    defaultVariants: {
      variant: "glass",
      size: "default",
    },
  }
)

type SelectTriggerVariant = "default" | "glass"

type SelectTriggerBaseProps = Omit<
  SelectPrimitive.Trigger.Props,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
> & {
  style?: React.CSSProperties
}

export interface SelectTriggerProps
  extends SelectTriggerBaseProps,
    Pick<VariantProps<typeof selectTriggerVariants>, "size"> {
  /**
   * `glass`: the shared Liquid Glass control material (default when standalone);
   * `default`: the solid macOS Pop-up Button / iOS pill fill.
   * On a Liquid Glass surface the trigger always renders the kit's flat
   * Over-Glass fill instead (Apple never stacks glass on glass).
   * @default "glass"
   */
  variant?: SelectTriggerVariant | null
  /**
   * Placement context; detected automatically inside Liquid Glass surfaces
   * (Dialog, Popover, Sheet, Drawer, glass Card, ...). Pass to override.
   */
  surface?: "default" | "over-glass"
  disableMotion?: boolean
}

function SelectTrigger({
  className,
  variant: variantProp,
  size = "default",
  surface: surfaceProp,
  disableMotion = false,
  disabled: triggerDisabled,
  children,
  ...props
}: SelectTriggerProps) {
  const { isMobile, disabled: rootDisabled, value } = useSelectContext()
  const onGlass = useOverGlass()
  const surface = surfaceProp ?? (onGlass ? "over-glass" : "default")
  const variant =
    surface === "over-glass" ? "over-glass" : (variantProp ?? "glass")
  const glassLayer =
    variant === "glass" ? (
      <LiquidSurfaceBackdrop size="small" />
    ) : null
  const prefersReducedMotion = useReducedMotion()
  const disabled = Boolean(triggerDisabled || rootDisabled)
  const shouldAnimate = !disableMotion && !prefersReducedMotion && !disabled

  const pressTransition = isMobile
    ? LIQUID_SPRINGS.iosPress
    : LIQUID_SPRINGS.macosPress
  const tapScale = isMobile
    ? LIQUID_PRESS_SCALE.ios
    : LIQUID_PRESS_SCALE.macos

  const chevron = (
    <ChevronsUpDownIcon className="pointer-events-none size-4 text-muted-foreground/80 md:size-3.5" />
  )

  if (isMobile) {
    return (
      <MotionDrawerTrigger
        data-slot="select-trigger"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        data-surface={surface}
        data-placeholder={value === null || value === "" ? "" : undefined}
        disabled={disabled}
        whileTap={shouldAnimate ? { scale: tapScale } : undefined}
        transition={pressTransition}
        className={cn(selectTriggerVariants({ variant, size }), className)}
        {...(props as Record<string, unknown>)}
      >
        {glassLayer}
        {children}
        {chevron}
      </MotionDrawerTrigger>
    )
  }

  return (
    <MotionSelectTriggerPrimitive
      data-slot="select-trigger"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      data-surface={surface}
      disabled={disabled}
      whileTap={shouldAnimate ? { scale: tapScale } : undefined}
      transition={pressTransition}
      className={cn(selectTriggerVariants({ variant, size }), className)}
      {...props}
    >
      {glassLayer}
      {children}
      <SelectPrimitive.Icon render={chevron} />
    </MotionSelectTriggerPrimitive>
  )
}

export interface SelectContentProps
  extends Omit<SelectPrimitive.Popup.Props, "title">,
    Pick<
      SelectPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
    > {
  /**
   * Optional sheet header title displayed inside the iOS 27 bottom drawer on mobile viewports.
   */
  title?: React.ReactNode
}

function SelectContent({
  className,
  children,
  title,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  const { isMobile } = useSelectContext()

  if (isMobile) {
    return (
      <DrawerContent
        data-slot="select-content"
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
      >
        <DrawerHeader className="items-center px-5 pt-3 pb-2 text-center">
          <DrawerTitle className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-foreground">
            {title ?? "请选择"}
          </DrawerTitle>
        </DrawerHeader>

        <div
          role="listbox"
          className="flex flex-col gap-3 overflow-y-auto px-4 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </div>
      </DrawerContent>
    )
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // Apple macOS 27 Spotless Liquid Glass Floating Menu (r=14px, true optical bezel refraction)
            "relative isolate z-50 flex max-h-(--available-height) min-w-[max(var(--anchor-width),11rem)] origin-(--transform-origin) flex-col overflow-hidden rounded-[14px] bg-transparent text-neutral-900",
            "shadow-[0_18px_44px_-10px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
            "dark:text-white dark:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.58),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "transition-[transform,opacity] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-ending-style:scale-[0.97] data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          <LiquidSurfaceBackdrop radius={14} bezel={14} size="menu" />
          <SelectScrollUpButton />
          <SelectPrimitive.List className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-1.5">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<"div"> & SelectPrimitive.GroupLabel.Props) {
  const { isMobile } = useSelectContext()

  if (isMobile) {
    return (
      <div
        data-slot="select-label"
        className={cn(
          "px-2 pt-1 text-[13px] font-semibold tracking-[-0.01em] text-foreground/85",
          className
        )}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }

  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
SelectLabel.displayName = "SelectLabel"

function SelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: SelectPrimitive.Item.Props) {
  const { isMobile, value: selectedValue, selectValue } = useSelectContext()
  const itemValue = String(value ?? "")
  const isSelected = selectedValue === itemValue

  if (isMobile) {
    return (
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        data-slot="select-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={() => selectValue(itemValue)}
        className={cn(
          // Apple iOS 27 List Row (52px touch target, 16px SF Pro, trailing Apple Blue checkmark)
          "flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[16px] font-normal text-foreground transition-colors outline-none select-none",
          "active:bg-black/[0.06] dark:active:bg-white/[0.1]",
          isSelected && "font-medium text-(--apple-blue)",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
      >
        <span className="flex flex-1 items-center gap-2.5 truncate">
          {children}
        </span>
        {isSelected ? (
          <CheckIcon className="size-[18px] shrink-0 text-(--apple-blue)" />
        ) : null}
      </button>
    )
  }

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      disabled={disabled}
      className={cn(
        // Apple macOS 27 Menu Item (r=8px, 13px Medium, #0069F9 active/hover highlight, trailing checkmark)
        "relative flex w-full cursor-default items-center gap-2 rounded-[8px] py-1.5 pr-8 pl-2.5 text-[13px] font-medium text-foreground/90 outline-hidden select-none",
        "transition-colors duration-75",
        "data-highlighted:bg-(--apple-blue) data-highlighted:text-white dark:data-highlighted:bg-(--apple-blue) dark:data-highlighted:text-white",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 items-center gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-3.5 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none size-3.5 stroke-[2.25]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
SelectItem.displayName = "SelectItem"

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div"> & SelectPrimitive.Separator.Props) {
  const { isMobile } = useSelectContext()

  if (isMobile) {
    return (
      <div
        data-slot="select-separator"
        role="separator"
        className={cn("h-px bg-black/[0.06] dark:bg-white/[0.08]", className)}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }

  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none mx-2 my-1 h-px bg-black/[0.08] dark:bg-white/[0.12]",
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center py-1 text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1 text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}
