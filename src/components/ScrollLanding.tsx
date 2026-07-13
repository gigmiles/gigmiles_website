'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { HeroMeltdown } from './hero/HeroMeltdown'
import { DownloadButton } from './ui/DownloadButton'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'

gsap.registerPlugin(ScrollTrigger)
// Mobile address-bar show/hide fires resize events mid-scroll; without this,
// every ScrollTrigger refreshes (full layout re-measure) and the page hitches.
ScrollTrigger.config({ ignoreMobileResize: true })

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
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-14 py-5 transition-colors duration-500 ${
        scrolled ? 'bg-[#0A3C3C]/95 backdrop-blur-xl border-b border-white/[0.06]' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/brand/icons/icon-180.png" alt="GigMiles" width={26} height={26} className="rounded-[7px]" />
        <span className="text-[#5EEAD4] text-[18px] italic font-black tracking-[-0.04em] leading-none font-[family-name:var(--font-outfit)]">gigmiles</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {[
          ['Why It Matters', '#why'],
          ['How It Works', '#how'],
          ['Calculator', '/calculator'],
          ['Pricing', '#pricing'],
          ['Contact', '/contact'],
        ].map(([label, href]) => (
          <a key={label} href={href} className="text-white/55 text-[15px] tracking-[0.04em] hover:text-white/65 transition-colors font-[family-name:var(--font-space-grotesk)]">
            {label}
          </a>
        ))}
      </div>
      <DownloadButton className="text-white/55 text-[15px] tracking-[0.04em] border border-white/[0.14] px-5 py-2.5 transition-all duration-200 hover:border-white/30 hover:text-white/80 active:scale-[0.98] font-[family-name:var(--font-space-grotesk)] cursor-pointer">
        Download App
      </DownloadButton>
    </nav>
  )
}

// ─── Platform logo wall ───────────────────────────────────────────────────────
const PLATFORMS = ['Uber', 'Lyft', 'DoorDash', 'Instacart', 'Amazon Flex', 'GrubHub', 'Shipt', 'Spark']

function PlatformWall() {
  return (
    <div className="relative bg-[#0C4646] border-t border-b border-white/[0.06] py-5 px-5 md:px-14 overflow-hidden">
      {/* Top fade-in: blends from hero #0A3C3C into platform wall #0C4646 */}
      <div className="absolute inset-x-0 -top-16 h-16 pointer-events-none bg-gradient-to-b from-[#0A3C3C] to-transparent" />
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-10 flex-wrap justify-center">
        <p className="text-white/60 text-[12px] tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">Works with</p>
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          {PLATFORMS.map(p => (
            <span key={p} className="text-white/55 text-[13px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)]">{p}</span>
          ))}
          {/* The differentiator, surfaced in the first viewport-and-a-half */}
          <span className="text-[#5EEAD4]/80 text-[12px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)] border border-[#5EEAD4]/25 px-2.5 py-0.5">
            Cars &amp; e-bikes
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Anchor banner ───────────────────────────────────────────────────────────
function AnchorBanner() {
  const stats = [
    { val: '$60', label: 'hidden costs per shift' },
    { val: '$0.14', label: 'reserve per dollar earned' },
    { val: '74%', label: 'of gross you keep' },
  ]
  return (
    <div className="bg-[#0C4646] border-b border-white/[0.06] py-5 px-6">
      <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-white/[0.08]">
        {stats.map((s) => (
          <div key={s.val} className="flex flex-col items-center gap-1 px-2 sm:px-6 py-1 text-center">
            <span className="text-white/80 text-[15px] sm:text-[16px] font-semibold font-[family-name:var(--font-space-grotesk)] tracking-[-0.02em]">{s.val}</span>
            <span className="text-white/55 text-[10px] sm:text-[11px] font-[family-name:var(--font-dm-sans)] leading-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Motion helpers ───────────────────────────────────────────────────────────
// Rules: every number renders its FINAL value in the server HTML (crawlers,
// previews, and no-JS visitors see real figures, never $0), entrances play
// once at 300–400ms ease-out, and everything sits still under
// prefers-reduced-motion.
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal(ref: React.RefObject<HTMLElement | null>, start = 'top 70%') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-r]'), {
        opacity: 0,
        y: 24,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start, toggleActions: 'play none none none' },
      })
    }, el)
    return () => ctx.revert()
  }, [ref, start])
}

// Once-visible entrance: server HTML is visible; with JS + motion allowed the
// element hides on mount, then reveals once when its trigger activates.
function useOnceVisible(active: boolean, delay = 0) {
  const [phase, setPhase] = useState<'static' | 'hidden' | 'shown'>('static')
  useEffect(() => {
    if (prefersReducedMotion()) return
    setPhase(p => (p === 'static' ? 'hidden' : p))
  }, [])
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setPhase('shown'), delay)
    return () => clearTimeout(t)
  }, [active, delay])
  return phase !== 'hidden'
}

// ─── Waterfall "Real Example" section ────────────────────────────────────────
function WaterfallSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  // Canonical example — matches the live app screenshots: $235 gross → $175 real.
  const gross = useCountUp(235, 400, active)
  const vehicle = useCountUp(43, 400, active)
  const taxes = useCountUp(17, 400, active)
  const net = useCountUp(175, 400, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      onEnter: () => setActive(true),
    })
    return () => trigger.kill()
  }, [])

  const rows = [
    { label: 'Gross earnings', val: `$${gross}`, color: 'text-white/90', pct: 100 },
    { label: 'Vehicle costs', val: `−$${vehicle}`, color: 'text-[#E11D48]', pct: Math.round((vehicle / 235) * 100) },
    { label: 'Estimated taxes', val: `−$${taxes}`, color: 'text-[#F59E0B]', pct: Math.round((taxes / 235) * 100) },
  ]

  return (
    <section id="why" ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0C4646] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          Real example
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          What a typical shift actually pays
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-8 sm:mb-12 max-w-lg font-[family-name:var(--font-dm-sans)]">
          8 hours · 105 mi · 2023 Toyota Prius · IRS mileage rate $0.725/mi (2026)
        </p>

        <div className="border border-white/[0.07] bg-[#0A3C3C]">
          {/* header */}
          <div className="px-5 sm:px-8 py-5 border-b border-white/[0.06] flex items-start sm:items-baseline justify-between gap-4">
            <span className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-space-grotesk)] font-medium flex-shrink-0">Shift breakdown</span>
            <div className="flex gap-4 sm:gap-8 flex-wrap justify-end">
              {[['Vehicle', '2023 Toyota Prius'], ['Miles', '105 mi'], ['Hours', '8.0 h']].map(([l, v]) => (
                <div key={l} className="flex flex-col gap-1 text-right sm:text-left">
                  <span className="text-[10px] sm:text-[11px] text-white/60 tracking-[0.1em] uppercase font-[family-name:var(--font-space-grotesk)]">{l}</span>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#94A3B8] font-[family-name:var(--font-space-grotesk)]">{v}</span>
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
                      className="h-full bg-white/20 transition-all duration-[400ms] ease-out"
                      style={{ width: active ? `${row.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}

              {/* net result */}
              <div className={`mt-5 px-5 py-5 border flex justify-between items-baseline transition-all duration-[400ms] delay-200 ${active ? 'border-[#5EEAD4]/25 bg-[#5EEAD4]/[0.04]' : 'border-white/[0.06]'}`}>
                <span className="text-[11px] text-[#5EEAD4] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">Real take-home</span>
                <span className="text-[42px] font-bold tracking-[-0.05em] text-[#10B981] leading-none font-[family-name:var(--font-space-grotesk)]">${net}</span>
              </div>
            </div>

            {/* stats */}
            <div className="px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06]">
                {[
                  ['Hourly rate', '$22', 'after all costs'],
                  ['Tax reserve', '$0.14', 'per dollar earned'],
                  ['Vehicle cost', '$0.18', 'per dollar gross'],
                  ['Effective rate', '74%', 'of gross kept'],
                ].map(([l, v, s]) => (
                  <div key={l} className="bg-[#0A3C3C] px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-1">
                    <span className="text-[11px] text-white/60 tracking-[0.1em] uppercase font-[family-name:var(--font-space-grotesk)]">{l}</span>
                    <span className="text-[20px] sm:text-[22px] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-space-grotesk)]">{v}</span>
                    <span className="text-[11px] text-white/50 font-[family-name:var(--font-dm-sans)]">{s}</span>
                  </div>
                ))}
              </div>

              <div className="border border-white/[0.06] px-5 py-4 bg-[#5EEAD4]/[0.03]">
                <p className="text-[11px] text-[#5EEAD4] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] mb-2">GigMiles insight</p>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                  You kept 74% of gross earnings. The IRS mileage deduction adds $76 in write-offs this shift — about ~$17 less in taxes.
                </p>
              </div>

              <p className="text-[11px] text-white/40 italic font-[family-name:var(--font-dm-sans)] leading-relaxed">
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
    sub: '8h · 105 mi · 2023 Toyota Prius',
    img: '/ss-home.jpeg',          // TODO: replace with Home / Net Earnings hero card screenshot
    imgAlt: 'Net earnings home screen',
  },
  {
    n: '02',
    label: 'What it cost to drive',
    amount: '−$43',
    color: '#E11D48',
    sub: 'Fuel $17 · Wear & tear $26 · IRS-aware depreciation',
    img: '/ss-shifts.jpeg',        // TODO: replace with Shifts list page screenshot
    imgAlt: 'Shifts list',
  },
  {
    n: '03',
    label: 'What the IRS takes',
    amount: '−$17',
    color: '#F59E0B',
    sub: 'SE $16 · Federal $0 · State $1',
    img: '/ss-tax-breakdown.jpeg',
    imgAlt: 'Tax breakdown',
  },
  {
    n: '04',
    label: 'What you actually keep',
    amount: '$175',
    color: '#5EEAD4',
    sub: '$22 / hr — after every cost',
    img: '/ss-quarterly.jpeg',
    imgAlt: 'Quarterly earnings summary',
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeScene, setActiveScene] = useState(0)
  // Reduced motion: skip the scroll-scrubbed storyboard entirely and show the
  // stacked cards (each scene reads as a complete statement) on all viewports.
  const [staticLayout, setStaticLayout] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) setStaticLayout(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActiveScene(Math.min(3, Math.floor(v * 4)))
  })

  const scene = HOW_SCENES[activeScene]

  return (
    // The 300vh scroll runway only serves the md+ sticky storyboard; on
    // mobile that viewport is hidden and the extra height reads as a
    // screenful of blank teal after the stacked cards.
    <section id="how" ref={sectionRef} className={`relative bg-[#0A3C3C] border-t border-white/[0.06] ${staticLayout ? '' : 'md:min-h-[300vh]'}`}>
      {/* ── Sticky viewport ── */}
      <div className={`sticky top-0 h-screen w-full overflow-hidden ${staticLayout ? 'hidden' : 'hidden md:flex'}`}>
        {/* Left — narrative */}
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-16 gap-8 relative">
          {/* Section eyebrow — stays fixed */}
          <div>
            <p className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-3 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
              <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
              How it works
            </p>
            <h2 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(22px,3vw,38px)] max-w-xs">
              One shift.<br />Every number.
            </h2>
          </div>

          {/* Scene content — animates */}
          <div className="flex flex-col gap-4" key={activeScene} style={{ animation: 'howFadeUp 0.4s ease both' }}>
            <span className="text-white/60 text-[11px] tracking-[0.2em] font-[family-name:var(--font-space-grotesk)]">
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
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeScene ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === activeScene ? '#5EEAD4' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right — phone image stack */}
        <div className="w-[45%] lg:w-[40%] flex items-center justify-center overflow-hidden relative bg-[#0C4646] border-l border-white/[0.06]">
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
                className="absolute inset-0 flex items-start justify-center pt-[88px] pb-6 transition-all duration-[400ms] ease-out"
                style={{
                  opacity: i === activeScene ? 1 : 0,
                  transform: `translateY(${(i - activeScene) * 60}px)`,
                  pointerEvents: i === activeScene ? 'auto' : 'none',
                }}
              >
                <div className="relative flex-shrink-0 h-[calc(100vh-120px)] max-h-[760px] aspect-[9/19]">
                  <div className="relative h-full bg-[#13605F] border-2 border-white/[0.10] rounded-[36px] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                    <div className="h-full bg-[#0A3C3C] rounded-[28px] overflow-hidden relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-[#13605F] rounded-b-xl z-10" />
                      <Image src={s.img} alt={s.imgAlt} fill className="object-cover object-top" sizes="(min-width:1280px) 320px, (min-width:1024px) 260px, 200px" />
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

      {/* ── Mobile (and reduced-motion): 4 stacked cards with phone images ── */}
      <div className={`${staticLayout ? '' : 'md:hidden'} py-16 flex flex-col gap-8 px-5`}>
        <p className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          How it works
        </p>
        {HOW_SCENES.map(s => (
          <div key={s.n} className="bg-[#0C4646] border border-white/[0.07] rounded-3xl overflow-hidden">
            {/* Phone image */}
            <div className="relative bg-[#0A3C3C] flex items-center justify-center py-8" style={{ background: `radial-gradient(circle 200px at 50% 60%, ${s.color}12, transparent 70%)` }}>
              <div className="relative w-[140px]">
                <div className="relative bg-[#13605F] border-2 border-white/[0.10] rounded-[32px] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                  <div className="bg-[#0A3C3C] rounded-[24px] overflow-hidden aspect-[9/19] relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#13605F] rounded-b-lg z-10" />
                    <Image src={s.img} alt={s.imgAlt} fill className="object-cover object-top" sizes="140px" />
                  </div>
                </div>
              </div>
            </div>
            {/* Text */}
            <div className="p-6 flex flex-col gap-2 border-t border-white/[0.06]">
              <span className="text-white/55 text-[11px] tracking-[0.2em] font-[family-name:var(--font-space-grotesk)]">{s.n} / 04</span>
              <div
                className="font-[family-name:var(--font-space-grotesk)] font-extralight text-[48px] tracking-[-0.05em] leading-none tabular-nums"
                style={{ color: s.color }}
              >{s.amount}</div>
              <p className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[16px] tracking-[-0.02em]">{s.label}</p>
              <p className="text-[#94A3B8] text-[13px] font-[family-name:var(--font-dm-sans)] leading-relaxed">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Animated count-up hook ───────────────────────────────────────────────────
// Initial value IS the target — static render shows the real number.
function useCountUp(target: number, duration = 400, active = false) {
  const [value, setValue] = useState(target)
  const played = useRef(false)
  useEffect(() => {
    if (!active || played.current || prefersReducedMotion()) return
    played.current = true
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
// Initial width IS the target pct; with JS + motion the bar collapses before
// its trigger and fills once on activation.
function useBarFill(pct: number, delay = 0, active = false) {
  const [width, setWidth] = useState(pct)
  const played = useRef(false)
  useEffect(() => {
    if (played.current || prefersReducedMotion()) return
    if (!active) {
      setWidth(0)
      return
    }
    played.current = true
    const t = setTimeout(() => {
      setWidth(pct)
    }, delay)
    return () => clearTimeout(t)
  }, [active, pct, delay])
  return width
}

// ─── Widget: Tax Breakdown ────────────────────────────────────────────────────
function TaxBreakdownWidget({ active }: { active: boolean }) {
  const se = useCountUp(115, 400, active)
  const state = useCountUp(37, 400, active)
  const total = useCountUp(152, 400, active)
  const seBar = useBarFill(76, 100, active)
  const stBar = useBarFill(24, 200, active)

  return (
    <div className="w-full max-w-[320px] bg-[#0C4A4A] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/65 text-[11px] tracking-[0.2em] uppercase">Q2 Tax Estimate</span>
        <span className="text-white/55 text-[11px]">Apr – Jun 2026</span>
      </div>
      <div>
        <span className="text-white font-light text-4xl tracking-[-0.04em]">${total}</span>
        <p className="text-white/60 text-xs mt-1">17.8% effective rate · due Jun 15</p>
      </div>
      <div className="space-y-4 pt-2 border-t border-white/[0.07]">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Self-Employment Tax</span>
            <span className="text-white/70">${se}</span>
          </div>
          <div className="h-px bg-white/[0.08] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-[400ms] ease-out"
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
              className="absolute inset-y-0 left-0 bg-white/25 transition-all duration-[400ms] ease-out delay-150"
              style={{ width: `${stBar}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs pt-1">
          <span className="text-white/50">Federal Income Tax</span>
          <span className="text-white/50">$0</span>
        </div>
      </div>
    </div>
  )
}

// ─── Widget: Expense Gaps ─────────────────────────────────────────────────────
function ExpenseGapsWidget({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setPulse(true), 300)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="w-full max-w-[320px] bg-[#0C4A4A] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/65 text-[11px] tracking-[0.2em] uppercase">Expense Gaps</span>
        <span
          className={`text-[11px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border transition-all duration-[400ms] ${
            pulse
              ? 'border-[#F59E0B]/50 text-[#F59E0B]/80 bg-[#F59E0B]/5'
              : 'border-white/10 text-white/40'
          }`}
        >
          2 missing
        </span>
      </div>
      <p className="text-white/55 text-xs leading-relaxed">
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
                <p className="text-white/60 text-[11px] mt-0.5">{item.sub}</p>
              </div>
              <span
                className={`text-[11px] transition-all duration-[400ms] ${
                  pulse ? 'text-[#10B981]/70' : 'text-white/40'
                }`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
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
        className={`mt-1 text-center text-xs tracking-[0.2em] uppercase py-3 rounded-lg border transition-all duration-[400ms] ${
          pulse
            ? 'border-white/20 text-white/50 hover:border-white/40 hover:text-white/70'
            : 'border-white/[0.08] text-white/35'
        }`}
      >
        + Log Missing Expenses
      </button>
    </div>
  )
}

// ─── Widget: YTD Summary ──────────────────────────────────────────────────────
function YtdSummaryWidget({ active }: { active: boolean }) {
  const earnings = useCountUp(1864, 400, active)
  const owed = useCountUp(337, 400, active)
  const paid = useCountUp(185, 400, active)

  return (
    <div className="w-full max-w-[320px] bg-[#0C4A4A] rounded-2xl p-6 flex flex-col gap-5 ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between">
        <span className="text-white/65 text-[11px] tracking-[0.2em] uppercase">Year-to-Date</span>
        <span className="text-white/55 text-[11px]">2026</span>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.07]">
        <div className="flex flex-col gap-1.5">
          <span className="text-white/60 text-[10px] tracking-[0.12em] uppercase">Earnings</span>
          <span className="text-white font-light text-xl tracking-[-0.03em]">${earnings.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-white/60 text-[10px] tracking-[0.12em] uppercase">Est. Tax</span>
          <span className="text-[#F59E0B]/80 font-light text-xl tracking-[-0.03em]">${owed}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-white/60 text-[10px] tracking-[0.12em] uppercase">Paid</span>
          <span className="text-[#10B981]/70 font-light text-xl tracking-[-0.03em]">${paid}</span>
        </div>
      </div>
      <div className="bg-white/[0.04] rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/65 text-[11px] tracking-[0.15em] uppercase">Tax reserve</span>
          <span className="text-white/55 text-[11px]">set aside per $1</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-light text-2xl tracking-[-0.03em]">$0.23</span>
          <span className="text-white/60 text-xs">/ dollar earned</span>
        </div>
        <p className="text-white/55 text-[11px] mt-2 leading-relaxed">18.1% effective rate + 5% buffer</p>
      </div>
      <p className="text-white/55 text-[11px] text-center">Year-end projection: $1,051 total tax</p>
    </div>
  )
}

// ─── Widget: Quarterly ────────────────────────────────────────────────────────
function QuarterlyWidget({ active }: { active: boolean }) {
  // Server HTML renders both quarters visible; entrances play once with JS.
  const q1visible = useOnceVisible(active, 0)
  const q2visible = useOnceVisible(active, 200)

  return (
    <div className="w-full max-w-[320px] flex flex-col gap-3">
      {/* Q1 */}
      <div
        className="bg-[#0C4A4A] rounded-2xl p-5 ring-1 ring-white/[0.07] transition-all duration-[400ms]"
        style={{ opacity: q1visible ? 1 : 0, transform: q1visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs font-mono">Q1</span>
            <span className="text-white/60 text-xs">Jan – Mar 2026</span>
          </div>
          <span className="text-[#E11D48] text-[9px] tracking-[0.15em] uppercase border border-[#E11D48]/30 px-2 py-0.5 rounded-full">Past due</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Earnings', v: '$1,010', c: 'text-white/60' },
            { l: 'Expenses', v: '$19', c: 'text-[#E11D48]' },
            { l: 'Taxable Income', v: '$991', c: 'text-white/50' },
            { l: 'Est. Tax', v: '$184.86', c: 'text-[#F59E0B]/70' },
          ].map(item => (
            <div key={item.l} className="bg-white/[0.04] rounded-lg p-2.5">
              <p className="text-white/55 text-[10px] tracking-[0.1em] uppercase mb-1">{item.l}</p>
              <p className={`${item.c} text-sm font-light`}>{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div
        className="bg-[#0C4A4A] rounded-2xl p-5 ring-1 ring-[#F59E0B]/20 transition-all duration-[400ms]"
        style={{
          opacity: q2visible ? 1 : 0,
          transform: q2visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#F59E0B]/60 text-xs font-mono">Q2</span>
            <span className="text-white/60 text-xs">Apr – Jun 2026</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-[#F59E0B]/50 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded-full">Current</span>
          </div>
          <span className="text-white/45 text-[9px]">Due Jun 15</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Earnings', v: '$854', c: 'text-white/60' },
            { l: 'Expenses', v: '$42', c: 'text-[#E11D48]' },
            { l: 'Taxable Income', v: '$812', c: 'text-white/50' },
            { l: 'Est. Tax', v: '$152.05', c: 'text-[#F59E0B]/70' },
          ].map(item => (
            <div key={item.l} className="bg-white/[0.04] rounded-lg p-2.5">
              <p className="text-white/55 text-[10px] tracking-[0.1em] uppercase mb-1">{item.l}</p>
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
    if (prefersReducedMotion()) {
      setActive(true)
      return
    }
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-r]'), {
        opacity: 0, y: 24, duration: 0.4, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 70%',
          toggleActions: 'play none none none',
          onEnter: () => setActive(true),
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
      <div className="bg-[#0C4646] flex-1 flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-16 gap-4 sm:gap-5">
        <span data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">{tag}</span>
        <h3 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[clamp(18px,2.5vw,28px)] leading-snug tracking-[-0.02em] max-w-sm">
          {title}
        </h3>
        <p data-r className="text-[#94A3B8] text-[13px] sm:text-[14px] leading-relaxed max-w-xs font-[family-name:var(--font-dm-sans)]">{body}</p>
      </div>
      <div className="bg-[#0A3C3C] w-full md:w-[400px] flex items-center justify-center py-8 px-5 sm:py-12 sm:px-8">
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
    <section ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0A3C3C] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          Features
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          Built for gig workers. Not accountants.
        </h2>
        <p data-r className="text-[#94A3B8] text-[15px] leading-relaxed mb-10 sm:mb-14 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Every screen gives you one clear number — what you actually kept.
        </p>
        <div className="space-y-px">
          <FeatureRow
            tag="Tax breakdown"
            title="Quarterly taxes — broken down by type"
            body="GigMiles calculates self-employment, federal, and state tax separately. Know your estimated quarterly tax before the deadline — not after."
            widget={(a) => <TaxBreakdownWidget active={a} />}
          />
          <FeatureRow
            tag="Expense gaps"
            title="Spot the expenses you forgot to log"
            body="GigMiles scans your data and spots unlogged expenses — phone, parking, tolls — so your records stay complete and your tax pro gets cleaner numbers."
            widget={(a) => <ExpenseGapsWidget active={a} />}
            reverse
          />
          <FeatureRow
            tag="Tax reserve"
            title="One number: set this much aside per dollar"
            body="GigMiles gives you one simple estimate — how many cents to set aside per dollar earned — so you can plan ahead for tax season."
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

// ─── Calculator ───────────────────────────────────────────────────────────────
function CalculatorSection() {
  const ref = useRef<HTMLElement>(null)
  const [gross, setGross] = useState(1200)
  const [hours, setHours] = useState(30)
  useReveal(ref, 'top 80%')

  const costs = Math.round(gross * 0.25)
  const taxes = Math.round(gross * 0.17)
  const net = gross - costs - taxes
  const hourly = hours > 0 ? (net / hours).toFixed(2) : '0.00'

  return (
    <section id="calculator" ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0C4646] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          Calculator
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          What do you actually take home?
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-3 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Adjust the sliders and see your real net income — after vehicle costs and self-employment taxes.
        </p>
        <a
          data-r
          href="/calculator"
          className="inline-flex items-center gap-2 mb-8 sm:mb-12 text-[#5EEAD4] text-[13px] tracking-[0.02em] hover:opacity-80 transition-opacity font-[family-name:var(--font-space-grotesk)]"
        >
          Open the full calculator — exact IRS mileage &amp; e-bike math
          <span aria-hidden="true">→</span>
        </a>

        <div data-r className="border border-white/[0.07] bg-[#0A3C3C] grid md:grid-cols-2 gap-px bg-white/[0.06]">
          {/* Sliders */}
          <div className="bg-[#0A3C3C] px-5 py-7 sm:px-8 sm:py-10 flex flex-col gap-8 sm:gap-10">
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
                className="w-full h-px appearance-none bg-white/10 cursor-pointer accent-[#5EEAD4] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5EEAD4] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#5EEAD4]"
              />
              <div className="flex justify-between text-[11px] text-white/55 font-[family-name:var(--font-dm-sans)]">
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
                className="w-full h-px appearance-none bg-white/10 cursor-pointer accent-[#5EEAD4] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5EEAD4] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#5EEAD4]"
              />
              <div className="flex justify-between text-[11px] text-white/55 font-[family-name:var(--font-dm-sans)]">
                <span>5 hrs</span>
                <span>80 hrs</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-[#0A3C3C] px-5 py-7 sm:px-8 sm:py-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              {[
                { label: 'Gross earnings', val: `$${gross.toLocaleString()}`, color: 'text-white/85', barColor: 'bg-white/30', pct: 100 },
                { label: 'Vehicle & operating costs (est. 25%)', val: `−$${costs}`, color: 'text-[#E11D48]', barColor: 'bg-[#E11D48]/60', pct: 25 },
                { label: 'Estimated taxes — SE + federal + state (est. 17%)', val: `−$${taxes}`, color: 'text-[#F59E0B]/90', barColor: 'bg-[#F59E0B]/60', pct: 17 },
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

            <div className="mt-auto border border-[#5EEAD4]/20 bg-[#5EEAD4]/[0.04] px-5 py-5 flex flex-col gap-3">
              <span className="text-[12px] text-[#5EEAD4] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]">Your real take-home</span>
              <div className="flex items-baseline justify-between">
                <span className="text-[42px] font-bold tracking-[-0.05em] text-[#10B981] leading-none font-[family-name:var(--font-space-grotesk)] tabular-nums">
                  ${net.toLocaleString()}
                </span>
                <span className="text-white/65 text-[13px] font-[family-name:var(--font-dm-sans)] tabular-nums">
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
                  className="bg-[#E11D48]/55 transition-[width] duration-500 ease-out"
                  style={{ width: `${(costs / gross) * 100}%` }}
                />
                <div
                  className="bg-[#F59E0B]/55 transition-[width] duration-500 ease-out"
                  style={{ width: `${(taxes / gross) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-[family-name:var(--font-dm-sans)] tabular-nums">
                <span className="text-[#10B981]/70">{Math.round((net / gross) * 100)}% kept</span>
                <span className="text-[#E11D48]">{Math.round((costs / gross) * 100)}% costs</span>
                <span className="text-[#F59E0B]/70">{Math.round((taxes / gross) * 100)}% taxes</span>
              </div>
              <p className="text-white/60 text-[12px] font-[family-name:var(--font-dm-sans)]">after vehicle costs + taxes · per week</p>
            </div>

            <DownloadButton className="text-center border border-[#5EEAD4]/30 text-[#5EEAD4]/70 text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-8 py-3 transition-all duration-200 hover:border-[#5EEAD4]/60 hover:text-[#5EEAD4] active:scale-[0.98] cursor-pointer w-full">
              Download GigMiles
            </DownloadButton>

            <p className="text-white/35 text-[10px] italic font-[family-name:var(--font-dm-sans)] leading-relaxed">
              Estimates only. Actual costs and taxes vary. Not tax advice.
            </p>
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
      className={`relative ${tier.bg} p-6 sm:p-8 flex flex-col gap-6 group overflow-hidden ${tier.featured ? 'border-t-2 border-t-[#5EEAD4]' : ''}`}
      style={{ '--mx': '50%', '--my': '50%', '--spot-opacity': '0' } as React.CSSProperties}
    >
      {/* Spotlight fill: tracks cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: 'radial-gradient(420px circle at var(--mx) var(--my), rgba(94,234,212,0.10), transparent 55%)',
        }}
      />
      {/* Border glow: brighter, tighter radial, masked to the edge */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: 'radial-gradient(260px circle at var(--mx) var(--my), rgba(94,234,212,0.45), transparent 60%)',
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
            <span className="text-[9px] tracking-[0.12em] uppercase text-[#5EEAD4]/80 bg-[#0A3C3C] border border-[#5EEAD4]/30 px-2 py-0.5 font-[family-name:var(--font-space-grotesk)]">
              {tier.badge}
            </span>
          </div>
        )}
        <div>
          <p className="text-white/50 text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)]">{tier.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-[family-name:var(--font-space-grotesk)] font-bold text-5xl tracking-[-0.04em]">{tier.price}</span>
            {tier.priceSuffix && <span className="text-[#94A3B8] text-[13px]">{tier.priceSuffix}</span>}
          </div>
          <p className="text-[#94A3B8] text-[12px] mt-2 font-[family-name:var(--font-dm-sans)]">{tier.caption}</p>
        </div>
        <ul className="space-y-3 flex-1">
          {tier.features.map(f => (
            <li key={f} className="flex items-center gap-3 text-[13px] text-[#94A3B8] font-[family-name:var(--font-dm-sans)]">
              <span className="text-[#5EEAD4]/70 flex-shrink-0 text-[12px]">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <DownloadButton
          className={`mt-2 text-center text-[11px] tracking-[0.1em] font-[family-name:var(--font-space-grotesk)] px-8 py-3 transition-all duration-200 active:scale-[0.98] cursor-pointer w-full ${
            tier.featured
              ? 'bg-[#5EEAD4] text-[#0A3C3C] font-semibold hover:bg-[#5EEAD4]/85'
              : 'border border-white/[0.18] text-white/60 hover:border-white/35 hover:text-white/85'
          }`}
        >
          {tier.cta}
        </DownloadButton>
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
    cta: 'Download App',
    bg: 'bg-[#0A3C3C]',
  },
  {
    label: 'Monthly',
    price: '$9.99',
    priceSuffix: '/ month',
    caption: 'Billed monthly · cancel anytime',
    features: ['Everything in Free Trial', 'Export for CPA', 'Unlimited shift history', 'Priority support'],
    cta: 'Download App',
    bg: 'bg-[#0A3C3C]',
  },
  {
    badge: 'Most Popular',
    label: 'Annual',
    price: '$99.99',
    priceSuffix: '/ year',
    caption: '$8.33 / month · save 17%',
    features: ['Everything in Monthly', 'Early access to new features', 'Locked-in beta pricing', 'Tax season export pack'],
    cta: 'Download App',
    bg: 'bg-[#0C4646]',
    featured: true,
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section id="pricing" ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0A3C3C] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          Pricing
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-xl">
          Less than one Uber ride per month
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-16 max-w-md font-[family-name:var(--font-dm-sans)]">
          10 days free during beta. No card required to start.
        </p>

        {/* Mobile: featured first, then rest. Desktop: natural order */}
        <div data-r className="flex flex-col md:grid md:grid-cols-3 border border-white/[0.07] bg-white/[0.07] gap-px">
          {/* Mobile-first sort: featured card floats to top on mobile */}
          <div className="contents md:hidden">
            {[...PRICING_TIERS].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map(tier => (
              <PricingCard key={tier.label + '-m'} tier={tier} />
            ))}
          </div>
          <div className="hidden md:contents">
            {PRICING_TIERS.map(tier => (
              <PricingCard key={tier.label} tier={tier} />
            ))}
          </div>
        </div>

        <p data-r className="text-white/40 text-[11px] leading-relaxed mt-8 max-w-lg font-[family-name:var(--font-dm-sans)] italic">
          Tax estimates are for planning purposes only — not tax advice, not a filed return. GigMiles factors in your optional W-2 wages when provided. Always consult a licensed tax professional before filing.
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
    a: 'GigMiles estimates self-employment tax, federal income tax, and state income tax using the current IRS mileage rate ($0.725/mi for 2026) and your filing status. Add your W-2 wages and GigMiles stacks your gig earnings on top to estimate your marginal rate more accurately. Estimates are for planning only — always verify with a licensed tax professional before filing.',
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
    a: 'Yes. GigMiles includes automatic GPS shift tracking — tap Start Shift and it records every mile you drive, your route, and shift duration into IRS-ready logs. Prefer manual entry? You can log miles per shift by hand too.',
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
        <span className={`text-white/50 text-base leading-none mt-0.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
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
    <section ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0C4646] border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          FAQ
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-8 sm:mb-12 max-w-xl">
          Common questions
        </h2>
        <div data-r>
          {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
        <a
          data-r
          href="/contact"
          className="inline-flex items-center gap-2 mt-8 text-[#5EEAD4] text-[13px] sm:text-[14px] tracking-[0.02em] hover:text-[#5EEAD4] transition-colors font-[family-name:var(--font-space-grotesk)]"
        >
          See all questions
          <span aria-hidden="true">→</span>
        </a>
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
      className="relative min-h-[70svh] sm:min-h-[80svh] bg-[#0A3C3C] flex flex-col items-center justify-center px-5 py-16 sm:px-6 text-center gap-5 sm:gap-7 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #5EEAD410 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div data-r className="flex flex-col items-center gap-3 mb-2 relative z-10">
        <Image src="/brand/icons/icon-180.png" alt="GigMiles" width={48} height={48} className="rounded-[12px] opacity-90" />
        <span className="text-[#5EEAD4] text-[22px] italic font-black tracking-[-0.04em] leading-none font-[family-name:var(--font-outfit)]">gigmiles</span>
      </div>
      <h2 data-r className="relative z-10 text-white font-[family-name:var(--font-space-grotesk)] font-black tracking-[-0.04em] leading-[1.0] text-[clamp(32px,7vw,80px)]">
        Your real earnings.<br className="hidden md:block" /> After everything.
      </h2>
      <p data-r className="relative z-10 text-[#94A3B8] text-[15px] max-w-sm leading-relaxed font-[family-name:var(--font-dm-sans)]">
        Know what you actually kept — after gas, mileage, and taxes. Every shift.
      </p>
      {/* Official store badges (Apple / Google marketing guidelines) */}
      <div className="relative z-10 mt-2 flex flex-wrap items-center justify-center gap-4">
        <a href={IOS_APP_STORE_URL} aria-label="Download on the App Store" className="inline-flex transition-transform active:scale-[0.97]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badges/app-store-badge.svg" alt="Download on the App Store" className="h-[52px] w-auto" />
        </a>
        <a href={ANDROID_PLAY_STORE_URL} aria-label="Get it on Google Play" className="inline-flex transition-transform active:scale-[0.97]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badges/google-play-badge.svg" alt="Get it on Google Play" className="h-[52px] w-auto" />
        </a>
      </div>
      <p data-r className="relative z-10 text-white/55 text-[11px] font-[family-name:var(--font-dm-sans)]">
        10 days free during beta — no card required
      </p>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0A3C3C] border-t border-white/[0.06] px-5 md:px-14 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/icons/icon-180.png" alt="GigMiles" width={22} height={22} className="rounded-[6px] opacity-90" />
          <div>
            <span className="text-[#5EEAD4]/85 text-[15px] italic font-black tracking-[-0.04em] leading-none font-[family-name:var(--font-outfit)]">gigmiles</span>
            <p className="text-white/45 text-[11px] mt-1 font-[family-name:var(--font-dm-sans)]">Your real earnings. After everything.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-8">
          {[['Blog', '/blog'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Legal', 'mailto:legal@gigmiles.app']].map(([l, h]) => (
            <a key={l} href={h} className="text-white/50 text-[12px] tracking-[0.04em] font-[family-name:var(--font-space-grotesk)] hover:text-white/55 transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-left md:text-right">
          <p className="text-white/55 text-[11px] font-[family-name:var(--font-dm-sans)]">&copy; {new Date().getFullYear()} GigMiles</p>
          <p className="text-white/35 text-[10px] mt-1 max-w-[220px] leading-relaxed font-[family-name:var(--font-dm-sans)] italic">Tax estimates are for planning purposes only. Not tax advice.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── E-bike differentiator ────────────────────────────────────────────────────
function EBikeSection() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const points = [
    ['Electricity per mile', 'Your real charging cost — not a gas estimate that never applied to you.'],
    ['Battery & mechanical wear', 'Tires, chain, brakes, and battery depreciation — the costs cars never have.'],
    ['The right IRS method', 'Actual expenses, applied automatically — the IRS does not allow standard mileage for bikes.'],
  ]
  return (
    <section ref={ref} className="py-16 md:py-24 px-5 md:px-14 bg-[#0C4646] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <p data-r className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          Unique to GigMiles
        </p>
        <h2 data-r className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(26px,4vw,44px)] mb-3 sm:mb-4 max-w-2xl">
          Driving an e-bike? We do the math no one else does.
        </h2>
        <p data-r className="text-[#94A3B8] text-[14px] leading-relaxed mb-8 sm:mb-12 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Most trackers only understand cars — so e-bike couriers get numbers that don&apos;t fit. GigMiles is the only one that calculates your true net on an e-bike.
        </p>
        <div data-r className="grid sm:grid-cols-3 border border-white/[0.07] bg-white/[0.06] gap-px">
          {points.map(([title, body]) => (
            <div key={title} className="bg-[#0A3C3C] px-5 py-6 sm:px-6 sm:py-7 flex flex-col gap-2">
              <span className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[15px] sm:text-[16px] tracking-[-0.01em]">{title}</span>
              <span className="text-[#94A3B8] text-[13px] leading-relaxed font-[family-name:var(--font-dm-sans)]">{body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ScrollLanding() {
  return (
    <>
      <Nav />

      <main className="bg-[#0A3C3C]">
        {/* The hero renders its headline as scroll-staged spans — keep a real
            h1 in the document for crawlers, previews, and screen readers. */}
        <h1 className="sr-only">
          GigMiles — know what you actually earn after gas, mileage, and taxes
        </h1>
        <HeroMeltdown />
        <PlatformWall />
        <AnchorBanner />
        <WaterfallSection />
        <HowItWorksSection />
        <EBikeSection />
        <FeaturesSection />
        <CalculatorSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <Footer />
      </main>
    </>
  )
}
