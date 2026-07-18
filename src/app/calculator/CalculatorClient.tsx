'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCalcParams,
  CALC_DEFAULTS,
  calcRealNet,
  defaultCostPerMile,
  IRS_MILEAGE_RATE_2026,
  parseCalcParams,
  type VehicleType,
} from '@/lib/calculatorMath'

// Defaults deliberately do NOT use $235 gross: the launch video's canonical
// example is $235 → $175 (app's actual-cost view), while this page applies
// the full IRS mileage deduction — same gross with a different net across
// our own assets would read as a contradiction. Lives in calculatorMath so
// the OG share card resolves identical numbers from the same URL.
const DEFAULTS = CALC_DEFAULTS

function fmtMoney(n: number, decimals = 0): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}


const inputCls =
  'w-full bg-[#0A3C3C] border border-white/[0.12] text-white text-[20px] font-semibold tracking-[-0.02em] font-[family-name:var(--font-space-grotesk)] px-4 py-3 outline-none focus:border-[#5EEAD4]/60 transition-colors tabular-nums'
const labelCls =
  'text-white/60 text-[11px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]'

export function CalculatorClient() {
  const [gross, setGross] = useState<number>(DEFAULTS.gross)
  const [miles, setMiles] = useState<number>(DEFAULTS.miles)
  const [hours, setHours] = useState<number>(DEFAULTS.hours)
  const [vehicle, setVehicle] = useState<VehicleType>(DEFAULTS.vehicle)
  const [costPerMile, setCostPerMile] = useState<number>(DEFAULTS.costPerMile)
  const hydrated = useRef(false)

  // Restore shared state from the URL once on mount.
  useEffect(() => {
    const s = parseCalcParams(new URLSearchParams(window.location.search))
    setGross(s.gross); setMiles(s.miles); setHours(s.hours)
    setVehicle(s.vehicle); setCostPerMile(s.costPerMile)
    hydrated.current = true
  }, [])

  // Reflect state into the URL (debounced) so results are shareable.
  useEffect(() => {
    if (!hydrated.current) return
    const t = setTimeout(() => {
      const q = buildCalcParams({ gross, miles, hours, vehicle, costPerMile })
      window.history.replaceState(null, '', `${window.location.pathname}?${q}`)
    }, 300)
    return () => clearTimeout(t)
  }, [gross, miles, hours, vehicle, costPerMile])

  const r = useMemo(
    () => calcRealNet({ gross, miles, hours, vehicle, costPerMile }),
    [gross, miles, hours, vehicle, costPerMile],
  )

  // Sharing is the whole growth mechanic: the link carries the inputs, and
  // /api/og/result renders them as a card, so a shared result recruits the next
  // driver. Nothing prompted it before — the URL updated silently and nobody
  // copies an address bar. Native sheet on mobile (where the traffic is),
  // clipboard on desktop.
  const [copied, setCopied] = useState(false)
  async function shareResult() {
    const url = `${window.location.origin}/calculator?${buildCalcParams({ gross, miles, hours, vehicle, costPerMile })}`
    const text = `${fmtMoney(gross)} on the app. ${fmtMoney(r.net)} in my pocket.`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'What I actually keep', text, url })
        return
      } catch {
        // Dismissing the share sheet throws — that's a choice, not a failure.
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard blocked (insecure context / permissions): the URL bar already
      // holds the same link, so there is nothing to recover from.
    }
  }

  const numField = (
    label: string, value: number, set: (n: number) => void,
    opts: { step?: string; prefix?: string; suffix?: string } = {},
  ) => (
    <div className="flex flex-col gap-2">
      <label className={labelCls}>{label}</label>
      <div className="relative">
        {opts.prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-[18px] font-[family-name:var(--font-space-grotesk)]">{opts.prefix}</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={opts.step ?? '1'}
          value={Number.isFinite(value) ? value : ''}
          onChange={e => set(e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0))}
          title={label}
          className={`${inputCls} ${opts.prefix ? 'pl-9' : ''}`}
        />
        {opts.suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 text-[13px] font-[family-name:var(--font-dm-sans)]">{opts.suffix}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="grid md:grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.07]">
      {/* ── Inputs ── */}
      <div className="bg-[#0C4646] px-5 py-7 sm:px-8 sm:py-9 flex flex-col gap-6">
        {/* Vehicle toggle */}
        <div className="flex flex-col gap-2">
          <span className={labelCls}>Vehicle</span>
          <div className="grid grid-cols-2 gap-px bg-white/[0.10] border border-white/[0.10]" role="group" aria-label="Vehicle type">
            {([['car', 'Car'], ['ebike', 'E-bike']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={vehicle === val}
                onClick={() => { setVehicle(val); setCostPerMile(defaultCostPerMile(val)) }}
                className={`py-3 text-[13px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)] font-medium transition-colors cursor-pointer ${
                  vehicle === val
                    ? 'bg-[#5EEAD4] text-[#0A3C3C]'
                    : 'bg-[#0A3C3C] text-white/60 hover:text-white/85'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-white/45 text-[11px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            {vehicle === 'car'
              ? `What driving costs you (fuel + wear) is not the same as what you can deduct. Your cost is editable below; the deduction uses the IRS 2026 rate — ${Math.round(IRS_MILEAGE_RATE_2026 * 100)}¢/mi from July 1.`
              : 'IRS standard mileage doesn’t apply to e-bikes, so a courier deducts actual expenses — here cost and deduction are the same number. Edit it to match your bike.'}
          </p>
        </div>

        {numField('Gross earnings', gross, setGross, { prefix: '$' })}
        {numField('Miles driven', miles, setMiles, { suffix: 'mi' })}
        {numField('Hours worked', hours, setHours, { step: '0.5', suffix: 'hrs' })}

        {numField(
          vehicle === 'car' ? 'Your real cost per mile (editable)' : 'E-bike cost per mile (editable)',
          costPerMile, setCostPerMile, { step: '0.01', prefix: '$', suffix: '/mi' },
        )}
      </div>

      {/* ── Results — the hero ── */}
      <div className="bg-[#0E4F4F] px-5 py-7 sm:px-8 sm:py-9 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">
            Your real net
          </span>
          <div
            className="text-[#5EEAD4] font-bold tracking-[-0.05em] leading-none font-[family-name:var(--font-space-grotesk)] tabular-nums"
            style={{ fontSize: 'clamp(56px, 14vw, 88px)' }}
            aria-live="polite"
          >
            {fmtMoney(r.net)}
          </div>
          <div className="flex gap-5 text-[14px] font-[family-name:var(--font-dm-sans)] tabular-nums">
            <span className="text-white/85">{fmtMoney(r.hourly, 2)}<span className="text-white/55">/hr real</span></span>
            <span className="text-white/85">{Math.round(r.pctKept * 100)}%<span className="text-white/55"> of gross kept</span></span>
          </div>
        </div>

        {/* Breakdown row */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08]">
          {[
            { l: 'Vehicle cost', v: `−${fmtMoney(r.vehicleCost)}`, c: 'text-[#E11D48]' },
            { l: 'SE tax (15.3%)', v: `−${fmtMoney(r.seTax)}`, c: 'text-[#F59E0B]' },
            { l: 'Real net', v: fmtMoney(r.net), c: 'text-[#10B981]' },
          ].map(item => (
            <div key={item.l} className="bg-[#0A3C3C] px-3 py-4 flex flex-col gap-1">
              <span className="text-[10px] text-white/55 tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] leading-tight">{item.l}</span>
              <span className={`text-[15px] sm:text-[17px] font-semibold tracking-[-0.02em] font-[family-name:var(--font-space-grotesk)] tabular-nums ${item.c}`}>{item.v}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={shareResult}
          className="w-full bg-[#5EEAD4] text-[#0A3C3C] text-[15px] font-bold tracking-[-0.01em] font-[family-name:var(--font-space-grotesk)] px-5 py-3.5 hover:bg-[#4fd9c4] active:scale-[0.99] transition-all"
        >
          {copied ? 'Link copied — paste it anywhere' : 'Share this result'}
        </button>

        {/* The payoff to the share card's promise ("yours isn't average"), placed
            at the result rather than below the fold — a visitor arriving from a
            shared link sees their number and the way to make it exact in the
            same glance. Secondary to Share on purpose: sharing is what makes
            this page compound. Routed through /download (the smart store
            bridge), so SiteBeacon records the intent as download_click. */}
        <a
          href="/download"
          className="text-center border border-[#5EEAD4]/35 text-[#5EEAD4] text-[13.5px] font-[family-name:var(--font-space-grotesk)] px-5 py-3 hover:border-[#5EEAD4]/70 hover:bg-[#5EEAD4]/[0.06] transition-all"
        >
          {vehicle === 'car'
            ? 'This used an average car — get the number for yours →'
            : 'These are default bike costs — get the number for yours →'}
        </a>

        <p className="text-white/55 text-[12px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
          Tax set-aside is figured on your {fmtMoney(r.mileageDeduction)} mileage
          deduction, not on what driving cost you — two different numbers.
          State income tax not included; the app calculates your state.
        </p>
      </div>
    </div>
  )
}
