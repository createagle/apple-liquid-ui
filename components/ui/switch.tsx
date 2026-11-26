"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { useIsMobile } from "@/hooks/use-mobile"
import { LIQUID_SPRINGS } from "@/lib/liquid-motion"
import { LiquidLens } from "@/components/ui/liquid-lens"

type SwitchSize = "sm" | "default" | "lg"
type SwitchVariant = "default" | "green" | "blue" | "glass"

interface SwitchGeometry {
  trackW: number
  trackH: number
  pad: number
  thumbW: number
  thumbH: number
  travel: number
}

const SWITCH_GEOMETRY: Record<
  "mobile" | "desktop",
  Record<SwitchSize, SwitchGeometry>
> = {
  mobile: {
    sm: { trackW: 46, trackH: 22, pad: 2, thumbW: 26, thumbH: 18, travel: 16 },
    default: {
      trackW: 60,
      trackH: 28,
      pad: 2,
      thumbW: 36,
      thumbH: 24,
      travel: 20,
    },
    lg: { trackW: 68, trackH: 32, pad: 2, thumbW: 40, thumbH: 28, travel: 24 },
  },
  desktop: {
    sm: { trackW: 36, trackH: 18, pad: 2, thumbW: 20, thumbH: 14, travel: 12 },
    default: {
      trackW: 42,
      trackH: 22,
      pad: 2,
      thumbW: 24,
      thumbH: 18,
      travel: 14,
    },
    lg: { trackW: 52, trackH: 26, pad: 2, thumbW: 30, thumbH: 22, travel: 18 },
  },
}

const switchVariants = cva(
  [
    "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-3 aria-invalid:ring-destructive/30",
    "data-disabled:cursor-not-allowed data-disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[22px] w-[46px] md:h-[18px] md:w-[36px]",
        default: "h-[28px] w-[60px] md:h-[22px] md:w-[42px]",
        lg: "h-[32px] w-[68px] md:h-[26px] md:w-[52px]",
      },
      variant: {
        default: "",
        green: "",
        blue: "",
        glass: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SwitchProps
  extends Omit<SwitchPrimitive.Root.Props, "size">,
    VariantProps<typeof switchVariants> {
  /**
   * Optional subtle I / O accessibility glyphs inside the switch track.
   */
  showLabels?: boolean
  /**
   * Disables press/drag liquid lens refraction and spring physics.
   */
  disableMotion?: boolean
  /**
   * Optical Snell refraction intensity for the floating Lip glass droplet (default `1`).
   */
  refraction?: number
  /**
   * Chromatic prism dispersion intensity on the droplet bezel (default `0.055`).
   */
  dispersion?: number
}

function Switch({
  className,
  size = "default",
  variant = "default",
  showLabels = false,
  disableMotion = false,
  refraction = 1,
  dispersion = 0.055,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  readOnly,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClick,
  ...props
}: SwitchProps) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const isMotionEnabled = !disableMotion && !prefersReducedMotion
  const isInteractive = !disabled && !readOnly

  const resolvedSize: SwitchSize = size ?? "default"
  const resolvedVariant: SwitchVariant = variant ?? "default"
  const geo = SWITCH_GEOMETRY[isMobile ? "mobile" : "desktop"][resolvedSize]

  const isControlled = checkedProp !== undefined
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked)
  const isChecked = isControlled ? Boolean(checkedProp) : uncontrolledChecked

  const rootRef = React.useRef<HTMLSpanElement | null>(null)
  const glideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressNextClickRef = React.useRef(false)
  const initializedRef = React.useRef(false)

  const [isPressing, setIsPressing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isGliding, setIsGliding] = React.useState(false)

  const dragRef = React.useRef<{
    pointerId: number
    startClientX: number
    startThumbX: number
    moved: boolean
    currentX: number
  } | null>(null)

  const x = useMotionValue(isChecked ? geo.travel : 0)
  const springConfig = isMobile
    ? LIQUID_SPRINGS.iosPress
    : LIQUID_SPRINGS.morph
  const springX = useSpring(x, springConfig)

  // Normalized 0..1 progress used for smooth real-time track color cross-fade while dragging
  const activeOpacity = useTransform(springX, [0, geo.travel], [0, 1])

  // Velocity-driven liquid droplet squash & stretch while gliding / dragging
  const vx = useVelocity(springX)
  const stretchX = useTransform(vx, [-900, 0, 900], [1.14, 1, 1.14])
  const squashY = useTransform(vx, [-900, 0, 900], [0.9, 1, 0.9])

  const triggerGlide = React.useCallback(() => {
    if (!isMotionEnabled) return
    setIsGliding(true)
    if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
    glideTimerRef.current = setTimeout(() => {
      setIsGliding(false)
    }, 280)
  }, [isMotionEnabled])

  React.useLayoutEffect(() => {
    if (dragRef.current?.moved) return
    const target = isChecked ? geo.travel : 0
    if (!initializedRef.current || !isMotionEnabled) {
      x.jump(target)
      springX.jump(target)
      initializedRef.current = true
    } else {
      x.set(target)
    }
  }, [geo.travel, isChecked, isMotionEnabled, springX, x])

  React.useEffect(() => {
    return () => {
      if (glideTimerRef.current) clearTimeout(glideTimerRef.current)
    }
  }, [])

  const emitCheckedChange = React.useCallback(
    (
      nextChecked: boolean,
      eventDetails?: Parameters<
        NonNullable<SwitchPrimitive.Root.Props["onCheckedChange"]>
      >[1]
    ) => {
      if (!isControlled) {
        setUncontrolledChecked(nextChecked)
      }
      onCheckedChange?.(
        nextChecked,
        eventDetails ??
          ({
            reason: "none",
            event: new Event("change"),
            cancel: () => {},
            allowPropagation: () => {},
            isCanceled: false,
            isPropagationAllowed: false,
            trigger: undefined,
          } as Parameters<
            NonNullable<SwitchPrimitive.Root.Props["onCheckedChange"]>
          >[1])
      )
    },
    [isControlled, onCheckedChange]
  )

  const handleCheckedChange: NonNullable<
    SwitchPrimitive.Root.Props["onCheckedChange"]
  > = React.useCallback(
    (nextChecked, eventDetails) => {
      emitCheckedChange(nextChecked, eventDetails)
      triggerGlide()
    },
    [emitCheckedChange, triggerGlide]
  )

  const handlePointerDown: NonNullable<
    SwitchPrimitive.Root.Props["onPointerDown"]
  > = (e) => {
    onPointerDown?.(e)
    if (!isInteractive || e.button !== 0) return

    setIsPressing(true)
    const startThumbX = isChecked ? geo.travel : 0
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startThumbX,
      moved: false,
      currentX: startThumbX,
    }
  }

  const handlePointerMove: NonNullable<
    SwitchPrimitive.Root.Props["onPointerMove"]
  > = (e) => {
    onPointerMove?.(e)
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || !isMotionEnabled) return

    const dx = e.clientX - drag.startClientX
    if (!drag.moved && Math.abs(dx) > 3) {
      drag.moved = true
      setIsDragging(true)
      rootRef.current?.setPointerCapture?.(e.pointerId)
    }

    if (!drag.moved) return

    const rawX = drag.startThumbX + dx
    // Slight rubber-band overscroll at both ends
    const clampedX = Math.max(-3, Math.min(geo.travel + 3, rawX))
    drag.currentX = clampedX
    x.set(clampedX)
  }

  const finishDrag = (pointerId: number, cancelled = false) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== pointerId) return

    const wasDragged = drag.moved
    const finalX = drag.currentX
    dragRef.current = null
    setIsPressing(false)
    setIsDragging(false)

    if (wasDragged) {
      suppressNextClickRef.current = true
      requestAnimationFrame(() => {
        suppressNextClickRef.current = false
      })
      try {
        rootRef.current?.releasePointerCapture?.(pointerId)
      } catch {
        // Ignore if capture was already released
      }

      if (!cancelled) {
        const nextChecked = finalX >= geo.travel / 2
        if (nextChecked !== isChecked) {
          emitCheckedChange(nextChecked)
        }
        x.set(nextChecked ? geo.travel : 0)
      } else {
        x.set(isChecked ? geo.travel : 0)
      }
    }
  }

  const handlePointerUp: NonNullable<
    SwitchPrimitive.Root.Props["onPointerUp"]
  > = (e) => {
    onPointerUp?.(e)
    finishDrag(e.pointerId, false)
  }

  const handlePointerCancel: NonNullable<
    SwitchPrimitive.Root.Props["onPointerCancel"]
  > = (e) => {
    onPointerCancel?.(e)
    finishDrag(e.pointerId, true)
  }

  const handleClick: NonNullable<SwitchPrimitive.Root.Props["onClick"]> = (
    e
  ) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick?.(e)
  }

  const showLiquidLens =
    isMotionEnabled &&
    isInteractive &&
    (isPressing || isDragging || isGliding)

  const activeTrackColorClass =
    resolvedVariant === "blue"
      ? "bg-(--apple-blue)"
      : resolvedVariant === "green"
        ? "bg-(--apple-green)"
        : resolvedVariant === "glass"
          ? "bg-(--apple-green)/82 md:bg-(--apple-blue)/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]"
          : "bg-(--apple-green) md:bg-(--apple-blue)"

  return (
    <SwitchPrimitive.Root
      ref={rootRef}
      data-slot="switch"
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      data-dragging={isDragging ? "true" : undefined}
      checked={isChecked}
      disabled={disabled}
      readOnly={readOnly}
      onCheckedChange={handleCheckedChange}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      className={cn(
        switchVariants({ size: resolvedSize, variant: resolvedVariant }),
        isInteractive && isMotionEnabled && "touch-pan-y",
        className
      )}
      {...props}
    >
      {/* Track Layer (sibling to LiquidLens so Root does not create a Backdrop Root) */}
      <span
        aria-hidden="true"
        data-slot="switch-track"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-full",
          resolvedVariant === "glass"
            ? "bg-(--liquid-surface) shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_-0.5px_0_rgba(255,255,255,0.5)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.16)]"
            : "bg-[rgba(120,120,128,0.26)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-[rgba(120,120,128,0.36)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"
        )}
      >
        {/* Smoothly interpolated active color fill (responds continuously to drag scrubbing) */}
        <motion.span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            activeTrackColorClass
          )}
          style={{
            opacity: isMotionEnabled ? activeOpacity : isChecked ? 1 : 0,
          }}
        />

        {/* Optional Apple Accessibility On/Off Labels (I / O) */}
        {showLabels ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[7px]">
            <motion.span
              className="h-[8px] w-[1.5px] rounded-full bg-white/90"
              style={{
                opacity: isMotionEnabled ? activeOpacity : isChecked ? 1 : 0,
              }}
            />
            <span className="size-[7px] rounded-full border-[1.5px] border-neutral-500/65 dark:border-white/45" />
          </span>
        ) : null}
      </span>

      {/* Accessible Base UI Thumb anchor (visually rendered by the spring-driven layers below) */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none sr-only"
      />

      {/* Resting Apple Solid White Capsule Thumb */}
      <motion.span
        aria-hidden="true"
        data-slot="switch-resting-thumb"
        className={cn(
          "pointer-events-none absolute z-10 rounded-full bg-white will-change-transform",
          "shadow-[0_3px_8px_rgba(0,0,0,0.16),0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)]",
          "dark:bg-white/95 dark:shadow-[0_3px_10px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.28)]"
        )}
        style={{
          top: geo.pad,
          left: geo.pad,
          width: geo.thumbW,
          height: geo.thumbH,
          x: isMotionEnabled ? springX : isChecked ? geo.travel : 0,
          scaleX: isDragging || isGliding ? stretchX : 1,
          scaleY: isDragging || isGliding ? squashY : 1,
        }}
        animate={{
          opacity: showLiquidLens ? 0 : 1,
        }}
        transition={{ duration: 0.14 }}
      />

      {/* Apple iOS 27 / macOS 27 Protruding Crystal Liquid Glass Droplet (pre-mounted so filter is warm) */}
      {isMotionEnabled ? (
        <motion.div
          aria-hidden="true"
          data-slot="switch-liquid-droplet"
          className="pointer-events-none absolute z-20 will-change-transform"
          style={{
            top: geo.pad,
            left: geo.pad,
            width: geo.thumbW,
            height: geo.thumbH,
            x: springX,
            scaleX: isDragging || isGliding ? stretchX : 1,
            scaleY: isDragging || isGliding ? squashY : 1,
          }}
          initial={false}
          animate={{
            opacity: showLiquidLens ? 1 : 0,
          }}
          transition={{ duration: showLiquidLens ? 0.1 : 0.16 }}
        >
          <LiquidLens
            profile="lip"
            rim="crystal"
            radius={999}
            refraction={refraction}
            dispersion={dispersion}
            blur={0}
            brightness={1.05}
            saturation={1.1}
            className="absolute -inset-x-[7px] -inset-y-[5px]"
          />
        </motion.div>
      ) : null}
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
