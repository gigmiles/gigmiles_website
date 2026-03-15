import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type GmIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface GmIconProps {
    icon: LucideIcon
    accent: string
    size?: GmIconSize
    glow?: boolean
    className?: string
}

const sizeConfig: Record<GmIconSize, { box: number; icon: number; radius: number; padding: number }> = {
    xs: { box: 28, icon: 12, radius: 8,  padding: 4 },
    sm: { box: 34, icon: 14, radius: 10, padding: 5 },
    md: { box: 42, icon: 18, radius: 12, padding: 6 },
    lg: { box: 52, icon: 22, radius: 14, padding: 7 },
    xl: { box: 62, icon: 26, radius: 16, padding: 8 },
}

/**
 * Premium icon component matching the mobile GmIcon design:
 * - Gradient border (accent/35% → accent/10%)
 * - Inner gradient bg (#0d1220 → accent/8%)
 * - Colored icon with optional glow shadow
 */
export function GmIcon({ icon: Icon, accent, size = 'md', glow = false, className }: GmIconProps) {
    const cfg = sizeConfig[size]

    return (
        <div
            className={cn('shrink-0 flex items-center justify-center', className)}
            style={{
                width: cfg.box,
                height: cfg.box,
                borderRadius: cfg.radius,
                background: `linear-gradient(135deg, ${accent}59, ${accent}1a)`,
                padding: 1,
                boxShadow: glow ? `0 0 18px ${accent}26, 0 0 6px ${accent}14` : undefined,
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: cfg.radius - 1,
                    background: `linear-gradient(135deg, #0d1220 60%, ${accent}14)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon
                    style={{
                        width: cfg.icon,
                        height: cfg.icon,
                        color: accent,
                        filter: glow ? `drop-shadow(0 0 4px ${accent}80)` : undefined,
                    }}
                    strokeWidth={1.8}
                />
            </div>
        </div>
    )
}
