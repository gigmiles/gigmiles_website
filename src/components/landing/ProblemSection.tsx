"use client"

import { motion } from 'framer-motion'
import { Receipt, TrendingDown, AlertCircle } from 'lucide-react'

const deductions = [
    { label: 'Fuel', amount: '220' },
    { label: 'Maintenance', amount: '140' },
    { label: 'Depreciation', amount: '180' },
    { label: 'Insurance', amount: '90' },
    { label: 'Self-Employment Tax', amount: '210' },
]

export function ProblemSection() {
    return (
        <section className="pt-10 pb-2 bg-[#080c14] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-red-500/[0.03] via-transparent to-red-500/[0.03] blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3"
                    >
                        Most gig workers track revenue.{' '}
                        <span className="text-red-400">Almost none track real profit.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-base text-slate-400 font-medium"
                    >
                        The app says $1,200 this week. Reality tells a different story.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="max-w-2xl mx-auto bg-[#0d1220] rounded-2xl p-5 md:p-6 border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-lg bg-neon-primary/10 text-neon-primary flex items-center justify-center">
                                <Receipt className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Weekly Summary</h3>
                                <p className="text-[10px] text-slate-500">Reality Check</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.15em]">Gross</p>
                            <p className="text-xl font-extrabold text-white">$1,200</p>
                        </div>
                    </div>

                    {/* Compact deductions */}
                    <div className="space-y-1.5 mb-4">
                        {deductions.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm text-slate-400 py-1">
                                <span className="flex items-center gap-2">
                                    <TrendingDown className="size-3 text-red-500/50" />
                                    {item.label}
                                </span>
                                <span className="font-mono text-red-400 text-xs">-${item.amount}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 bg-red-500/[0.06] text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/10">
                            <AlertCircle className="size-3.5 shrink-0" />
                            <span>70% lost to expenses & taxes</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.15em]">Net</p>
                            <p className="text-2xl font-extrabold text-neon-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">$360</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
