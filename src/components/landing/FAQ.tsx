"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const faqs = [
    {
        question: "Is there a free trial?",
        answer: "Yes, we offer a 14-day free trial on both our Monthly and Annual plans. This gives you full access to advanced tax modeling, platform analytics, and burnout alerts before you pay a dime."
    },
    {
        question: "Do you need my Uber or DoorDash login passwords?",
        answer: "Absolutely not. We never ask for your passwords to any platform. You are in full control of the data you enter into GigMiles."
    },
    {
        question: "How accurate is the tax estimation?",
        answer: "We use standard IRS models for self-employment tax (around 15.3%) and track your deductible expenses (like mileage and depreciation) to give you a highly accurate baseline. However, we always recommend consulting a CPA for your final tax filing."
    },
    {
        question: "What exactly is the 'Burnout Risk' alert?",
        answer: "Our engine analyzes the amount of hours you are putting in versus your real net take-home pay. If you are working unhealthy hours for diminishing returns (which is common across gig apps), we alert you before burnout hits so you can adjust your strategy."
    },
    {
        question: "Are you owned by a rideshare company?",
        answer: "No. GigMiles is proudly built by an independent team. We don't sell your data to Uber, Lyft, or corporate data brokers. We work for you."
    }
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-14 bg-[#080c14] relative">
            <div className="container mx-auto px-6 max-w-3xl relative z-10">
                <div className="text-center mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-4">FAQ</p>
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-400 font-medium">
                        Everything you need to know about how GigMiles works.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className={cn(
                                    "border rounded-2xl overflow-hidden transition-all duration-300",
                                    isOpen
                                        ? "bg-[#0d1220] border-emerald-500/20 shadow-[0_0_20px_rgba(57,255,20,0.03)]"
                                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
                                )}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="flex items-center justify-between w-full p-6 text-left"
                                >
                                    <span className={cn(
                                        "font-bold text-lg transition-colors",
                                        isOpen ? "text-emerald-500" : "text-white"
                                    )}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "size-5 text-slate-600 transition-transform duration-300 shrink-0 ml-4",
                                            isOpen ? "rotate-180 text-emerald-500" : ""
                                        )}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 text-slate-400 leading-relaxed font-medium">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
