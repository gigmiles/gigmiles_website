'use client'

import { useEffect, useState } from 'react'
import { getYesterdaysSummary } from '@/app/dashboard/actions'
import { X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface SummaryData {
    date: string
    netProfit: number
    gross: number
    hours: number
}

export function YesterdaysSummaryNotification() {
    const [summary, setSummary] = useState<SummaryData | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const today = new Date().toLocaleDateString('en-CA')
        const dismissed = localStorage.getItem(`dismissed_yesterday_summary_${today}`)

        if (dismissed) return

        let isMounted = true

        async function fetchSummary() {
            try {
                const data = await getYesterdaysSummary()
                if (data && isMounted) {
                    setSummary(data)
                    setIsVisible(true)
                }
            } catch (err) {
                console.error("Failed to fetch yesterday's summary", err)
            }
        }

        fetchSummary()

        return () => {
            isMounted = false
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        const today = new Date().toLocaleDateString('en-CA')
        localStorage.setItem(`dismissed_yesterday_summary_${today}`, 'true')
    }

    if (!summary) return null

    const isPositive = summary.netProfit >= 0

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <Link
                        href={`/dashboard/reports?startDate=${summary.date}&endDate=${summary.date}`}
                        className="flex items-center gap-4 px-5 py-3 rounded-l-2xl hover:bg-white/5 transition-colors group/link"
                    >
                        <div className={`p-2 rounded-xl ${isPositive ? 'bg-neon-primary/10 shadow-[0_0_10px_rgba(57,255,20,0.2)]' : 'bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}`}>
                            {isPositive
                                ? <TrendingUp className="size-4 text-neon-primary" />
                                : <TrendingDown className="size-4 text-red-500" />
                            }
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-xs hidden sm:inline">Yesterday</span>
                            <span className={`font-display font-extrabold text-lg tracking-tight ${isPositive ? 'text-neon-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}>
                                {isPositive ? '+' : '-'}${Math.abs(summary.netProfit).toFixed(2)}
                            </span>
                            <span className="text-slate-600 font-bold hidden md:inline">·</span>
                            <span className="text-slate-400 font-bold text-sm hidden md:inline">{summary.hours.toFixed(1)}h</span>
                        </div>

                        <div className="flex items-center gap-1 ml-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 group-hover/link:bg-white/10 group-hover/link:border-white/10 transition-all">
                            <span className="text-xs font-bold text-slate-300 group-hover/link:text-white transition-colors">Details</span>
                            <ArrowRight className="size-3 text-slate-400 group-hover/link:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>

                    <button
                        onClick={handleDismiss}
                        className="p-3.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="size-3" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
