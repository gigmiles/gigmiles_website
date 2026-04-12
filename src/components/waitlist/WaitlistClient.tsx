"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { VibeLogo as Logo } from "@/components/brand/VibeLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, FileText } from "lucide-react";
import { ProfitCalculator } from "@/components/waitlist/ProfitCalculator";

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
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
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Feature Cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Calculator className="size-5 text-[#10b981]" />,
    title: "Auto Depreciation",
    desc: "$0.70/mile IRS rate calculated automatically",
  },
  {
    icon: <TrendingUp className="size-5 text-[#10b981]" />,
    title: "Real Net Profit",
    desc: "All platforms: DoorDash, Uber, Instacart & 6 more",
  },
  {
    icon: <FileText className="size-5 text-[#10b981]" />,
    title: "Tax Ready",
    desc: "Quarterly estimates + Schedule C export",
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I thought I was making $18/hr. GigMiles showed me I was actually losing $2/hr after depreciation. Total game changer.",
    name: "Sarah M.",
    role: "DoorDash Driver · 3 years",
  },
  {
    quote: "Finally, a tool that shows what I actually take home. I cut my hours on bad routes and tripled my real profit.",
    name: "Mike T.",
    role: "Uber Eats & Instacart",
  },
  {
    quote: "The IRS depreciation math alone saved me $1,200 on my taxes. Worth every penny.",
    name: "Daniela R.",
    role: "Full-time gig driver",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export function WaitlistClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [spotCount, setSpotCount] = useState<number>(0);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist/count");
        if (res.ok) {
          const data = await res.json() as { count: number; remaining: number; isFull: boolean };
          setSpotCount(data.count);
          setIsFull(data.isFull);
        }
      } catch {
        // fail silently — UI still works
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setPosition(data.position);
      setSpotCount((prev) => prev + 1);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div
      className="min-h-screen w-full font-sans"
      style={{ backgroundColor: "#080c14", color: "#e2e8f0" }}
    >
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="w-full px-6 py-5 flex items-center justify-between max-w-2xl mx-auto">
        <Logo size="sm" />
        <span className="text-xs text-slate-500 font-medium tracking-wide hidden sm:block">
          Real net profit for gig drivers
        </span>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">

          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <motion.section
            className="pt-12 pb-10 text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#10b981",
                }}
              >
                <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse inline-block" />
                Founding Member · 500 Spots Only
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeSlideUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight text-white mb-5"
            >
              Track Your{" "}
              <span className="text-[#10b981]">REAL</span>{" "}
              Net Profit
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeSlideUp}
              className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg mx-auto mb-10"
            >
              Finally know your real hourly rate — after every mile, tax, and cost.
            </motion.p>

            {/* Interactive Profit Calculator */}
            <motion.div variants={scaleIn} className="mx-auto max-w-md">
              <ProfitCalculator
                onJoinWaitlist={() => {
                  document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </motion.div>
          </motion.section>

          {/* ── Email Capture ─────────────────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <div
              id="waitlist-form"
              className="rounded-2xl p-7 sm:p-9"
              style={{
                backgroundColor: "#0d1220",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              {/* ── Spot Counter ── */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    🔥 Founding Member spots
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    <span className="text-[#10b981] font-bold">{spotCount}</span>
                    <span className="text-slate-600"> / 500 claimed</span>
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((spotCount / 500) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  {isFull
                    ? "All spots are claimed."
                    : <><span className="text-amber-400 font-semibold">{500 - spotCount} spots left</span> at $59.99/year — goes to $99.99 at launch</>
                  }
                </p>
              </div>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center py-4"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-lg font-bold text-white mb-1">
                    ✓ You&apos;re on the list!
                  </p>
                  {position && (
                    <p className="text-sm text-slate-400 mb-1">
                      You&apos;re <span className="text-[#10b981] font-semibold">#{position}</span> in line.
                    </p>
                  )}
                  <p className="text-sm text-slate-500">Check your inbox for confirmation.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Claim your Founding Member spot
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Lock in <span className="text-[#10b981] font-semibold">$59.99/year</span> forever — only 500 spots available.{" "}
                    Standard price at launch: $99.99/year.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        error={status === "error" ? errorMsg : undefined}
                        disabled={status === "loading"}
                        required
                        aria-label="Email address"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full sm:w-auto shrink-0 bg-[#10b981] hover:bg-[#059669] text-white font-black transition-all duration-200"
                      style={{
                        boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 50px rgba(16, 185, 129, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 30px rgba(16, 185, 129, 0.2)";
                      }}
                    >
                      {status === "loading" ? "Joining…" : "Join Waitlist →"}
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Founding Member badge included. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </motion.section>

          {/* ── Founding Member Benefits ─────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: "#0d1220",
                border: "1px solid rgba(16, 185, 129, 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  Founding Member
                </span>
                <span className="text-xs text-slate-500">· 500 spots only</span>
              </div>

              <ul className="space-y-3">
                {[
                  { icon: "💰", text: "$59.99/year locked in forever — never increases" },
                  { icon: "🏅", text: "Exclusive Founding Member badge in the app" },
                  { icon: "⚡", text: "Early access to every new feature before public release" },
                  { icon: "🗳️", text: "Priority voice in product decisions — your feedback shapes the roadmap" },
                  { icon: "🔒", text: "Private Founding Member community channel" },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    variants={fadeSlideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-base leading-none mt-0.5">{item.icon}</span>
                    <span className="text-sm text-slate-300 leading-relaxed">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* ── Features ──────────────────────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <h2 className="font-display text-xl font-bold text-white text-center mb-6">
              Everything you need to stop guessing
            </h2>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:grid sm:grid-cols-3 snap-x snap-mandatory sm:snap-none">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="shrink-0 w-64 sm:w-auto snap-start rounded-2xl p-5"
                  style={{
                    backgroundColor: "#0d1220",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── Social Proof ──────────────────────────────────────────────────── */}
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <h2 className="font-display text-xl font-bold text-white text-center mb-6">
              Gig workers need this
            </h2>

            <div className="space-y-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeSlideUp}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: "#0d1220",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="text-[#10b981] text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-[#10b981]"
                      style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{t.name}</p>
                      <p className="text-[10px] text-slate-600">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="text-center py-6 px-4 text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p>
          © 2026 GigMiles
          {" · "}
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
