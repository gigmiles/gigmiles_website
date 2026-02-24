'use client'

import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Zap, Clock } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MilestonesWidgetProps {
    bestHourlyRate?: number
    bestShiftDay?: string
    bestPlatform?: string
}

export const MilestonesWidget = memo(function MilestonesWidget({
    bestHourlyRate = 45.20,
    bestShiftDay = "Friday (Feb 20)",
    bestPlatform = "Uber Eats"
}: MilestonesWidgetProps) {
    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden group relative">
            {/* Animated Glow */}
            <div className="absolute -bottom-16 -right-16 w-38 h-38 bg-emerald-500/10 blur-[70px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Trophy className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Personal Bests</h3>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Live Milestones</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Hourly Peak Record */}
                    <div className="relative p-4 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 group-hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <Zap className="size-5 text-emerald-400 fill-emerald-400/20" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight text-white">${bestHourlyRate}/hr</h4>
                                <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">All-Time Peak</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                            <span>{bestPlatform}</span>
                            <span>{bestShiftDay}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="size-3 text-amber-500 fill-amber-500/20" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rating</span>
                            </div>
                            <span className="text-sm font-black text-slate-200">4.98</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="size-3 text-indigo-400" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Longest Shift</span>
                            </div>
                            <span className="text-sm font-black text-slate-200">11.5h</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})
