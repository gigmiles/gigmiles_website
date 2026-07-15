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
} from './calculatorMath'

describe('calcRealNet', () => {
  it('computes the car example: $235 gross, 130 mi, 9 h', () => {
    const r = calcRealNet({ gross: 235, miles: 130, hours: 9, vehicle: 'car', ebikeRate: 0.08 })
    expect(r.vehicleCost).toBeCloseTo(130 * IRS_MILEAGE_RATE_2026, 5) // 98.8 at 76¢/mi
    expect(r.seTax).toBeCloseTo((235 - 130 * IRS_MILEAGE_RATE_2026) * 0.9235 * 0.153, 5) // ≈19.24
    expect(r.net).toBeCloseTo(235 - 130 * IRS_MILEAGE_RATE_2026 - r.seTax, 5)
    expect(r.hourly).toBeCloseTo(r.net / 9, 5)
    expect(r.pctKept).toBeCloseTo(r.net / 235, 5)
  })

  it('uses the editable actual-expense rate for e-bike', () => {
    const r = calcRealNet({ gross: 200, miles: 100, hours: 8, vehicle: 'ebike', ebikeRate: 0.12 })
    expect(r.vehicleCost).toBeCloseTo(12, 5)
    expect(r.seTax).toBeCloseTo(188 * 0.9235 * 0.153, 5)
  })

  it('floors SE tax at 0 when vehicle cost exceeds gross', () => {
    const r = calcRealNet({ gross: 50, miles: 200, hours: 5, vehicle: 'car', ebikeRate: 0.08 })
    expect(r.seTax).toBe(0)
    expect(r.net).toBeCloseTo(50 - 200 * IRS_MILEAGE_RATE_2026, 5) // net can go negative; shown honestly
  })

  it('handles zero hours and zero gross without dividing by zero', () => {
    const r = calcRealNet({ gross: 0, miles: 0, hours: 0, vehicle: 'car', ebikeRate: 0.08 })
    expect(r.hourly).toBe(0)
    expect(r.pctKept).toBe(0)
  })

  it('clamps negative inputs to zero', () => {
    const r = calcRealNet({ gross: -10, miles: -5, hours: -1, vehicle: 'ebike', ebikeRate: -0.5 })
    expect(r.vehicleCost).toBe(0)
    expect(r.seTax).toBe(0)
    expect(r.net).toBe(0)
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
