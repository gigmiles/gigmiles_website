'use client'

import { Bell, X, Calendar, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { GmIcon } from '@/components/ui/GmIcon'
import { cn } from '@/lib/utils'

interface Notification {
    id: string
    type: 'tax' | 'milestone' | 'tip' | 'alert'
    title: string
    body: string
    time: string
    read: boolean
}

function getQuarterNotifications(): Notification[] {
    const now = new Date()
    const month = now.getMonth() + 1
    const notifications: Notification[] = []

    const quarters = [
        { label: 'Q1', due: 'April 15', months: [3, 4], alert: month === 3 || month === 4 },
        { label: 'Q2', due: 'June 15', months: [5, 6], alert: month === 5 || month === 6 },
        { label: 'Q3', due: 'September 15', months: [8, 9], alert: month === 8 || month === 9 },
        { label: 'Q4', due: 'January 15', months: [12, 1], alert: month === 12 || month === 1 },
    ]

    const upcoming = quarters.find(q => q.alert)
    if (upcoming) {
        notifications.push({
            id: 'tax-deadline',
            type: 'tax',
            title: `${upcoming.label} Tax Payment Due`,
            body: `Estimated quarterly taxes are due ${upcoming.due}. Review your Tax Center to see what you owe.`,
            time: `Due ${upcoming.due}`,
            read: false,
        })
    }

    notifications.push({
        id: 'track-tip',
        type: 'tip',
        title: 'Maximize your deductions',
        body: 'Log every trip and expense consistently. The IRS mileage rate is $0.67/mile for 2024.',
        time: 'Pro tip',
        read: true,
    })

    return notifications
}

const typeConfig = {
    tax:       { icon: ShieldCheck, accent: '#f59e0b' },
    milestone: { icon: TrendingUp,  accent: '#10b981' },
    tip:       { icon: TrendingUp,  accent: '#3b82f6' },
    alert:     { icon: AlertCircle, accent: '#e11d48' },
}

export function NotificationsPanel() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(getQuarterNotifications)

    const unread = notifications.filter(n => !n.read).length

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    const dismiss = (id: string) =>
        setNotifications(prev => prev.filter(n => n.id !== id))

    return (
        <>
            {/* Bell button */}
            <button
                onClick={() => setOpen(true)}
                className="relative h-12 w-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Notifications"
            >
                <Bell className="size-5" />
                {unread > 0 && (
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(225,29,72,0.7)]" />
                )}
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    'fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col transition-transform duration-300 ease-out',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
                style={{
                    background: 'rgba(8, 12, 20, 0.98)',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <GmIcon icon={Bell} accent="#f59e0b" size="sm" glow />
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h2>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                                {unread > 0 ? `${unread} unread` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                            >
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                            aria-label="Close"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
                            <GmIcon icon={Bell} accent="#475569" size="lg" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-400">No notifications</p>
                                <p className="text-xs text-slate-600 mt-1">You're all caught up!</p>
                            </div>
                        </div>
                    ) : (
                        notifications.map(n => {
                            const cfg = typeConfig[n.type]
                            return (
                                <div
                                    key={n.id}
                                    className={cn(
                                        'relative rounded-2xl p-4 border transition-all group',
                                        n.read
                                            ? 'border-white/[0.05] bg-white/[0.02]'
                                            : 'border-white/[0.08] bg-white/[0.04]'
                                    )}
                                >
                                    {/* Unread dot */}
                                    {!n.read && (
                                        <div
                                            className="absolute top-4 right-4 size-1.5 rounded-full"
                                            style={{ background: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}99` }}
                                        />
                                    )}

                                    <div className="flex items-start gap-3">
                                        <GmIcon icon={cfg.icon} accent={cfg.accent} size="sm" glow={!n.read} />
                                        <div className="flex-1 min-w-0 pr-3">
                                            <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{n.body}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest mt-2"
                                                style={{ color: `${cfg.accent}80` }}>
                                                {n.time}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dismiss */}
                                    <button
                                        onClick={() => dismiss(n.id)}
                                        className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/5 text-slate-600 hover:text-slate-300 transition-all"
                                        aria-label="Dismiss"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/[0.05]">
                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest text-center">
                        More notification types coming soon
                    </p>
                </div>
            </div>
        </>
    )
}
