'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { HeroMeltdown } from './hero/HeroMeltdown'

gsap.registerPlugin(ScrollTrigger)

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-14 py-5 transition-all duration-500 ${
        scrolled ? 'bg-[#050B12]/95 backdrop-blur-xl border-b border-white/[0.06]' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/logo-icon.png" alt="GigMiles" width={26} height={26} className="rounded-[6px]" />
        <span className="text-white/75 text-[13px] tracking-[-0.01em] font-medium font-[family-name:var(--font-space-grotesk)]">GigMiles</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {[
          ['Why It Matters', '#why'],
          ['How It Works', '#how'],
          ['Calculator', '#calculator'],
          ['Pricing', '#pricing'],
        ].map(([label, href]) => (
          <a key={label} href={href} className="text-white/35 text-[11px] tracking-[0.04em] hover:text-white/65 transition-colors font-[family-name:var(--font-space-grotesk)]">
            {label}
          </a>
        ))}
      </div>
      <a
        href="/waitlist"
        className="text-white/55 text-[11px] tracking-[0.04em] border border-white/[0.14] px-5 py-2 transition-all duration-200 hover:border-white/30 hover:text-white/80 active:scale-[0.98] font-[family-name:var(--font-space-grotesk)]"
      >
        Join Early Access
      </a>
    </nav>
  )
}

// ─── Platform logo wall ───────────────────────────────────────────────────────
const PLATFORMS = ['Uber', 'Lyft', 'DoorDash', 'Instacart', 'Amazon Flex', 'GrubHub', 'Shipt', 'Spark']

function PlatformWall() {
  return (
    <div className="relative bg-[#08111F] border-t border-b border-white/[0.06] py-5 px-5 md:px-14 overflow-hidden">
      {/* Top fade-in: blends from hero #050B12 into platform wall #08111F */}
      <div className="absolute inset-x-0 -top-16 h-16 pointer-events-none bg-gradient-to-b from-[#050B12] to-transparent" />
      <div className="max-w-5xl mx-auto flex items-center gap-10 flex-wrap justify-center">
        <p className="text-white/20 text-[10px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)]">Works with</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {PLATFORMS.map(p => (
            <span key={p} className="text-white/30 text-[11px] tracking-[0.08em] font-[family-name:var(--font-space-grotesk)]">{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Anchor banner ───────────────────────────────────────────────────────────
function AnchorBanner() {
  const stats = [
    { val: '$88', label: 'avg. hidden costs per shift' },
    { val: '$0.23', label: 'reserve per dollar earned' },
    { val: '62%', label: 'of gross you actually keep' },
  ]
  return (
    <div className="bg-[#08111F] border-b border-white/[0.06] py-5 px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-0 flex-wrap">
        {stats.map((s, i) => (
          <div key={s.val} className="flex items-center">
            <div className="flex items-baseline gap-2 px-6 py-1 text-center">
              <span className="text-white/80 text-[15px] font-semibold font-[family-name:var(--font-space-grotesk)] tracking-[-0.02em]">{s.val}</span>
              <span className="text-white/30 text-[11px] font-[family-name:var(--font-dm-sans)]">{s.label}</span>
            </div>
            {i < stats.length - 1 && <span className="text-white/[0.12] text-[16px] select-none">|</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal(ref: React.RefObject<HTMLElement | null>, start = 'top 70%') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-r]'), {
        opacity: 0,
        y: 40,
        duration: 1.0,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, toggleActions: 'play none none reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [ref, start])
}

// ─── Waterfall "Real Example" section ────────────────────────────────────────
function WaterfallSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const gross = useCountUp(235, 900, active)
  const vehicle = useCountUp(57, 900, active)
  const taxes = useCountUp(31, 900, active)
  const net = useCountUp(147, 1100, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      onEnter: () => setActive(true),
      onLeaveBack: () => setActive(false),
    })
    return () => trigger.kill()
  }, [])

  const rows = [
    { label: 'Gross earnings', val: `$${gross}`, color: 'text-white/90', pct: 100 },
    { label: 'Vehicle costs', val: `−$${vehicle}`, color: 'text-[#F87171]', pct: Math.round((vehicle / 235) * 100) },
    { label: 'Estimated taxes', val: `−$${taxes}`, color: 'text-[#FBBF24]', pct: Math.round((taxes / 235) * 100) },
  ]

  return (
    <section id="why" ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Real example
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          What a typical shift actually pays
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-10 sm:mb-16 max-w-lg font-[family-name:var(--font-dm-sans)]">
          9 hours · DoorDash, Uber Eats, Amazon Flex · based on IRS mileage rate $0.725/mi (2026)
        </p>

        <div className="border border-white/[0.07] bg-[#050B12]">
          {/* header */}
          <div className="px-5 sm:px-8 py-5 border-b border-white/[0.06] flex items-baseline justify-between flex-wrap gap-4">
            <span className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium">Shift breakdown</span>
            <div className="flex gap-5 sm:gap-8 flex-wrap">
              {[['Platform', 'DoorDash + Uber Eats'], ['Miles', '112 mi'], ['Hours', '9.0 h']].map(([l, v]) => (
                <div key={l} className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/25 tracking-[0.1em] uppercase font-[family-name:var(--font-space-grotesk)]">{l}</span>
                  <span className="text-[13px] font-semibold text-[#94A3B8] font-[family-name:var(--font-space-grotesk)]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2">
            {/* waterfall */}
            <div className="px-5 py-6 sm:px-8 sm:py-8 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col gap-0">
              {rows.map(row => (
                <div key={row.label} className="py-4 border-b border-white/[0.04] last:border-b-0">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[13px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">{row.label}</span>
                    <span className={`font-[family-name:var(--font-space-grotesk)] font-semibold text-[16px] ${row.color}`}>{row.val}</span>
                  </div>
                  <div className="h-px bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-white/20 transition-all duration-[900ms] ease-out"
                      style={{ width: active ? `${row.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}

              {/* net result */}
              <div className={`mt-5 px-5 py-5 border flex justify-between items-baseline transition-all duration-700 delay-700 ${active ? 'border-[#14B8A6]/25 bg-[#14B8A6]/[0.04] opacity-100' : 'border-white/[0.04] opacity-20'}`}>
                <span className="text-[11px] text-[#14B8A6] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">Real take-home</span>
                <span className="text-[42px] font-bold tracking-[-0.05em] text-[#10B981] leading-none font-[family-name:var(--font-space-grotesk)]">${net}</span>
              </div>
            </div>

            {/* stats */}
            <div className="px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06]">
                {[
                  ['Hourly rate', '$16.33', 'after all costs'],
                  ['Tax reserve', '$0.13', 'per dollar earned'],
                  ['Vehicle cost', '$0.24', 'per dollar gross'],
                  ['Effective rate', '62%', 'of gross kept'],
                ].map(([l, v, s]) => (
                  <div key={l} className="bg-[#050B12] px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-1">
                    <span className="text-[10px] text-white/25 tracking-[0.1em] uppercase font-[family-name:var(--font-space-grotesk)]">{l}</span>
                    <span className="text-[20px] sm:text-[22px] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-space-grotesk)]">{v}</span>
                    <span className="text-[11px] text-white/30 font-[family-name:var(--font-dm-sans)]">{s}</span>
                  </div>
                ))}
              </div>

              <div className="border border-white/[0.06] px-5 py-4 bg-[#14B8A6]/[0.03]">
                <p className="text-[11px] text-[#14B8A6] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] mb-2">GigMiles insight</p>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                  You kept 62% of gross earnings. The IRS mileage deduction adds $81 in write-offs this shift — about ~$18 less in taxes.
                </p>
              </div>

              <p className="text-[11px] text-white/20 italic font-[family-name:var(--font-dm-sans)] leading-relaxed">
                Estimates based on IRS standard mileage rate. Actual taxes vary by state and filing status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How it Works — Sticky Storyboard ────────────────────────────────────────
const HOW_SCENES = [
  {
    n: '01',
    label: 'What you grossed',
    amount: '$235',
    color: '#10B981',
    sub: '9h · DoorDash + Uber Eats · 112 mi',
    img: '/ss-quarterly.jpeg',
    imgAlt: 'Shift earnings',
  },
  {
    n: '02',
    label: 'What it cost to drive',
    amount: '−$57',
    color: '#EF4444',
    sub: 'Gas · mileage at IRS rate · wear & tear',
    img: '/ss-expense-gaps.jpeg',
    imgAlt: 'Expense gaps',
  },
  {
    n: '03',
    label: 'What the IRS takes',
    amount: '−$31',
    color: '#F59E0B',
    sub: 'Self-employment tax + state income tax',
    img: '/ss-tax-breakdown.jpeg',
    imgAlt: 'Tax breakdown',
  },
  {
    n: '04',
    label: 'What you actually keep',
    amount: '$147',
    color: '#14B8A6',
    sub: '$16.33 / hr — after every cost',
    img: '/ss-quarterly.jpeg',
    imgAlt: 'Real take-home',
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeScene, setActiveScene] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActiveScene(Math.min(3, Math.floor(v * 4)))
  })

  const scene = HOW_SCENES[activeScene]

  return (
    <section id="how" ref={sectionRef} className="relative bg-[#050B12] border-t border-white/[0.06] min-h-[300vh]">
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden hidden md:flex">
        {/* Left — narrative */}
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-16 gap-8 relative">
          {/* Section eyebrow — stays fixed */}
          <div>
            <p className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-3 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
              <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
              How it works
            </p>
            <h2 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(22px,3vw,38px)] max-w-xs">
              One shift.<br />Every number.
            </h2>
          </div>

          {/* Scene content — animates */}
          <div className="flex flex-col gap-4" key={activeScene} style={{ animation: 'howFadeUp 0.4s ease both' }}>
            <span className="text-white/20 text-[11px] tracking-[0.2em] font-[family-name:var(--font-space-grotesk)]">
              {scene.n} / 04
            </span>
            <div
              className="font-[family-name:var(--font-space-grotesk)] font-extralight tracking-[-0.05em] leading-none tabular-nums"
              style={{ fontSize: 'clamp(56px, 8vw, 96px)', color: scene.color }}
            >
              {scene.amount}
            </div>
            <p className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[18px] lg:text-[20px] tracking-[-0.02em]">
              {scene.label}
            </p>
            <p className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-dm-sans)] leading-relaxed max-w-[260px]">
              {scene.sub}
            </p>
          </div>

          {/* Dot pagination */}
          <div className="flex gap-2.5 items-center">
            {HOW_SCENES.map((s, i) => (
              <div
                key={s.n}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === activeScene ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === activeScene ? '#14B8A6' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right — phone image stack */}
        <div className="w-[45%] lg:w-[40%] flex items-center justify-center overflow-hidden relative bg-[#08111F] border-l border-white/[0.06]">
          <div
            className="absolute inset-0 transition-none"
            style={{
              background: `radial-gradient(circle 300px at 50% 50%, ${scene.color}10, transparent 70%)`,
              transition: 'background 0.6s ease',
            }}
          />
          <div
            className="relative h-full w-full overflow-hidden"
          >
            {HOW_SCENES.map((s, i) => (
              <div
                key={s.n}
                className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                style={{
                  opacity: i === activeScene ? 1 : 0,
                  transform: `translateY(${(i - activeScene) * 60}px)`,
                  pointerEvents: i === activeScene ? 'auto' : 'none',
                }}
              >
                <div className="relative w-[160px] lg:w-[190px] flex-shrink-0">
                  <div className="relative bg-[#0F1623] border-2 border-white/[0.10] rounded-[36px] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                    <div className="bg-[#050B12] rounded-[28px] overflow-hidden aspect-[9/19] relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-[#0F1623] rounded-b-xl z-10" />
                      <Image src={s.img} alt={s.imgAlt} fill className="object-cover object-top" sizes="190px" />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 rounded-[36px] -z-10 blur-2xl scale-110"
                    style={{ backgroundColor: scene.color, opacity: 0.06 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile: 4 stacked cards (no sticky) ── */}
      <div className="md:hidden px-5 py-16 flex flex-col gap-px bg-white/[0.06]">
        <p className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-8 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          How it works
        </p>
        {HOW_SCENES.map(s => (
          <div key={s.n} className="bg-[#050B12] p-7 flex flex-col gap-3">
            <span className="text-white/20 text-[10px] tracking-[0.2em] font-[family-name:var(--font-space-grotesk)]">{s.n} / 04</span>
            <div
              className="font-[family-name:var(--font-space-grotesk)] font-extralight text-[56px] tracking-[-0.05em] leading-none tabular-nums"
              style={{ color: s.color }}
            >
              {s.amount}
            </div>
            <p className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[17px] tracking-[-0.02em]">{s.label}</p>
            <p className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-dm-sans)] leading-relaxed">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Animated count-up hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, active = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    let raf: number
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(ease * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])
  return value
}

// ─── Animated bar fill hook ───────────────────────────────────────────────────
function useBarFill(pct: number, delay = 0, active = false) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      setWidth(pct)
    }, delay)
    return () => clearTimeout(t)
  }, [active, pct, delay])
  return width
}

// ─── Widget: Tax Breakdown ────────────────────────────────────────────────────
function TaxBreakdownWidget({ active }: { active: boolean }) {
  const se = useCountUp(115, 1000, active)
  const state = useCountUp(37, 900, active)
  const total = useCountUp(152, 1100, active)
  const seBar = useBarFill(76, 100, active)
  const stBar = useBarFill(24, 300, active)

  return (
    <div className="w-full max-w-[320px] bg-[#111] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Q2 Tax Estimate</span>
        <span className="text-white/20 text-[10px]">Apr – Jun 2026</span>
      </div>
      <div>
        <span className="text-white font-light text-4xl tracking-[-0.04em]">${total}</span>
        <p className="text-white/25 text-xs mt-1">17.8% effective rate · due Jun 15</p>
      </div>
      <div className="space-y-4 pt-2 border-t border-white/[0.07]">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Self-Employment Tax</span>
            <span className="text-white/70">${se}</span>
          </div>
          <div className="h-px bg-white/[0.08] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-[1100ms] ease-out"
              style={{ width: `${seBar}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">State Income Tax</span>
            <span className="text-white/70">${state}</span>
          </div>
          <div className="h-px bg-white/[0.08] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/25 transition-all duration-[900ms] ease-out delay-300"
              style={{ width: `${stBar}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs pt-1">
          <span className="text-white/30">Federal Income Tax</span>
          <span className="text-white/30">$0</span>
        </div>
      </div>
    </div>
  )
}

// ─── Widget: Expense Gaps ─────────────────────────────────────────────────────
function ExpenseGapsWidget({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(false)
  const phoneBar = useBarFill(0, 0, false)
  const parkBar = useBarFill(0, 0, false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setPulse(true), 600)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="w-full max-w-[320px] bg-[#111] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Expense Gaps</span>
        <span
          className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border transition-all duration-500 ${
            pulse
              ? 'border-[#FF9500]/50 text-[#FF9500]/80 bg-[#FF9500]/5'
              : 'border-white/10 text-white/20'
          }`}
        >
          2 missing
        </span>
      </div>
      <p className="text-white/35 text-xs leading-relaxed">
        Unlogged expenses costing you ~$54 in missed deductions this quarter
      </p>
      <div className="space-y-5 pt-2 border-t border-white/[0.07]">
        {[
          { label: 'Phone & Data', sub: '$60/mo × 3 months', savings: '~$33 savings', pct: 0 },
          { label: 'Parking & Tolls', sub: '$40/mo × 3 months', savings: '~$22 savings', pct: 0 },
        ].map((item, i) => (
          <div key={item.label} className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60 text-sm">{item.label}</p>
                <p className="text-white/25 text-[10px] mt-0.5">{item.sub}</p>
              </div>
              <span
                className={`text-[10px] transition-all duration-700 ${
                  pulse ? 'text-[#10B981]/70' : 'text-white/20'
                }`}
                style={{ transitionDelay: `${i * 200 + 400}ms` }}
              >
                {item.savings}
              </span>
            </div>
            <div className="h-px bg-white/[0.08]">
              <div className="h-full bg-white/10 w-full" />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`mt-1 text-center text-xs tracking-[0.2em] uppercase py-3 rounded-lg border transition-all duration-500 ${
          pulse
            ? 'border-white/20 text-white/50 hover:border-white/40 hover:text-white/70'
            : 'border-white/[0.08] text-white/15'
        }`}
      >
        + Log Missing Expenses
      </button>
    </div>
  )
}

// ─── Widget: YTD Summary ──────────────────────────────────────────────────────
function YtdSummaryWidget({ active }: { active: boolean }) {
  const earnings = useCountUp(1864, 1200, active)
  const owed = useCountUp(337, 1100, active)
  const paid = useCountUp(185, 1000, active)

  return (
    <div className="w-full max-w-[320px] bg-[#111] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Year-to-Date</span>
        <span className="text-white/20 text-[10px]">2026</span>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.07]">
        <div className="flex flex-col gap-1.5">
          <span className="text-white/25 text-[9px] tracking-[0.15em] uppercase">Earnings</span>
          <span className="text-white font-light text-xl tracking-[-0.03em]">${earnings.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-white/25 text-[9px] tracking-[0.15em] uppercase">Est. Tax</span>
          <span className="text-[#FF9500]/80 font-light text-xl tracking-[-0.03em]">${owed}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-white/25 text-[9px] tracking-[0.15em] uppercase">Paid</span>
          <span className="text-[#10B981]/70 font-light text-xl tracking-[-0.03em]">${paid}</span>
        </div>
      </div>
      <div className="bg-white/[0.04] rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/30 text-[10px] tracking-[0.15em] uppercase">Tax reserve</span>
          <span className="text-white/20 text-[10px]">set aside per $1</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-light text-2xl tracking-[-0.03em]">$0.23</span>
          <span className="text-white/25 text-xs">/ dollar earned</span>
        </div>
        <p className="text-white/20 text-[10px] mt-2 leading-relaxed">18.1% effective rate + 5% buffer</p>
      </div>
      <p className="text-white/20 text-[10px] text-center">Year-end projection: $1,051 total tax</p>
    </div>
  )
}

// ─── Widget: Quarterly ────────────────────────────────────────────────────────
function QuarterlyWidget({ active }: { active: boolean }) {
  const [q2visible, setQ2Visible] = useState(false)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setQ2Visible(true), 500)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="w-full max-w-[320px] flex flex-col gap-3">
      {/* Q1 */}
      <div
        className="bg-[#111] rounded-2xl p-5 ring-1 ring-white/[0.07] transition-all duration-700"
        style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs font-mono">Q1</span>
            <span className="text-white/40 text-xs">Jan – Mar 2026</span>
          </div>
          <span className="text-[#FF4444]/70 text-[9px] tracking-[0.15em] uppercase border border-[#FF4444]/30 px-2 py-0.5 rounded-full">Past due</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Earnings', v: '$1,010', c: 'text-white/60' },
            { l: 'Expenses', v: '$19', c: 'text-[#FF4444]/60' },
            { l: 'Taxable Income', v: '$991', c: 'text-white/50' },
            { l: 'Est. Tax', v: '$184.86', c: 'text-[#FF9500]/70' },
          ].map(item => (
            <div key={item.l} className="bg-white/[0.04] rounded-lg p-2.5">
              <p className="text-white/20 text-[9px] tracking-[0.1em] uppercase mb-1">{item.l}</p>
              <p className={`${item.c} text-sm font-light`}>{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div
        className="bg-[#111] rounded-2xl p-5 ring-1 ring-[#FF9500]/20 transition-all duration-700"
        style={{
          opacity: q2visible ? 1 : 0,
          transform: q2visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#FF9500]/60 text-xs font-mono">Q2</span>
            <span className="text-white/40 text-xs">Apr – Jun 2026</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-[#FF9500]/50 border border-[#FF9500]/20 px-1.5 py-0.5 rounded-full">Current</span>
          </div>
          <span className="text-white/25 text-[9px]">Due Jun 15</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Earnings', v: '$854', c: 'text-white/60' },
            { l: 'Expenses', v: '$42', c: 'text-[#FF4444]/60' },
            { l: 'Taxable Income', v: '$812', c: 'text-white/50' },
            { l: 'Est. Tax', v: '$152.05', c: 'text-[#FF9500]/70' },
          ].map(item => (
            <div key={item.l} className="bg-white/[0.04] rounded-lg p-2.5">
              <p className="text-white/20 text-[9px] tracking-[0.1em] uppercase mb-1">{item.l}</p>
              <p className={`${item.c} text-sm font-light`}>{item.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Feature row ─────────────────────────────────────────────────────────────
function FeatureRow({
  tag, title, body, widget, reverse = false,
}: {
  tag: string
  title: string
  body: string
  widget: (active: boolean) => React.ReactNode
  reverse?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-r]'), {
        opacity: 0, y: 32, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
          onEnter: () => setActive(true),
          onLeaveBack: () => setActive(false),
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-px bg-white/[0.06]`}
    >
      <div className="bg-[#08111F] flex-1 flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-16 gap-4 sm:gap-5">
        <span data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">{tag}</span>
        <h3 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[clamp(18px,2.5vw,28px)] leading-snug tracking-[-0.02em] max-w-sm">
          {title}
        </h3>
        <p data-r className="text-[#94A3B8] text-[13px] sm:text-[14px] leading-relaxed max-w-xs font-[family-name:var(--font-dm-sans)]">{body}</p>
      </div>
      <div className="bg-[#050B12] w-full md:w-[400px] flex items-center justify-center py-10 px-5 sm:py-12 sm:px-8">
        {widget(active)}
      </div>
    </div>
  )
}

// ─── Features section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, 'top 85%')
  return (
    <section ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Features
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-10 sm:mb-16 max-w-2xl">
          Everything a gig worker needs to stop guessing
        </h2>
        <div className="space-y-px">
          <FeatureRow
            tag="Tax breakdown"
            title="Quarterly taxes — broken down by type"
            body="GigMiles calculates self-employment, federal, and state tax separately. Know what you owe before the deadline — not after."
            widget={(a) => <TaxBreakdownWidget active={a} />}
          />
          <FeatureRow
            tag="Expense gaps"
            title="Find the deductions you're missing"
            body="GigMiles scans your data and spots unlogged expenses — phone, parking, tolls. Missed deductions are money you gave away for free."
            widget={(a) => <ExpenseGapsWidget active={a} />}
            reverse
          />
          <FeatureRow
            tag="Tax reserve"
            title="One number: set this much aside per dollar"
            body="GigMiles tells you exactly how many cents to save per dollar earned — so tax season is never a surprise again."
            widget={(a) => <YtdSummaryWidget active={a} />}
          />
          <FeatureRow
            tag="Quarterly tracker"
            title="Past due and current quarter, side by side"
            body="GigMiles tracks every quarter — earnings, taxable income, and estimated tax per period. Mark as paid and move on."
            widget={(a) => <QuarterlyWidget active={a} />}
            reverse
          />
        </div>
      </div>
    </section>
  )
}

// ─── Phone Showcase ───────────────────────────────────────────────────────────
const PHONES = [
  {
    img: '/ss-expense-gaps.jpeg',
    label: 'Expense Gaps',
    sub: 'Spot missed deductions instantly',
  },
  {
    img: '/ss-tax-breakdown.jpeg',
    label: 'Tax Breakdown',
    sub: 'Quarterly taxes broken down by type',
  },
  {
    img: '/ss-quarterly.jpeg',
    label: 'Quarterly Tracker',
    sub: 'Past due and current quarter, side by side',
  },
]

function PhoneCard({ phone }: { phone: { img: string; label: string; sub: string } }) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Mouse position normalized to [-0.5, 0.5]
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  // Spring-smoothed for premium feel
  const sx = useSpring(mx, { stiffness: 150, damping: 20, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 150, damping: 20, mass: 0.5 })

  // Tilt: max 12 degrees each axis
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12])
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10])

  // Gloss highlight position
  const glossX = useTransform(sx, [-0.5, 0.5], ['0%', '100%'])
  const glossY = useTransform(sy, [-0.5, 0.5], ['0%', '100%'])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div
      data-r
      className="flex flex-col items-center gap-6 [perspective:1000px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative w-[200px] md:w-[220px] flex-shrink-0"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer frame */}
        <div className="relative bg-[#0F1623] border-2 border-white/[0.12] rounded-[38px] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          {/* Inner bezel */}
          <div className="bg-[#050B12] rounded-[30px] overflow-hidden aspect-[9/19] relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#0F1623] rounded-b-2xl z-10 flex items-center justify-center gap-1.5">
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <div className="w-4 h-1.5 bg-white/10 rounded-full" />
            </div>
            <Image
              src={phone.img}
              alt={phone.label}
              fill
              className="object-cover object-top"
              sizes="220px"
            />
            {/* Gloss highlight: tracks mouse, sits ABOVE screenshot */}
            <motion.div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                background: useTransform(
                  [glossX, glossY],
                  ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.25), transparent 45%)`
                ),
              }}
            />
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full" />
        </div>
        {/* Teal glow that intensifies on hover */}
        <motion.div
          className="absolute inset-0 rounded-[38px] bg-[#14B8A6] blur-2xl -z-10"
          style={{
            opacity: useTransform([sx, sy], ([x, y]) => 0.05 + Math.min(Math.abs(x as number) + Math.abs(y as number), 0.5) * 0.15),
            scale: 1.1,
          }}
        />
      </motion.div>

      {/* Label */}
      <div className="text-center">
        <p className="text-white/70 text-[13px] font-medium font-[family-name:var(--font-space-grotesk)] mb-1">{phone.label}</p>
        <p className="text-white/30 text-[11px] font-[family-name:var(--font-dm-sans)]">{phone.sub}</p>
      </div>
    </div>
  )
}

function PhoneShowcaseSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, 'top 75%')
  return (
    <section ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          The app
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          Built for gig workers. Not accountants.
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-12 sm:mb-20 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Every screen is designed to give you one clear number — what you actually kept.
        </p>

        {/* Mobile: horizontal scroll · Desktop: 3-col grid */}
        <div className="md:hidden -mx-5 px-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-5">
          <div className="flex gap-6 w-max">
            {PHONES.map(phone => (
              <div key={phone.label} className="snap-start shrink-0 w-[68vw] max-w-[260px]">
                <PhoneCard phone={phone} />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-12">
          {PHONES.map(phone => (
            <PhoneCard key={phone.label} phone={phone} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Calculator ───────────────────────────────────────────────────────────────
function CalculatorSection() {
  const ref = useRef<HTMLElement>(null)
  const [gross, setGross] = useState(1200)
  const [hours, setHours] = useState(30)
  useReveal(ref, 'top 80%')

  const costs = Math.round(gross * 0.35)
  const taxes = Math.round(gross * 0.153)
  const net = gross - costs - taxes
  const hourly = hours > 0 ? (net / hours).toFixed(2) : '0.00'

  return (
    <section id="calculator" ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Calculator
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          What do you actually take home?
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-10 sm:mb-16 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Adjust the sliders and see your real net income — after vehicle costs and self-employment taxes.
        </p>

        <div data-r className="border border-white/[0.07] bg-[#050B12] grid md:grid-cols-2 gap-px bg-white/[0.06]">
          {/* Sliders */}
          <div className="bg-[#050B12] px-5 py-7 sm:px-8 sm:py-10 flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <label className="text-white/50 text-[11px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]">
                  Weekly Gross Earnings
                </label>
                <span className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[20px] tracking-[-0.03em]">
                  ${gross.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={3000}
                step={50}
                value={gross}
                onChange={e => setGross(Number(e.target.value))}
                title="Weekly Gross Earnings"
                className="w-full h-px appearance-none bg-white/10 cursor-pointer accent-[#14B8A6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#14B8A6] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#14B8A6]"
              />
              <div className="flex justify-between text-[10px] text-white/20 font-[family-name:var(--font-dm-sans)]">
                <span>$100</span>
                <span>$3,000</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <label className="text-white/50 text-[11px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]">
                  Hours Driven / Week
                </label>
                <span className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[20px] tracking-[-0.03em]">
                  {hours} hrs
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
                title="Hours Driven Per Week"
                className="w-full h-px appearance-none bg-white/10 cursor-pointer accent-[#14B8A6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#14B8A6] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#14B8A6]"
              />
              <div className="flex justify-between text-[10px] text-white/20 font-[family-name:var(--font-dm-sans)]">
                <span>5 hrs</span>
                <span>80 hrs</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-[#050B12] px-5 py-7 sm:px-8 sm:py-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              {[
                { label: 'Gross earnings', val: `$${gross.toLocaleString()}`, color: 'text-white/85', barColor: 'bg-white/30', pct: 100 },
                { label: 'Vehicle & operating costs (est. 35%)', val: `−$${costs}`, color: 'text-[#F87171]/90', barColor: 'bg-[#F87171]/60', pct: 35 },
                { label: 'Self-employment taxes (est. 15.3%)', val: `−$${taxes}`, color: 'text-[#FBBF24]/90', barColor: 'bg-[#FBBF24]/60', pct: 15.3 },
              ].map(row => (
                <div key={row.label} className="py-3 border-b border-white/[0.05] flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">{row.label}</span>
                    <span className={`font-[family-name:var(--font-space-grotesk)] font-semibold text-[14px] tabular-nums ${row.color}`}>{row.val}</span>
                  </div>
                  <div className="h-px bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full ${row.barColor} transition-[width] duration-500 ease-out`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto border border-[#14B8A6]/20 bg-[#14B8A6]/[0.04] px-5 py-5 flex flex-col gap-3">
              <span className="text-[10px] text-[#14B8A6] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]">Your real take-home</span>
              <div className="flex items-baseline justify-between">
                <span className="text-[42px] font-bold tracking-[-0.05em] text-[#10B981] leading-none font-[family-name:var(--font-space-grotesk)] tabular-nums">
                  ${net.toLocaleString()}
                </span>
                <span className="text-white/45 text-[13px] font-[family-name:var(--font-dm-sans)] tabular-nums">
                  ${hourly}<span className="text-[10px]">/hr</span>
                </span>
              </div>
              {/* Stacked breakdown bar: net (teal) + costs (red) + taxes (amber) */}
              <div className="h-1.5 flex bg-white/[0.05] overflow-hidden">
                <div
                  className="bg-[#10B981]/70 transition-[width] duration-500 ease-out"
                  style={{ width: `${(net / gross) * 100}%` }}
                />
                <div
                  className="bg-[#F87171]/55 transition-[width] duration-500 ease-out"
                  style={{ width: `${(costs / gross) * 100}%` }}
                />
                <div
                  className="bg-[#FBBF24]/55 transition-[width] duration-500 ease-out"
                  style={{ width: `${(taxes / gross) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-[family-name:var(--font-dm-sans)] tabular-nums">
                <span className="text-[#10B981]/70">{Math.round((net / gross) * 100)}% kept</span>
                <span className="text-[#F87171]/70">{Math.round((costs / gross) * 100)}% costs</span>
                <span className="text-[#FBBF24]/70">{Math.round((taxes / gross) * 100)}% taxes</span>
              </div>
              <p className="text-white/25 text-[11px] font-[family-name:var(--font-dm-sans)]">after vehicle costs + taxes · per week</p>
            </div>

            <a href="/waitlist" className="text-center border border-[#14B8A6]/30 text-[#14B8A6]/70 text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-8 py-3 transition-all duration-200 hover:border-[#14B8A6]/60 hover:text-[#14B8A6] active:scale-[0.98]">
              Track this in GigMiles
            </a>

            <p className="text-white/15 text-[10px] italic font-[family-name:var(--font-dm-sans)] leading-relaxed">
              Estimates only. Actual costs and taxes vary. Not tax advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'I thought I was clearing $18 an hour on Uber. GigMiles showed me $11.40 after mileage and taxes. Rough wake-up call — but now I actually plan my shifts around the real number.',
    name: 'Marcus T.',
    role: 'Uber · 3 years',
    initials: 'MT',
    accent: '#14B8A6',
    featured: true,
  },
  {
    quote: 'The expense gaps feature flagged $340 in deductions I was ignoring. Phone, parking, tolls. That\'s more than the app costs in a year.',
    name: 'Priya N.',
    role: 'DoorDash + Instacart',
    initials: 'PN',
    accent: '#10B981',
    featured: false,
  },
  {
    quote: 'Tax season used to kill me. Now I set aside exactly 23 cents per dollar, every week. Zero surprises.',
    name: 'Darnell W.',
    role: 'Amazon Flex',
    initials: 'DW',
    accent: '#F59E0B',
    featured: false,
  },
]

function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const [featured, ...rest] = TESTIMONIALS
  return (
    <section ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Beta testers
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-10 sm:mb-16 max-w-xl">
          Real numbers change how you drive
        </h2>

        {/* Asymmetric layout: featured left, 2 stacked right */}
        <div className="grid md:grid-cols-[3fr_2fr] gap-px bg-white/[0.07] border border-white/[0.07]">
          {/* Featured — large pull quote */}
          <div data-r className="bg-[#050B12] p-8 sm:p-10 flex flex-col gap-8">
            <p className="text-white/70 font-[family-name:var(--font-dm-sans)] italic leading-[1.65] text-[clamp(16px,2.2vw,22px)] flex-1">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold font-[family-name:var(--font-space-grotesk)] text-[#050B12] flex-shrink-0"
                style={{ backgroundColor: featured.accent }}
              >
                {featured.initials}
              </div>
              <div>
                <p className="text-white/75 text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium">{featured.name}</p>
                <p className="text-white/30 text-[11px] mt-0.5 font-[family-name:var(--font-dm-sans)]">{featured.role}</p>
              </div>
            </div>
          </div>

          {/* Two stacked — smaller */}
          <div className="flex flex-col gap-px bg-white/[0.07]">
            {rest.map(t => (
              <div key={t.name} data-r className="bg-[#050B12] p-6 sm:p-8 flex flex-col gap-5 flex-1 hover:bg-[#08111F] transition-colors duration-200">
                <p className="text-[#94A3B8] text-[13px] leading-[1.75] flex-1 font-[family-name:var(--font-dm-sans)]">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold font-[family-name:var(--font-space-grotesk)] text-[#050B12] flex-shrink-0"
                    style={{ backgroundColor: t.accent }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white/75 text-[12px] font-[family-name:var(--font-space-grotesk)] font-medium">{t.name}</p>
                    <p className="text-white/30 text-[10px] mt-0.5 font-[family-name:var(--font-dm-sans)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing card (cursor spotlight) ──────────────────────────────────────────
type PricingTier = {
  badge?: string
  label: string
  price: string
  priceSuffix?: string
  caption: string
  features: string[]
  cta: string
  ctaHref: string
  bg: string
  featured?: boolean
}

function PricingCard({ tier }: { tier: PricingTier }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const handleEnter = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--spot-opacity', '1')
  }

  const handleLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--spot-opacity', '0')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative ${tier.bg} p-6 sm:p-8 flex flex-col gap-6 group overflow-hidden ${tier.featured ? 'border-t-2 border-t-[#14B8A6]' : ''}`}
      style={{ '--mx': '50%', '--my': '50%', '--spot-opacity': '0' } as React.CSSProperties}
    >
      {/* Spotlight fill: tracks cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: 'radial-gradient(420px circle at var(--mx) var(--my), rgba(20,184,166,0.10), transparent 55%)',
        }}
      />
      {/* Border glow: brighter, tighter radial, masked to the edge */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: 'radial-gradient(260px circle at var(--mx) var(--my), rgba(20,184,166,0.45), transparent 60%)',
          mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* Content (sits above overlays) */}
      <div className="relative flex flex-col gap-6 flex-1">
        {tier.badge && (
          <div className="absolute -top-1 right-0 z-10">
            <span className="text-[9px] tracking-[0.12em] uppercase text-[#14B8A6]/80 bg-[#050B12] border border-[#14B8A6]/30 px-2 py-0.5 font-[family-name:var(--font-space-grotesk)]">
              {tier.badge}
            </span>
          </div>
        )}
        <div>
          <p className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)]">{tier.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-[family-name:var(--font-space-grotesk)] font-bold text-5xl tracking-[-0.04em]">{tier.price}</span>
            {tier.priceSuffix && <span className="text-[#94A3B8] text-[13px]">{tier.priceSuffix}</span>}
          </div>
          <p className="text-[#94A3B8] text-[12px] mt-2 font-[family-name:var(--font-dm-sans)]">{tier.caption}</p>
        </div>
        <ul className="space-y-3 flex-1">
          {tier.features.map(f => (
            <li key={f} className="flex items-center gap-3 text-[13px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">
              <span className="text-[#14B8A6]/70 flex-shrink-0 text-[12px]">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <a
          href={tier.ctaHref}
          className={`mt-2 text-center text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-8 py-3 transition-all duration-200 active:scale-[0.98] ${
            tier.featured
              ? 'bg-[#14B8A6] text-[#050B12] font-semibold hover:bg-[#14B8A6]/85'
              : 'border border-white/[0.18] text-white/60 hover:border-white/35 hover:text-white/85'
          }`}
        >
          {tier.cta}
        </a>
      </div>
    </div>
  )
}

const PRICING_TIERS: PricingTier[] = [
  {
    label: 'Free Trial',
    price: 'Free',
    caption: '10 days · no card required',
    features: ['All platforms tracked', 'Real-time net earnings', 'Quarterly tax estimates', 'Expense gap detection'],
    cta: 'Start Free',
    ctaHref: '/waitlist',
    bg: 'bg-[#08111F]',
  },
  {
    badge: 'Most Popular',
    label: 'Monthly',
    price: '$9.99',
    priceSuffix: '/ month',
    caption: 'Billed monthly · cancel anytime',
    features: ['Everything in Free Trial', 'Export for CPA', 'Unlimited shift history', 'Priority support'],
    cta: 'Join the Waitlist',
    ctaHref: '/waitlist',
    bg: 'bg-[#050B12]',
    featured: true,
  },
  {
    label: 'Annual',
    price: '$99',
    priceSuffix: '/ year',
    caption: '$8.33 / month · save 17%',
    features: ['Everything in Monthly', 'Early access to new features', 'Locked-in beta pricing', 'Tax season export pack'],
    cta: 'Join the Waitlist',
    ctaHref: '/waitlist',
    bg: 'bg-[#08111F]',
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section id="pricing" ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Pricing
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          Less than one Uber ride per month
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-16 max-w-md font-[family-name:var(--font-dm-sans)]">
          10 days free during beta. No card required to start.
        </p>

        <div data-r className="grid md:grid-cols-3 border border-white/[0.07] bg-white/[0.07] gap-px">
          {PRICING_TIERS.map(tier => (
            <PricingCard key={tier.label} tier={tier} />
          ))}
        </div>

        <p data-r className="text-white/20 text-[11px] leading-relaxed mt-8 max-w-lg font-[family-name:var(--font-dm-sans)] italic">
          Tax estimates assume gig work is your primary income source and are for planning purposes only — not tax advice, not a filed return. Always consult a licensed tax professional before filing.
        </p>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Which platforms does GigMiles support?',
    a: 'Uber, Lyft, DoorDash, Instacart, Amazon Flex — and any custom platform you add manually.',
  },
  {
    q: 'How are taxes calculated?',
    a: 'GigMiles estimates self-employment tax, federal income tax, and state income tax using the current IRS mileage rate ($0.725/mi for 2026) and your filing status. Estimates assume gig work is your primary income source — if you also have W-2 wages, your actual tax may differ. Always verify with a licensed tax professional before filing.',
  },
  {
    q: 'Is this professional tax advice?',
    a: 'No. GigMiles is a record-keeping and tax estimation tool — not a tax preparer and not a substitute for a CPA. The numbers help you plan and set money aside. Your tax professional reviews the full picture at filing time.',
  },
  {
    q: 'What is the 10-day free trial?',
    a: 'During beta, every new account gets 10 days fully free with no card required. Cancel anytime.',
  },
  {
    q: 'Can I export my data for a tax professional?',
    a: 'Yes. GigMiles generates a Schedule C preparation worksheet — a summary of your earnings, mileage, and deductions formatted for your CPA. It is a preparation aid, not a filed tax return.',
  },
  {
    q: 'Does it track mileage automatically?',
    a: 'Automatic mileage tracking via GPS is on the roadmap. Currently you log miles per shift manually or let the app estimate based on shift duration.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.07]">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 sm:py-6 text-left group"
      >
        <span className="text-white/70 text-[13px] sm:text-[14px] leading-snug group-hover:text-white transition-colors font-[family-name:var(--font-space-grotesk)]">{q}</span>
        <span className={`text-white/30 text-base leading-none mt-0.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <p className="text-[#94A3B8] text-[13px] leading-relaxed pb-5 sm:pb-6 max-w-xl font-[family-name:var(--font-dm-sans)]">{a}</p>
      )}
    </div>
  )
}

function FaqSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="py-20 md:py-32 px-5 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          FAQ
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-10 sm:mb-16 max-w-xl">
          Common questions
        </h2>
        <div data-r>
          {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCtaSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section
      ref={ref}
      className="relative min-h-[70dvh] sm:min-h-[80dvh] bg-[#050B12] flex flex-col items-center justify-center px-5 py-16 sm:px-6 text-center gap-5 sm:gap-7 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14B8A610 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div data-r className="flex flex-col items-center gap-3 mb-2 relative z-10">
        <Image src="/logo-icon.png" alt="GigMiles" width={48} height={48} className="rounded-[12px] opacity-80" />
        <span className="text-[#14B8A6]/50 text-[10px] tracking-[0.35em] uppercase font-[family-name:var(--font-space-grotesk)]">GigMiles</span>
      </div>
      <h2 data-r className="relative z-10 text-white font-[family-name:var(--font-space-grotesk)] font-black tracking-[-0.04em] leading-[1.0] text-[clamp(32px,7vw,80px)]">
        Your real earnings.<br className="hidden md:block" /> After everything.
      </h2>
      <p data-r className="relative z-10 text-[#94A3B8] text-[15px] max-w-sm leading-relaxed font-[family-name:var(--font-dm-sans)]">
        Know what you actually kept — after gas, mileage, and taxes. Every shift.
      </p>
      <a
        data-r
        href="/waitlist"
        className="relative z-10 mt-2 bg-[#14B8A6] text-[#050B12] text-[11px] tracking-[0.12em] uppercase font-[family-name:var(--font-space-grotesk)] font-semibold px-12 py-4 transition-all duration-200 hover:bg-[#14B8A6]/85 hover:shadow-[0_0_40px_rgba(20,184,166,0.25)] active:scale-[0.97]"
      >
        Join Early Access
      </a>
      <p data-r className="relative z-10 text-white/20 text-[11px] font-[family-name:var(--font-dm-sans)]">
        10 days free during beta — no card required
      </p>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#050B12] border-t border-white/[0.06] px-5 md:px-14 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="GigMiles" width={22} height={22} className="rounded-[5px] opacity-60" />
          <div>
            <span className="text-white/40 text-[12px] tracking-[-0.01em] font-medium font-[family-name:var(--font-space-grotesk)]">GigMiles</span>
            <p className="text-white/20 text-[11px] mt-0.5 font-[family-name:var(--font-dm-sans)]">Your real earnings. After everything.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-8">
          {[['Waitlist', '/waitlist'], ['Contact', 'mailto:support@gigmiles.app'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} className="text-white/30 text-[12px] tracking-[0.04em] font-[family-name:var(--font-space-grotesk)] hover:text-white/55 transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-right">
          <p className="text-white/20 text-[11px] font-[family-name:var(--font-dm-sans)]">&copy; {new Date().getFullYear()} GigMiles</p>
          <p className="text-white/15 text-[10px] mt-1 max-w-[220px] leading-relaxed font-[family-name:var(--font-dm-sans)] italic">Tax estimates are for planning purposes only. Not tax advice.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ScrollLanding() {
  return (
    <>
      <Nav />

      <main className="bg-[#050B12]">
        <HeroMeltdown />
        <PlatformWall />
        <AnchorBanner />
        <WaterfallSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PhoneShowcaseSection />
        <CalculatorSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <Footer />
      </main>
    </>
  )
}
