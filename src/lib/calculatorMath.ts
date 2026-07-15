// Math for the public /calculator page (v1, federal-only).
//
// Car: IRS 2026 business standard mileage rate — 76¢/mi effective July 1, 2026
// (72.5¢ Jan–Jun) — covers gas, wear, depreciation, insurance in one number.
// E-bike: the IRS standard mileage rate applies to cars, vans, pickups and
// panel trucks only — NOT bikes. E-bike couriers deduct actual expenses, so
// we estimate with an editable per-mile figure. The blended default below
// mirrors the mobile app's e-bike model (gig_calculator.dart): electricity at
// 25 mi/kWh × $0.17/kWh (≈$0.007/mi) + $0.05/mi wear ≈ $0.057/mi. The dedicated
// /ebike worksheet breaks the same total into its electricity/battery/
// mechanical buckets; see EBIKE_* constants and calcEbikeCost below.

export const IRS_MILEAGE_RATE_2026 = 0.76
export const EBIKE_DEFAULT_RATE = 0.057
export const SE_EARNINGS_FACTOR = 0.9235
export const SE_TAX_RATE = 0.153

// E-bike actual-expense model — mirrors the mobile app (feature truth source).
// Efficiency and wear are the app's shipped constants; electricity price is the
// EIA US-residential-average default the app also uses (per-state live in-app).
export const EBIKE_EFFICIENCY_MI_PER_KWH = 25 // gig_calculator.dart eBikeEfficiency
export const EBIKE_DEFAULT_KWH_PRICE = 0.17 // EIA US residential avg; app fallback
export const EBIKE_BATTERY_WEAR = 0.025 // ~$700 pack / (800 cycles × 30 mi/charge)
export const EBIKE_MECHANICAL_WEAR = 0.025 // tires, brakes, chain, tune-ups
// battery + mechanical = $0.05/mi, matching the app's eBikeWearRatePerMile.

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

export interface EbikeInput {
  miles: number
  /** electricity price $/kWh (defaults to EBIKE_DEFAULT_KWH_PRICE) */
  kwhPrice: number
  /** bike efficiency mi/kWh (defaults to EBIKE_EFFICIENCY_MI_PER_KWH) */
  efficiency: number
  /** battery-cycle wear $/mi (defaults to EBIKE_BATTERY_WEAR) */
  batteryWear: number
  /** mechanical wear $/mi (defaults to EBIKE_MECHANICAL_WEAR) */
  mechanicalWear: number
}

export interface EbikeResult {
  electricity: number
  battery: number
  mechanical: number
  total: number
  /** total $/mi; 0 when miles is 0 */
  perMile: number
}

// Actual-expense e-bike cost, broken into the article's three buckets. IRS
// standard mileage does NOT apply to bikes, so there is no per-mile deduction
// rate here — only real operating cost. Mirrors the mobile app's model.
export function calcEbikeCost({ miles, kwhPrice, efficiency, batteryWear, mechanicalWear }: EbikeInput): EbikeResult {
  const mi = Math.max(0, miles || 0)
  const price = Math.max(0, kwhPrice || 0)
  const eff = Math.max(1, efficiency || EBIKE_EFFICIENCY_MI_PER_KWH) // avoid /0
  const battRate = Math.max(0, batteryWear || 0)
  const mechRate = Math.max(0, mechanicalWear || 0)

  const electricity = (mi / eff) * price
  const battery = mi * battRate
  const mechanical = mi * mechRate
  const total = electricity + battery + mechanical
  const perMile = mi > 0 ? total / mi : 0

  return { electricity, battery, mechanical, total, perMile }
}
