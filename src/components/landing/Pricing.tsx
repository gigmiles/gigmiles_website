"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Pricing() {
    return (
        <section id="pricing" className="py-10 bg-[#0a0e17] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-3">Plans</p>
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                        Clarity that pays for itself.
                    </h2>
                    <p className="text-base text-slate-400 font-medium">
                        Stop losing money to bad math. Choose the plan that fits your hustle.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-[#0d1220] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative transition-all"
                    >
                        <h3 className="text-xl font-bold text-white mb-1">Monthly</h3>
                        <p className="text-slate-500 mb-4 text-sm font-medium">Flexibility to pay as you earn.</p>

                        <div className="mb-5">
                            <span className="text-4xl font-extrabold text-white">$9.99</span>
                            <span className="text-slate-500 font-medium">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Advanced Tax modeling',
                                'Multi-Platform Trend Analytics',
                                { text: 'Burnout Risk & Early Warnings', bold: true },
                                'Downloadable Tax Reports (PDF/CSV)',
                            ].map((item, idx) => {
                                const text = typeof item === 'string' ? item : item.text
                                const bold = typeof item === 'object' && item.bold
                                return (
                                    <li key={idx} className="flex gap-3 text-slate-300">
                                        <Check className="size-5 text-emerald-500 shrink-0" />
                                        <span className={bold ? 'font-bold' : ''}>{text}</span>
                                    </li>
                                )
                            })}
                        </ul>

                        <Link href="/login?signup=true">
                            <Button className="w-full h-12 bg-white/[0.05] text-white border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] font-bold rounded-xl transition-all">
                                Start 14-Day Free Trial
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Annual Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-[#080c14] rounded-2xl p-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.06] blur-[100px] rounded-full"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold text-white">Annual</h3>
                                <div className="flex flex-col items-end">
                                    <span className="px-3 py-1 bg-emerald-500/[0.08] text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                                        Best Value
                                    </span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Save 16%</span>
                                </div>
                            </div>
                            <p className="text-slate-500 mb-4 text-sm font-medium">For those who treat this like a business.</p>

                            <div className="mb-5">
                                <span className="text-4xl font-extrabold text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">$99.99</span>
                                <span className="text-slate-500 font-medium">/year</span>
                            </div>

                            <ul className="space-y-3 mb-5">
                                {[
                                    'Everything in Monthly',
                                    'Live Tax Liability Modeling',
                                    'Multi-Platform Trend Analytics',
                                    { text: 'Burnout Risk & Early Warnings', bold: true },
                                ].map((item, idx) => {
                                    const text = typeof item === 'string' ? item : item.text
                                    const bold = typeof item === 'object' && item.bold
                                    return (
                                        <li key={idx} className="flex gap-3 text-white">
                                            <Check className="size-5 text-emerald-500 shrink-0" />
                                            <span className={bold ? 'font-bold' : ''}>{text}</span>
                                        </li>
                                    )
                                })}
                            </ul>

                            <Link href="/login?signup=true">
                                <Button className="w-full h-12 bg-emerald-500 text-[#0a0e17] hover:bg-emerald-500/90 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                                    Start 14-Day Free Trial
                                </Button>
                            </Link>
                            <p className="text-center text-xs text-slate-600 mt-4 font-medium">Billed annually. Cancel anytime.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
