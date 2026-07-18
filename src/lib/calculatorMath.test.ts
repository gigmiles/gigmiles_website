import { describe, it, expect } from 'vitest'
import {
  calcRealNet,
  calcEbikeCost,
  IRS_MILEAGE_RATE_2026,
  EBIKE_DEFAULT_RATE,
  EBIKE_EFFICIENCY_MI_PER_KWH,
  EBIKE_DEFAULT_KWH_PRICE,
  EBIKE_BATTERY_WEAR,
  EBIKE_MECHANICAL_WEAR,
  CAR_DEFAULT_COST_PER_MILE,
  parseCalcParams,
  buildCalcParams,
  CALC_DEFAULTS,
  CALC_LIMITS,
} from './calculatorMath'

describe('calcRealNet — cost and deduction are different numbers', () => {
  // The v1 bug: 76¢/mi was subtracted as if it were cash spent, so $300 over
  // 150 mi read $160 while the app said ~$235 for the same shift.
  it('car: subtracts REAL cost from take-home, taxes on the IRS deduction', () => {
    const r = calcRealNet({ gross: 300, miles: 150, hours: 10, vehicle: 'car', costPerMile: CAR_DEFAULT_COST_PER_MILE })
    expect(r.vehicleCost).toBeCloseTo(150 * 0.33, 5)            // 49.50 real cost
    expect(r.mileageDeduction).toBeCloseTo(150 * 0.76, 5)       // 114.00 deduction
    expect(r.seTax).toBeCloseTo((300 - 114) * 0.9235 * 0.153, 5) // 26.28 on the DEDUCTION
    expect(r.net).toBeCloseTo(300 - 49.5 - r.seTax, 5)          // ≈224.22
    expect(Math.round(r.net)).toBe(224)
    expect(Math.round(r.net)).not.toBe(160)                     // the v1 answer
  })

  it('reproduces the canonical $235 → ~$175 shift the page has always claimed', () => {
    // 105 mi is the canonical shift (GIGMILES_CANONICAL_NUMBERS). v1 returned
    // $133 here while the page's own prose said ~$175.
    const r = calcRealNet({ gross: 235, miles: 105, hours: 8, vehicle: 'car', costPerMile: CAR_DEFAULT_COST_PER_MILE })
    expect(r.net).toBeGreaterThan(170)
    expect(r.net).toBeLessThan(185)
  })

  it('e-bike: no standard mileage rate, so cost and deduction coincide', () => {
    const r = calcRealNet({ gross: 180, miles: 60, hours: 5, vehicle: 'ebike', costPerMile: EBIKE_DEFAULT_RATE })
    expect(r.vehicleCost).toBeCloseTo(60 * EBIKE_DEFAULT_RATE, 5)
    expect(r.mileageDeduction).toBeCloseTo(r.vehicleCost, 5)
    expect(r.seTax).toBeCloseTo((180 - r.vehicleCost) * 0.9235 * 0.153, 5)
  })

  it('an e-bike keeps more of the same gross than a car', () => {
    const base = { gross: 250, miles: 90, hours: 6 } as const
    const car = calcRealNet({ ...base, vehicle: 'car', costPerMile: CAR_DEFAULT_COST_PER_MILE })
    const bike = calcRealNet({ ...base, vehicle: 'ebike', costPerMile: EBIKE_DEFAULT_RATE })
    expect(bike.net).toBeGreaterThan(car.net)
  })

  it('floors the tax at $0 and survives zeros', () => {
    const heavy = calcRealNet({ gross: 50, miles: 400, hours: 8, vehicle: 'car', costPerMile: CAR_DEFAULT_COST_PER_MILE })
    expect(heavy.seTax).toBe(0)                                  // deduction exceeds gross
    const zero = calcRealNet({ gross: 0, miles: 0, hours: 0, vehicle: 'car', costPerMile: CAR_DEFAULT_COST_PER_MILE })
    expect(zero.net).toBe(0); expect(zero.hourly).toBe(0); expect(zero.pctKept).toBe(0)
  })
})

describe('calcEbikeCost', () => {
  const defaults = {
    kwhPrice: EBIKE_DEFAULT_KWH_PRICE,
    efficiency: EBIKE_EFFICIENCY_MI_PER_KWH,
    batteryWear: EBIKE_BATTERY_WEAR,
    mechanicalWear: EBIKE_MECHANICAL_WEAR,
  }

  it('reproduces the RSG article sample month (900 mi at app defaults)', () => {
    const r = calcEbikeCost({ miles: 900, ...defaults })
    // 900/25 × $0.17 = $6.12 electricity; $0.025/mi each bucket = $22.50 wear each
    expect(r.electricity).toBeCloseTo(6.12, 2)
    expect(r.battery).toBeCloseTo(22.5, 2)
    expect(r.mechanical).toBeCloseTo(22.5, 2)
    expect(r.total).toBeCloseTo(51.12, 2) // article headline ~$51
    expect(r.perMile).toBeCloseTo(0.0568, 4) // ~6¢/mi
  })

  it('the blended /calculator default matches the decomposed model at defaults', () => {
    // EBIKE_DEFAULT_RATE (single-field /calculator estimate) must stay within a
    // tenth of a cent of the true electricity+wear model, or the two pages drift.
    const perMile = calcEbikeCost({ miles: 1000, ...defaults }).perMile
    expect(Math.abs(perMile - EBIKE_DEFAULT_RATE)).toBeLessThan(0.001)
  })

  it('scales electricity with price and efficiency', () => {
    // NYC-high price at the same efficiency still only moves electricity a little.
    const r = calcEbikeCost({ miles: 900, ...defaults, kwhPrice: 0.24 })
    expect(r.electricity).toBeCloseTo((900 / 25) * 0.24, 5) // $8.64
    expect(r.total).toBeCloseTo(8.64 + 45, 2)
  })

  it('guards against divide-by-zero efficiency and clamps negatives', () => {
    const r = calcEbikeCost({ miles: 100, kwhPrice: -1, efficiency: 0, batteryWear: -1, mechanicalWear: -1 })
    expect(Number.isFinite(r.electricity)).toBe(true)
    expect(r.electricity).toBe(0) // price clamped to 0
    expect(r.total).toBe(0)
    expect(r.perMile).toBe(0)
  })

  it('returns zero perMile at zero miles', () => {
    const r = calcEbikeCost({ miles: 0, ...defaults })
    expect(r.total).toBe(0)
    expect(r.perMile).toBe(0)
  })
})

// ─── Share-card parity ───────────────────────────────────────────────────────
// A /calculator link is rendered twice: as an OG card (server) and as the page
// (client). If they resolve a URL differently, the card advertises a number the
// page contradicts — publicly, on someone's timeline. These pin that they can't.
describe('parseCalcParams / buildCalcParams', () => {
  const parse = (qs: string) => parseCalcParams(new URLSearchParams(qs))

  it('reads a normal shared link', () => {
    expect(parse('g=420&mi=200&h=9&v=car')).toEqual({
      gross: 420, miles: 200, hours: 9, vehicle: 'car', costPerMile: CALC_DEFAULTS.costPerMile,
    })
  })

  it('reads an e-bike link with a custom rate', () => {
    const s = parse('g=180&mi=60&h=5&v=ebike&r=0.09')
    expect(s.vehicle).toBe('ebike')
    expect(s.costPerMile).toBe(0.09)
  })

  // The regression that prompted this suite: the card clamped out-of-range
  // values to the ceiling while the page fell back to the default, so
  // ?g=200000 rendered $100,000 on the card and $300 on the page.
  it('falls back to the DEFAULT for out-of-range values, never the ceiling', () => {
    expect(parse('g=200000').gross).toBe(CALC_DEFAULTS.gross)
    expect(parse('g=200000').gross).not.toBe(CALC_LIMITS.gross)
    expect(parse('mi=99999').miles).toBe(CALC_DEFAULTS.miles)
    expect(parse('h=500').hours).toBe(CALC_DEFAULTS.hours)
    expect(parse('r=50').costPerMile).toBe(CALC_DEFAULTS.costPerMile)
  })

  it('accepts the exact limit', () => {
    expect(parse(`g=${CALC_LIMITS.gross}`).gross).toBe(CALC_LIMITS.gross)
  })

  it('rejects negatives, junk and missing keys', () => {
    expect(parse('g=-5').gross).toBe(CALC_DEFAULTS.gross)
    expect(parse('g=abc').gross).toBe(CALC_DEFAULTS.gross)
    expect(parse('').gross).toBe(CALC_DEFAULTS.gross)
    expect(parse('v=motorcycle').vehicle).toBe('car')
  })

  it('round-trips: build → parse returns the same state', () => {
    for (const s of [
      { gross: 412.5, miles: 187, hours: 7.5, vehicle: 'car' as const, costPerMile: CALC_DEFAULTS.costPerMile },
      { gross: 95, miles: 40, hours: 3, vehicle: 'ebike' as const, costPerMile: 0.062 },
      { gross: 0, miles: 0, hours: 0, vehicle: 'car' as const, costPerMile: CALC_DEFAULTS.costPerMile },
    ]) {
      expect(parse(buildCalcParams(s))).toEqual(s)
    }
  })

  it('a shared URL yields identical math on card and page', () => {
    // One resolution path → one result object. Card and page both do exactly
    // this, so agreement is structural rather than coincidental.
    const qs = 'g=300&mi=150&h=10&v=car'
    const a = calcRealNet(parse(qs))
    const b = calcRealNet(parse(qs))
    expect(a).toEqual(b)
    // Hand-checked: cost 150 × $0.33 = $49.50; deduction 150 × 76¢ = $114;
    // tax (300−114) × 0.9235 × 0.153 = $26.28; net $224.22 → both round to $224.
    expect(a.vehicleCost).toBeCloseTo(49.5, 2)
    expect(a.mileageDeduction).toBeCloseTo(114, 2)
    expect(a.seTax).toBeCloseTo(26.28, 2)
    expect(Math.round(a.net)).toBe(224)
    expect(Math.round(a.pctKept * 100)).toBe(75)
  })
})
