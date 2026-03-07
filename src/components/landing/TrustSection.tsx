"use client"

import { motion } from 'framer-motion'
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react'

const trustFeatures = [
    {
        title: "No Gig Passwords",
        description: "We never ask for or store your Uber, DoorDash, or other platform passwords. You just enter your numbers.",
        icon: EyeOff
    },
    {
        title: "Bank-Level Security",
        description: "Your financial data is encrypted in transit and at rest using industry-standard 256-bit encryption.",
        icon: Lock
    },
    {
        title: "Your Data is Yours",
        description: "We make money from subscriptions, not from selling your driving data to third-party brokers.",
        icon: ShieldCheck
    },
    {
        title: "For Drivers, By Drivers",
        description: "Built by an independent team that understands the realities of gig work, not a massive corporation.",
        icon: UserCheck
    }
]

export function TrustSection() {
    return (
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-500 border-y border-slate-100 dark:border-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-navy-dark dark:text-white mb-4">
                        Built on Trust & Privacy
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gig workers are tired of apps spying on them. We take a different approach: total privacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {trustFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                                <feature.icon className="size-6" />
                            </div>
                            <h3 className="font-bold text-navy-dark dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
