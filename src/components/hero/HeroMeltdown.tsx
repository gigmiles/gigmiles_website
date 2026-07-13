'use client'

import { useRef, useState } from 'react'
import { useScroll, useSpring, useMotionValueEvent } from 'motion/react'
import { Particles } from '@/components/ui/particles'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { DownloadButton } from '@/components/ui/DownloadButton'

// ─── Config — change these numbers anytime ──────────────────────────────────
// Canonical example — MUST match the published launch video: $235 gross →
// $175 real over an 8h shift ($22/hr chip, frame-confirmed). Change only in
// lockstep with the video assets.
export const HERO_CONFIG = {
  gross: 235,
  vehicleCost: 27,
  taxes: 33,
  get net() { return this.gross - this.vehicleCost - this.taxes },
  hourlyRate: 22,
  shiftHours: 8,
  platforms: 'DoorDash + Uber Eats',
  miles: 130,
  vehicle: '2023 Toyota Prius',
  trips: 3,
}

// ─── Color interpolation helper ─────────────────────────────────────────────
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const bl = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${bl})`
}

function getStageColor(progress: number): string {
  if (progress < 0.15) return '#5EEAD4'
  if (progress < 0.35) return lerpColor('#5EEAD4', '#F59E0B', (progress - 0.15) / 0.2)
  if (progress < 0.55) return lerpColor('#F59E0B', '#E11D48', (progress - 0.35) / 0.2)
  return '#5EEAD4'
}

// ─── Scroll-driven number display ───────────────────────────────────────────
function MeltdownNumber({ progress }: { progress: number }) {
  const { gross, net } = HERO_CONFIG
  const countdownEnd = gross - net

  let displayNum: number
  if (progress < 0.15) {
    displayNum = gross
  } else if (progress < 0.55) {
    const t = (progress - 0.15) / 0.4
    displayNum = Math.round(gross - countdownEnd * t)
  } else {
    displayNum = net
  }

  const color = getStageColor(progress)
  const scale = progress < 0.15 ? 1
    : progress < 0.35 ? 1 - 0.45 * ((progress - 0.15) / 0.20)
    : progress < 0.55 ? 0.55
    : progress < 0.65 ? 0.55 + 0.45 * ((progress - 0.55) / 0.10)
    : 1.0

  const numOpacity = progress > 0.74 ? Math.max(0, 1 - (progress - 0.74) / 0.04) : 1

  // Phase 1: fade to black (0.53 → 0.565)
  const blackoutIn = progress >= 0.53 && progress < 0.565
    ? (progress - 0.53) / 0.035
    : progress >= 0.565 ? 1 : 0

  // Phase 2: iris opening — hole radius grows from 0 → 700px (0.565 → 0.62)
  const irisT = progress >= 0.565 && progress < 0.62
    ? (progress - 0.565) / 0.055
    : progress >= 0.62 ? 1 : 0
  const holeRadius = Math.round(irisT * irisT * 700) // eased
  const blackoutBg = irisT > 0
    ? `radial-gradient(circle ${holeRadius}px at 50% 50%, transparent 0%, transparent ${holeRadius - 1}px, #0A3C3C ${holeRadius + 2}px)`
    : '#0A3C3C'

  // Stage 1 entrance: number drops in from above
  const entranceY = progress < 0.08 ? (1 - progress / 0.08) * -30 : 0

  return (
    <>
      {/* Blackout overlay with iris reveal */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-none"
        style={{
          background: blackoutBg,
          opacity: Math.max(0, Math.min(1, blackoutIn)),
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4" style={{ opacity: numOpacity }}>
        {/* Stage 1 eyebrow — visible from first paint (CRO 2026-07-13: the
            fold used to show a bare $235 with zero framing; cold visitors
            had no idea what the page was about) */}
        <p
          className="text-white/30 text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-space-grotesk)] text-center"
          style={{ opacity: progress < 0.14 ? 1 : Math.max(0, 1 - (progress - 0.14) / 0.04) }}
        >
          Your shift earnings
        </p>

        <span
          className="font-[family-name:var(--font-space-grotesk)] font-extralight tabular-nums leading-none tracking-[-0.06em] select-none will-change-transform"
          style={{
            fontSize: 'clamp(100px, 22vw, 260px)',
            color,
            transform: `scale(${scale}) translateY(${entranceY}px)`,
            transition: 'transform 80ms linear',
          }}
        >
          ${displayNum}
        </span>

        {/* Stage 1 context line — visible from first paint */}
        <p
          className="text-white/20 text-[13px] font-[family-name:var(--font-dm-sans)] tracking-wide text-center"
          style={{ opacity: progress < 0.12 ? 1 : Math.max(0, 1 - (progress - 0.12) / 0.04) }}
        >
          {HERO_CONFIG.platforms} · {HERO_CONFIG.shiftHours}h · {HERO_CONFIG.miles} mi
        </p>

        {/* Stage 1 promise + scroll invitation — the one line that tells a
            cold visitor what this page is about before any scrolling. Fades
            out as the meltdown starts so it never competes with stage 2. */}
        <div
          className="flex flex-col items-center gap-2 text-center"
          style={{ opacity: progress < 0.06 ? 1 : Math.max(0, 1 - (progress - 0.06) / 0.05) }}
        >
          <p className="text-white/70 text-[13px] sm:text-[17px] px-6 font-[family-name:var(--font-dm-sans)]">
            That&apos;s your gross — not what you take home.
          </p>
          <p className="text-[#5EEAD4] text-[13px] sm:text-[14px] font-[family-name:var(--font-space-grotesk)] tracking-[0.06em]">
            Scroll to see what you actually keep
          </p>
          <span aria-hidden className="text-[#5EEAD4]/70 text-[18px] leading-none animate-bounce">↓</span>
        </div>

        {/* Stage 3+ subtitle */}
        <div
          className="flex flex-col items-center gap-2 text-center"
          style={{
            opacity: progress < 0.62 ? 0 : progress > 0.66 ? 1 : (progress - 0.62) / 0.04,
          }}
        >
          <p className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-[clamp(20px,4vw,32px)] tracking-[-0.02em]">
            What you actually kept.
          </p>
          <p className="text-white/45 text-[13px] sm:text-[15px] font-[family-name:var(--font-dm-sans)] tracking-wide">
            ${HERO_CONFIG.hourlyRate}/hr &middot; after every cost
          </p>
        </div>
      </div>
    </>
  )
}

// ─── Cost breakdown overlay (Stage 2) ─────────────────────────────────────────
function CostBreakdown({ progress }: { progress: number }) {
  const visible = progress >= 0.18 && progress < 0.55
  if (!visible) return null

  const t = progress < 0.22
    ? (progress - 0.18) / 0.04
    : progress > 0.50
      ? 1 - (progress - 0.50) / 0.05
      : 1

  const opacity = Math.max(0, Math.min(1, t))

  const leftItems = [
    { label: 'FUEL', amount: 9 },
    { label: 'WEAR & TEAR', amount: 18 },
  ]
  const rightItems = [
    { label: 'SE TAX', amount: 20 },
    { label: 'FED + STATE', amount: 13 },
  ]

  return (
    <div
      className="absolute inset-0 pointer-events-none z-15"
      style={{ opacity }}
    >
      {/* Left column — above center */}
      <div className="absolute left-[5%] sm:left-[8%] top-[20%] flex flex-col gap-6 sm:gap-8">
        {leftItems.map(({ label, amount }, i) => (
          <div
            key={label}
            className="flex flex-col gap-1"
            style={{
              opacity: progress >= 0.18 + i * 0.06 ? 1 : 0,
              transform: `translateX(${progress >= 0.18 + i * 0.06 ? 0 : -24}px)`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <span className="text-white/30 text-[9px] sm:text-[11px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)]">
              {label}
            </span>
            <span className="text-[#E11D48] text-[clamp(26px,5vw,44px)] font-light leading-none font-[family-name:var(--font-space-grotesk)] tracking-[-0.03em]">
              −${amount}
            </span>
          </div>
        ))}
      </div>

      {/* Right column — below center */}
      <div className="absolute right-[5%] sm:right-[8%] bottom-[22%] flex flex-col gap-6 sm:gap-8 items-end">
        {rightItems.map(({ label, amount }, i) => (
          <div
            key={label}
            className="flex flex-col gap-1 items-end"
            style={{
              opacity: progress >= 0.22 + i * 0.06 ? 1 : 0,
              transform: `translateX(${progress >= 0.22 + i * 0.06 ? 0 : 24}px)`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <span className="text-white/30 text-[9px] sm:text-[11px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)]">
              {label}
            </span>
            <span className="text-[#E11D48] text-[clamp(26px,5vw,44px)] font-light leading-none font-[family-name:var(--font-space-grotesk)] tracking-[-0.03em]">
              −${amount}
            </span>
          </div>
        ))}
      </div>

      {/* Center hook — above the number */}
      <div
        className="absolute top-[18%] sm:top-[22%] left-1/2 -translate-x-1/2 text-center"
        style={{
          opacity: progress >= 0.20 ? Math.min(1, (progress - 0.20) / 0.04) : 0,
        }}
      >
        <p className="text-white/70 text-[15px] sm:text-[18px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">
          Where your money goes
        </p>
      </div>

      {/* Bottom total drain */}
      <div
        className="absolute bottom-[22%] sm:bottom-[24%] left-1/2 -translate-x-1/2 text-center"
        style={{
          opacity: progress >= 0.36 ? Math.min(1, (progress - 0.36) / 0.04) : 0,
        }}
      >
        <p className="text-[#E11D48]/60 text-[12px] sm:text-[14px] tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">
          −${HERO_CONFIG.vehicleCost + HERO_CONFIG.taxes} total drained
        </p>
      </div>
    </div>
  )
}

// ─── Earnings bar ───────────────────────────────────────────────────────────
function EarningsBar({ progress }: { progress: number }) {
  const { gross, net } = HERO_CONFIG
  const pct = progress < 0.15 ? 100
    : progress < 0.55 ? 100 - (100 - (net / gross) * 100) * ((progress - 0.15) / 0.4)
    : (net / gross) * 100

  const color = getStageColor(progress)
  const barOpacity = progress < 0.08 ? 0 : progress > 0.70 ? 0 : 1

  return (
    <div
      className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[min(80%,400px)] z-10 transition-opacity duration-500"
      style={{ opacity: barOpacity }}
    >
      <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            opacity: 0.6,
            transition: 'width 80ms linear',
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-white/20 font-[family-name:var(--font-space-grotesk)] tracking-[0.1em]">$0</span>
        <span className="text-[10px] text-white/20 font-[family-name:var(--font-space-grotesk)] tracking-[0.1em]">${HERO_CONFIG.gross}</span>
      </div>
    </div>
  )
}

// ─── Split Reality ──────────────────────────────────────────────────────────
function SplitReality({ progress }: { progress: number }) {
  if (progress < 0.65 || progress > 0.95) return null

  // Fade in: 0.65 → 0.70
  const fadeIn = Math.min(1, (progress - 0.65) / 0.05)
  // Static split readable from 0.70 → 0.80, then right panel expands: 0.80 → 0.91
  const expandT = progress < 0.80 ? 0 : progress > 0.91 ? 1 : (progress - 0.80) / 0.11
  const rightWidthPct = 50 + expandT * 50

  // Divider fades out as right panel overtakes center
  const dividerLeft = 100 - rightWidthPct
  const dividerOpacity = expandT < 0.2 ? 1 : Math.max(0, 1 - (expandT - 0.2) / 0.25)

  return (
    <div
      className="absolute inset-0 z-30 overflow-hidden pointer-events-none"
      style={{ opacity: fadeIn }}
    >
      {/* Left panel — static background, content pinned to left half */}
      <div className="absolute inset-0 bg-[#2A0E12]/95 flex items-center justify-center pr-[50%]">
        <div className="flex flex-col items-center gap-3 px-3 sm:px-6 text-center">
          <span className="text-[#E11D48]/50 text-[9px] sm:text-[13px] tracking-[0.15em] sm:tracking-[0.3em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">
            Without GigMiles
          </span>
          <span className="text-[#E11D48]/30 text-[clamp(40px,9vw,110px)] font-extralight font-[family-name:var(--font-space-grotesk)] tracking-[-0.04em] leading-none blur-[2px] select-none">
            ${HERO_CONFIG.gross}
          </span>
          <span className="text-white/25 text-[9px] sm:text-[13px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">
            Guessing
          </span>
          <p className="hidden sm:block text-white/18 text-[14px] font-[family-name:var(--font-dm-sans)] max-w-[180px] leading-relaxed mt-1">
            You don&apos;t know what you actually made
          </p>
        </div>
      </div>

      {/* Divider — slides right and fades out as right panel expands */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/20"
        style={{
          left: `${dividerLeft}%`,
          opacity: dividerOpacity,
          transition: 'none',
        }}
      />

      {/* Right panel — expands from 50% to 100% covering the left */}
      <div
        className="absolute top-0 bottom-0 right-0 flex items-center justify-center overflow-hidden"
        style={{ width: `${rightWidthPct}%` }}
      >
        <div className="absolute inset-0 bg-[#0A3C3C]/95" />
        <div className="relative flex flex-col items-center gap-3 px-3 sm:px-6 text-center">
          <span className="text-[#5EEAD4]/80 text-[9px] sm:text-[13px] tracking-[0.15em] sm:tracking-[0.3em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">
            With GigMiles
          </span>
          <span className="text-[#5EEAD4] text-[clamp(40px,9vw,110px)] font-extralight font-[family-name:var(--font-space-grotesk)] tracking-[-0.04em] leading-none select-none">
            ${HERO_CONFIG.net}
          </span>
          <span className="text-[#5EEAD4]/70 text-[9px] sm:text-[13px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-[family-name:var(--font-space-grotesk)]">
            Knowing
          </span>
          <p
            className="text-[#5EEAD4]/60 text-[12px] sm:text-[14px] font-[family-name:var(--font-dm-sans)] max-w-[180px] leading-relaxed mt-1"
            style={{ opacity: expandT > 0.5 ? Math.min(1, (expandT - 0.5) / 0.3) : 0 }}
          >
            ${HERO_CONFIG.hourlyRate}/hr — after every cost
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Final CTA overlay ──────────────────────────────────────────────────────
function HeroCTA({ progress }: { progress: number }) {
  if (progress < 0.92) return null
  const t = Math.min(1, (progress - 0.92) / 0.08)

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 pointer-events-auto bg-[#0A3C3C]"
      style={{ opacity: t }}
    >
      <p className="text-[#5EEAD4]/60 text-[11px] tracking-[0.4em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium">
        GigMiles
      </p>
      <h2 className="text-white font-[family-name:var(--font-space-grotesk)] font-black tracking-[-0.04em] leading-[1.0] text-center text-[clamp(32px,6vw,64px)] max-w-xl px-4">
        <AnimatedShinyText shimmerWidth={180} className="text-white font-black">
          Your real number. Every shift.
        </AnimatedShinyText>
      </h2>
      <DownloadButton
        className="mt-2 border border-[#5EEAD4]/40 text-[#5EEAD4] text-[12px] tracking-[0.12em] uppercase font-[family-name:var(--font-space-grotesk)] font-medium px-10 py-3.5 transition-all duration-300 hover:bg-[#5EEAD4]/10 hover:border-[#5EEAD4]/60 hover:shadow-[0_0_30px_rgba(94,234,212,0.15)] active:scale-[0.97] cursor-pointer"
        style={{ transform: `scale(${0.8 + t * 0.2})` }}
      >
        Download App
      </DownloadButton>
      <p className="text-white/20 text-[11px] font-[family-name:var(--font-dm-sans)]">
        10 days free — no card required
      </p>
    </div>
  )
}

// ─── Progress dots ──────────────────────────────────────────────────────────
function ProgressDots({ progress }: { progress: number }) {
  const stage = progress < 0.15 ? 0 : progress < 0.55 ? 1 : progress < 0.65 ? 2 : progress < 0.92 ? 3 : 4
  return (
    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-30 flex gap-2">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full transition-all duration-500"
          style={{
            backgroundColor: i <= stage ? getStageColor(progress) : 'rgba(255,255,255,0.1)',
            transform: i === stage ? 'scale(1.4)' : 'scale(1)',
            opacity: progress > 0.88 ? 0 : 1,
          }}
        />
      ))}
    </div>
  )
}

// ─── Main Hero Component ────────────────────────────────────────────────────
export function HeroMeltdown() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [particleColor, setParticleColor] = useState('#5EEAD4')

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.0005,
  })

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    setProgress(v)
    setParticleColor(getStageColor(v))
  })

  // Ambient glow color
  const glowColor = getStageColor(progress)
  const glowOpacity = progress > 0.53 && progress < 0.60 ? 0 : 0.08

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#0E4F4F]"
      >
        {/* Particles background */}
        <Particles
          className="absolute inset-0"
          quantity={70}
          color={particleColor}
          size={0.4}
          staticity={40}
          ease={60}
        />

        {/* Ambient glow blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            opacity: glowOpacity,
            filter: 'blur(120px)',
          }}
        />

        {/* Main content area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MeltdownNumber progress={progress} />
        </div>

        {/* Cost breakdown — Stage 2 */}
        <CostBreakdown progress={progress} />

        {/* Earnings bar */}
        <EarningsBar progress={progress} />

        {/* Split reality */}
        <SplitReality progress={progress} />

        {/* CTA */}
        <HeroCTA progress={progress} />

        {/* Progress dots */}
        <ProgressDots progress={progress} />

        {/* Bottom gradient seam for smooth transition to next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-50 bg-gradient-to-t from-[#0E4F4F] to-transparent"
          style={{ opacity: progress > 0.95 ? (progress - 0.95) / 0.05 : 0 }}
        />
      </div>
    </div>
  )
}
