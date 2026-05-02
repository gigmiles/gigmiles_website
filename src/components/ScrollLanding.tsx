'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollVideoAnimation, type OverlayStage } from './ScrollVideoAnimation'

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
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-14 py-5 transition-all duration-500 ${
        scrolled ? 'bg-[#050B12]/95 backdrop-blur-xl border-b border-white/[0.06]' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/logo-icon.png" alt="GigMiles" width={26} height={26} className="rounded-[6px]" />
        <span className="text-white/75 text-[13px] tracking-[-0.01em] font-medium font-[family-name:var(--font-space-grotesk)]">GigMiles</span>
      </div>
      <a
        href="/waitlist"
        className="text-white/55 text-[11px] tracking-[0.04em] border border-white/[0.14] px-5 py-2 transition-all duration-200 hover:border-white/30 hover:text-white/80 active:scale-[0.98] font-[family-name:var(--font-space-grotesk)]"
      >
        Join Waitlist
      </a>
    </nav>
  )
}

// ─── Platform logo wall ───────────────────────────────────────────────────────
const PLATFORMS = ['Uber', 'Lyft', 'DoorDash', 'Instacart', 'Amazon Flex', 'GrubHub', 'Shipt', 'Spark']

function PlatformWall() {
  return (
    <div className="bg-[#08111F] border-t border-b border-white/[0.06] py-5 px-14 overflow-hidden">
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
  return (
    <div className="bg-[#111] border-b border-white/[0.06] py-5 px-6">
      <p className="text-center text-white/40 text-[12px] tracking-[0.18em] font-light">
        Most GigMiles drivers are surprised by what they actually kept.
      </p>
    </div>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100)
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center gap-5">
      <span className="text-white/20 text-[10px] tracking-[0.35em] uppercase">GigMiles</span>
      <div className="w-36 h-px bg-white/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white/50 transition-all duration-300 ease-out"
          ref={el => { if (el) el.style.width = `${pct}%` }}
        />
      </div>
      <span className="text-white/15 text-[10px] tabular-nums tracking-widest">{pct}%</span>
    </div>
  )
}

// ─── Overlay content pieces ───────────────────────────────────────────────────
function StageContent({
  label,
  number,
  numberColor = '#ffffff',
  sub,
}: {
  label: string
  number: string
  numberColor?: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] tracking-[0.28em] uppercase text-white/25">{label}</span>
      <span
        className="font-light leading-none tracking-[-0.04em] text-[clamp(72px,14vw,148px)]"
        ref={el => { if (el) el.style.color = numberColor }}
      >
        {number}
      </span>
      <span className="text-white/35 text-sm tracking-wide max-w-xs leading-relaxed">{sub}</span>
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
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Real example
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-4 max-w-xl">
          What a typical shift actually pays
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-16 max-w-lg font-[family-name:var(--font-dm-sans)]">
          9 hours · DoorDash, Uber Eats, Amazon Flex · based on IRS mileage rate $0.67/mi
        </p>

        <div className="border border-white/[0.07] bg-[#050B12]">
          {/* header */}
          <div className="px-8 py-5 border-b border-white/[0.06] flex items-baseline justify-between flex-wrap gap-4">
            <span className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium">Shift breakdown</span>
            <div className="flex gap-8">
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
            <div className="px-8 py-8 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col gap-0">
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
            <div className="px-8 py-8 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06]">
                {[
                  ['Hourly rate', '$16.33', 'after all costs'],
                  ['Tax reserve', '23¢', 'per dollar earned'],
                  ['Vehicle cost', '51¢', 'per dollar gross'],
                  ['Effective rate', '62%', 'of gross kept'],
                ].map(([l, v, s]) => (
                  <div key={l} className="bg-[#050B12] px-5 py-5 flex flex-col gap-1">
                    <span className="text-[10px] text-white/25 tracking-[0.1em] uppercase font-[family-name:var(--font-space-grotesk)]">{l}</span>
                    <span className="text-[22px] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-space-grotesk)]">{v}</span>
                    <span className="text-[11px] text-white/30 font-[family-name:var(--font-dm-sans)]">{s}</span>
                  </div>
                ))}
              </div>

              <div className="border border-white/[0.06] px-5 py-4 bg-[#14B8A6]/[0.03]">
                <p className="text-[11px] text-[#14B8A6] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] mb-2">GigMiles insight</p>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                  You kept 62% of gross earnings. IRS mileage deduction alone saves an estimated $75 in taxes this shift.
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

// ─── How it Works ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n: '01',
    title: 'Log your shifts',
    body: 'Add earnings from Uber, DoorDash, Amazon Flex, Instacart, or Lyft in seconds. One tap per shift.',
  },
  {
    n: '02',
    title: 'Track every cost',
    body: 'Fuel, mileage at IRS rate ($0.725/mi), maintenance, insurance. GigMiles separates business from personal automatically.',
  },
  {
    n: '03',
    title: 'See your real number',
    body: 'Gross pay minus vehicle costs minus estimated taxes. GigMiles shows your true hourly rate — updated live as you drive.',
  },
]

function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          How it works
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-16 max-w-xl">
          Three steps to knowing what you actually keep
        </h2>
        <div className="grid md:grid-cols-3 border border-white/[0.07] bg-white/[0.07] gap-px">
          {HOW_STEPS.map(step => (
            <div key={step.n} data-r className="bg-[#050B12] p-8 flex flex-col gap-6">
              <span className="text-[#14B8A6] text-[11px] tracking-[0.2em] font-[family-name:var(--font-space-grotesk)] pb-4 border-b border-white/[0.06]">{step.n}</span>
              <h3 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[18px] leading-snug tracking-[-0.02em]">{step.title}</h3>
              <p className="text-[#94A3B8] text-[14px] leading-relaxed font-[family-name:var(--font-dm-sans)]">{step.body}</p>
            </div>
          ))}
        </div>
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
      <div className="bg-[#08111F] flex-1 flex flex-col justify-center px-10 py-16 gap-5">
        <span data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">{tag}</span>
        <h3 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[clamp(20px,2.5vw,28px)] leading-snug tracking-[-0.02em] max-w-sm">
          {title}
        </h3>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed max-w-xs font-[family-name:var(--font-dm-sans)]">{body}</p>
      </div>
      <div data-r className="bg-[#050B12] w-full md:w-[400px] flex items-center justify-center py-12 px-8">
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
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Features
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-16 max-w-2xl">
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'I thought I was clearing $18 an hour on Uber. GigMiles showed me $11.40 after mileage and taxes. Rough wake-up call, but now I actually plan my shifts.',
    name: 'Marcus T.',
    role: 'Uber driver · 3 years',
  },
  {
    quote: 'The expense gaps feature flagged $340 in quarterly deductions I was ignoring — phone, parking, tolls. That\'s more than the app costs in a year.',
    name: 'Priya N.',
    role: 'DoorDash + Instacart',
  },
  {
    quote: 'Tax season used to kill me. Now I set aside 23 cents per dollar every week, exactly what GigMiles tells me. Zero surprises when the bill hits.',
    name: 'Darnell W.',
    role: 'Amazon Flex driver',
  },
]

function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Beta testers
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-16 max-w-xl">
          Real numbers change how you drive
        </h2>
        <div className="grid md:grid-cols-3 border border-white/[0.07] bg-white/[0.07] gap-px">
          {TESTIMONIALS.map(t => (
            <div key={t.name} data-r className="bg-[#050B12] p-8 flex flex-col gap-8 hover:bg-[#08111F] transition-colors duration-200">
              <p className="text-[#94A3B8] text-[14px] leading-[1.75] flex-1 font-[family-name:var(--font-dm-sans)]">&ldquo;{t.quote}&rdquo;</p>
              <div className="pt-4 border-t border-white/[0.07]">
                <p className="text-white/75 text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium">{t.name}</p>
                <p className="text-white/30 text-[11px] mt-1 font-[family-name:var(--font-dm-sans)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#08111F] border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          Pricing
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-4 max-w-xl">
          Less than one Uber ride per month
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-16 max-w-md font-[family-name:var(--font-dm-sans)]">
          10 days free during beta. No card required to start.
        </p>

        <div data-r className="grid md:grid-cols-2 border border-white/[0.07] bg-white/[0.07] gap-px">
          {/* Monthly */}
          <div className="bg-[#08111F] p-10 flex flex-col gap-6 relative">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[#FBBF24]/70 font-[family-name:var(--font-space-grotesk)]">Limited time</span>
            <div>
              <p className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)]">Monthly</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-[family-name:var(--font-space-grotesk)] font-bold text-5xl tracking-[-0.04em]">$9.99</span>
                <span className="text-[#94A3B8] text-[13px]">/ month</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1">
              {['All platforms tracked', 'Real-time net earnings', 'Quarterly tax estimates', 'Expense gap detection', 'Export for CPA'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[13px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">
                  <span className="w-1 h-1 bg-[#14B8A6]/50 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/waitlist" className="mt-2 text-center border border-white/[0.18] text-white/60 text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-8 py-3 transition-all duration-200 hover:border-white/35 hover:text-white/85 active:scale-[0.98]">
              Join the Waitlist
            </a>
          </div>

          {/* Annual */}
          <div className="bg-[#050B12] p-10 flex flex-col gap-6 relative border-t-2 border-t-[#14B8A6]">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[#FBBF24]/70 font-[family-name:var(--font-space-grotesk)]">Limited time</span>
            <div>
              <p className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)]">Annual</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-[family-name:var(--font-space-grotesk)] font-bold text-5xl tracking-[-0.04em]">$99.9</span>
                <span className="text-[#94A3B8] text-[13px]">/ year</span>
              </div>
              <p className="text-[#94A3B8] text-[12px] mt-2 font-[family-name:var(--font-dm-sans)]">$8.33 / month · save 17%</p>
            </div>
            <ul className="space-y-3 flex-1">
              {['Everything in Monthly', 'Priority support', 'Early access to new features', 'Locked-in beta pricing'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[13px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">
                  <span className="w-1 h-1 bg-[#14B8A6]/50 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/waitlist" className="mt-2 text-center bg-[#14B8A6] text-[#050B12] text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] font-medium px-8 py-3 transition-all duration-200 hover:bg-[#14B8A6]/90 active:scale-[0.98]">
              Join the Waitlist
            </a>
          </div>
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
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
      >
        <span className="text-white/70 text-[14px] leading-snug group-hover:text-white transition-colors font-[family-name:var(--font-space-grotesk)]">{q}</span>
        <span className={`text-white/30 text-base leading-none mt-0.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <p className="text-[#94A3B8] text-[13px] leading-relaxed pb-6 max-w-xl font-[family-name:var(--font-dm-sans)]">{a}</p>
      )}
    </div>
  )
}

function FaqSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="py-32 px-6 md:px-14 bg-[#050B12] border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        <p data-r className="text-[#14B8A6] text-[10px] tracking-[0.2em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#14B8A6] opacity-60 inline-block" />
          FAQ
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,4vw,44px)] mb-16 max-w-xl">
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
      className="min-h-[80dvh] bg-[#08111F] flex flex-col items-center justify-center px-6 text-center gap-7 border-t border-white/[0.06]"
    >
      <div data-r className="flex flex-col items-center gap-3 mb-2">
        <Image src="/logo-icon.png" alt="GigMiles" width={56} height={56} className="rounded-[14px] opacity-85" />
        <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-space-grotesk)]">GigMiles</span>
      </div>
      <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.035em] leading-none text-[clamp(32px,6vw,72px)]">
        Your real earnings.<br className="hidden md:block" /> After everything.
      </h2>
      <p data-r className="text-[#94A3B8] text-[15px] max-w-sm leading-relaxed font-[family-name:var(--font-dm-sans)]">
        GigMiles calculates your real take-home after gas, miles, and taxes — so nothing surprises you at filing time.
      </p>
      <a data-r href="/waitlist" className="mt-2 border border-white/[0.18] text-white/60 text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-12 py-3 transition-all duration-200 hover:border-white/35 hover:text-white/85 active:scale-[0.98]">
        Join the Waitlist
      </a>
      <p data-r className="text-white/25 text-[11px] font-[family-name:var(--font-dm-sans)]">
        10 days free during beta — no card required
      </p>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#050B12] border-t border-white/[0.06] px-6 md:px-14 py-12">
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

// ─── Overlay stages definition ────────────────────────────────────────────────
const STAGES: OverlayStage[] = []

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ScrollLanding() {
  const [loadedCount, setLoadedCount] = useState(0)
  const totalFrames = 193

  const isReady = loadedCount >= totalFrames * 0.85

  return (
    <>
      {!isReady && <LoadingScreen progress={loadedCount / totalFrames} />}
      <Nav />

      <main className="bg-[#050B12]">
        <ScrollVideoAnimation
          frameDir="/frames/hero"
          frameCount={totalFrames}
          stages={STAGES}
          onLoadProgress={(loaded) => setLoadedCount(loaded)}
        />
        <PlatformWall />
        <AnchorBanner />
        <WaterfallSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <Footer />
      </main>
    </>
  )
}
