'use client'

import { Target, TrendingUp, Calendar, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { memo, useMemo, useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface WeeklyGoalCardProps {
    currentNet: number
    weeklyGoal?: number
}

export const WeeklyGoalCard = memo(function WeeklyGoalCard({
    currentNet,
    weeklyGoal: initialGoal = 1000
}: WeeklyGoalCardProps) {
    const [goal, setGoal] = useState(initialGoal)
    const [isEditing, setIsEditing] = useState(false)
    const [tempGoal, setTempGoal] = useState(initialGoal.toString())

    useEffect(() => {
        const savedGoal = localStorage.getItem('gigmiles_weekly_goal')
        if (savedGoal) {
            const num = parseInt(savedGoal)
            setGoal(num)
            setTempGoal(savedGoal)
        }
    }, [])

    const handleSave = () => {
        const num = parseInt(tempGoal)
        if (!isNaN(num) && num > 0) {
            setGoal(num)
            localStorage.setItem('gigmiles_weekly_goal', num.toString())
            setIsEditing(false)
        }
    }

    const progress = useMemo(() => {
        return Math.min(Math.round((currentNet / goal) * 100), 100)
    }, [currentNet, goal])

    const remaining = useMemo(() => {
        return Math.max(goal - currentNet, 0)
    }, [currentNet, goal])

    const daysLeft = useMemo(() => {
        const now = new Date()
        const day = now.getDay()
        return day === 0 ? 0 : 7 - day
    }, [])

    return (
        <Card className="bg-white/[0.03] border-white/5 overflow-hidden relative">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            Weekly Goal
                        </h2>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Progress to Target</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Target className="size-3.5" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-end justify-between mb-2">
                            <div className="flex items-baseline gap-1 group/goal cursor-pointer" onClick={() => !isEditing && setIsEditing(true)}>
                                <span className="text-2xl font-black tracking-tighter text-white">${currentNet.toFixed(0)}</span>

                                {isEditing ? (
                                    <div className="flex items-center gap-1 animate-in slide-in-from-left-2 duration-300">
                                        <span className="text-[10px] font-bold text-slate-500 mb-0.5">/ $</span>
                                        <div className="relative flex items-center">
                                            <Input
                                                autoFocus
                                                value={tempGoal}
                                                onChange={(e) => setTempGoal(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSave()
                                                    if (e.key === 'Escape') setIsEditing(false)
                                                }}
                                                className="h-6 w-16 px-1 py-0 text-xs font-bold bg-white/5 border-emerald-500/30 text-white focus-visible:ring-emerald-500/20"
                                            />
                                            <div className="absolute -right-12 flex items-center gap-0.5">
                                                <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="p-0.5 rounded bg-emerald-500/20 text-emerald-400" aria-label="Save goal">
                                                    <Check className="size-2.5" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="p-0.5 rounded bg-white/5 text-slate-400" aria-label="Cancel editing">
                                                    <X className="size-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-[10px] font-bold text-slate-600 mb-0.5 group-hover/goal:text-emerald-500/70 transition-colors">/ ${goal}</span>
                                        <Pencil className="size-2 text-slate-600 mb-0.5 opacity-0 group-hover/goal:opacity-100 transition-all" />
                                    </div>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                progress >= 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"
                            )}>
                                {progress}%
                            </span>
                        </div>

                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <TrendingUp className="size-2.5 text-slate-600" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Remaining</span>
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">
                                {remaining > 0 ? `$${remaining.toFixed(0)}` : 'Goal Met!'}
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Calendar className="size-2.5 text-slate-600" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Days Left</span>
                            </div>
                            <p className="text-sm font-bold text-white tracking-tight">
                                {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})
