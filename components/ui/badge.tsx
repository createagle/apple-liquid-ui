import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  [
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-150 outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-(--apple-blue)/40",
    "has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
    "aria-invalid:border-(--apple-red) aria-invalid:ring-(--apple-red)/25",
    "[&>svg]:pointer-events-none [&>svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-5 px-2 text-[11px] [&>svg]:size-3",
        default: "h-6 px-2.5 text-[12px] md:h-[22px] md:px-2.5 md:text-[11.5px] [&>svg]:size-3",
        lg: "h-7 px-3 text-[13px] md:h-6.5 md:text-[12.5px] [&>svg]:size-3.5",
      },
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
        ghost:
          "bg-transparent text-foreground/80 hover:bg-black/[0.06] hover:text-foreground dark:hover:bg-white/[0.1]",
        link: "bg-transparent px-1 text-(--apple-blue) underline-offset-4 hover:underline",
      },
      glass: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        glass: true,
        className:
          "bg-(--apple-blue)/90 text-white [backdrop-filter:blur(8px)_saturate(1.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_2px_8px_-2px_color-mix(in_srgb,var(--apple-blue)_42%,transparent)] [a]:hover:brightness-105",
      },
      {
        variant: "default",
        glass: false,
        className:
          "bg-(--apple-blue) text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] [a]:hover:brightness-105",
      },
      {
        variant: "secondary",
        glass: true,
        className:
          "bg-(--liquid-surface) text-foreground [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_1px_4px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.08)] [a]:hover:bg-(--liquid-surface-hover) dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.16)]",
      },
      {
        variant: "secondary",
        glass: false,
        className:
          "bg-black/[0.07] text-foreground [a]:hover:bg-black/[0.11] dark:bg-white/[0.12] dark:[a]:hover:bg-white/[0.18]",
      },
      {
        variant: "destructive",
        glass: true,
        className:
          "bg-(--apple-red)/18 text-(--apple-red) [backdrop-filter:blur(8px)_saturate(1.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_0_0.5px_color-mix(in_srgb,var(--apple-red)_28%,transparent)] [a]:hover:bg-(--apple-red)/24 dark:bg-(--apple-red)/24 dark:text-[#ff6961]",
      },
      {
        variant: "destructive",
        glass: false,
        className:
          "bg-(--apple-red)/14 text-(--apple-red) [a]:hover:bg-(--apple-red)/20 dark:bg-(--apple-red)/22 dark:text-[#ff6961]",
      },
      {
        variant: "outline",
        glass: true,
        className:
          "border-black/[0.14] bg-white/35 text-foreground [backdrop-filter:blur(8px)_saturate(1.4)] [a]:hover:bg-white/55 dark:border-white/[0.2] dark:bg-white/[0.06] dark:[a]:hover:bg-white/[0.12]",
      },
      {
        variant: "outline",
        glass: false,
        className:
          "border-black/[0.14] bg-transparent text-foreground [a]:hover:bg-black/[0.05] dark:border-white/[0.18] dark:[a]:hover:bg-white/[0.08]",
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "default",
      glass: true,
    },
  }
)

export interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant = "default",
  size = "default",
  glass = true,
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ variant, size, glass: Boolean(glass) }),
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
      glass: Boolean(glass),
    },
  })
}

export { Badge, badgeVariants }
