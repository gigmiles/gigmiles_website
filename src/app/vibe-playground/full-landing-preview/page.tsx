"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Receipt, 
  TrendingDown, 
  AlertCircle,
  Calculator,
  Check,
  MousePointerClick,
  Share2,
  EyeOff,
  UserCheck,
  Lock,
  Star,
  PlayCircle
} from "lucide-react";
import { VibeLogo as Logo } from "@/components/brand/VibeLogo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function FullLandingPreview() {
  const [gross, setGross] = useState<number>(1200);
  const [hours, setHours] = useState<number>(45);

  const estimatedExpenses = gross * 0.35;
  const estimatedTaxes = gross * 0.153;
  const netProfit = gross - estimatedExpenses - estimatedTaxes;
  const realHourly = netProfit / (hours || 1);

  // Burnout Logic - Vibe Version
  let burnoutStatus = {
    label: "Optimal Performance",
    color: "text-[#10B981]",
    bgColor: "bg-[#10B981]/10",
    borderColor: "border-[#10B981]/20",
    description: "You are maintaining a professional and sustainable pace.",
    icon: <Zap className="size-5" />
  };

  if (hours >= 55 || realHourly < 15) {
    burnoutStatus = {
      label: "Critical Burnout Risk",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: "You are working too hard for too little. Structural change required.",
      icon: <AlertCircle className="size-5" />
    };
  } else if (hours >= 40) {
    burnoutStatus = {
      label: "Heavy Load Warning",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      description: "Efficiency is dropping. Recovery time is recommended soon.",
      icon: <AlertCircle className="size-5" />
    };
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white font-sans selection:bg-[#10B981] selection:text-black overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[5%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-pulse [animation-delay:3s]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo className="scale-110 hover:scale-115 transition-transform" />
          <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl rounded-2xl p-1 px-2">
            {['Features', 'Calculator', 'Pricing'].map(item => (
              <button key={item} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#10B981] transition-colors">{item}</button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-2" />
            <Link href="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:text-[#10B981] transition-colors">Sign In</Link>
          </div>
          <Button className="bg-[#10B981] text-black font-black px-8 py-6 rounded-2xl hover:shadow-[0_0_30px_#10B98188] transition-all uppercase tracking-tighter text-sm">
            Join Beta
          </Button>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION - "Big-Big-Space" */}
        <section className="pt-52 pb-32 px-6 text-center max-w-7xl mx-auto space-y-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            Vibe Preview v1.0
          </div>
          
          <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase">
            BEYOND THE <br /> <span className="bg-gradient-to-r from-white to-white/20 bg-clip-text text-transparent">MILES.</span> <br />
            BEYOND THE <span className="text-[#10B981] drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] italic">GUESS.</span>
          </h1>

          <p className="text-xl md:text-3xl text-[#A1A1AA] max-w-3xl mx-auto leading-[1.4] font-medium tracking-tight">
            Stop guessing your net profit. Join the elite gig workers using real-time intelligence to dominate their market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
            <Button className="h-24 px-16 rounded-[2.5rem] bg-[#10B981] text-black text-2xl font-black uppercase tracking-tighter hover:scale-105 hover:shadow-[0_0_60px_#10B98166] transition-all duration-500 group">
              Get Started
              <ArrowRight className="size-8 ml-4 group-hover:translate-x-3 transition-transform" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="size-12 rounded-full border-4 border-[#0D0F14] bg-white/10" />
                ))}
              </div>
              <div className="text-left">
                <div className="flex text-amber-400 size-3 mb-1">
                   {[1,2,3,4,5].map(s => <Star key={s} className="fill-current" />)}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">Trusted by 15k+ Drivers</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE BENTO FEATURE GRID */}
        <section className="px-6 py-32 max-w-7xl mx-auto space-y-20">
            <div className="space-y-6">
               <span className="text-[#A1A1AA] font-black uppercase tracking-[0.4em] text-xs">The Engine</span>
               <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none uppercase">Features Built <br /> For Performance.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "No Ads", desc: "Your focus is your profit. We keep the experience 100% ad-free.", icon: <EyeOff className="size-6" /> },
                  { title: "Privacy First", desc: "Your data is encrypted. We never sell your earnings info.", icon: <Lock className="size-6" /> },
                  { title: "Tax Ready", desc: "Export clean reports for tax season in one tap.", icon: <Receipt className="size-6" /> },
                  { title: "Speed", desc: "Ultralight performance. Works where you work.", icon: <Zap className="size-6" /> }
                ].map((f, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] hover:border-[#10B981]/30 transition-all group">
                      <div className="size-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-6 group-hover:scale-110 transition-transform">
                        {f.icon}
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{f.title}</h4>
                      <p className="text-xs font-medium text-[#A1A1AA] leading-relaxed italic">{f.desc}</p>
                  </div>
                ))}
            </div>

            <div className="space-y-6 pt-20">
               <span className="text-[#A1A1AA] font-black uppercase tracking-[0.4em] text-xs">Deep Dive</span>
               <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none">THE REALITY <br /> CHECK.</h2>
            </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Problem Breakdown Card */}
              <div className="md:col-span-12 lg:col-span-7 group relative p-12 rounded-[4rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                  <div className="space-y-8 flex-1">
                    <h3 className="text-4xl font-black tracking-tighter">THE NET MARGIN.</h3>
                    <p className="text-[#A1A1AA] text-lg font-medium leading-relaxed">
                      Revenue is only half the story. We help you track the hidden costs that impact your bottom line every single day.
                    </p>
                    <div className="space-y-4">
                      {['Fuel', 'Maintenance', 'Depreciation', 'Taxes'].map(item => (
                        <div key={item} className="flex items-center justify-between text-xs font-black uppercase tracking-widest border-b border-white/[0.05] pb-2">
                          <span className="text-[#A1A1AA] flex items-center gap-3">
                            <TrendingDown className="size-3 text-red-500" /> {item}
                          </span>
                          <span className="text-red-500">Deducted</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-64 aspect-square rounded-[3rem] bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-red-500/5 backdrop-blur-xl" />
                     <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-2">Net Profit</p>
                        <p className="text-6xl font-black tracking-tighter text-red-500 italic">30%</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Real-time Interaction Card */}
              <div className="md:col-span-12 lg:col-span-5 p-12 rounded-[4rem] bg-[#10B981] text-black flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 group">
                <Receipt className="size-16 fill-black mb-8" />
                <div className="space-y-6">
                  <h3 className="text-5xl font-black tracking-tighter leading-[0.9]">SMART <br /> LOGGING.</h3>
                  <p className="text-black/60 text-xl font-bold leading-tight">
                    Record every expense. <br /> Categorize in seconds. <br /> Total clarity.
                  </p>
                  <Button className="w-full h-16 rounded-2xl bg-black text-[#10B981] font-black uppercase tracking-tighter text-lg mt-4 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                    Start Tracking
                  </Button>
                </div>
              </div>

              {/* Profit Calculator Bento Item */}
              <div className="md:col-span-12 lg:col-span-12 p-12 lg:p-16 rounded-[5rem] bg-[#15181E] border border-white/[0.08] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Calculator className="size-44 text-[#10B981]" />
                </div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h3 className="text-5xl lg:text-7xl font-black tracking-tighter italic">THE <br /> CALCULATOR.</h3>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">Weekly Revenue</label>
                        <input 
                          type="range" min="100" max="5000" value={gross} onChange={(e) => setGross(Number(e.target.value))}
                          className="w-full accent-[#10B981] h-1"
                        />
                        <p className="text-4xl font-black text-white italic">${gross.toLocaleString()}</p>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">Online Hours</label>
                        <input 
                          type="range" min="1" max="100" value={hours} onChange={(e) => setHours(Number(e.target.value))}
                          className="w-full accent-[#10B981] h-1"
                        />
                        <p className="text-4xl font-black text-white italic">{hours} HOURS</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/[0.08] backdrop-blur-2xl rounded-[4rem] p-12 flex flex-col justify-center items-center text-center space-y-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#10B981]">True Earnings</span>
                      <p className="text-8xl font-black tracking-tighter text-white italic">${realHourly.toFixed(2)}</p>
                      <p className="text-[#A1A1AA] font-bold text-lg">Net Hourly Revenue</p>
                      
                      {/* VIBE BURNOUT WIDGET */}
                      <div className={`w-full p-6 rounded-3xl border ${burnoutStatus.borderColor} ${burnoutStatus.bgColor} transition-all duration-500 flex items-start gap-4 text-left group/burnout`}>
                        <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 ${burnoutStatus.color} group-hover/burnout:scale-110 transition-transform`}>
                           {burnoutStatus.icon}
                        </div>
                        <div className="space-y-1">
                           <h4 className={`font-black uppercase tracking-tighter text-sm ${burnoutStatus.color}`}>{burnoutStatus.label}</h4>
                           <p className="text-[11px] font-bold text-[#A1A1AA] leading-snug">{burnoutStatus.description}</p>
                        </div>
                      </div>

                      <Link href="/login" className="w-full">
                        <Button className="w-full h-20 bg-[#10B981] text-black text-xl font-black rounded-3xl uppercase tracking-tighter">Claim This Reality</Button>
                      </Link>
                  </div>
                </div>
              </div>

              {/* Beta Access Card - Single High Impact */}
              <div className="md:col-span-12 p-12 lg:p-20 rounded-[5rem] bg-gradient-to-br from-[#10B981]/10 to-transparent border border-[#10B981]/20 backdrop-blur-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Star className="size-64 text-[#10B981]" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                      <div className="space-y-4">
                        <span className="px-5 py-2 rounded-full bg-[#10B981] text-black text-[10px] font-black uppercase tracking-[0.3em]">Limited Beta</span>
                        <h3 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">The Beta <br /> Pass.</h3>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-12">
                          <div className="text-left space-y-6 max-w-md">
                              <p className="text-[#A1A1AA] text-lg font-medium leading-relaxed">
                                We're building the future of gig economy intelligence. Join the Beta to shape the product and secure early-access benefits.
                              </p>
                              <ul className="space-y-4">
                                {['Full Access to All Features', 'No Ads. No Distractions.', 'No Credit Card Required', 'Priority Support', 'Early Adopter Status'].map(t => (
                                    <li key={t} className="flex items-center gap-4 text-sm font-black text-white/80">
                                        <Check className="size-5 text-[#10B981]" /> {t}
                                    </li>
                                ))}
                              </ul>
                          </div>
                          
                          <div className="bg-black/40 border border-white/5 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-4 min-w-[300px]">
                              <span className="text-7xl font-black italic">$0.00</span>
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">No Subscription Fee</span>
                              <div className="w-full pt-6">
                                <Button className="w-full h-20 bg-[#10B981] text-black text-xl font-black rounded-3xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                    Claim Free Access
                                </Button>
                              </div>
                              <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest pt-2">Free for a limited time during beta</p>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        </section>

        {/* TRUST & FAQ - Clean & Premium */}
        <section className="px-6 py-32 bg-black/20">
           <div className="max-w-4xl mx-auto space-y-20">
              <div className="text-center space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Engineered for Trust.</h2>
                 <p className="text-xl text-[#A1A1AA] font-medium leading-relaxed">
                    We never store your gig passwords. We never sell your data. We are drivers building for drivers.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[
                    { q: "Is it secure?", a: "Bank-level 256-bit encryption. Your data is your property, always." },
                    { q: "Why do I need this?", a: "Because gross earnings are a lie. Tax season shouldn't be a nightmare." },
                    { q: "Multi-app support?", a: "Yes. Uber, DoorDash, Lyft, Amazon Flex and more are supported natively." },
                    { q: "Can I cancel?", a: "At any moment. No hidden fees. No friction." }
                 ].map(item => (
                    <div key={item.q} className="space-y-4 group">
                       <h4 className="text-lg font-black tracking-tight text-white group-hover:text-[#10B981] transition-colors">{item.q}</h4>
                       <p className="text-[#A1A1AA] font-medium leading-relaxed">{item.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-44 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/10 via-transparent to-transparent" />
            <div className="max-w-5xl mx-auto relative z-10 text-center space-y-12">
                <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
                  LIMITED <br /> <span className="text-[#10B981]">BETA.</span>
                </h2>
                <Button className="h-28 px-20 rounded-[3rem] bg-[#10B981] text-black text-3xl font-black uppercase tracking-tighter hover:scale-110 hover:shadow-[0_0_80px_#10B98188] transition-all duration-700">
                    Join Gigmiles Free
                </Button>
            </div>
        </section>

      </main>

      <footer className="py-20 border-t border-white/[0.05] relative z-10 bg-[#0D0F14]">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
            <Logo className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">
                <span className="hover:text-white cursor-pointer transition-colors">Security</span>
                <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
            <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest opacity-40">© 2026 GIGMILES AD LABS</p>
         </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .perspective-lg {
          perspective: 2000px;
        }
      `}</style>
    </div>
  );
}
