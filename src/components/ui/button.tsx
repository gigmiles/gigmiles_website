'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { haptics } from "@/lib/haptics"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-black transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm active:bg-primary/90 active:shadow-md hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/90 focus-visible:ring-destructive/40 shadow-sm",
        outline:
          "border border-white/[0.08] bg-white/[0.03] text-white shadow-sm hover:bg-white/[0.06] active:bg-white/[0.06] hover:text-white backdrop-blur-xl",
        secondary:
          "bg-white/[0.03] border border-white/[0.06] text-white hover:bg-white/[0.06] active:bg-white/[0.06] backdrop-blur-md",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] min-h-[52px] px-6 py-4 has-[>svg]:px-4",
        xs: "h-9 gap-1 rounded-lg px-3 text-sm has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-11 rounded-xl gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-[60px] rounded-2xl px-8 has-[>svg]:px-5 text-lg",
        icon: "size-[52px]",
        "icon-xs": "size-9 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-11 rounded-xl",
        "icon-lg": "size-[60px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const handleClick = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only fire haptic on native interaction
    await haptics.light();
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick as any}
      {...props}
    />
  )
}

export { Button, buttonVariants }
