"use client"

import * as React from "react"
import { cn } from "cn"

import { LiquidSurfaceBackdrop } from "@/components/ui/liquid-surface"

export interface CardProps extends React.ComponentProps<"div"> {
  /**
   * Density and corner-radius scale.
   * @default "default"
   */
  size?: "default" | "sm"
  /**
   * Renders the Apple Liquid Glass translucent surface by default.
   * Pass `glass={false}` for a solid iOS/macOS grouped card surface.
   * @default true
   */
  glass?: boolean
  /**
   * Use `surface="over-glass"` when nesting a card inside another Liquid Glass container
   * (matches macOS 27 Group Box subtle translucent fill without nested backdrop-filter).
   * @default "default"
   */
  surface?: "default" | "over-glass"
  /**
   * Enables true SVG SDF optical bezel refraction (`<LiquidSurfaceBackdrop>`) on the glass card.
   * @default false
   */
  refract?: boolean
}

function Card({
  className,
  size = "default",
  glass,
  surface = "default",
  refract = false,
  children,
  ...props
}: CardProps) {
  const isGlass = glass ?? surface !== "over-glass"
  const radiusPx = size === "sm" ? 18 : 24

  return (
    <div
      data-slot="card"
      data-size={size}
      data-glass={isGlass ? "true" : undefined}
      data-surface={surface}
      className={cn(
        "group/card relative isolate flex flex-col gap-(--card-spacing) overflow-hidden py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(5)] md:[--card-spacing:--spacing(4)]",
        "rounded-[26px] md:rounded-[22px] data-[size=sm]:rounded-[20px] md:data-[size=sm]:rounded-[16px]",
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3.5)] md:data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        "*:[img:first-child]:rounded-t-[inherit] *:[img:last-child]:rounded-b-[inherit]",
        isGlass
          ? "bg-transparent shadow-[0_14px_38px_-10px_rgba(0,0,0,0.16),0_2px_10px_-2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.88)] dark:shadow-[0_18px_44px_-10px_rgba(0,0,0,0.58),0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]"
          : surface === "over-glass"
            ? "bg-black/[0.035] shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-white/[0.055] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.09)]"
            : "bg-white shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08)] dark:bg-[#1c1c1e] dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.48),0_0_0_0.5px_rgba(255,255,255,0.1)]",
        className
      )}
      {...props}
    >
      {isGlass ? (
        refract ? (
          <LiquidSurfaceBackdrop radius={radiusPx} bezel={20} tone="sheet" />
        ) : (
          <span
            aria-hidden="true"
            data-slot="card-glass-backdrop"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-(--liquid-surface) [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))]"
          />
        )
      ) : null}
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-[inherit] px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:border-black/[0.06] [.border-b]:pb-(--card-spacing) dark:[.border-b]:border-white/[0.08]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-[16px] leading-snug font-semibold tracking-[-0.015em] text-foreground md:text-[15px] group-data-[size=sm]/card:text-[14px]",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-[13.5px] leading-relaxed text-muted-foreground md:text-[13px]",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 rounded-b-[inherit] border-t border-black/[0.06] bg-black/[0.025] p-(--card-spacing) dark:border-white/[0.08] dark:bg-white/[0.035]",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
