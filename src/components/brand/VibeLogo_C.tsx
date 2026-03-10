"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VibeLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  light?: boolean;
}

const SIZE_MAP = {
  xs: { icon: "size-7",             text: "text-lg",              tagline: "text-[6px]" },
  sm: { icon: "size-9",             text: "text-xl",              tagline: "text-[6px]" },
  md: { icon: "size-11 md:size-12", text: "text-2xl md:text-3xl", tagline: "text-[7px]" },
  lg: { icon: "size-14",            text: "text-3xl md:text-4xl", tagline: "text-[8px]" },
  xl: { icon: "size-20",            text: "text-5xl md:text-6xl", tagline: "text-[9px]" },
};

export function VibeLogo_C({
  className,
  iconOnly = false,
  size = "md",
  light = false,
}: VibeLogoProps) {
  const id = React.useId().replace(/:/g, "-");
  const { icon: iconClass, text: textClass, tagline: taglineClass } = SIZE_MAP[size];

  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer select-none", className)}>
      <div className="relative flex-shrink-0">
        {!light && (
          <div className="absolute inset-0 rounded-2xl bg-[#10B981]/10 blur-xl scale-150 group-hover:bg-[#10B981]/20 transition-all duration-500 pointer-events-none" />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(iconClass, "relative z-10 transition-all duration-300 group-hover:scale-[1.04] group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,0.55)]")}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={light ? "#FFFFFF" : "#0D2318"} />
              <stop offset="100%" stopColor={light ? "#F0FFF8" : "#060E0A"} />
            </linearGradient>
            <linearGradient id={`${id}-fill`} x1="50" y1="15" x2="50" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#34D399" />
              <stop offset="55%"  stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" type="matrix"
                values="0 0 0 0 0.063  0 0 0 0 0.725  0 0 0 0 0.506  0 0 0 1.2 0"
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={`${id}-shine`} cx="42%" cy="35%" r="55%">
              <stop offset="0%"   stopColor="#A7F3D0" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`${id}-clip`}>
              <rect x="3" y="3" width="94" height="94" rx="22" />
            </clipPath>
          </defs>

          {/* Background */}
          <rect x="3" y="3" width="94" height="94" rx="22" fill={`url(#${id}-bg)`} />
          <rect x="3" y="3" width="94" height="94" rx="22" stroke="#10B981" strokeWidth="1.5" strokeOpacity={light ? "0.35" : "0.2"} />
          <rect x="9" y="9" width="82" height="82" rx="17" stroke="#10B981" strokeWidth="0.75" strokeOpacity="0.08" />

          {/* Map Pin */}
          <g clipPath={`url(#${id}-clip)`} filter={`url(#${id}-glow)`}>
            <path d="M 36 44 L 64 44 L 50 73 Z" fill={`url(#${id}-fill)`} />
            <circle cx="50" cy="33" r="16" fill={`url(#${id}-fill)`} />
            <circle cx="50" cy="33" r="16" fill={`url(#${id}-shine)`} />
          </g>

          {/* Pin hole */}
          <circle cx="50" cy="33" r="6" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.9" />

          {/* Speed / trend lines */}
          <line x1="62" y1="26" x2="69" y2="19" stroke="#C1FF72" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.55" />
          <line x1="66" y1="32" x2="78" y2="24" stroke="#C1FF72" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.38" />
          <line x1="65" y1="40" x2="73" y2="35" stroke="#C1FF72" strokeWidth="2"   strokeLinecap="round" strokeOpacity="0.22" />

          {/* Tip accent */}
          <circle cx="50" cy="73" r="2" fill="#C1FF72" opacity="0.5" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none gap-[3px]">
          <span className={cn("font-black uppercase italic tracking-tighter leading-none transition-colors duration-300", light ? "text-slate-900" : "text-white", textClass)}>
            GIG<span className="text-[#10B981] group-hover:text-[#34D399] transition-colors duration-300">MILES</span>
          </span>
          <span className={cn("font-semibold uppercase tracking-[0.45em] leading-none transition-colors duration-300 pl-[1px]", light ? "text-slate-500/70 group-hover:text-slate-500" : "text-white/30 group-hover:text-white/50", taglineClass)}>
            Real Net Profit
          </span>
        </div>
      )}
    </div>
  );
}
