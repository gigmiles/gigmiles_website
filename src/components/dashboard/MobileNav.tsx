'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Calculator, Settings, Plus } from 'lucide-react'
import { GmIcon } from '@/components/ui/GmIcon'
import { cn } from '@/lib/utils'

const leftNavItems = [
    { title: 'Home',    href: '/dashboard',         icon: Home,     accent: '#10b981' },
    { title: 'Reports', href: '/dashboard/reports',  icon: BarChart3, accent: '#3b82f6' },
]

const rightNavItems = [
    { title: 'Tax',      href: '/dashboard/tax',      icon: Calculator, accent: '#f59e0b' },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings,   accent: '#94a3b8' },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-white/[0.06] bg-[#080c14]/95 backdrop-blur-2xl md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            {/* Top shimmer line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            <div className="flex items-center justify-between px-2 pt-2">
                {leftNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2 px-1 transition-all active:scale-90 min-h-[52px] justify-center relative',
                                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-10"
                                    style={{ background: item.accent }}
                                />
                            )}
                            <GmIcon
                                icon={item.icon}
                                accent={isActive ? item.accent : '#475569'}
                                size="sm"
                                glow={isActive}
                            />
                            <span
                                className="text-[9px] font-black uppercase tracking-widest"
                                style={{ color: isActive ? item.accent : undefined }}
                            >
                                {item.title}
                            </span>
                        </Link>
                    )
                })}

                {/* Center FAB */}
                <div className="flex flex-1 justify-center relative -top-5">
                    <Link
                        href="/dashboard/entry/new"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 active:scale-95 transition-transform border-4 border-[#080c14]"
                        style={{
                            boxShadow: '0 0 0 1px rgba(16,185,129,0.3), 0 8px 30px rgba(16,185,129,0.35), 0 0 60px rgba(16,185,129,0.1)',
                        }}
                    >
                        <Plus className="size-7" strokeWidth={2.5} />
                    </Link>
                </div>

                {rightNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2 px-1 transition-all active:scale-90 min-h-[52px] justify-center relative',
                                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-10"
                                    style={{ background: item.accent }}
                                />
                            )}
                            <GmIcon
                                icon={item.icon}
                                accent={isActive ? item.accent : '#475569'}
                                size="sm"
                                glow={isActive}
                            />
                            <span
                                className="text-[9px] font-black uppercase tracking-widest"
                                style={{ color: isActive ? item.accent : undefined }}
                            >
                                {item.title}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
