"use client"

import React from "react"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface GlassTooltipProps {
  content: string
  children?: React.ReactNode // Usually an Info icon, but can be overridden
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function GlassTooltip({ content, children, side = "top", className }: GlassTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
          <button type="button" className="text-slate-400 hover:text-white transition-colors cursor-pointer outline-none ring-0">
            {children || <Info className="size-[14px] opacity-40 hover:opacity-100 transition-opacity" />}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            "relative overflow-hidden border border-white/10 !bg-[#0B1120]/80 backdrop-blur-2xl",
            "text-slate-300 text-[11px] font-medium leading-relaxed tracking-wide px-3 py-2 max-w-[240px]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl z-[90]",
            // Target the Radix arrow recursively if using standard shadcn structure
            "[&_[data-slot=tooltip-arrow]]:fill-[#0B1120] [&>svg]:fill-[#0B1120]/80",
            className
          )}
        >
          {/* Noise overlay purely for the tooltip bg to prevent banding */}
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />
          
          <div className="relative z-10">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
