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
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-10 md:size-12 relative z-10 drop-shadow-2xl"
                >
                    {/* Main Gem/G Shape Container */}
                    <path
                        d="M20 20L50 10L80 20L90 50L80 80L50 90L20 80L10 50L20 20Z"
                        className="fill-emerald-500/10 stroke-emerald-500"
                        strokeWidth="2"
                    />

                    {/* Emerald Facets Rendering */}
                    <path d="M20 20L80 20L90 50L80 80L20 80L10 50L20 20Z" className="fill-emerald-400/20" />
                    <path d="M50 10V25M50 90V75M10 50H25M90 50H75" className="stroke-emerald-500/40" strokeWidth="1" />

                    {/* The "G" and "Road" integration */}
                    <path
                        d="M75 35C75 25 60 20 50 20C30 20 20 35 20 50C20 65 30 80 50 80C65 80 75 70 75 55H55V45H85"
                        className="stroke-slate-950 dark:stroke-white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Road Perspective within the G curve */}
                    <path
                        d="M30 65C35 60 45 55 50 55"
                        className="stroke-emerald-400"
                        strokeWidth="3"
                        strokeDasharray="4 4"
                    />

                    {/* Accent Arrow / Growth indicator */}
                    <path
                        d="M65 45L55 45L60 40"
                        className="stroke-emerald-500"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
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
