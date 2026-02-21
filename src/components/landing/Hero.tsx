"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle, TrendingUp, Wallet, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import * as React from 'react'

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
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
            {/* Background Gradients */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-1/2 -ml-[50%] w-[200%] h-[50%] bg-gradient-to-b from-neon-primary/10 to-transparent blur-3xl pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none"
            />

            <div className="container relative mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-8 z-10 text-left"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-primary/10 border border-neon-primary/20 text-neon-primary font-bold text-xs uppercase tracking-wider self-start"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-primary"></span>
                            </span>
                            New: Multi-app expense tracking
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-navy-dark dark:text-white leading-[1.1] tracking-tight"
                        >
                            Know Your Real <br />
                            <span className="text-neon-primary">Net Earnings</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg"
                        >
                            Gross income isn't profit. Take control of your gig business with the ultimate financial copilot. Automatically track taxes, fuel, and depreciation.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 mt-4"
                        >
                            <Link href="/signup">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button size="lg" className="h-14 px-8 rounded-xl bg-electric-blue text-white hover:bg-electric-blue/90 shadow-xl shadow-electric-blue/30 hover:shadow-electric-blue/40 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Get Started Free
                                            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href="/login">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                        <PlayCircle className="size-5" />
                                        See Demo
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                                        className="size-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer"
                                    >
                                        <div className="size-full bg-gradient-to-br from-slate-400 to-slate-500 opacity-50" />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-0.5 text-amber-500">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-3 fill-current" />)}
                                </div>
                                <p className="text-sm text-slate-500 font-medium italic">Join 15,000+ drivers tracking profit today</p>
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
                        <div className="absolute inset-0 bg-neon-primary/20 blur-[120px] rounded-full -z-10 group-hover:bg-neon-primary/30 transition-all duration-700"></div>

                        {/* Main Dashboard Window */}
                        <motion.div
                            whileHover={{ rotateY: 5, rotateX: 2, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-default"
                        >
                            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex gap-1.5">
                                    <div className="size-3 rounded-full bg-red-400"></div>
                                    <div className="size-3 rounded-full bg-amber-400"></div>
                                    <div className="size-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="ml-4 flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full max-w-[200px]"></div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Net Profit Card */}
                                <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 group/card">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estimated Net Profit</h3>
                                            <p className="font-display text-3xl font-extrabold text-navy-dark dark:text-white mt-1">$4,821.50</p>
                                        </div>
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2.5 py-1 rounded-lg bg-neon-primary/10 text-neon-primary text-xs font-bold flex items-center gap-1 cursor-default"
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
                                                    i === 6 ? "bg-neon-primary" : "bg-neon-primary/40"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Expense Breakdown */}
                                    <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Expenses</h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Fuel', value: 30, color: 'bg-electric-blue' },
                                                { label: 'Maintenance', value: 15, color: 'bg-amber-500' },
                                                { label: 'Taxes', value: 20, color: 'bg-neon-primary' }
                                            ].map((item, idx) => (
                                                <div key={item.label} className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-500 flex items-center gap-1.5">
                                                            <div className={`size-1.5 rounded-full ${item.color}`} /> {item.label}
                                                        </span>
                                                        <span className="dark:text-white">{item.value}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.value}%` }}
                                                            transition={{ duration: 1, delay: 1.5 + (idx * 0.2) }}
                                                            className={cn("h-full", item.color)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Platforms */}
                                    <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Top Platforms</h3>
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
                                                    className={`flex items-center justify-between p-2 rounded-xl ${p.active ? 'bg-neon-primary/5 border border-neon-primary/10' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'}`}
                                                >
                                                    <span className="font-bold text-xs dark:text-white">{p.name}</span>
                                                    <span className={`text-[10px] font-black ${p.active ? 'text-neon-primary' : 'text-slate-400'}`}>${p.rate.toFixed(2)} / hr</span>
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
