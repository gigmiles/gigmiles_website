'use client'

import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CloudRain, Sun, Cloud, Wind, TrendingUp } from 'lucide-react'
import { cn } from "@/lib/utils"

interface WeatherWidgetProps {
    condition?: 'rain' | 'sun' | 'cloud' | 'wind'
    temp?: number
    impactText?: string
}

export const WeatherWidget = memo(function WeatherWidget({
    condition = 'rain',
    temp = 18,
    impactText = "Demand is increasing due to rain. Higher tips expected! 🌧️"
}: WeatherWidgetProps) {
    const icons = {
        rain: CloudRain,
        sun: Sun,
        cloud: Cloud,
        wind: Wind
    }

    const Icon = icons[condition]

    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden group relative">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <Icon className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Work Conditions</h3>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Market Pulse</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                        <TrendingUp className="size-3" /> High Demand
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{temp}°C</span>
                        <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                            {impactText}
                        </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Gig Forecast</span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">+15% Tip Rate</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})
