'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  calcEbikeCost,
  EBIKE_EFFICIENCY_MI_PER_KWH,
  EBIKE_DEFAULT_KWH_PRICE,
  EBIKE_BATTERY_WEAR,
  EBIKE_MECHANICAL_WEAR,
} from '@/lib/calculatorMath'

// Defaults reproduce the RSG article's illustrative NYC-courier month:
// 900 mi, app model (25 mi/kWh, $0.17/kWh, $0.025+$0.025/mi wear) → ~$51, ~6¢/mi.
const DEFAULTS = {
  miles: 900,
  kwhPrice: EBIKE_DEFAULT_KWH_PRICE,
  efficiency: EBIKE_EFFICIENCY_MI_PER_KWH,
  batteryWear: EBIKE_BATTERY_WEAR,
  mechanicalWear: EBIKE_MECHANICAL_WEAR,
}

function fmtMoney(n: number, decimals = 0): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

// Shareable state ↔ URL query params (?mi=900&k=0.17&e=25&b=0.025&w=0.025)
function readUrlState(): typeof DEFAULTS {
  const p = new URLSearchParams(window.location.search)
  const num = (key: string, fallback: number, max: number) => {
    const v = parseFloat(p.get(key) ?? '')
    return Number.isFinite(v) && v >= 0 && v <= max ? v : fallback
  }
  return {
    miles: num('mi', DEFAULTS.miles, 100_000),
    kwhPrice: num('k', DEFAULTS.kwhPrice, 5),
    efficiency: num('e', DEFAULTS.efficiency, 200),
    batteryWear: num('b', DEFAULTS.batteryWear, 5),
    mechanicalWear: num('w', DEFAULTS.mechanicalWear, 5),
  }
}

const inputCls =
  'w-full bg-[#0A3C3C] border border-white/[0.12] text-white text-[20px] font-semibold tracking-[-0.02em] font-[family-name:var(--font-space-grotesk)] px-4 py-3 outline-none focus:border-[#5EEAD4]/60 transition-colors tabular-nums'
const labelCls =
  'text-white/60 text-[11px] tracking-[0.15em] uppercase font-[family-name:var(--font-space-grotesk)]'

export function EbikeClient() {
  const [miles, setMiles] = useState<number>(DEFAULTS.miles)
  const [kwhPrice, setKwhPrice] = useState<number>(DEFAULTS.kwhPrice)
  const [efficiency, setEfficiency] = useState<number>(DEFAULTS.efficiency)
  const [batteryWear, setBatteryWear] = useState<number>(DEFAULTS.batteryWear)
  const [mechanicalWear, setMechanicalWear] = useState<number>(DEFAULTS.mechanicalWear)
  const hydrated = useRef(false)

  useEffect(() => {
    const s = readUrlState()
    setMiles(s.miles); setKwhPrice(s.kwhPrice); setEfficiency(s.efficiency)
    setBatteryWear(s.batteryWear); setMechanicalWear(s.mechanicalWear)
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    const t = setTimeout(() => {
      const p = new URLSearchParams()
      p.set('mi', String(miles)); p.set('k', String(kwhPrice)); p.set('e', String(efficiency))
      p.set('b', String(batteryWear)); p.set('w', String(mechanicalWear))
      window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [miles, kwhPrice, efficiency, batteryWear, mechanicalWear])

  const r = useMemo(
    () => calcEbikeCost({ miles, kwhPrice, efficiency, batteryWear, mechanicalWear }),
    [miles, kwhPrice, efficiency, batteryWear, mechanicalWear],
  )

  // Whole-dollar bucket displays that always sum to the displayed total —
  // mechanical (the softest estimate) absorbs sub-dollar rounding so the
  // breakdown never reads $6+$23+$23=$52 next to a $51 headline.
  const totalR = Math.round(r.total)
  const elecR = Math.round(r.electricity)
  const battR = Math.round(r.battery)
  const mechR = Math.max(0, totalR - elecR - battR)

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
        {numField('Miles ridden', miles, setMiles, { suffix: 'mi' })}
        {numField('Your electricity price', kwhPrice, setKwhPrice, { step: '0.01', prefix: '$', suffix: '/kWh' })}

        <div className="h-px bg-white/[0.08]" />
        <p className="text-white/45 text-[11px] leading-relaxed font-[family-name:var(--font-dm-sans)] -mb-1">
          Tune these to your bike — defaults are a realistic delivery e-bike.
        </p>
        {numField('Efficiency', efficiency, setEfficiency, { suffix: 'mi/kWh' })}
        {numField('Battery wear', batteryWear, setBatteryWear, { step: '0.005', prefix: '$', suffix: '/mi' })}
        {numField('Mechanical wear', mechanicalWear, setMechanicalWear, { step: '0.005', prefix: '$', suffix: '/mi' })}
      </div>

      {/* ── Results ── */}
      <div className="bg-[#0E4F4F] px-5 py-7 sm:px-8 sm:py-9 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">
            Real operating cost
          </span>
          <div
            className="text-[#5EEAD4] font-bold tracking-[-0.05em] leading-none font-[family-name:var(--font-space-grotesk)] tabular-nums"
            style={{ fontSize: 'clamp(56px, 14vw, 88px)' }}
            aria-live="polite"
          >
            {fmtMoney(r.total)}
          </div>
          <div className="flex gap-5 text-[14px] font-[family-name:var(--font-dm-sans)] tabular-nums">
            <span className="text-white/85">
              {r.perMile.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              <span className="text-white/55">/mi</span>
            </span>
            <span className="text-white/85">≈ {Math.round(r.perMile * 100)}¢<span className="text-white/55"> per mile</span></span>
          </div>
        </div>

        {/* Three-bucket breakdown — matches the article */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08]">
          {[
            { l: 'Electricity', v: fmtMoney(elecR), c: 'text-[#5EEAD4]' },
            { l: 'Battery', v: fmtMoney(battR), c: 'text-[#F59E0B]' },
            { l: 'Mechanical', v: fmtMoney(mechR), c: 'text-[#E11D48]' },
          ].map(item => (
            <div key={item.l} className="bg-[#0A3C3C] px-3 py-4 flex flex-col gap-1">
              <span className="text-[10px] text-white/55 tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)] leading-tight">{item.l}</span>
              <span className={`text-[15px] sm:text-[17px] font-semibold tracking-[-0.02em] font-[family-name:var(--font-space-grotesk)] tabular-nums ${item.c}`}>{item.v}</span>
            </div>
          ))}
        </div>

        <p className="text-white/55 text-[12px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
          The invisible costs (battery + wear) usually dwarf the electricity bill —
          the part you never get billed for is the part that matters at tax time.
        </p>
      </div>
    </div>
  )
}
