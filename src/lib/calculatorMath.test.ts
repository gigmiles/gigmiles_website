import { describe, it, expect } from 'vitest'
import { calcRealNet, IRS_MILEAGE_RATE_2026 } from './calculatorMath'

describe('calcRealNet', () => {
  it('computes the car example: $235 gross, 130 mi, 9 h', () => {
    const r = calcRealNet({ gross: 235, miles: 130, hours: 9, vehicle: 'car', ebikeRate: 0.08 })
    expect(r.vehicleCost).toBeCloseTo(130 * IRS_MILEAGE_RATE_2026, 5) // 94.25
    expect(r.seTax).toBeCloseTo((235 - 94.25) * 0.9235 * 0.153, 5) // ≈19.89
    expect(r.net).toBeCloseTo(235 - 94.25 - r.seTax, 5)
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
    expect(r.net).toBeCloseTo(50 - 145, 5) // net can go negative; shown honestly
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
