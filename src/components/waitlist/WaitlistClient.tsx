"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ProfitCalculator } from "@/components/waitlist/ProfitCalculator";

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeSlideUp = {
  hidden: { opacity: 0, y: 32 },
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
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// ─── Static content ───────────────────────────────────────────────────────────

const BENEFITS = [
  "10 days fully free during beta — no card required",
  "Locked-in early-access pricing if you upgrade",
  "Direct Slack channel with the founding team",
  "Vote on the public product roadmap",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function WaitlistClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    if (source || medium || campaign) {
      setRef([source, medium, campaign].filter(Boolean).join("|"));
    }
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/waitlist/count");
        if (res.ok) {
          const data = (await res.json()) as { count: number; remaining: number; isFull: boolean };
          setIsFull(data.isFull);
        }
      } catch {
        // fail silently
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
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
        body: JSON.stringify({ email, ref }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setPosition(data.position);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050B12] text-[#E2E8F0] font-[family-name:var(--font-dm-sans)]">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-14 py-5 bg-[#050B12]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="GigMiles" width={26} height={26} className="rounded-[6px]" />
          <span className="text-white/75 text-[13px] tracking-[-0.01em] font-medium font-[family-name:var(--font-space-grotesk)]">
            GigMiles
          </span>
        </Link>
        <Link
          href="/"
          className="text-white/45 text-[11px] tracking-[0.06em] hover:text-white/75 transition-colors font-[family-name:var(--font-space-grotesk)]"
        >
          ← Back to site
        </Link>
      </nav>

      <main className="pt-24 pb-20 px-6 md:px-14">
        <div className="max-w-2xl mx-auto">
          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <motion.section
            className="pt-12 pb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeSlideUp}
              className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3"
            >
              <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
              Early access
            </motion.p>

            <motion.h1
              variants={fadeSlideUp}
              className="font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.035em] leading-[1.05] text-white text-[clamp(36px,6vw,64px)] mb-5"
            >
              Reserve your spot.
              <br />
              <span className="text-white/40">Know what you actually keep.</span>
            </motion.h1>

            <motion.p
              variants={fadeSlideUp}
              className="text-[#94A3B8] text-[15px] sm:text-[16px] leading-relaxed max-w-md font-[family-name:var(--font-dm-sans)]"
            >
              GigMiles is in private beta. The first 5,000 drivers get full access — and a real influence on the product
              before launch.
            </motion.p>
          </motion.section>

          {/* ── Email Capture ────────────────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <div
              id="waitlist-form"
              className="border border-white/[0.07] bg-[#08111F] p-7 sm:p-9"
            >
              {/* Status indicator (no claim count exposed) */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/55 text-[11px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]">
                    Early access
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-grotesk)]">
                    <span className="relative flex h-2 w-2">
                      {!isFull && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#14B8A6]/40 animate-ping" />
                      )}
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          isFull ? "bg-[#FBBF24]" : "bg-[#14B8A6]"
                        }`}
                      />
                    </span>
                    <span className={isFull ? "text-[#FBBF24]/85" : "text-[#14B8A6]/85"}>
                      {isFull ? "Cohort full" : "Open"}
                    </span>
                  </span>
                </div>
                <div className="w-full h-px bg-[#14B8A6]/30" />
                <p className="mt-3 text-[11px] text-white/35 font-[family-name:var(--font-dm-sans)] leading-relaxed">
                  {isFull
                    ? "First cohort is full. Join the waitlist for the next one."
                    : "Private beta · limited to 5,000 drivers · 10-day free trial · no card required"}
                </p>
              </div>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-white/[0.06] pt-6"
                >
                  <p className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)] mb-3">
                    You&apos;re in
                  </p>
                  <p className="text-white text-[20px] font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.02em] mb-2">
                    Welcome to GigMiles.
                  </p>
                  {position && (
                    <p className="text-[#94A3B8] text-[14px] mb-1 font-[family-name:var(--font-dm-sans)]">
                      You&apos;re{" "}
                      <span className="text-[#14B8A6] font-[family-name:var(--font-space-grotesk)] font-semibold tabular-nums">
                        #{position}
                      </span>{" "}
                      in line.
                    </p>
                  )}
                  <p className="text-[#94A3B8]/70 text-[13px] font-[family-name:var(--font-dm-sans)]">
                    Confirmation in your inbox. We&apos;ll reach out as spots open.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <label
                    htmlFor="waitlist-email"
                    className="block text-white/75 text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium mb-2"
                  >
                    Get on the list
                  </label>
                  <p className="text-[#94A3B8] text-[12px] mb-4 font-[family-name:var(--font-dm-sans)] leading-relaxed">
                    We&apos;ll email when your access opens. One message — no marketing spam.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        id="waitlist-email"
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

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="shrink-0 bg-[#14B8A6] text-[#050B12] text-[12px] tracking-[0.08em] font-[family-name:var(--font-space-grotesk)] font-semibold px-8 py-3 transition-all duration-200 hover:bg-[#14B8A6]/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? "Joining…" : "Join Waitlist"}
                    </button>
                  </div>

                  <p className="mt-3 text-[11px] text-white/30 font-[family-name:var(--font-dm-sans)]">
                    By joining you agree to occasional updates. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </motion.section>

          {/* ── What's included ──────────────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16"
          >
            <p className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
              <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
              What you get
            </p>
            <h2 className="text-white text-[clamp(22px,3vw,32px)] font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.025em] leading-[1.15] mb-8 max-w-md">
              Beta access, real influence, no fluff.
            </h2>

            <motion.ul
              className="border border-white/[0.07] divide-y divide-white/[0.06]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {BENEFITS.map((benefit) => (
                <motion.li
                  key={benefit}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="flex items-start gap-4 px-5 py-4 sm:px-6 bg-[#08111F]"
                >
                  <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center border border-[#14B8A6]/30 bg-[#14B8A6]/[0.06]">
                    <span className="text-[#14B8A6] text-[10px]">✓</span>
                  </span>
                  <span className="text-[14px] text-[#CBD5E1] font-[family-name:var(--font-dm-sans)] leading-relaxed">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>

          {/* ── Profit Calculator ────────────────────────────────────────────── */}
          <motion.section
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-8"
          >
            <p className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
              <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
              Try it now
            </p>
            <h2 className="text-white text-[clamp(22px,3vw,32px)] font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.025em] leading-[1.15] mb-8 max-w-md">
              See your real net profit in 30 seconds.
            </h2>

            <ProfitCalculator
              onJoinWaitlist={() => {
                document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </motion.section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 md:px-14 py-8">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/30 text-[11px] font-[family-name:var(--font-dm-sans)]">
            © {new Date().getFullYear()} GigMiles
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-white/35 text-[11px] tracking-[0.04em] hover:text-white/65 transition-colors font-[family-name:var(--font-space-grotesk)]"
            >
              Home
            </Link>
            <Link
              href="/privacy"
              className="text-white/35 text-[11px] tracking-[0.04em] hover:text-white/65 transition-colors font-[family-name:var(--font-space-grotesk)]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-white/35 text-[11px] tracking-[0.04em] hover:text-white/65 transition-colors font-[family-name:var(--font-space-grotesk)]"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
