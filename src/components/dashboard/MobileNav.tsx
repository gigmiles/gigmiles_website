'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, Calculator, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    {
        title: 'Ana Sayfa',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Raporlar',
        href: '/dashboard/reports',
        icon: BarChart3,
    },
    {
        title: 'Vergi',
        href: '/dashboard/tax',
        icon: Calculator,
    },
    {
        title: 'Ayarlar',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border/10 bg-background/80 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom,0.5rem)]">
            <div className="flex items-center justify-around p-2 pb-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-90',
                                isActive
                                    ? 'text-emerald-500'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            )}
                        >
                            <item.icon className={cn('size-6', isActive && 'animate-pulse-subtle')} />
                            <span className="text-[10px] font-medium tracking-tight">
                                {item.title}
                            </span>
                        </Link>
                    )
                })}

                {/* Floating Action Button Style for Mobile */}
                <Link
                    href="/dashboard/entry/new"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform -mt-8 border-4 border-background"
                >
                    <Plus className="size-6" strokeWidth={3} />
                </Link>
            </div>
        </div>
    )
}
