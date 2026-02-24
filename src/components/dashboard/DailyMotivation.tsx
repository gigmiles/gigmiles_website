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
    userName?: string | null
    className?: string
}

export function DailyMotivation({ hasEntry, userName, className }: DailyMotivationProps) {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(
                "flex items-center gap-2.5 text-sm",
                className
            )}
        >
            <Sparkles className="size-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium truncate">
                <span className="text-slate-200 font-bold">{greeting}{userName ? `, ${userName.split('@')[0]}` : ''}</span>
                {' · '}
                <span className="italic text-slate-500">&quot;{quote}&quot;</span>
            </span>
        </motion.div>
    )
}
