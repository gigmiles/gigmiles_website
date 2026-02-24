'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Calculator, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const leftNavItems = [
    { title: 'Home', href: '/dashboard', icon: Home },
    { title: 'Activity', href: '/dashboard/activity', icon: Activity },
]

const rightNavItems = [
    { title: 'Tax', href: '/dashboard/tax', icon: Calculator },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-white/5 bg-slate-950/90 backdrop-blur-xl md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <div className="flex items-center justify-between px-2 pt-2">
                {leftNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-90 min-h-[48px] justify-center',
                                isActive
                                    ? 'text-neon-primary'
                                    : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            <item.icon className="size-6" />
                            <span className="text-[10px] font-medium tracking-tight mt-0.5">
                                {item.title}
                            </span>
                        </Link>
                    )
                })}

                {/* Center FAB */}
                <div className="flex flex-1 justify-center relative -top-6">
                    <Link
                        href="/dashboard/entry/new"
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-primary text-slate-950 shadow-[0_8px_30px_rgba(57,255,20,0.25)] active:scale-95 transition-transform border-[6px] border-slate-950"
                    >
                        <Plus className="size-8" strokeWidth={2.5} />
                    </Link>
                </div>

                {rightNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-90 min-h-[48px] justify-center',
                                isActive
                                    ? 'text-neon-primary'
                                    : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            <item.icon className="size-6" />
                            <span className="text-[10px] font-medium tracking-tight mt-0.5">
                                {item.title}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
