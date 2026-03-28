"use client";

import React, { useState } from "react";
import { APP_STORE_URL } from "@/config/app";
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
  EyeOff,
  Lock,
  Star,
  Brain,
  Menu,
  X,
} from "lucide-react";
import { VibeLogo as Logo } from "@/components/brand/VibeLogo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MagneticCTA } from "@/components/ui/MagneticCTA";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const heroTextStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export function VibeLandingClient() {
  const [gross, setGross] = useState<number>(1200);
  const [hours, setHours] = useState<number>(45);
  const [showFeatures, setShowFeatures] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const estimatedExpenses = gross * 0.35;
  const estimatedTaxes = gross * 0.153;
  const netProfit = gross - estimatedExpenses - estimatedTaxes;
  const realHourly = netProfit / (hours || 1);

  let burnoutStatus = {
    label: "Optimal Performance",
    color: "text-[#10B981]",
    bgColor: "bg-[#10B981]/10",
    borderColor: "border-[#10B981]/20",
    description: "You are maintaining a professional and sustainable pace.",
    icon: <Zap className="size-5" />,
  };

  if (hours >= 55 || realHourly < 15) {
    burnoutStatus = {
      label: "Critical Burnout Risk",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description:
        "You are working too hard for too little. Structural change required.",
      icon: <AlertCircle className="size-5" />,
    };
  } else if (hours >= 40) {
    burnoutStatus = {
      label: "Heavy Load Warning",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      description:
        "Efficiency is dropping. Recovery time is recommended soon.",
      icon: <AlertCircle className="size-5" />,
    };
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-[#10B981] selection:text-black overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-[5%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#10B981]/5 blur-[150px] animate-orbit" />
        <div className="absolute bottom-[5%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-orbit-reverse" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/3 blur-[120px] animate-orbit [animation-delay:5s]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo className="scale-110 hover:scale-115 transition-transform" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl rounded-2xl p-1 px-2">
            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#10B981] transition-colors flex items-center gap-1.5"
              >
                Features
                <svg className={`size-3 transition-transform duration-200 ${showFeatures ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showFeatures && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFeatures(false)} />
                  <div className="absolute top-full left-0 mt-4 w-[520px] p-6 rounded-3xl bg-[#0B1120]/98 backdrop-blur-3xl border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-50">
                    <div className="space-y-5">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10B981]/60">Current Features</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <TrendingUp className="size-4" />, name: "Net Profit Dashboard", desc: "Real-time earnings & costs" },
                          { icon: <Calculator className="size-4" />, name: "Vehicle Depreciation", desc: "Year, make & model based" },
                          { icon: <Receipt className="size-4" />, name: "Expense Tracking", desc: "Log & categorize costs" },
                          { icon: <TrendingDown className="size-4" />, name: "Tax Ledger", desc: "Self-employment tax calc" },
                          { icon: <Star className="size-4" />, name: "Platform Analytics", desc: "Multi-platform comparison" },
                          { icon: <AlertCircle className="size-4" />, name: "Burnout Monitor", desc: "Hours & fatigue tracking" },
                          { icon: <EyeOff className="size-4" />, name: "Ad-Free Experience", desc: "Zero ads, zero distractions" },
                          { icon: <ShieldCheck className="size-4" />, name: "Data Privacy", desc: "No passwords stored ever" },
                        ].map((f) => (
                          <div key={f.name} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-default group">
                            <div className="size-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shrink-0 group-hover:bg-[#10B981] group-hover:text-black transition-colors">
                              {f.icon}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white leading-tight">{f.name}</p>
                              <p className="text-[9px] text-[#A1A1AA]/60 mt-0.5">{f.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60">Coming Soon</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <Brain className="size-4" />, name: "AI Strategy", desc: "Smart earning insights" },
                          { icon: <Zap className="size-4" />, name: "Smart Maintenance", desc: "Predictive service alerts" },
                          { icon: <AlertCircle className="size-4" />, name: "AI Mileage Tracking", desc: "Automatic trip logging" },
                          { icon: <Star className="size-4" />, name: "Multi-App Export", desc: "One-tap tax season reports" },
                        ].map((f) => (
                          <div key={f.name} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.01] opacity-60 cursor-default">
                            <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                              {f.icon}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white leading-tight">{f.name}</p>
                              <p className="text-[9px] text-[#A1A1AA]/40 mt-0.5">{f.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {["Calculator", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#10B981] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href={APP_STORE_URL} className="hidden md:block">
              <Button className="bg-[#10B981] text-black font-black px-8 py-6 rounded-2xl hover:shadow-[0_0_30px_#10B98188] transition-all uppercase tracking-tighter text-sm">
                Download App
              </Button>
            </a>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 mx-auto max-w-7xl rounded-2xl bg-[#0B1120]/98 border border-white/[0.08] backdrop-blur-3xl p-6 space-y-1">
            {[
              { label: "Features", href: "#features" },
              { label: "Calculator", href: "#calculator" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#10B981] hover:bg-white/[0.03] rounded-xl transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.06]">
              <a href={APP_STORE_URL} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#10B981] text-black font-black rounded-xl uppercase tracking-tighter text-sm py-6">
                  Download on App Store
                </Button>
              </a>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-32 md:pt-40 pb-20 px-6 text-center max-w-7xl mx-auto space-y-10">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[8px] font-black uppercase tracking-[0.3em]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            Early Access · Now Available on iOS
          </div>

          {/* Motto */}
          <h1 className="text-4xl md:text-6xl md:text-[clamp(4.5rem,8vw,8rem)] font-black tracking-tighter leading-[0.85] uppercase">
            <span className="block hero-line-1">
              BEYOND THE
            </span>
            <span className="block hero-line-2 bg-gradient-to-r from-white to-white/20 bg-clip-text text-transparent">
              GUESS.
            </span>
            <span className="block hero-line-3">
              BEYOND THE
            </span>
            <span
              className="block hero-line-4 italic"
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399, #10B981, #34D399, #10B981)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'heroSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 1.1s forwards, shimmer 4s ease-in-out 2.5s infinite, heroGlow 3s ease-in-out 2.5s infinite',
                opacity: 0,
              }}
            >
              MILES.
            </span>
          </h1>

          {/* Subtitle */}
          <div className="space-y-3">
            <p className="hero-subtitle text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-[1.6] font-medium tracking-tight">
              Stop guessing your net profit. Real-time intelligence for the
              drivers who take their earnings seriously.
            </p>
          </div>

          {/* CTA */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <MagneticCTA>
              <a href={APP_STORE_URL} className="block">
                <Button className="h-18 px-12 rounded-2xl bg-[#10B981] text-black text-lg font-black uppercase tracking-tighter hover:scale-105 hover:shadow-[0_0_60px_#10B98166] transition-all duration-500 group">
                  Download on App Store
                  <ArrowRight className="size-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </a>
            </MagneticCTA>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <ShieldCheck className="size-5 text-[#10B981]" />
              <p className="text-xs font-black uppercase tracking-widest text-[#A1A1AA]">
                Built by Gig Drivers, For Gig Drivers
              </p>
            </div>
          </div>
        </section>

        {/* LOGO MARQUEE */}
        <section className="py-12 border-y border-white/[0.05] bg-black/20 overflow-hidden flex flex-col items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60 mb-8 text-center px-4">
            Built for the platforms you drive for
          </p>
          <div className="relative flex overflow-hidden w-full max-w-7xl mx-auto [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="animate-marquee flex w-max min-w-full shrink-0 flex-row items-center justify-around gap-16 py-4 px-8">
              {["UBER", "DOORDASH", "LYFT", "AMAZON FLEX", "INSTACART", "GRUBHUB"].map((b) => (
                <span key={b} className="text-2xl md:text-3xl font-black italic text-[#A1A1AA]/20 uppercase tracking-tighter">{b}</span>
              ))}
            </div>
            <div aria-hidden="true" className="animate-marquee flex w-max min-w-full shrink-0 flex-row items-center justify-around gap-16 py-4 px-8">
              {["UBER", "DOORDASH", "LYFT", "AMAZON FLEX", "INSTACART", "GRUBHUB"].map((b) => (
                <span key={b} className="text-2xl md:text-3xl font-black italic text-[#A1A1AA]/20 uppercase tracking-tighter">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <motion.section
          id="features"
          className="px-6 py-32 max-w-7xl mx-auto space-y-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={sectionReveal} className="space-y-6">
            <span className="text-[#A1A1AA] font-black uppercase tracking-[0.4em] text-[10px]">
              The Engine
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none uppercase">
              Features Built <br /> For Performance.
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[minmax(280px,auto)] gap-6">
            {[
              {
                title: "Net Profit Dashboard",
                desc: "Real-time gross vs. take-home breakdown. See what you actually earned — not just what the app paid.",
                icon: <TrendingUp className="size-8" />,
                className: "md:col-span-6 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-[#10B981]/10 text-[#10B981]",
              },
              {
                title: "Tax Ledger",
                desc: "Self-employment tax calculated automatically as you earn. No surprises at filing.",
                icon: <Receipt className="size-8" />,
                className: "md:col-span-6 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-emerald-500/10 text-emerald-500",
              },
              {
                title: "Expense Tracking",
                desc: "Log fuel, maintenance, and gear. Every cost categorized and deduction-ready.",
                icon: <TrendingDown className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-blue-500/10 text-blue-400",
              },
              {
                title: "Vehicle Depreciation",
                desc: "Year, make & model based depreciation built in. Know your true cost per mile.",
                icon: <Calculator className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-rose-500/10 text-rose-500",
              },
              {
                title: "Platform Analytics",
                desc: "Compare your real hourly rate across Uber, DoorDash, Lyft & more side by side.",
                icon: <Star className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-violet-500/10 text-violet-400",
              },
              {
                title: "Burnout Guard",
                desc: "Real-time fatigue monitoring. Know exactly when long hours stop making financial sense.",
                icon: <AlertCircle className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-amber-500/10 text-amber-500",
              },
              {
                title: "Year in Review",
                desc: "Your full-year earnings wrapped into one shareable card. Flex your hustle.",
                icon: <Zap className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-indigo-500/10 text-indigo-400",
              },
              {
                title: "No Ads. Ever.",
                desc: "Your focus is your profit. Zero ads, zero distractions — always.",
                icon: <EyeOff className="size-8" />,
                className: "md:col-span-4 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-[#10B981]/10 text-[#10B981]",
              },
              {
                title: "Privacy First",
                desc: "Your data is encrypted end-to-end. We never sell or share your earnings information.",
                icon: <Lock className="size-8" />,
                className: "md:col-span-6 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-slate-500/10 text-slate-400",
              },
              {
                title: "Mileage Tracking",
                desc: "Log every business mile. Maximize your deductible and reduce your tax bill.",
                icon: <ShieldCheck className="size-8" />,
                className: "md:col-span-6 md:row-span-1 flex flex-col justify-between",
                iconBg: "bg-teal-500/10 text-teal-400",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={sectionReveal}
                className={`p-8 rounded-3xl glass-card glass-card-hover hover-spring group relative overflow-hidden ${f.className}`}
              >
                <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none ${f.iconBg.split(' ')[0]}`} />
                <div className={`size-12 rounded-xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform ${f.iconBg}`}>
                  <div className="scale-75">{f.icon}</div>
                </div>
                <div className="relative z-10 w-full mt-auto">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-2">
                    {f.title}
                  </h4>
                  <p className="text-[13px] font-medium text-[#A1A1AA] leading-relaxed italic max-w-[90%]">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* REALITY ENGINE */}
          <div className="space-y-4 pt-16">
            <span className="text-[#A1A1AA] font-black uppercase tracking-[0.4em] text-[10px]">
              The Truth
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none uppercase">
              THE REALITY <br /> ENGINE.
            </h2>
            <p className="text-lg text-[#A1A1AA] font-medium max-w-xl leading-relaxed">
              Most drivers only see what the app pays them. GigMiles shows you what you actually take home — after every hidden cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Waterfall Breakdown */}
            <div className="md:col-span-12 lg:col-span-7 group relative p-8 lg:p-10 rounded-3xl glass-card overflow-hidden hover:border-white/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60 mb-1.5">What Drivers See</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">${gross.toLocaleString()}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#A1A1AA]/40 mt-1">Weekly Gross</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/20 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#10B981]/60 mb-1.5">What They Keep</p>
                    <p className="text-3xl font-black text-[#10B981] italic tracking-tighter">${Math.round(netProfit).toLocaleString()}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#10B981]/40 mt-1">True Net</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60">
                      Where Your Money Goes
                    </h3>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/60 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
                      National Avg.
                    </span>
                  </div>
                  {[
                    { label: "Fuel & Gas", pct: 14, color: "bg-amber-500", textColor: "text-amber-500", amount: Math.round(gross * 0.14) },
                    { label: "Vehicle Wear", pct: 10, color: "bg-orange-500", textColor: "text-orange-500", amount: Math.round(gross * 0.10) },
                    { label: "Depreciation", pct: 11, color: "bg-red-400", textColor: "text-red-400", amount: Math.round(gross * 0.11) },
                    { label: "Self-Employment Tax", pct: 15.3, color: "bg-red-500", textColor: "text-red-500", amount: Math.round(gross * 0.153) },
                  ].map((item) => (
                    <div key={item.label} className="group/row">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                          <TrendingDown className={`size-3 ${item.textColor}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A1A1AA]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-[#A1A1AA]/40">~{item.pct}%</span>
                          <span className={`text-sm font-black italic ${item.textColor}`}>-${item.amount}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.pct * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Estimated Take-Home</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[#10B981] italic tracking-tighter">${Math.round(netProfit).toLocaleString()}</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#10B981]/60">
                          ~{((netProfit / gross) * 100).toFixed(0)}% kept
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-[#10B981] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                        style={{ width: `${(netProfit / gross) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/15 flex items-start gap-4">
                  <ShieldCheck className="size-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-white">These are national averages — your reality is different.</p>
                    <p className="text-[10px] font-medium text-[#A1A1AA]/60 leading-relaxed">
                      GigMiles calculates your real costs based on your vehicle make, model, year, fuel type, and state tax rates. No guessing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Every Mile Counts */}
            <div className="md:col-span-12 lg:col-span-5 p-10 md:p-12 rounded-[2rem] md:rounded-[4rem] bg-[#10B981] text-black flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-black/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <Receipt className="size-16 fill-black mb-6" />
                <div className="space-y-6 flex-1">
                  <h3 className="text-4xl font-black tracking-tighter leading-[0.9]">
                    EVERY <br /> MILE <br /> COUNTS.
                  </h3>
                  <p className="text-black/70 text-base font-bold leading-snug">
                    Every untracked mile is money left on the table. Every missed receipt is a tax deduction you&apos;ll never get back.
                  </p>
                  <div className="space-y-3 py-4">
                    {[
                      { stat: "$0.725/mi", label: "IRS Mileage Rate 2026" },
                      { stat: "Your Car", label: "Personalized Cost Data" },
                      { stat: "30 sec", label: "To Log a Trip" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-baseline gap-3">
                        <span className="text-2xl font-black italic tracking-tighter">{item.stat}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-black/40">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a href={APP_STORE_URL}>
                  <Button className="w-full h-14 rounded-xl bg-black text-[#10B981] font-black uppercase tracking-tighter text-base mt-4 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all">
                    Download on App Store
                  </Button>
                </a>
              </div>
            </div>

            {/* Calculator */}
            <div
              id="calculator"
              className="md:col-span-12 lg:col-span-12 p-8 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[5rem] glass-card relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calculator className="size-44 text-[#10B981]" />
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <h3 className="text-4xl lg:text-6xl font-black tracking-tighter italic uppercase">
                    THE <br /> CALCULATOR.
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">
                        Weekly Revenue
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        value={gross}
                        onChange={(e) => setGross(Number(e.target.value))}
                        className="w-full accent-[#10B981] h-2 cursor-pointer"
                      />
                      <p className="text-3xl font-black text-white italic">
                        ${gross.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">
                        Online Hours
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full accent-[#10B981] h-2 cursor-pointer"
                      />
                      <p className="text-3xl font-black text-white italic">
                        {hours} HOURS
                      </p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-10 flex flex-col justify-center items-center text-center space-y-5">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#10B981]">
                    True Earnings
                  </span>
                  <p key={realHourly} className="text-6xl font-black tracking-tighter text-white italic animate-number-pop">
                    ${realHourly.toFixed(2)}
                  </p>
                  <p className="text-[#A1A1AA] font-bold text-base">
                    Net Hourly Revenue
                  </p>

                  <div
                    className={`w-full p-5 rounded-2xl border ${burnoutStatus.borderColor} ${burnoutStatus.bgColor} transition-all duration-500 flex items-start gap-4 text-left group/burnout`}
                  >
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5 ${burnoutStatus.color} group-hover/burnout:scale-110 transition-transform`}
                    >
                      <div className="scale-75">{burnoutStatus.icon}</div>
                    </div>
                    <div className="space-y-1">
                      <h4 className={`font-black uppercase tracking-tighter text-xs ${burnoutStatus.color}`}>
                        {burnoutStatus.label}
                      </h4>
                      <p className="text-[10px] font-bold text-[#A1A1AA] leading-snug">
                        {burnoutStatus.description}
                      </p>
                    </div>
                  </div>

                  <a href={APP_STORE_URL} className="w-full block">
                    <Button className="w-full h-16 bg-[#10B981] text-black text-lg font-black rounded-2xl uppercase tracking-tighter">
                      Download on App Store
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* PRICING */}
            <div
              id="pricing"
              className="md:col-span-12 space-y-10"
            >
              <div className="text-center space-y-4">
                <span className="text-[#A1A1AA] font-black uppercase tracking-[0.4em] text-[10px]">Pricing</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                  Simple, Honest <br /> Pricing.
                </h2>
                <p className="text-lg text-[#A1A1AA] font-medium">
                  Start free. Stay free if you&apos;re early enough.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Trial */}
                <div className="relative p-8 rounded-3xl bg-[#10B981]/5 border-2 border-[#10B981]/40 flex flex-col gap-6 hover:border-[#10B981]/60 transition-colors">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-[#10B981] text-black text-[9px] font-black uppercase tracking-[0.3em]">
                      Early Access
                    </span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10B981]/60">Free Trial</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white italic tracking-tighter">FREE</span>
                    </div>
                    <p className="text-sm text-[#A1A1AA] font-medium">14 Days · No Credit Card</p>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {["Full Access to All Features", "No Ads. Ever.", "Early Access Perks", "Priority Support"].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm font-bold text-white/80">
                        <Check className="size-4 text-[#10B981] shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  <a href={APP_STORE_URL}>
                    <Button className="w-full h-14 bg-[#10B981] text-black font-black rounded-2xl uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                      Download on App Store
                    </Button>
                  </a>
                </div>

                {/* Monthly */}
                <div className="p-8 rounded-3xl glass-card flex flex-col gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60">Monthly</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white italic tracking-tighter">$7.99</span>
                      <span className="text-sm text-[#A1A1AA] font-bold">/mo</span>
                    </div>
                    <p className="text-sm text-[#A1A1AA] font-medium">After 14-day free trial</p>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {["Full Access to All Features", "No Ads. Ever.", "Cancel Anytime"].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm font-bold text-white/80">
                        <Check className="size-4 text-[#10B981] shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  <a href={APP_STORE_URL}>
                    <Button className="w-full h-14 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-tighter hover:bg-white/10 transition-all">
                      Start Free Trial
                    </Button>
                  </a>
                </div>

                {/* Annual */}
                <div className="relative p-8 rounded-3xl glass-card flex flex-col gap-6">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-[0.3em]">
                      Best Value
                    </span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60">Annual</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white italic tracking-tighter">$59.99</span>
                      <span className="text-sm text-[#A1A1AA] font-bold">/yr</span>
                    </div>
                    <p className="text-sm text-[#10B981] font-bold">~$5/mo · Save 37%</p>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {["Full Access to All Features", "No Ads. Ever.", "2 Months Free", "Priority Support", "Cancel Anytime"].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm font-bold text-white/80">
                        <Check className="size-4 text-[#10B981] shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  <a href={APP_STORE_URL}>
                    <Button className="w-full h-14 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-tighter hover:bg-white/10 transition-all">
                      Start Free Trial
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </motion.section>

        {/* TRUST & FAQ */}
        <section className="px-6 py-32 bg-black/20">
          <div className="max-w-4xl mx-auto space-y-20">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                Engineered for Trust.
              </h2>
              <p className="text-xl text-[#A1A1AA] font-medium leading-relaxed">
                We never store your gig passwords. We never sell your data. We
                are drivers building for drivers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  q: "Is it secure?",
                  a: "Bank-level 256-bit encryption. Your data is your property, always.",
                },
                {
                  q: "Why do I need this?",
                  a: "Because gross earnings are a lie. Tax season shouldn't be a nightmare.",
                },
                {
                  q: "Multi-app support?",
                  a: "Yes. Uber, DoorDash, Lyft, Amazon Flex and more are supported natively.",
                },
                {
                  q: "Can I cancel?",
                  a: "At any moment. No hidden fees. No friction.",
                },
              ].map((item) => (
                <div key={item.q} className="space-y-4 group">
                  <h4 className="text-lg font-black tracking-tight text-white group-hover:text-[#10B981] transition-colors">
                    {item.q}
                  </h4>
                  <p className="text-[#A1A1AA] font-medium leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-44 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/10 via-transparent to-transparent" />
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-10">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
              EARLY <br />{" "}
              <span className="text-[#10B981]">ACCESS.</span>
            </h2>
            <MagneticCTA className="mx-auto max-w-fit">
              <a href={APP_STORE_URL} className="block">
                <Button className="h-24 px-16 rounded-2xl bg-[#10B981] text-black text-2xl font-black uppercase tracking-tighter hover:scale-110 hover:shadow-[0_0_80px_#10B98188] transition-all duration-700">
                  Download on App Store
                </Button>
              </a>
            </MagneticCTA>
            <p className="text-sm text-[#A1A1AA]/60 font-bold uppercase tracking-widest">
              14-day free trial · No credit card required
            </p>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/[0.05] relative z-10 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <Logo className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest opacity-40">
            © 2026 GIGMILES
          </p>
        </div>
      </footer>
    </div>
  );
}
