'use client'

import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Compass, Lightbulb, Clock, ArrowRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface StrategyWidgetProps {
    tip?: string
    bestHours?: string
    targetRegion?: string
}

export const StrategyWidget = memo(function StrategyWidget({
    tip = "Tuesdays usually earn more between 18:00 - 21:00. Don't miss those hours today!",
    bestHours = "18:00 - 21:00",
    targetRegion = "Downtown (High Surge)"
}: StrategyWidgetProps) {
    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden group relative">
            {/* Animated Pulsing Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-primary/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-neon-primary/20 transition-all duration-700 animate-pulse" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-neon-primary/10 text-neon-primary">
                            <Compass className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Today's Strategy</h3>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">AI Copilot</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
                        <div className="mt-1">
                            <Lightbulb className="size-4 text-amber-500 shrink-0" />
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                            "{tip}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="size-3 text-slate-500" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Prime Time</span>
                            </div>
                            <span className="text-xs font-black text-slate-200">{bestHours}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Compass className="size-3 text-slate-500" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hotzone</span>
                            </div>
                            <span className="text-xs font-black text-slate-200">{targetRegion}</span>
                        </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neon-primary/10 text-neon-primary hover:bg-neon-primary/20 transition-all text-xs font-bold group/btn">
                        Optimize Schedule <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
})
