"use client"

import { Share2, MousePointerClick, ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Features() {
    return (
        <section className="py-12 bg-[#0a0e17] overflow-hidden relative">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-10"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-primary/60 mb-3">Core Features</p>
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                        Everything you need in one dashboard.
                    </h2>
                    <p className="text-base text-slate-400 font-medium">
                        We do the hard work of crunching the numbers so you can focus on driving.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 max-w-7xl mx-auto">
                    {/* Left Side: 6 Features (3x2 Grid) */}
                    <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Feature 1: Profit Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-primary/[0.04] rounded-full blur-3xl -z-10 group-hover:bg-neon-primary/[0.07] transition-colors" />
                            <div className="size-11 bg-neon-primary/10 text-neon-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-neon-primary group-hover:text-[#0a0e17] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300">
                                <MousePointerClick className="size-6" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-2">
                                Real-Time Profit Insights
                            </h3>
                            <p className="text-slate-400 leading-relaxed max-w-md text-sm">
                                Stop guessing. We subtract fuel, maintenance, and taxes to show your real take-home net profit.
                            </p>
                        </motion.div>

                        {/* Feature 2: Tax Estimation (Span 1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden flex flex-col justify-end"
                        >
                            <div className="size-11 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-auto group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mt-5 mb-2">
                                Tax Safety Net
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Never get surprised by a tax bill. Our engine calculates your estimated liabilities continuously.
                            </p>
                        </motion.div>

                        {/* Feature 3: Expense Tracking (Span 1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden flex flex-col justify-end"
                        >
                            <div className="size-11 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-auto group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300">
                                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-0.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mt-5 mb-2">
                                Expense Management
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Log fuel, maintenance, and phone bills. Watch your real deductibles grow automatically.
                            </p>
                        </motion.div>

                        {/* Feature 4: Shift History (Span 2) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden flex flex-col justify-end"
                        >
                            <div className="size-11 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300">
                                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-2">
                                Detailed Shift History
                            </h3>
                            <p className="text-slate-400 leading-relaxed max-w-md text-sm">
                                Every mile driven, every dollar earned, timestamped and securely archived. Instantly edit past entries or export your data for tax season.
                            </p>
                        </motion.div>

                        {/* Feature 5: Asset Car Value (Span 1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden flex flex-col justify-end"
                        >
                            <div className="size-11 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mb-auto group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all duration-300">
                                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mt-5 mb-2">
                                Asset Car Value
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Track the real-time depreciation of your vehicle. Know exactly how much your car is losing value per mile.
                            </p>
                        </motion.div>

                        {/* Feature 6: Gig Comparison (Span 1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="md:col-span-1 p-6 bg-[#0d1220] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                        >
                            <div className="size-11 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300">
                                <Share2 className="size-6" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-2">
                                Gig Comparison
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Compare net hourly rates across platforms to see which app truly pays best.
                            </p>
                        </motion.div>
                    </div> {/* End Features Block */}

                    {/* Right Side: Trust Section (Vertical) */}
                    <div className="xl:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="h-full p-6 bg-[#080c14] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden border border-white/[0.06]"
                        >
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-neon-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />

                            <h3 className="font-display text-lg font-bold text-white mb-5 border-b border-white/[0.06] pb-3">
                                Built on Trust & Total Privacy
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6 relative z-10">
                                {[
                                    { icon: EyeOff, title: 'No Gig Passwords', desc: 'We never ask for or store your app passwords. Just enter your numbers.' },
                                    { icon: Lock, title: 'Bank-Level Security', desc: 'Financial data is encrypted in transit and at rest using 256-bit encryption.' },
                                    { icon: UserCheck, title: 'Built by Drivers', desc: 'Built by an independent team that understands the realities of gig work.' },
                                    { icon: ShieldCheck, title: 'Your Data is Yours', desc: 'We make money from our service, not from selling your driving data.' },
                                ].map((item) => (
                                    <div key={item.title} className="space-y-2">
                                        <div className="flex items-center gap-3 text-neon-primary font-bold">
                                            <item.icon className="size-5" />
                                            {item.title}
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
