"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VibeLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function VibeLogo({ className, iconOnly = false }: VibeLogoProps) {
  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      {/* Vibe Icon: Minimalist G + Infinity/Road Loop */}
      <div className="relative">
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-[#34D399]/10 blur-xl rounded-full scale-110 group-hover:bg-[#34D399]/20 transition-all duration-700" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-12 md:size-14 relative z-10 overflow-visible"
        >
          {/* Outer Ring - Partial */}
          <circle 
            cx="50" cy="50" r="45" 
            stroke="white" 
            strokeWidth="2" 
            strokeOpacity="0.1" 
            strokeDasharray="10 5"
          />
          
          {/* The "G" / Speed Loop */}
          <path
            d="M80 30C85 40 85 60 80 70M70 80C60 85 40 85 30 80C20 75 15 60 15 50C15 40 20 25 35 20C55 15 75 25 75 45V55H50"
            className="stroke-[#10B981] transition-all duration-500"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))" }}
          />
          
          {/* Fast Motion Lines */}
          <path d="M50 45H60" className="stroke-white/10" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 55H65" className="stroke-[#E2E8F0]" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className="font-black text-3xl md:text-4xl tracking-tighter uppercase italic leading-none text-white group-hover:text-[#10B981] transition-colors duration-300">
            GIG<span className="text-[#34D399] group-hover:text-white transition-colors duration-300">MILES</span>
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#A1A1AA] ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
            Earnings Performance
          </span>
        </div>
      )}
    </div>
  );
}
