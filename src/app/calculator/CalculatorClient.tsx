'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  calcRealNet,
  EBIKE_DEFAULT_RATE,
  IRS_MILEAGE_RATE_2026,
  type VehicleType,
} from '@/lib/calculatorMath'

// Defaults deliberately do NOT use $235 gross: the launch video's canonical
// example is $235 → $175 (app's actual-cost view), while this page applies
// the full IRS mileage deduction — same gross with a different net across
// our own assets would read as a contradiction.
const DEFAULTS = { gross: 300, miles: 150, hours: 10, vehicle: 'car' as VehicleType, ebikeRate: EBIKE_DEFAULT_RATE }

function fmtMoney(n: number, decimals = 0): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

// Shareable state ↔ URL query params (?g=235&mi=130&h=9&v=ebike&r=0.057)
function readUrlState(): typeof DEFAULTS {
  const p = new URLSearchParams(window.location.search)
  const num = (key: string, fallback: number, max: number) => {
    const v = parseFloat(p.get(key) ?? '')
    return Number.isFinite(v) && v >= 0 && v <= max ? v : fallback
  }
  return {
    gross: num('g', DEFAULTS.gross, 100_000),
    miles: num('mi', DEFAULTS.miles, 10_000),
    hours: num('h', DEFAULTS.hours, 200),
    vehicle: p.get('v') === 'ebike' ? 'ebike' : 'car',
    ebikeRate: num('r', DEFAULTS.ebikeRate, 10),
  }
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
  const [ebikeRate, setEbikeRate] = useState<number>(DEFAULTS.ebikeRate)
  const hydrated = useRef(false)

  // Restore shared state from the URL once on mount.
  useEffect(() => {
    const s = readUrlState()
    setGross(s.gross); setMiles(s.miles); setHours(s.hours)
    setVehicle(s.vehicle); setEbikeRate(s.ebikeRate)
    hydrated.current = true
  }, [])

  // Reflect state into the URL (debounced) so results are shareable.
  useEffect(() => {
    if (!hydrated.current) return
    const t = setTimeout(() => {
      const p = new URLSearchParams()
      p.set('g', String(gross)); p.set('mi', String(miles)); p.set('h', String(hours))
      p.set('v', vehicle)
      if (vehicle === 'ebike') p.set('r', String(ebikeRate))
      window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [gross, miles, hours, vehicle, ebikeRate])

  const r = useMemo(
    () => calcRealNet({ gross, miles, hours, vehicle, ebikeRate }),
    [gross, miles, hours, vehicle, ebikeRate],
  )

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
                onClick={() => setVehicle(val)}
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
              ? `Car costs use the IRS 2026 standard mileage rate — ${Math.round(IRS_MILEAGE_RATE_2026 * 100)}¢/mi (from July 1).`
              : 'IRS standard mileage doesn’t apply to e-bikes — this is an actual-expense estimate. Edit the rate to match your costs.'}
          </p>
        </div>

        {numField('Gross earnings', gross, setGross, { prefix: '$' })}
        {numField('Miles driven', miles, setMiles, { suffix: 'mi' })}
        {numField('Hours worked', hours, setHours, { step: '0.5', suffix: 'hrs' })}

        {vehicle === 'ebike' &&
          numField('E-bike cost per mile (editable estimate)', ebikeRate, setEbikeRate, { step: '0.01', prefix: '$', suffix: '/mi' })}
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
            { l: vehicle === 'car' ? 'Vehicle (IRS mi.)' : 'E-bike costs', v: `−${fmtMoney(r.vehicleCost)}`, c: 'text-[#E11D48]' },
            { l: 'SE tax (15.3%)', v: `−${fmtMoney(r.seTax)}`, c: 'text-[#F59E0B]' },
            { l: 'Real net', v: fmtMoney(r.net), c: 'text-[#10B981]' },
          ].map(item => (
            <div key={item.l} className="bg-[#0A3C3C] px-3 py-4 flex flex-col gap-1">
              <span className="text-[10px] text-white/55 tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] leading-tight">{item.l}</span>
              <span className={`text-[15px] sm:text-[17px] font-semibold tracking-[-0.02em] font-[family-name:var(--font-space-grotesk)] tabular-nums ${item.c}`}>{item.v}</span>
            </div>
          ))}
        </div>

        <p className="text-white/55 text-[12px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
          State income tax not included — the app calculates your state.
        </p>
      </div>
    </div>
  )
}
