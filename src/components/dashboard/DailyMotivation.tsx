'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const MOTIVATIONS = [
    "Every mile gets you closer to your financial goals.",
    "Consistency is the key to mastering your gig business.",
    "Small daily profits build massive long-term wealth.",
    "Turn today's miles into tomorrow's freedom.",
    "Your vehicle is your business. Drive smart, earn heavy.",
    "Track every expense, keep every profit.",
    "Focus on the net, not just the gross.",
    "A smooth shift starts with a clear mind and a full tank.",
    "The best investment you can make is in yourself.",
    "Keep pushing. Those targeted weekly goals are within reach."
]

interface DailyMotivationProps {
    hasEntry: boolean
    className?: string
}

export function DailyMotivation({ hasEntry, className }: DailyMotivationProps) {
    const [quote, setQuote] = useState("")
    const [greeting, setGreeting] = useState("")

    useEffect(() => {
        // Randomly pick a quote based on the day of the year so it stays consistent for the day
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
        setQuote(MOTIVATIONS[dayOfYear % MOTIVATIONS.length])

        // Determine greeting based on time of day
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Good Morning")
        else if (hour < 17) setGreeting("Good Afternoon")
        else setGreeting("Good Evening")
    }, [])

    if (!quote) return null // Wait for client-side hydrating

    // Determine what to show based on entry status
    const message = hasEntry
        ? "You've already started tracking today. Keep up the momentum!"
        : "You haven't tracked anything yet today. Let's make it a profitable shift!"

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                    "relative overflow-hidden group rounded-2xl glass-card border-white/5 p-5 shadow-lg shadow-emerald-500/5",
                    className
                )}
            >
                {/* Subtle background glow */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />

                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Sparkles className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white tracking-tight mb-0.5">
                            {greeting} <span className="text-emerald-500">·</span> {hasEntry ? "Active Shift" : "Ready to Drive"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium italic mb-2">
                            "{quote}"
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-emerald-500/80">
                            {message}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
