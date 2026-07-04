// Math for the public /calculator page (v1, federal-only).
//
// Car: IRS 2026 standard mileage rate ($0.725/mi) covers gas, wear,
// depreciation, insurance — the deduction-grade per-mile cost.
// E-bike: the IRS standard mileage rate applies to cars, vans, pickups and
// panel trucks only — NOT bikes. E-bike couriers deduct actual expenses, so
// we estimate with an editable per-mile figure (electricity, battery wear,
// tires, chain, brakes) defaulting to $0.08/mi. This mirrors the app's
// e-bike handling.

export const IRS_MILEAGE_RATE_2026 = 0.725
export const EBIKE_DEFAULT_RATE = 0.08
export const SE_EARNINGS_FACTOR = 0.9235
export const SE_TAX_RATE = 0.153

export type VehicleType = 'car' | 'ebike'

export interface CalcInput {
  gross: number
  miles: number
  hours: number
  vehicle: VehicleType
  /** $/mi actual-expense estimate, only used when vehicle === 'ebike' */
  ebikeRate: number
}

export interface CalcResult {
  vehicleCost: number
  seTax: number
  net: number
  hourly: number
  /** 0..1 of gross kept; 0 when gross is 0 */
  pctKept: number
}

export function calcRealNet({ gross, miles, hours, vehicle, ebikeRate }: CalcInput): CalcResult {
  const g = Math.max(0, gross || 0)
  const mi = Math.max(0, miles || 0)
  const h = Math.max(0, hours || 0)
  const rate = vehicle === 'car' ? IRS_MILEAGE_RATE_2026 : Math.max(0, ebikeRate || 0)

  const vehicleCost = mi * rate
  const seTax = Math.max(0, (g - vehicleCost) * SE_EARNINGS_FACTOR * SE_TAX_RATE)
  const net = g - vehicleCost - seTax
  const hourly = h > 0 ? net / h : 0
  const pctKept = g > 0 ? net / g : 0

  return { vehicleCost, seTax, net, hourly, pctKept }
}
