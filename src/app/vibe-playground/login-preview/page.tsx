"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Github, Loader2, Sparkles } from "lucide-react";
import { VibeLogo as Logo } from "@/components/brand/VibeLogo";
import { Button } from "@/components/ui/button";

export default function VibeLoginPreview() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0D0F14] font-sans selection:bg-[#10B981] selection:text-black">
      {/* Background Mesh Gradient - Vibe Style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-[#10B981]/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-[#818CF8]/10 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Branding - Enhanced with Vibe Spacing */}
        <div className="flex flex-col items-center mb-12 animate-fade-in-up">
          <div className="transition-transform active:scale-95 hover:scale-105 duration-300">
            <Logo className="mb-4 flex-col !gap-4 scale-110" />
          </div>
          <p className="text-[#10B981] text-xs font-black uppercase tracking-[0.3em] opacity-80 mt-2">
            Professional Earnings Intelligence
          </p>
        </div>

        {/* Login Card - Glassmorphism & Anti-Boring Borders */}
        <div className="relative group overflow-hidden backdrop-blur-3xl bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-500 hover:border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Vibe Tab Switcher */}
            <div className="flex gap-4 mb-10 p-1.5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-[#10B981] text-black shadow-[0_0_20px_#10B98144]' : 'text-[#A1A1AA] hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isSignUp ? 'bg-[#10B981] text-black shadow-[0_0_20px_#10B98144]' : 'text-[#A1A1AA] hover:text-white'}`}
              >
                Create
              </button>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA] group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="email"
                    placeholder="name@gigmiles.com"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] ml-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA] group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/[0.08] rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-[10px] font-bold text-[#A1A1AA] hover:text-[#10B981] transition-colors uppercase tracking-widest">
                    Forgot Key?
                  </button>
                </div>
              )}

              <Button
                className={`w-full py-7 rounded-2xl text-lg font-black transition-all active:scale-95 group relative overflow-hidden ${isSignUp ? 'bg-white text-black' : 'bg-[#10B981] text-black'}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-tighter">
                  {isSignUp ? 'Launch Account' : 'Authenticate'}
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="absolute -top-1 -right-1">
                  <div className="size-3 bg-white/20 rounded-full animate-ping opacity-50" />
                  <div className="size-3 bg-white/20 rounded-full absolute inset-0" />
                </div>
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.05]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                <span className="px-4 bg-[#0D0F14] text-[#A1A1AA]">Secure Bridge</span>
              </div>
            </div>

            <Button variant="outline" className="w-full border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.05] py-7 rounded-2xl font-bold flex gap-3 hover:border-white/20 transition-all">
              <Github className="size-5" />
              GitHub Identity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
