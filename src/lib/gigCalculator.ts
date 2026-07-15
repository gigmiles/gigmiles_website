// ─── Constants ────────────────────────────────────────────────────────────────

const IRS_MILEAGE_RATE = 0.76; // 2026 (76¢ from July 1; unused legacy constant)
const SE_TAX_RATE = 0.153;
const SE_ADJUSTMENT = 0.9235;
const DEFAULT_GAS_PRICE = 4.10; // AAA April 2026

// ─── State Tax Rates ──────────────────────────────────────────────────────────

const STATE_TAX_RATES: Record<string, number> = {
  AL: 5.0, AK: 0, AZ: 2.5, AR: 4.7, CA: 9.3, CO: 4.4, CT: 5.0,
  DE: 6.6, FL: 0, GA: 5.4, HI: 8.2, ID: 5.8, IL: 4.95, IN: 3.0,
  IA: 3.8, KS: 5.7, KY: 4.0, LA: 3.0, ME: 7.15, MD: 5.75, MA: 5.0,
  MI: 4.05, MN: 7.85, MS: 4.4, MO: 4.8, MT: 5.9, NE: 5.2, NV: 0,
  NH: 0, NJ: 5.525, NM: 5.9, NY: 6.25, NC: 4.25, ND: 2.5, OH: 2.75,
  OK: 4.75, OR: 9.9, PA: 3.07, RI: 5.99, SC: 6.5, SD: 0, TN: 0,
  TX: 0, UT: 4.65, VT: 8.75, VA: 5.75, WA: 0, WV: 4.82, WI: 7.65,
  WY: 0, DC: 8.5,
};

// ─── State Names ──────────────────────────────────────────────────────────────

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "Washington D.C.",
};

// ─── State Minimum Wages ──────────────────────────────────────────────────────

const STATE_MIN_WAGES: Record<string, number> = {
  CA: 16.50, NY: 16.00, WA: 16.28, FL: 13.00, TX: 7.25,
  IL: 14.00, PA: 7.25, OH: 10.45, GA: 7.25, NC: 7.25,
  MI: 10.33, NJ: 15.49, AZ: 14.35, CO: 14.42, NV: 12.00,
};

const FEDERAL_MIN_WAGE = 7.25;

// ─── Luxury Brands ───────────────────────────────────────────────────────────

const LUXURY_BRANDS = new Set([
  "BMW", "Mercedes-Benz", "Audi", "Lexus", "Tesla", "Porsche",
  "Land Rover", "Jaguar", "Volvo", "Infiniti", "Acura", "Cadillac",
  "Lincoln", "Genesis",
]);

// ─── High Resale Models (make + model substrings) ─────────────────────────────

const HIGH_RESALE_MODELS = new Set([
  "Toyota Camry", "Toyota Corolla", "Toyota RAV4", "Toyota Highlander",
  "Toyota Prius", "Honda Civic", "Honda CR-V", "Honda Accord", "Honda Pilot",
  "Subaru Outback", "Subaru Crosstrek", "Ford F-150",
  "Chevrolet Silverado", "Jeep Wrangler",
]);

// ─── Federal Tax Brackets 2026 (Single) ──────────────────────────────────────

function calculateFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  if (taxableIncome > 201_775) {
    tax += (taxableIncome - 201_775) * 0.32;
    taxableIncome = 201_775;
  }
  if (taxableIncome > 105_700) {
    tax += (taxableIncome - 105_700) * 0.24;
    taxableIncome = 105_700;
  }
  if (taxableIncome > 50_400) {
    tax += (taxableIncome - 50_400) * 0.22;
    taxableIncome = 50_400;
  }
  if (taxableIncome > 12_400) {
    tax += (taxableIncome - 12_400) * 0.12;
    taxableIncome = 12_400;
  }
  tax += taxableIncome * 0.10;
  return tax;
}

// ─── Vehicle Depreciation Rate ────────────────────────────────────────────────

function getDepreciationRate(vehicleMake: string, vehicleYear: number): number {
  const age = new Date().getFullYear() - vehicleYear;

  // Base rate by brand/model
  let base = 0.15;
  if (LUXURY_BRANDS.has(vehicleMake)) {
    base = 0.15 + 0.07; // $0.22
  } else {
    // Check high resale — vehicleMake here can be partial (e.g. "Toyota"), check against full model key
    const isHighResale = Array.from(HIGH_RESALE_MODELS).some((model) =>
      model.toLowerCase().startsWith(vehicleMake.toLowerCase())
    );
    if (isHighResale) {
      base = 0.15 - 0.03; // $0.12
    }
  }

  // Age adjustment
  let ageAdj = 0;
  if (age <= 3) ageAdj = 0.03;
  else if (age <= 7) ageAdj = -0.01;
  else if (age <= 15) ageAdj = -0.03;
  else ageAdj = -0.05;

  return Math.max(0.05, base + ageAdj);
}

// ─── Main Calculation Function ────────────────────────────────────────────────

export interface CalculatorInput {
  grossEarnings: number;   // daily
  miles: number;           // daily
  mpg: number;
  vehicleMake: string;
  vehicleYear: number;
  state: string;           // 2-letter code
  hoursWorked: number;
}

export interface CalculatorResult {
  grossEarnings: number;
  fuelCost: number;
  wearCost: number;
  taxAmount: number;       // daily
  netProfit: number;
  hourlyRate: number;
  stateName: string;
  stateMinWage: number;
  depreciationRate: number;
  gallonsUsed: number;
  stateTaxRate: number;
}

export function calculateProfit(input: CalculatorInput): CalculatorResult {
  const { grossEarnings, miles, mpg, vehicleMake, vehicleYear, state, hoursWorked } = input;

  // Fuel cost — skip for EVs (mpg === 999)
  const gallonsUsed = mpg >= 999 ? 0 : miles / mpg;
  const fuelCost = gallonsUsed * DEFAULT_GAS_PRICE;

  // Vehicle wear (depreciation)
  const depreciationRate = getDepreciationRate(vehicleMake, vehicleYear);
  const wearCost = miles * depreciationRate;

  // Taxes (annualize → compute → daily share)
  const annualGross = grossEarnings * 260;
  const seTaxableBase = annualGross * SE_ADJUSTMENT;
  const seDeduction = seTaxableBase * SE_TAX_RATE * 0.5; // half SE tax is deductible
  const annualSeTax = seTaxableBase * SE_TAX_RATE;
  const federalTaxableIncome = Math.max(0, annualGross - seDeduction - 14_600); // standard deduction 2026
  const federalTax = calculateFederalTax(federalTaxableIncome);
  const stateTaxRate = STATE_TAX_RATES[state] ?? 0;
  const stateTax = federalTaxableIncome * (stateTaxRate / 100);
  const annualTax = annualSeTax + federalTax + stateTax;
  const taxAmount = annualTax / 260;

  const netProfit = grossEarnings - fuelCost - wearCost - taxAmount;
  const hourlyRate = hoursWorked > 0 ? netProfit / hoursWorked : 0;

  const stateMinWage = STATE_MIN_WAGES[state] ?? FEDERAL_MIN_WAGE;
  const stateName = STATE_NAMES[state] ?? state;

  return {
    grossEarnings,
    fuelCost,
    wearCost,
    taxAmount,
    netProfit,
    hourlyRate,
    stateName,
    stateMinWage,
    depreciationRate,
    gallonsUsed,
    stateTaxRate,
  };
}
