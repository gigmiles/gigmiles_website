// Math for the public /calculator page (v2, federal-only).
//
// ⚠️ THE DISTINCTION THIS PAGE EXISTS TO TEACH — and got wrong until 2026-07-17.
//
// The IRS standard mileage rate (76¢/mi from Jul 1, 2026; 72.5¢ Jan–Jun) is a
// DEDUCTION rate — what you may write off. It is NOT what driving cost you.
// v1 subtracted 76¢/mi as if it were cash spent, which understated net income
// badly: $300 over 150 mi came out at $160, while the GigMiles app (which models
// real fuel + wear for your actual car) says ~$235 for the same shift. The page's
// own prose claimed "$235 → roughly $175" while its calculator said $133.
//
// v2 mirrors the app: subtract REAL cost to get take-home, and compute the tax
// set-aside on the DEDUCTION. Two different per-mile numbers, two different jobs.
//
//   vehicleCost      = miles × costPerMile        ← cash/wear actually incurred
//   mileageDeduction = miles × 76¢ (car)          ← taxable-income reducer
//   seTax            = (gross − mileageDeduction) × 92.35% × 15.3%
//   net              = gross − vehicleCost − seTax
//
// E-bikes have no standard mileage rate (IRS limits it to cars, vans, pickups
// and panel trucks), so a courier deducts actual expenses — cost and deduction
// are the same number there, and the formula collapses correctly on its own.
export const IRS_MILEAGE_RATE_2026 = 0.76
// Default REAL cost per mile for a car whose specifics we don't know. Taken
// from the mobile app's own no-vehicle-data defaults (the feature truth source),
// so web and app agree when neither knows the car:
//   fuel  = fuelUnitPrice $4.50/gal ÷ defaultEfficiency 25 MPG = $0.18/mi
//   wear  = baseRate $0.15/mi with ageFactor 1.0 (no year known)
// (vehicle.dart fuelUnitPrice/defaultEfficiency, gig_calculator.dart
// computeWearRateBreakdown). Editable in the UI — every car really is different,
// and a fixed number pretending to be your car is the mistake v1 made.
export const CAR_DEFAULT_COST_PER_MILE = 0.33

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

// ─── Shareable state ⇄ URL ───────────────────────────────────────────────────
// The page and the OG share card MUST resolve a URL to the same numbers: a
// shared link renders a card, and the recipient then lands on the page. If they
// parsed differently, the card would advertise a figure the page contradicts.
// They diverged exactly that way once (the card clamped out-of-range values to
// the ceiling while the page fell back to defaults — ?g=200000 rendered
// $100,000 on the card and $300 on the page), so parsing lives here, once.
export const CALC_DEFAULTS = {
  gross: 300,
  miles: 150,
  hours: 10,
  vehicle: 'car' as VehicleType,
  costPerMile: CAR_DEFAULT_COST_PER_MILE,
}

/** Default real cost per mile for a vehicle type. */
export const defaultCostPerMile = (v: VehicleType) =>
  v === 'car' ? CAR_DEFAULT_COST_PER_MILE : EBIKE_DEFAULT_RATE

export const CALC_LIMITS = { gross: 100_000, miles: 10_000, hours: 200, costPerMile: 10 }

/** Resolve ?g=&mi=&h=&v=&r= to calculator state. Out-of-range or unparseable
 *  values fall back to the default — never to the ceiling. */
export function parseCalcParams(p: URLSearchParams): typeof CALC_DEFAULTS {
  const num = (key: string, fallback: number, max: number) => {
    const v = parseFloat(p.get(key) ?? '')
    return Number.isFinite(v) && v >= 0 && v <= max ? v : fallback
  }
  const vehicle: VehicleType = p.get('v') === 'ebike' ? 'ebike' : 'car'
  return {
    gross: num('g', CALC_DEFAULTS.gross, CALC_LIMITS.gross),
    miles: num('mi', CALC_DEFAULTS.miles, CALC_LIMITS.miles),
    hours: num('h', CALC_DEFAULTS.hours, CALC_LIMITS.hours),
    vehicle,
    // `r` carries the rate for BOTH vehicle types; the fallback follows the
    // type, so an old car link with no `r` still resolves to the car default.
    costPerMile: num('r', defaultCostPerMile(vehicle), CALC_LIMITS.costPerMile),
  }
}

/** State → query string. Used by the URL sync AND the share button: the sync is
 *  debounced, so sharing right after typing would otherwise emit the previous
 *  result's link — and the card would render those stale numbers. */
export function buildCalcParams(s: typeof CALC_DEFAULTS): string {
  const p = new URLSearchParams()
  p.set('g', String(s.gross)); p.set('mi', String(s.miles)); p.set('h', String(s.hours))
  p.set('v', s.vehicle)
  p.set('r', String(s.costPerMile))
  return p.toString()
}

export interface CalcInput {
  gross: number
  miles: number
  hours: number
  vehicle: VehicleType
  /** REAL $/mi operating cost. Car default CAR_DEFAULT_COST_PER_MILE; for an
   *  e-bike this is also the deductible actual-expense rate. */
  costPerMile: number
}

export interface CalcResult {
  /** What driving actually cost — fuel + wear. Reduces take-home. */
  vehicleCost: number
  /** What the IRS lets you write off. Reduces TAXABLE INCOME, not take-home. */
  mileageDeduction: number
  seTax: number
  net: number
  hourly: number
  /** 0..1 of gross kept; 0 when gross is 0 */
  pctKept: number
}

export function calcRealNet({ gross, miles, hours, vehicle, costPerMile }: CalcInput): CalcResult {
  const g = Math.max(0, gross || 0)
  const mi = Math.max(0, miles || 0)
  const h = Math.max(0, hours || 0)
  const rate = Math.max(0, costPerMile || 0)

  const vehicleCost = mi * rate
  // Cars use the IRS standard mileage rate; e-bikes are excluded from it, so
  // their deduction is the actual expense — the same figure as the cost.
  const mileageDeduction = vehicle === 'car' ? mi * IRS_MILEAGE_RATE_2026 : vehicleCost
  const seTax = Math.max(0, (g - mileageDeduction) * SE_EARNINGS_FACTOR * SE_TAX_RATE)
  const net = g - vehicleCost - seTax
  const hourly = h > 0 ? net / h : 0
  const pctKept = g > 0 ? net / g : 0

  return { vehicleCost, mileageDeduction, seTax, net, hourly, pctKept }
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
