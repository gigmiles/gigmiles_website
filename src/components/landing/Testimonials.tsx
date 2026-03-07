"use client"

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
    {
        quote: "GigMiles showed me I was barely clearing $14/hr after expenses. It completely changed how I pick my hours.",
        author: "Marcus T.",
        role: "Uber & Lyft",
        rating: 5
    },
    {
        quote: "I realized I was driving 60 hours for diminishing returns. Now I do 40 hours at strategic peaks—same net profit.",
        author: "Sarah J.",
        role: "Multi-App Courier",
        rating: 5
    },
    {
        quote: "No fluff, just hard numbers. The weekly reality reports keep me grounded and profitable.",
        author: "David L.",
        role: "Instacart Shopper",
        rating: 5
    }
]

export function Testimonials() {
    return (
        <section className="py-10 bg-[#080c14] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-3">Feedback</p>
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Built with gig workers across the US.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={t.author}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-[#0d1220] px-5 py-4 rounded-2xl border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative transition-all"
                        >
                            <div className="flex gap-0.5 mb-3">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[#0a0e17] font-bold text-sm shadow-[0_0_8px_rgba(57,255,20,0.15)]">
                                    {t.author.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t.author}</h4>
                                    <p className="text-xs text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
