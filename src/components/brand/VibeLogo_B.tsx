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
  xs: { icon: "size-7",             text: "text-lg",              tagline: "text-[6px]"  },
  sm: { icon: "size-9",             text: "text-xl",              tagline: "text-[6px]"  },
  md: { icon: "size-11 md:size-12", text: "text-2xl md:text-3xl", tagline: "text-[7px]"  },
  lg: { icon: "size-14",            text: "text-3xl md:text-4xl", tagline: "text-[8px]"  },
  xl: { icon: "size-20",            text: "text-5xl md:text-6xl", tagline: "text-[9px]"  },
};

const CX = 50;
const CY = 52;
const R  = 32;

const ARC_START_X = +(CX + R * Math.cos((135 * Math.PI) / 180)).toFixed(2);
const ARC_START_Y = +(CY + R * Math.sin((135 * Math.PI) / 180)).toFixed(2);
const ARC_END_X   = +(CX + R * Math.cos(( 45 * Math.PI) / 180)).toFixed(2);
const ARC_END_Y   = +(CY + R * Math.sin(( 45 * Math.PI) / 180)).toFixed(2);

const ARC_PATH = `M ${ARC_START_X} ${ARC_START_Y} A ${R} ${R} 0 1 0 ${ARC_END_X} ${ARC_END_Y}`;

export function VibeLogo_B({
  className,
  iconOnly = false,
  size = "md",
  light = false,
}: VibeLogoProps) {
  const uid       = React.useId().replace(/:/g, "");
  const bgGradId  = `gm-bg-${uid}`;
  const arcGradId = `gm-arc-${uid}`;
  const glowId    = `gm-glow-${uid}`;
  const bloomId   = `gm-bloom-${uid}`;
  const clipId    = `gm-clip-${uid}`;

  const { icon: iconClass, text: textClass, tagline: taglineClass } = SIZE_MAP[size];

  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer select-none", className)}>
      <div className="relative flex-shrink-0">
        {!light && (
          <div className="absolute inset-0 rounded-[22px] pointer-events-none bg-[#10B981]/12 blur-2xl scale-150 group-hover:bg-[#10B981]/28 transition-all duration-500" />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(iconClass, "relative z-10 transition-all duration-300 group-hover:scale-[1.04] group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,0.55)]")}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={bgGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#0F2318" />
              <stop offset="100%" stopColor="#060D09" />
            </linearGradient>
            <linearGradient id={arcGradId} x1={ARC_START_X} y1={ARC_START_Y} x2={ARC_END_X} y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#6EE7B7" />
              <stop offset="48%"  stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
              <feComposite in="blurred" in2="SourceGraphic" operator="over" />
            </filter>
            <filter id={bloomId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="bloom" />
            </filter>
            <clipPath id={clipId}>
              <rect x="3" y="3" width="94" height="94" rx="22" />
            </clipPath>
          </defs>

          <rect x="3" y="3" width="94" height="94" rx="22" fill={light ? "#F0FDF4" : `url(#${bgGradId})`} />
          <rect x="3" y="3" width="94" height="94" rx="22" stroke="#10B981" strokeWidth="1.2" strokeOpacity={light ? "0.40" : "0.18"} />
          <rect x="8.5" y="8.5" width="83" height="83" rx="17" stroke="#10B981" strokeWidth="0.55" strokeOpacity="0.07" />

          <g clipPath={`url(#${clipId})`}>
            {/* Track */}
            <path d={ARC_PATH} stroke="#10B981" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.08" fill="none" />
            {/* Bloom */}
            <path d={ARC_PATH} stroke="#10B981" strokeWidth="14" strokeLinecap="round" strokeOpacity="0.18" fill="none" filter={`url(#${bloomId})`} />
            {/* Inner glow */}
            <path d={ARC_PATH} stroke="#34D399" strokeWidth="11" strokeLinecap="round" strokeOpacity="0.30" fill="none" filter={`url(#${glowId})`} />
            {/* Main arc */}
            <path d={ARC_PATH} stroke={`url(#${arcGradId})`} strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Start dot */}
            <circle cx={ARC_START_X} cy={ARC_START_Y} r="3.5" fill="#6EE7B7" opacity="0.72" />
            <circle cx={ARC_START_X} cy={ARC_START_Y} r="6"   fill="#6EE7B7" opacity="0.12" />
            {/* Needle */}
            <g transform={`translate(${ARC_END_X}, ${ARC_END_Y}) rotate(-45)`}>
              <polygon points="0,-7  5,3.5  -5,3.5" fill="#C1FF72" opacity="0.95" />
            </g>
            <circle cx={ARC_END_X} cy={ARC_END_Y} r="2.2" fill="#C1FF72" opacity="0.55" />
            <circle cx={ARC_END_X} cy={ARC_END_Y} r="7"   fill="#C1FF72" opacity="0.09" />
          </g>
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none gap-[3px]">
          <span className={cn("font-black uppercase italic tracking-tighter leading-none transition-colors duration-300", light ? "text-slate-900" : "text-white", textClass)}>
            GIG<span className="text-[#10B981] group-hover:text-[#34D399] transition-colors duration-300">MILES</span>
          </span>
          <span className={cn("font-semibold uppercase tracking-[0.45em] leading-none pl-[1px] transition-colors duration-300", light ? "text-slate-500/70 group-hover:text-slate-600" : "text-white/30 group-hover:text-white/50", taglineClass)}>
            REAL NET PROFIT
          </span>
        </div>
      )}
    </div>
  );
}
