'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Route, Clock, DollarSign, TrendingDown, ChevronRight } from 'lucide-react'
import { PlatformEarning } from '@/app/dashboard/types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SummaryHeroProps {
    gross: number
    netProfit: number
    totalGrandCosts: number
    hourlyRate: number
    miles: number
    hours: number
    isXL?: boolean
    platformEarnings?: PlatformEarning[]
    fuelCost?: number
    wearCost?: number
    insurance?: number
    federalTax?: number
    stateTax?: number
    directExpenses?: Array<{ id: string; category: string; amount: number; description?: string }>
    tips?: number
}

export function SummaryHero({
    gross,
    netProfit,
    totalGrandCosts,
    hourlyRate,
    miles,
    hours,
    isXL = false,
    platformEarnings = [],
    fuelCost = 0,
    wearCost = 0,
    insurance = 0,
    federalTax = 0,
    stateTax = 0,
    directExpenses = [],
    tips = 0
}: SummaryHeroProps) {
    const profitPerMile = miles > 0 ? netProfit / miles : 0

    return (
        <div className={cn(
            "relative overflow-hidden group cursor-default h-full flex flex-col justify-center px-4 py-6 md:p-8",
        )}>
            {/* Glowing background effect */}
            <div className={cn(
                "absolute -top-32 -right-32 w-64 h-64 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000",
                hourlyRate >= 25 ? "bg-emerald-500/15" : hourlyRate >= 15 ? "bg-amber-500/15" : "bg-red-500/15"
            )} />

            <div className="relative z-10 space-y-5">
                {/* Net Profit — Compact Hero */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Real Take-Home Profit</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-500">$</span>
                        <motion.p
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 120 }}
                            className="animate-number-pop font-display font-extrabold tracking-tighter text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] text-4xl md:text-5xl"
                        >
                            {netProfit.toFixed(2)}
                        </motion.p>
                    </div>
                </div>

                {/* 4-Column Stats Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Gross Income — Clickable with per-app breakdown */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex flex-col gap-1.5 bg-white/5 rounded-2xl p-3.5 border border-white/5 transition-all hover:bg-white/10 hover-spring text-left group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                            <DollarSign className="size-3 text-emerald-400" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Gross</span>
                                    </div>
                                    <ChevronRight className="size-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <span className="text-white font-bold text-lg truncate">${gross.toFixed(2)}</span>
                                {tips > 0 && (
                                    <span className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-wider">${tips.toFixed(2)} tips</span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-slate-900 border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Per-App Earnings</h4>
                            <div className="space-y-2">
                                {platformEarnings.length > 0 ? (
                                    platformEarnings.map((p, i) => {
                                        const total = (p.amount || 0) + (p.tips || 0)
                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">{p.platform_name}</span>
                                                <div className="flex items-center gap-2">
                                                    {p.tips > 0 && (
                                                        <span className="text-[9px] text-emerald-400 font-bold">+${p.tips.toFixed(0)} tip</span>
                                                    )}
                                                    <span className="text-xs font-black text-white">${total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-[10px] text-slate-600 italic">No earnings data.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Total Costs — Clickable with itemized breakdown */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex flex-col gap-1.5 bg-white/5 rounded-2xl p-3.5 border border-white/5 transition-all hover:bg-white/10 hover-spring text-left group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded-md bg-red-500/10 border border-red-500/20">
                                            <TrendingDown className="size-3 text-red-400" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Costs</span>
                                    </div>
                                    <ChevronRight className="size-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <span className="text-red-400 font-bold text-lg truncate">-${totalGrandCosts.toFixed(2)}</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-slate-900 border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Cost Breakdown</h4>
                            <div className="space-y-2">
                                {/* Hidden costs */}
                                {fuelCost > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-300">⛽ Fuel</span>
                                        <span className="text-xs font-black text-red-400">-${fuelCost.toFixed(2)}</span>
                                    </div>
                                )}
                                {wearCost > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-300">🔧 Wear & Tear</span>
                                        <span className="text-xs font-black text-red-400">-${wearCost.toFixed(2)}</span>
                                    </div>
                                )}
                                {insurance > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-300">🛡️ Insurance</span>
                                        <span className="text-xs font-black text-red-400">-${insurance.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Tax */}
                                {(federalTax > 0 || stateTax > 0) && (
                                    <>
                                        <div className="border-t border-white/5 my-1.5" />
                                        {federalTax > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">🏛️ Federal Tax</span>
                                                <span className="text-xs font-black text-amber-400">-${federalTax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {stateTax > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">📍 State Tax</span>
                                                <span className="text-xs font-black text-amber-400">-${stateTax.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Direct expenses */}
                                {directExpenses.length > 0 && (
                                    <>
                                        <div className="border-t border-white/5 my-1.5" />
                                        {directExpenses.map((exp, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300">📝 {exp.category}</span>
                                                <span className="text-xs font-black text-red-400">-${exp.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Empty state */}
                                {totalGrandCosts === 0 && (
                                    <p className="text-[10px] text-slate-600 italic">No costs recorded.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Miles Driven */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex flex-col gap-1.5 bg-white/5 rounded-2xl p-3.5 border border-white/5 transition-all hover:bg-white/10 hover-spring text-left group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                            <Route className="size-3 text-emerald-500" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Miles</span>
                                    </div>
                                    <ChevronRight className="size-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <span className="text-white font-bold text-lg truncate">{miles.toFixed(1)}</span>
                                <span className="text-[8px] text-emerald-500/70 font-bold uppercase tracking-wider">${profitPerMile.toFixed(2)}/mi</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-slate-900 border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Per-App Mileage</h4>
                            <div className="space-y-2">
                                {platformEarnings.filter(p => p.miles > 0).length > 0 ? (
                                    platformEarnings.filter(p => p.miles > 0).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-300">{p.platform_name}</span>
                                            <span className="text-xs font-black text-white">{p.miles.toFixed(1)} <span className="text-slate-500">mi</span></span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-600 italic">No mileage data.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Active Hours */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex flex-col gap-1.5 bg-white/5 rounded-2xl p-3.5 border border-white/5 transition-all hover:bg-white/10 hover-spring text-left group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                                            <Clock className="size-3 text-blue-400" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active</span>
                                    </div>
                                    <ChevronRight className="size-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <span className="text-white font-bold text-lg truncate">{hours.toFixed(1)}h</span>
                                <span className="text-[8px] text-blue-400/70 font-bold uppercase tracking-wider">${hourlyRate.toFixed(2)}/hr</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-slate-900 border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Active Time Split</h4>
                            <div className="space-y-2">
                                {platformEarnings.filter(p => p.hours > 0).length > 0 ? (
                                    platformEarnings.filter(p => p.hours > 0).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-300">{p.platform_name}</span>
                                            <span className="text-xs font-black text-white">{p.hours.toFixed(1)} <span className="text-slate-500">h</span></span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-600 italic">No time data.</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Compact Burnout Meter */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Burnout</p>
                            <span className="text-lg font-bold text-white">${hourlyRate.toFixed(0)}<span className="text-xs text-slate-500 font-bold">/hr</span></span>
                        </div>
                        <div className={cn(
                            "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                            hourlyRate >= 25 ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" :
                                hourlyRate >= 15 ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" :
                                    "bg-red-500/15 text-red-500 border border-red-500/20"
                        )}>
                            {hourlyRate >= 25 ? "Healthy" : hourlyRate >= 15 ? "At Risk" : "Burnout"}
                        </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (hourlyRate / 40) * 100)}%` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                            className={cn(
                                "h-full rounded-full",
                                hourlyRate >= 25 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                    hourlyRate >= 15 ? "bg-amber-400" : "bg-red-500"
                            )}
                        />
                        <div className="absolute top-0 bottom-0 left-[62.5%] w-px bg-white/20" />
                    </div>
                </div>
            </div>
        </div>
    )
}
