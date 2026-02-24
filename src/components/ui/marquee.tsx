"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
    children: React.ReactNode
    className?: string
    pauseOnHover?: boolean
    direction?: 'left' | 'right'
    speed?: 'slow' | 'normal' | 'fast'
}

export function Marquee({
    children,
    className,
    pauseOnHover = true,
    direction = 'left',
    speed = 'normal',
}: MarqueeProps) {
    const speedX = speed === 'fast' ? 15 : speed === 'slow' ? 40 : 25

    return (
        <div
            className={cn(
                "flex w-full overflow-hidden [--gap:2rem]",
                "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
                className
            )}
        >
            <div
                className={cn(
                    "flex shrink-0 min-w-full justify-around gap-[var(--gap)]",
                    speed === 'fast' ? "animate-marquee-fast" : speed === 'slow' ? "animate-marquee-slow" : "animate-marquee",
                    direction === 'right' && "[animation-direction:reverse]",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {children}
                {children}
            </div>

            {/* Duplicate for seamless loop */}
            <div
                className={cn(
                    "flex shrink-0 min-w-full justify-around gap-[var(--gap)]",
                    speed === 'fast' ? "animate-marquee-fast" : speed === 'slow' ? "animate-marquee-slow" : "animate-marquee",
                    direction === 'right' && "[animation-direction:reverse]",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                aria-hidden="true"
            >
                {children}
                {children}
            </div>
        </div>
    )
}
