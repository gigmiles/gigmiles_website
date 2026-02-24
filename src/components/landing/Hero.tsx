"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle, TrendingUp, Wallet, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, useInView } from 'framer-motion'
import * as React from 'react'
import { Marquee } from '@/components/ui/marquee'

export function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 } as any
        }
    }

    return (
        <section className="relative overflow-hidden pt-24 pb-10 lg:pt-32 lg:pb-14">
            {/* Background — ambient gradient mesh */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-to-b from-neon-primary/[0.06] via-neon-primary/[0.02] to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/[0.04] blur-[120px] rounded-full" />
                <div className="absolute top-1/3 left-0 w-64 h-64 bg-indigo-500/[0.03] blur-[100px] rounded-full" />
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.015] grid-pattern-slate" />
            </div>

            <div className="container relative mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-5 z-10 text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-primary/[0.08] border border-neon-primary/20 text-neon-primary font-bold text-[11px] uppercase tracking-[0.15em] self-start shadow-[0_0_15px_rgba(57,255,20,0.05)]"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-primary"></span>
                            </span>
                            New: Burnout Risk Analysis
                        </motion.div>

                        {/* Headline */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden"
                        >
                            <motion.h1
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
                            >
                                You&apos;re working harder than you think.<br />
                                <span className="text-neon-primary text-4xl md:text-5xl lg:text-6xl mt-4 block drop-shadow-[0_0_25px_rgba(57,255,20,0.25)]">You&apos;re earning less than you think.</span>
                            </motion.h1>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden"
                        >
                            <motion.p
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg font-medium"
                            >
                                Uber. DoorDash. Instacart. Freelance.<br />
                                We calculate what you actually keep after fuel, maintenance, and taxes.
                            </motion.p>
                        </motion.div>

                        {/* Primary CTA */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Link href="#calculator">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button size="lg" className="h-14 px-8 rounded-2xl bg-neon-primary text-[#0a0e17] font-extrabold hover:bg-neon-primary/90 shadow-[0_0_30px_rgba(57,255,20,0.2)] hover:shadow-[0_0_50px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden text-lg">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Run My Free Profit Check
                                            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href="/login">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl bg-white/[0.03] border-white/[0.08] text-white font-bold hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-center gap-2">
                                        <PlayCircle className="size-5 text-slate-400" />
                                        See Demo
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Platform Marquee */}
                        <motion.div
                            variants={itemVariants}
                            className="pt-4 border-t border-white/[0.06]"
                        >
                            <Marquee speed="slow" pauseOnHover={true} className="py-2">
                                {['Uber', 'DoorDash', 'Lyft', 'Instacart', 'Freelance', 'Amazon Flex'].map((name) => (
                                    <span key={name} className="text-slate-500 font-bold text-lg px-4 flex items-center gap-3">
                                        {name} <span className="w-1 h-1 rounded-full bg-slate-700 block ml-4"></span>
                                    </span>
                                ))}
                            </Marquee>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-5 -mt-1"
                        >
                            <div className="flex -space-x-3">
                                {[
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
                                ].map((imgSrc, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -4, scale: 1.1, zIndex: 10 }}
                                        className="size-10 rounded-full border-2 border-[#0a0e17] bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer relative ring-1 ring-white/10"
                                    >
                                        <img src={imgSrc} alt="Driver avatar" className="w-full h-full object-cover" />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-0.5 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-3 fill-current" />)}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Join <span className="text-slate-300 font-bold">15,000+</span> drivers tracking profit</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40, rotateY: -10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 1, delay: 0.8, type: "spring" }}
                        className="relative group perspective-lg"
                    >
                        {/* Ambient glow behind mockup */}
                        <div className="absolute inset-0 bg-neon-primary/10 blur-[100px] rounded-full -z-10 group-hover:bg-neon-primary/15 transition-all duration-700"></div>

                        {/* Main Dashboard Window */}
                        <motion.div
                            whileHover={{ rotateY: 5, rotateX: 2, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-[#0d1220] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.06] overflow-hidden cursor-default"
                        >
                            {/* Window chrome */}
                            <div className="bg-[#0a0e17] px-6 py-4 flex items-center gap-2 border-b border-white/[0.06]">
                                <div className="flex gap-1.5">
                                    <div className="size-3 rounded-full bg-red-500/70"></div>
                                    <div className="size-3 rounded-full bg-amber-500/70"></div>
                                    <div className="size-3 rounded-full bg-green-500/70"></div>
                                </div>
                                <div className="ml-4 flex-1 h-2.5 bg-white/[0.04] rounded-full max-w-[200px]"></div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Net Profit Card */}
                                <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] group/card">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Estimated Net Profit</h3>
                                            <p className="font-display text-3xl font-extrabold text-white mt-1">$4,821.50</p>
                                        </div>
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2.5 py-1 rounded-lg bg-neon-primary/[0.08] text-neon-primary text-xs font-bold flex items-center gap-1 cursor-default border border-neon-primary/10"
                                        >
                                            <TrendingUp className="size-3" />
                                            +12.4%
                                        </motion.span>
                                    </div>
                                    <div className="h-24 w-full flex items-end gap-1.5 pt-4">
                                        {[40, 25, 60, 45, 80, 65, 100].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                                                className={cn(
                                                    "flex-1 rounded-t-lg transition-colors group-hover/card:bg-neon-primary",
                                                    i === 6 ? "bg-neon-primary shadow-[0_0_10px_rgba(57,255,20,0.3)]" : "bg-neon-primary/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Expense Breakdown */}
                                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-4">
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Expenses</h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Fuel', value: 30, color: 'bg-blue-500' },
                                                { label: 'Maintenance', value: 15, color: 'bg-amber-500' },
                                                { label: 'Taxes', value: 20, color: 'bg-neon-primary' }
                                            ].map((item, idx) => (
                                                <div key={item.label} className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-500 flex items-center gap-1.5">
                                                            <div className={`size-1.5 rounded-full ${item.color}`} /> {item.label}
                                                        </span>
                                                        <span className="text-white">{item.value}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.value}%` }}
                                                            transition={{ duration: 1, delay: 1.5 + (idx * 0.2) }}
                                                            className={cn("h-full rounded-full", item.color)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Platforms */}
                                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-4">
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Top Platforms</h3>
                                        <div className="space-y-2.5">
                                            {[
                                                { name: 'Uber', rate: 32.50, active: true },
                                                { name: 'DoorDash', rate: 21.10, active: false },
                                                { name: 'Lyft', rate: 28.40, active: false }
                                            ].map((p, idx) => (
                                                <motion.div
                                                    key={p.name}
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 1.8 + (idx * 0.1) }}
                                                    className={cn(
                                                        "flex items-center justify-between p-2.5 rounded-xl border transition-colors",
                                                        p.active
                                                            ? "bg-neon-primary/[0.05] border-neon-primary/10"
                                                            : "bg-white/[0.02] border-white/[0.04]"
                                                    )}
                                                >
                                                    <span className="font-bold text-xs text-white">{p.name}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-black",
                                                        p.active ? "text-neon-primary" : "text-slate-500"
                                                    )}>
                                                        ${p.rate.toFixed(2)} / hr
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
