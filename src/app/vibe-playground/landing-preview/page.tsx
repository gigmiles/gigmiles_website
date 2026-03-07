"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function VibeLandingPreview() {
  return (
    <div className="min-h-screen bg-[#0D0F14] text-white font-sans selection:bg-[#C1FF72] selection:text-black overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#C1FF72]/5 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00D1FF]/5 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Premium Nav - Vibe Style */}
      <nav className="fixed top-0 w-full z-50 p-6 md:p-10 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <Logo className="scale-110" />
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-1 px-4">
            <Link href="/login" className="text-sm font-bold text-[#A1A1AA] hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link href="/login?signup=true">
              <Button className="bg-[#C1FF72] text-black font-black px-6 rounded-xl hover:shadow-[0_0_20px_#C1FF7288] transition-all">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* HERO SECTION - The "Big-Big-Space" Rule */}
          <section className="text-center space-y-12 py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C1FF72]/10 border border-[#C1FF72]/20 text-[#C1FF72] text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C1FF72] animate-pulse" />
              The Future of Gig Work
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-extrabold tracking-tighter leading-[0.85] text-white">
              STOP <span className="text-white/20">DRIVING</span> <br />
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">BLIND.</span>
            </h1>

            <p className="text-lg md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed font-medium">
              Join the top 1% of earners who treat their gig work like a professional enterprise. Real-time net profit tracking for the modern driver.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button className="h-20 px-12 rounded-[2rem] bg-[#C1FF72] text-black text-xl font-black uppercase tracking-tighter hover:scale-105 hover:shadow-[0_0_40px_#C1FF7266] transition-all duration-500 group">
                Request Access
                <ArrowRight className="size-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="text-sm text-[#A1A1AA] font-mono flex items-center gap-3">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                15,204 OPERATORS ONLINE
              </div>
            </div>
          </section>

          {/* ASYMMETRIC BENTO GRID FEATURE SECTION */}
          <section className="space-y-12">
             <div className="flex items-end justify-between">
                <div className="space-y-4">
                    <span className="text-[#00D1FF] font-black uppercase tracking-[0.3em] text-xs">Capabilities</span>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic">ENGINEERED FOR PROFIT.</h2>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                {/* Large Dominant Card */}
                <div className="md:col-span-8 group relative p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl overflow-hidden transition-all duration-700 hover:border-white/30">
                    <div className="absolute top-0 right-0 p-8">
                        <TrendingUp className="size-16 text-[#C1FF72] opacity-20" />
                    </div>
                    <div className="relative h-full flex flex-col justify-end gap-6">
                        <h3 className="text-5xl font-black tracking-tighter">TRUE NET PROFIT.</h3>
                        <p className="max-w-md text-xl text-[#A1A1AA] leading-relaxed">
                            Fuel, maintenance, insurance, and taxes. We crunch the numbers so you keep what you earn. No more guesswork.
                        </p>
                        <div className="pt-6 flex gap-4">
                            {["UBER", "LYFT", "DOORDASH"].map(tag => (
                                <span key={tag} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-[#A1A1AA]">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vertical Accent Card */}
                <div className="md:col-span-4 p-12 rounded-[3.5rem] bg-[#C1FF72] text-black group hover:rotate-1 transition-all duration-500 flex flex-col justify-between">
                    <Zap className="size-12 fill-black" />
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black leading-tight italic">LIVE <br /> ANALYTICS.</h3>
                        <p className="text-black/60 font-bold leading-tight">
                            Real-time data streaming directly to your dashboard.
                        </p>
                    </div>
                </div>

                {/* Horizontal Bottom Card */}
                <div className="md:col-span-7 group relative p-10 rounded-[3rem] bg-[#15181E] border border-white/[0.08] overflow-hidden flex items-center justify-between">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black">SECURE DATA.</h3>
                        <p className="text-[#A1A1AA]">Your earnings data, encrypted and private.</p>
                    </div>
                    <ShieldCheck className="size-12 text-[#00D1FF] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Small Playful Card */}
                <div className="md:col-span-5 p-10 rounded-[3rem] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group overflow-hidden">
                    <div className="flex gap-4 animate-marquee whitespace-nowrap">
                        {[1, 2, 3].map(i => (
                            <span key={i} className="text-6xl font-black text-white/5 group-hover:text-[#C1FF72]/10 transition-colors">VIBE PREVIEW</span>
                        ))}
                    </div>
                </div>
             </div>
          </section>
        </div>
      </main>

      {/* Styled Footer */}
      <footer className="py-20 border-t border-white/[0.05] text-center space-y-6">
          <Logo className="mx-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
          <p className="text-[#A1A1AA] text-xs font-mono uppercase tracking-[0.4em]">Proprietary Gigmiles Local Vibe Preview v1.0</p>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
