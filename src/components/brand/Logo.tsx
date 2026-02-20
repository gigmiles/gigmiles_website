"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Premium SVG Icon */}
            <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full group-hover:bg-emerald-500/30 transition-all duration-500" />
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-8 md:size-10 relative z-10 drop-shadow-2xl"
                >
                    {/* Outer Ring / Scope */}
                    <circle cx="20" cy="20" r="18" className="stroke-emerald-500/20" strokeWidth="1" />

                    {/* The "Miles" Path - Stylized curve */}
                    <path
                        d="M8 30C8 30 14 26 20 20C26 14 32 10 32 10"
                        className="stroke-emerald-500"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Secondary Path - Parallel road effect */}
                    <path
                        d="M12 34C12 34 18 30 24 24C30 18 36 14 36 14"
                        className="stroke-emerald-500/40"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* The "Earnings" Dot - Radiant coin at the horizon */}
                    <circle cx="32" cy="10" r="4" className="fill-emerald-500 shadow-lg shadow-emerald-500/50" />
                    <circle cx="32" cy="10" r="2" className="fill-white/80" />

                    {/* Decorative Dashes */}
                    <path d="M14 28L16 26" className="stroke-white/30" strokeWidth="1" strokeLinecap="round" />
                    <path d="M22 20L24 18" className="stroke-white/30" strokeWidth="1" strokeLinecap="round" />
                </svg>
            </div>

            {!iconOnly && (
                <span className="font-display font-bold text-2xl md:text-3xl tracking-tighter text-slate-900 dark:text-white italic">
                    Gig<span className="text-emerald-500">Miles</span>
                </span>
            )}
        </div>
    );
}
