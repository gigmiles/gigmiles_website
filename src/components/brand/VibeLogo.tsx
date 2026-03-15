"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VibeLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Reverse variant: for use on light backgrounds */
  light?: boolean;
}

const SIZE_MAP = {
  xs: { icon: "size-7",             text: "text-lg",              tagline: "text-[6px]"  },
  sm: { icon: "size-9",             text: "text-xl",              tagline: "text-[6px]"  },
  md: { icon: "size-11 md:size-12", text: "text-2xl md:text-3xl", tagline: "text-[7px]" },
  lg: { icon: "size-14",            text: "text-3xl md:text-4xl", tagline: "text-[8px]" },
  xl: { icon: "size-20",            text: "text-5xl md:text-6xl", tagline: "text-[9px]" },
};

export function VibeLogo({
  className,
  iconOnly = false,
  size = "md",
  light = false,
}: VibeLogoProps) {
  const uid = React.useId().replace(/:/g, "");
  const filterId = `${uid}-glow`;
  const bgGradId = `${uid}-bg`;

  const { icon: iconClass, text: textClass, tagline: taglineClass } = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "flex items-center gap-3 group cursor-pointer select-none",
        className
      )}
    >
      {/* ── Icon Mark ──────────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0">
        {!light && (
          <div
            className="absolute inset-0 rounded-2xl bg-[#10B981]/15 blur-xl scale-125
                        group-hover:bg-[#10B981]/25 transition-all duration-500 pointer-events-none"
          />
        )}

        <div className={cn(
          iconClass,
          "relative z-10 transition-all duration-300 overflow-hidden rounded-xl bg-[#030712] shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]",
          "group-hover:scale-[1.08] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3),inset_0_0_12px_rgba(0,0,0,0.6)]"
        )}>
          <img 
            src="/logo-gauge.png" 
            alt="GigMiles Logo" 
            className="w-full h-full object-cover scale-[1.2] transform-gpu origin-center" 
          />
        </div>
      </div>

      {/* ── Wordmark ───────────────────────────────────────────────────── */}
      {!iconOnly && (
        <div className="flex flex-col leading-none gap-[3px]">
          {/* Brand name */}
          <span
            className={cn(
              "font-black uppercase italic tracking-tighter leading-none",
              light ? "text-slate-900" : "text-white",
              "transition-colors duration-300",
              textClass
            )}
          >
            GIG
            <span className="text-[#10B981] group-hover:text-[#34D399] transition-colors duration-300">
              MILES
            </span>
          </span>

          {/* Tagline */}
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.45em] leading-none pl-[1px]",
              light
                ? "text-slate-500/70 group-hover:text-slate-500"
                : "text-white/30 group-hover:text-white/50",
              "transition-colors duration-300",
              taglineClass
            )}
          >
            REAL NET PROFIT
          </span>
        </div>
      )}

    </div>
  );
}
