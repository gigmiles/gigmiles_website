"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ArrowRight, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ProfitCalculator() {
    const [gross, setGross] = useState<number>(1200)
    const [hours, setHours] = useState<number>(45)
    const [platform, setPlatform] = useState<string>('uber')

    // Simple estimation logic for the landing page
    const estimatedExpenses = gross * 0.35 // 35% average expenses (fuel, maintenance, depreciation)
    const estimatedTaxes = gross * 0.153 // 15.3% self-employment tax estimate
    const netProfit = gross - estimatedExpenses - estimatedTaxes
    const realHourly = netProfit / (hours || 1) // Prevent division by zero

    // Burnout logic
    let burnoutRisk = 'Healthy'
    let burnoutColor = 'text-neon-primary bg-neon-primary/10 border-neon-primary/20'
    let burnoutMessage = 'Sustainable pace. Keep it up!'
    let notificationText = `Last week you worked ${hours} hours, your real net is $${realHourly.toFixed(2)}/hr. You are on track.`

    if (hours >= 55 || realHourly < 15) { // Assuming $15 as a generic minimum wage baseline
        burnoutRisk = 'Burnout Risk'
        burnoutColor = 'text-red-500 bg-red-500/10 border-red-500/20'
        burnoutMessage = 'You are working too hard for too little.'
        notificationText = `Reality Check: You worked ${hours} hours, but your net is only $${realHourly.toFixed(2)}/hr. Watch out, your burnout risk is high. Time to try different platforms or hours?`
    } else if (hours >= 40) {
        burnoutRisk = 'Warning'
        burnoutColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        burnoutMessage = 'Heavy schedule. Efficiency might drop.'
        notificationText = `You worked ${hours} hours. Intensive schedule! Make sure you are taking enough breaks to maintain your $${realHourly.toFixed(2)}/hr average.`
    }

    return (
        <section id="calculator" className="pb-14 pt-4 bg-[#080c14]">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-primary/[0.08] border border-neon-primary/15 text-neon-primary font-bold text-[11px] uppercase tracking-[0.15em] mb-6"
                    >
                        <Calculator className="size-4" />
                        Interactive Profit Checker
                    </motion.div>
                    <motion.div className="overflow-hidden pb-2">
                        <motion.h2
                            initial={{ y: "100%", opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
                        >
                            Stop guessing your net.
                        </motion.h2>
                    </motion.div>
                    <motion.div className="overflow-hidden">
                        <motion.p
                            initial={{ y: "100%", opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg text-slate-400 max-w-2xl mx-auto font-medium"
                        >
                            Enter your weekly numbers below and see the harsh reality of why most gig workers burn out—and how to fix it.
                        </motion.p>
                    </motion.div>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Inputs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#0d1220] rounded-[2rem] p-6 lg:p-8 border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-col h-full"
                    >
                        <h3 className="text-2xl font-bold text-white mb-8">Your Weekly Stats</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Primary App</label>
                                <select
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-primary/50 focus:border-neon-primary/30 focus:outline-none transition-all"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    title="Select your primary app"
                                    aria-label="Primary App"
                                >
                                    <option value="uber">Uber</option>
                                    <option value="doordash">DoorDash</option>
                                    <option value="lyft">Lyft</option>
                                    <option value="instacart">Instacart</option>
                                    <option value="freelance">Independent / Freelance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">App Revenue (Gross Earnings)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={gross}
                                        onChange={(e) => setGross(Number(e.target.value))}
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-4 py-3 text-white focus:ring-1 focus:ring-neon-primary/50 focus:border-neon-primary/30 focus:outline-none transition-all"
                                        title="Gross Earnings"
                                        aria-label="Gross Earnings"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Online Hours</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hours}
                                        onChange={(e) => setHours(Number(e.target.value))}
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-4 pr-12 py-3 text-white focus:ring-1 focus:ring-neon-primary/50 focus:border-neon-primary/30 focus:outline-none transition-all"
                                        title="Online Hours"
                                        aria-label="Online Hours"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">hrs</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="80"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="w-full mt-4 accent-neon-primary"
                                    title="Hours Range"
                                    aria-label="Hours Range"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#080c14] rounded-[2rem] p-6 lg:p-8 border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-full justify-between"
                    >
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-primary/[0.06] blur-[100px] rounded-full"></div>

                        <div className="relative z-10 space-y-5">
                            <div className="text-center pb-5 border-b border-white/[0.06]">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Actual Net Value</p>
                                <div className="flex justify-center items-end gap-2 text-white">
                                    <span className="text-5xl md:text-6xl font-extrabold text-neon-primary tracking-tight">
                                        ${realHourly.toFixed(2)}
                                    </span>
                                    <span className="text-xl text-slate-400 font-bold pb-2">/ hr</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-3">After taxes, fuel, and depreciation.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <motion.div whileHover={{ scale: 1.05, y: -2 }} className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 cursor-default">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <ShieldCheck className="size-4 text-blue-400" />
                                        Est. Tax
                                    </div>
                                    <p className="text-2xl font-bold text-white">${estimatedTaxes.toFixed(0)}</p>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05, y: -2 }} className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 cursor-default">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <TrendingUp className="size-4 text-neon-primary" />
                                        Net Take-home
                                    </div>
                                    <p className="text-2xl font-bold text-white">${netProfit.toFixed(0)}</p>
                                </motion.div>
                            </div>

                            {/* Burnout Risk Widget */}
                            <div className="space-y-4">
                                <div className={`rounded-xl p-4 border flex items-center gap-3 ${burnoutColor}`}>
                                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 bg-white/10`}>
                                        <AlertTriangle className="size-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{burnoutRisk}</h4>
                                        <p className="text-xs mt-0.5 leading-snug">{burnoutMessage}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-center text-red-400 font-bold text-xs mb-3">This is why most gig workers burn out.</p>
                                <Link href="/signup">
                                    <Button className="w-full h-12 bg-neon-primary text-slate-950 hover:bg-neon-primary/90 font-extrabold text-base rounded-xl shadow-lg shadow-neon-primary/20 hover:shadow-neon-primary/40 transition-all flex items-center justify-center gap-2 group">
                                        Unlock Full Reality Report
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <p className="text-center text-xs text-slate-500 mt-4">Takes 2 minutes. 100% Free.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
