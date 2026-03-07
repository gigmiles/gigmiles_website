"use client";

import React from "react";
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react'

import { Logo } from '@/components/brand/Logo'
import { VibeLogo } from '@/components/brand/VibeLogo'

export default function VibePlayground() {
  return (
    <div className="min-h-screen bg-[#0D0F14] text-white p-8 font-sans selection:bg-[#10B981] selection:text-black">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#10B981] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#10B981] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Header Section - "Big-Big-Space" Rule */}
        <header className="py-20 text-center space-y-6">
          <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Vibe Coded <span className="text-[#10B981]">Playground</span>
          </h1>
          <p className="text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Exploring the "Kill Boring Designs" philosophy. This page is a local-only sandbox for premium UI elements and interactions.
          </p>
        </header>

        {/* Bento Grid Evolution Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-semibold">Bento Grid Evolution</h2>
            <span className="text-sm text-[#10B981] font-mono tracking-widest uppercase">Premium Layout</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 group relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                    <h3 className="text-2xl font-medium">Visual Depth & Glassmorphism</h3>
                    <p className="text-[#A1A1AA] leading-relaxed">
                        Notice the subtle 1px border and the backdrop blur effect. On hover, the border intensity increases and a subtle glow appears from the top left corner.
                    </p>
                </div>
            </div>

            {/* Vibe Logo Showcase */}
            <div className="col-span-full md:col-span-8 p-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="size-32 text-[#10B981]" />
                </div>
                <div className="relative z-10 space-y-8">
                    <h3 className="text-sm font-black text-[#A1A1AA] uppercase tracking-[0.4em]">Proprietary Branding v2.0</h3>
                    <div className="flex flex-col md:flex-row items-center gap-16 py-10">
                        <div className="space-y-2 text-center md:text-left">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Original Concept</p>
                            <Logo />
                        </div>
                        <div className="hidden md:block w-px h-20 bg-white/10" />
                        <div className="space-y-4 text-center md:text-left scale-125">
                            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.4em]">Vibe Coded Evolution</p>
                            <VibeLogo />
                        </div>
                    </div>
                    <p className="text-[#A1A1AA] max-w-xl text-xs font-medium leading-relaxed italic">
                        The new identity focuses on speed, loops, and vibrant performance. The "G" is re-engineered as a continuous high-speed track, utilizing the Vibrant Lime (#10B981) and Electric Cyan (#10B981) spectrum.
                    </p>
                </div>
            </div>

            {/* Small Tall Card */}
            <div className="group relative p-8 rounded-3xl bg-[#15181E] border border-white/[0.08] hover:scale-[1.02] transition-all duration-500">
                <div className="relative h-full flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="text-4xl font-bold text-[#10B981]">99.9%</div>
                        <div className="text-sm text-[#A1A1AA] uppercase tracking-wider">Uptime Reliability</div>
                    </div>
                    <div className="pt-8">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Regular Card */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] space-y-6">
                <h3 className="text-xl font-medium text-white italic tracking-tight">Full Page Previews</h3>
                <div className="space-y-4">
                    <Link href="/vibe-playground/login-preview" className="block">
                        <button className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-[#10B981] transition-colors active:scale-95 flex items-center justify-center gap-2">
                            Login Experience <ArrowRight className="size-4" />
                        </button>
                    </Link>
                    <Link href="/vibe-playground/full-landing-preview" className="block">
                        <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#00D1FF] to-[#E2E8F0] text-black font-black uppercase tracking-tighter hover:scale-105 shadow-[0_0_30px_#00D1FF44] transition-all flex items-center justify-center gap-2 group">
                           Full Vibe Upgrade <Sparkles className="size-4 animate-pulse" />
                        </button>
                    </Link>
                    <Link href="/vibe-playground/landing-preview" className="block">
                        <button className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[#A1A1AA] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                           Hero & Bento Specs <ArrowRight className="size-4" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Another Card */}
             <div className="md:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-medium">Anti-Boring Marquee</h3>
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-tighter text-[#A1A1AA]">Live System</span>
                     </div>
                </div>
                <div className="flex gap-8 animate-marquee whitespace-nowrap py-4">
                    {["STUNNING", "PREMIUM", "VIBE CODED", "ANTI-BORING", "CLEAN UI"].map((text, i) => (
                        <span key={i} className="text-4xl font-black text-white/10 group-hover:text-[#C1FF72]/20 transition-colors duration-700">
                            {text}
                        </span>
                    ))}
                    {["STUNNING", "PREMIUM", "VIBE CODED", "ANTI-BORING", "CLEAN UI"].map((text, i) => (
                        <span key={i} className="text-4xl font-black text-white/10 group-hover:text-[#C1FF72]/20 transition-colors duration-700">
                            {text}
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* Form Elements Example */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
            <div className="space-y-6">
                <h2 className="text-3xl font-semibold">Premium Inputs</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-[#A1A1AA] ml-1">Project Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter project name..." 
                            className="w-full bg-[#0D0F14] border border-white/[0.08] rounded-2xl p-4 focus:outline-none focus:border-[#C1FF72] focus:ring-1 focus:ring-[#C1FF72]/20 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-3xl font-semibold">Status Indicators</h2>
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Analytics Mode</span>
                        <div className="w-12 h-6 rounded-full bg-[#C1FF72] p-1 flex justify-end">
                            <div className="w-4 h-4 bg-black rounded-full shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Deployment Cloud</span>
                        <div className="px-3 py-1 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] text-xs font-medium border border-[#00D1FF]/20">
                            Active
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-10 text-center text-[#A1A1AA] text-sm border-t border-white/[0.05]">
            <p>Built with ❤️ and the Vibe Design System. Local Test Environment only.</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
