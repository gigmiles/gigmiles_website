'use client'

import { useEffect, useState } from 'react'
import { getYesterdaysSummary } from '@/app/dashboard/actions'
import { X, Calendar, ArrowRight } from 'lucide-react'
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
        // Check local storage if we already dismissed today
        const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local format
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
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-700/5 border border-indigo-500/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card shadow-lg shadow-indigo-500/5 group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

                    <div className="flex items-start sm:items-center gap-4 relative z-10 w-full">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Calendar className="size-6" />
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">Yesterday&apos;s Summary</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-500 dark:text-slate-400 border border-white/5 uppercase tracking-wider">{summary.date}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                                {isPositive ? "Great job! You made" : "You recorded"} <span className={isPositive ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                    ${Math.abs(summary.netProfit).toFixed(2)}
                                </span> {isPositive ? "net profit" : "net loss"} in <span className="text-slate-900 dark:text-slate-300 font-bold">{summary.hours.toFixed(1)} hrs</span>.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto mx-auto sm:ml-auto w-full sm:w-auto">
                            <Link href="/dashboard/reports" className="flex-1 sm:flex-none">
                                <button className="w-full flex justify-center items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                                    View Reports
                                    <ArrowRight className="size-3" />
                                </button>
                            </Link>
                            <button
                                onClick={handleDismiss}
                                className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 rounded-xl transition-all shrink-0"
                                aria-label="Dismiss notification"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
