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
        {/* Ambient glow blob — dark mode only */}
        {!light && (
          <div
            className="absolute inset-0 rounded-2xl bg-[#10B981]/10 blur-xl scale-150
                        group-hover:bg-[#10B981]/20 transition-all duration-500 pointer-events-none"
          />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            iconClass,
            "relative z-10 transition-all duration-300",
            "group-hover:scale-[1.04] group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,0.55)]"
          )}
          aria-hidden="true"
        >
          <defs>
            {/* Rounded-square background gradient */}
            <linearGradient id={bgGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={light ? "#FFFFFF" : "#0D2318"} />
              <stop offset="100%" stopColor={light ? "#F0FDF4" : "#060E0A"} />
            </linearGradient>

            {/* Glow filter applied to bars + chevron group */}
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Background rounded square ── */}
          <rect
            x="3" y="3" width="94" height="94" rx="22"
            fill={`url(#${bgGradId})`}
          />
          {/* Outer border */}
          <rect
            x="3" y="3" width="94" height="94" rx="22"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeOpacity={light ? "0.35" : "0.18"}
          />

          {/* ── Road perspective bars + chevron arrow ── */}
          <g filter={`url(#${filterId})`}>

            {/* Upward chevron — bold V pointing UP, peak at y≈20 */}
            <polyline
              points="35,34 50,20 65,34"
              stroke="#10B981"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Top bar — narrowest (w=24), brightest */}
            <rect x="38" y="42" width="24" height="6.5" rx="3.2"
              fill="#10B981" opacity="0.80"
            />

            {/* Middle bar — medium (w=38) */}
            <rect x="31" y="56" width="38" height="6.5" rx="3.2"
              fill="#10B981" opacity="0.55"
            />

            {/* Bottom bar — widest (w=54), dimmest */}
            <rect x="23" y="71" width="54" height="6.5" rx="3.2"
              fill="#10B981" opacity="0.30"
            />

          </g>

          {/* Lime accent dot at chevron peak */}
          <circle cx="50" cy="20" r="3.2" fill="#C1FF72" opacity="0.90" />

        </svg>
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
