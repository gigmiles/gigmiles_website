"use client"

import { Share2, MousePointerClick, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
    {
        name: 'Real-Time Profit Insights',
        description: 'Stop guessing your earnings. We automatically subtract fuel, maintenance, and taxes from your entries to show your real net profit.',
        icon: MousePointerClick,
        color: 'bg-primary/10 text-neon-primary'
    },
    {
        name: 'Tax Estimation',
        description: 'Never get surprised by a tax bill. Our engine calculates your estimated tax liabilities in real-time as you log your shifts.',
        icon: ShieldCheck,
        color: 'bg-primary/10 text-neon-primary'
    },
    {
        name: 'Gig Performance Analysis',
        description: 'Know where to drive. Compare your net hourly rates across different platforms to see which app is actually paying best in your area.',
        icon: Share2,
        color: 'bg-primary/10 text-neon-primary'
    },
]

export function Features() {
    return (
        <section className="py-24 bg-background-light dark:bg-background-dark/50 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-extrabold text-navy-dark dark:text-white mb-6">
                        Finally, a bank account for <br className="hidden sm:block" /> your gig career
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        We do the hard work of crunching the numbers so you can focus on driving. See exactly where your money goes.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`size-14 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:bg-neon-primary group-hover:text-navy-dark transition-all duration-300`}
                            >
                                <feature.icon className="size-8" />
                            </motion.div>
                            <h3 className="font-display text-xl font-bold text-navy-dark dark:text-white mb-4">
                                {feature.name}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
