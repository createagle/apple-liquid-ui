"use client"

import * as React from "react"
import { cn } from "cn"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DropdownProps,
  type Locale,
} from "react-day-picker"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Button variant used for previous/next month navigation controls.
   * @default "ghost"
   */
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  /**
   * Renders the Apple 27 Liquid Glass container surface when standalone.
   * Automatically yields to parent Popover/Drawer/Card surfaces to avoid nested glass.
   * @default true
   */
  glass?: boolean
  /**
   * Enables SVG SDF optical bezel refraction on the standalone glass surface.
   * @default true
   */
  refract?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  glass = true,
  refract = true,
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-3.5 [--cell-radius:9999px] [--cell-size:2.5rem] md:p-3 md:[--cell-size:2rem]",
        "in-data-[slot=popover-content]:p-0 in-data-[slot=drawer-content]:p-0 in-data-[slot=card-content]:p-0",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-0 flex h-9 w-full items-center justify-between gap-1 md:h-7",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "pointer-events-auto size-9 rounded-full p-0 text-(--apple-blue) select-none hover:bg-black/[0.06] aria-disabled:opacity-35 md:size-7 dark:hover:bg-white/[0.1]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "pointer-events-auto size-9 rounded-full p-0 text-(--apple-blue) select-none hover:bg-black/[0.06] aria-disabled:opacity-35 md:size-7 dark:hover:bg-white/[0.1]",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center px-10 md:h-7 md:px-8",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "relative z-10 flex h-9 w-full items-center justify-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em] md:h-7 md:text-[13px]",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative inline-flex items-center rounded-full bg-black/[0.05] px-2.5 py-1 transition-colors hover:bg-black/[0.09] focus-within:ring-2 focus-within:ring-(--apple-blue)/45 dark:bg-white/[0.09] dark:hover:bg-white/[0.14]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 size-full cursor-pointer opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-semibold tracking-[-0.015em] text-foreground select-none",
          captionLayout === "label"
            ? "text-[16px] md:text-[14px]"
            : "pointer-events-none flex items-center gap-1 text-[14px] md:text-[13px] [&>svg]:size-3.5 [&>svg]:text-foreground/55",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 pb-1 text-center text-[12px] font-semibold text-foreground/45 select-none md:text-[11px]",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[11px] text-foreground/45 tabular-nums select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-full p-0 text-center select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-full before:pointer-events-none before:absolute before:inset-y-0 before:right-0 before:left-1/2 before:-z-10 before:bg-(--apple-blue)/14 dark:before:bg-(--apple-blue)/22 [&:has([data-range-end=true])]:before:hidden",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "relative isolate z-0 rounded-none bg-(--apple-blue)/14 first:rounded-l-full last:rounded-r-full dark:bg-(--apple-blue)/22",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "relative isolate z-0 rounded-r-full before:pointer-events-none before:absolute before:inset-y-0 before:right-1/2 before:left-0 before:-z-10 before:bg-(--apple-blue)/14 dark:before:bg-(--apple-blue)/22 [&:has([data-range-start=true])]:before:hidden",
          defaultClassNames.range_end
        ),
        today: cn("rounded-full", defaultClassNames.today),
        outside: cn(
          "text-foreground/30 aria-selected:text-foreground/45",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-foreground/30 opacity-45",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({
          className: rootClassName,
          rootRef,
          children: rootChildren,
          ...rootProps
        }) => {
          return (
            <div
              data-slot="calendar"
              data-glass={glass ? "true" : "false"}
              ref={rootRef}
              className={cn(
                "relative isolate overflow-hidden rounded-[24px]",
                glass
                  ? [
                      "bg-transparent text-neutral-900 dark:text-white",
                      "shadow-[0_18px_46px_-10px_rgba(0,0,0,0.18),0_4px_14px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
                      "dark:shadow-[0_22px_54px_-10px_rgba(0,0,0,0.62),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]",
                    ]
                  : "border border-border/70 bg-background text-foreground shadow-sm",
                "in-data-[slot=popover-content]:rounded-none! in-data-[slot=popover-content]:border-0! in-data-[slot=popover-content]:bg-transparent! in-data-[slot=popover-content]:shadow-none!",
                "in-data-[slot=drawer-content]:rounded-none! in-data-[slot=drawer-content]:border-0! in-data-[slot=drawer-content]:bg-transparent! in-data-[slot=drawer-content]:shadow-none!",
                "in-data-[slot=card-content]:rounded-none! in-data-[slot=card-content]:border-0! in-data-[slot=card-content]:bg-transparent! in-data-[slot=card-content]:shadow-none!",
                rootClassName
              )}
              {...rootProps}
            >
              {glass ? (
                refract ? (
                  <LiquidSurfaceBackdrop
                    radius={24}
                    bezel={20}
                    tone="sheet"
                    className="in-data-[slot=popover-content]:hidden in-data-[slot=drawer-content]:hidden in-data-[slot=card-content]:hidden"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    data-slot="calendar-glass-backdrop"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-(--liquid-surface-sheet) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] in-data-[slot=popover-content]:hidden in-data-[slot=drawer-content]:hidden in-data-[slot=card-content]:hidden"
                  />
                )
              ) : null}
              {rootChildren}
            </div>
          )
        },
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-4.5 md:size-4", chevronClassName)}
                {...chevronProps}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4.5 md:size-4", chevronClassName)}
                {...chevronProps}
              />
            )
          }

          return (
            <ChevronDownIcon
              className={cn("size-3.5", chevronClassName)}
              {...chevronProps}
            />
          )
        },
        DayButton: ({ ...dayProps }) => (
          <CalendarDayButton locale={locale} {...dayProps} />
        ),
        Dropdown: CalendarDropdown,
        WeekNumber: ({ children: weekChildren, ...weekProps }) => {
          return (
            <td {...weekProps}>
              <div className="flex size-(--cell-size) items-center justify-center text-center text-[11px] text-foreground/45 tabular-nums">
                {weekChildren}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  onAnimationStart: _onAnimationStart,
  onDrag: _onDrag,
  onDragStart: _onDragStart,
  onDragEnd: _onDragEnd,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-today={modifiers.today || undefined}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-(--cell-size) w-full min-w-(--cell-size) flex-col gap-0.5 rounded-full border-0 p-0 text-[15px] leading-none font-normal text-foreground tabular-nums md:text-[13px]",
        "hover:bg-black/[0.07] hover:text-foreground dark:hover:bg-white/[0.12]",
        "group-data-[outside=true]/day:text-foreground/30",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-(--apple-blue)/40",
        "data-[today=true]:bg-(--apple-blue)/12 data-[today=true]:font-semibold data-[today=true]:text-(--apple-blue) data-[today=true]:hover:bg-(--apple-blue)/18",
        "data-[range-middle=true]:rounded-full data-[range-middle=true]:bg-transparent data-[range-middle=true]:font-medium data-[range-middle=true]:text-foreground data-[range-middle=true]:hover:bg-(--apple-blue)/18",
        "data-[selected-single=true]:bg-(--apple-blue) data-[selected-single=true]:font-semibold data-[selected-single=true]:text-white data-[selected-single=true]:shadow-[0_4px_12px_-2px_color-mix(in_srgb,var(--apple-blue)_52%,transparent),inset_0_1px_0_rgba(255,255,255,0.3)] data-[selected-single=true]:hover:bg-(--apple-blue)",
        "data-[range-start=true]:bg-(--apple-blue) data-[range-start=true]:font-semibold data-[range-start=true]:text-white data-[range-start=true]:shadow-[0_4px_12px_-2px_color-mix(in_srgb,var(--apple-blue)_52%,transparent),inset_0_1px_0_rgba(255,255,255,0.3)] data-[range-start=true]:hover:bg-(--apple-blue)",
        "data-[range-end=true]:bg-(--apple-blue) data-[range-end=true]:font-semibold data-[range-end=true]:text-white data-[range-end=true]:shadow-[0_4px_12px_-2px_color-mix(in_srgb,var(--apple-blue)_52%,transparent),inset_0_1px_0_rgba(255,255,255,0.3)] data-[range-end=true]:hover:bg-(--apple-blue)",
        "[&>span]:text-[11px] [&>span]:opacity-75",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
  className,
}: DropdownProps) {
  const handleValueChange = React.useCallback(
    (next: string | null) => {
      if (next === null || !onChange) return
      onChange({
        target: { value: next },
      } as React.ChangeEvent<HTMLSelectElement>)
    },
    [onChange]
  )

  return (
    <Select
      value={value !== undefined ? String(value) : null}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn(
          "h-8 gap-1 rounded-full bg-black/[0.05] px-2.5 text-[14px] font-semibold tracking-[-0.01em] text-foreground shadow-none hover:bg-black/[0.09] md:h-7 md:rounded-full md:px-2.5 md:text-[13px] dark:bg-white/[0.09] dark:hover:bg-white/[0.14]",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="center"
        title={ariaLabel}
        className="md:max-h-60 md:min-w-28"
      >
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { Calendar, CalendarDayButton, CalendarDropdown }
