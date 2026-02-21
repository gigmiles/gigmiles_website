export const IRS_STANDARD_MILEAGE_RATE_2025 = 0.70 // Prompt said $0.70 for 2025

// Federal Self-Employment Tax Rate ~15.3%
export const FEDERAL_SE_TAX_RATE = 0.153

// Simplified State Tax Rates (Map or Object)
export const STATE_TAX_RATES: Record<string, number> = {
    'AL': 0.04, 'AK': 0.00, 'AZ': 0.025, 'AR': 0.044, 'CA': 0.06,
    'CO': 0.044, 'CT': 0.05, 'DE': 0.05, 'FL': 0.00, 'GA': 0.055,
    'HI': 0.07, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.03, 'IA': 0.05,
    'KS': 0.05, 'KY': 0.05, 'LA': 0.035, 'ME': 0.06, 'MD': 0.045,
    'MA': 0.05, 'MI': 0.0425, 'MN': 0.06, 'MS': 0.04, 'MO': 0.04,
    'MT': 0.05, 'NE': 0.05, 'NV': 0.00, 'NH': 0.00, 'NJ': 0.05,
    'NM': 0.04, 'NY': 0.05, 'NC': 0.045, 'ND': 0.02, 'OH': 0.03,
    'OK': 0.04, 'OR': 0.07, 'PA': 0.0307, 'RI': 0.04, 'SC': 0.05,
    'SD': 0.00, 'TN': 0.00, 'TX': 0.00, 'UT': 0.0485, 'VT': 0.05,
    'VA': 0.05, 'WA': 0.00, 'WV': 0.05, 'WI': 0.05, 'WY': 0.00,
    'DEFAULT': 0.04
}

interface CalculationInput {
    grossEarnings: number
    expenses: number
    miles: number
    stateCode: string
    mpg?: number
    gasPrice?: number
    wearRate?: number // Price per mile for wear & tear
    manualFuel?: number
    manualWear?: number
    manualInsurance?: number
    ownershipType?: string // 'owned', 'leased', 'rented'
    monthlyInsurance?: number
    monthlyLease?: number
    paymentCycle?: string // 'daily', 'weekly', 'monthly'
    insuranceCycle?: string // 'daily', 'weekly', 'monthly'
    fuelType?: 'gasoline' | 'electric'
    electricityPrice?: number // $/kWh
    platformFee?: number
    platformFeeCycle?: string // 'daily', 'weekly'
}

export function calculateFinancials({
    grossEarnings,
    expenses,
    miles,
    stateCode,
    mpg = 25,
    gasPrice = 4.50, // Updated standard baseline
    wearRate = 0.35,
    manualFuel,
    manualWear,
    manualInsurance,
    ownershipType = 'owned',
    monthlyInsurance = 0,
    monthlyLease = 0,
    paymentCycle = 'monthly',
    insuranceCycle = 'monthly',
    fuelType = 'gasoline',
    electricityPrice = 0.15,
    platformFee = 0,
    platformFeeCycle = 'daily'
}: CalculationInput) {
    // Ensure numeric parity (Sanitize inputs)
    const safeMiles = Number(miles) || 0
    const safeMpg = Number(mpg) || 25
    const safeGasPrice = Number(gasPrice) || 4.50
    const safeGross = Number(grossEarnings) || 0
    const safeExpenses = Number(expenses) || 0

    // 1. Amortized Fixed Costs (Daily/Weekly/Monthly/Yearly to Daily)
    const safeMonthlyInsurance = Number(monthlyInsurance) || 0
    const safeMonthlyLease = Number(monthlyLease) || 0

    const getDailyValue = (val: number, cycle: string) => {
        if (cycle === 'daily') return val
        if (cycle === 'weekly') return val / 7
        if (cycle === 'yearly') return val / 365
        return val / 30 // monthly
    }

    const dailyLease = getDailyValue(safeMonthlyLease, paymentCycle)
    const dailyInsurance = getDailyValue(safeMonthlyInsurance, insuranceCycle)
    const dailyPlatformFee = getDailyValue(Number(platformFee) || 0, platformFeeCycle)

    const dailyFixedCosts = dailyLease + dailyInsurance + dailyPlatformFee

    // 2. Fuel Cost (Separated by Gas vs Electric)
    let gasCost = 0
    let electricCost = 0

    if (manualFuel !== undefined) {
        if (fuelType === 'electric') electricCost = Number(manualFuel)
        else gasCost = Number(manualFuel)
    } else {
        if (fuelType === 'electric') {
            electricCost = safeMpg > 0 ? (safeMiles / safeMpg) * (Number(electricityPrice) || 0.15) : 0
        } else {
            gasCost = safeMpg > 0 ? (safeMiles / safeMpg) * safeGasPrice : 0
        }
    }

    const fuelCost = gasCost + electricCost

    // 3. Tax Logic
    const mileageDeduction = safeMiles * IRS_STANDARD_MILEAGE_RATE_2025
    const totalDeductions = safeExpenses + mileageDeduction
    const taxableIncome = Math.max(0, safeGross - totalDeductions)

    const stateRate = STATE_TAX_RATES[stateCode] ?? STATE_TAX_RATES['DEFAULT']
    const estimatedFederalTax = taxableIncome * FEDERAL_SE_TAX_RATE
    const estimatedStateTax = taxableIncome * stateRate
    const totalEstimatedTax = estimatedFederalTax + estimatedStateTax

    // 3. Real-World Business Profit logic
    // Wear & Tear (Only if user owns the vehicle)
    const isOwned = ownershipType.toLowerCase() === 'owned'
    const wearCost = manualWear !== undefined
        ? Number(manualWear)
        : (isOwned ? (safeMiles * wearRate) : 0)

    // Per-shift/Daily Insurance (Legacy or manual override)
    const directInsurance = manualInsurance !== undefined ? Number(manualInsurance) : 0

    const totalRealCosts = safeExpenses + fuelCost + wearCost + directInsurance + dailyFixedCosts

    return {
        grossEarnings: safeGross,
        cashExpenses: safeExpenses,
        fuelCost,
        gasCost,
        electricCost,
        wearCost,
        insuranceCost: directInsurance + dailyFixedCosts,
        dailyFixedCosts,
        totalRealCosts,
        estimatedTax: totalEstimatedTax,
        estimatedFederalTax,
        estimatedStateTax,
        netProfit: safeGross - totalRealCosts - totalEstimatedTax,
        mileageDeduction
    }
}

// --- Bolt Migration Helpers ---
export function calculateHourlyRate(netProfit: number, hours: number): number {
    if (hours === 0) return 0
    return Number((netProfit / hours).toFixed(2))
}

export function calculatePerMile(amount: number, miles: number): number {
    if (miles === 0) return 0
    return Number((amount / miles).toFixed(2))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function formatNumber(amount: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount)
}


export function calculateProfitMargin(netProfit: number, grossIncome: number): number {
    if (grossIncome === 0) return 0
    return Number(((netProfit / grossIncome) * 100).toFixed(2))
}

export function getDepreciationRate(make: string, model: string, year: number): number {
    let rate = 0.15 // Base rate ($0.15/mile)

    // 1. Luxury / Premium Make Factor (Higher Maintenance/Depreciation)
    const luxuryMakes = [
        'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Tesla', 'Porsche', 'Land Rover',
        'Jaguar', 'Volvo', 'Infiniti', 'Acura', 'Cadillac', 'Lincoln', 'Maserati',
        'Alfa Romeo', 'Rivian', 'Lucid', 'Polestar'
    ]

    // 2. High Resale Value Models (Lower Depreciation)
    // These cars hold their value better than average
    const highResaleModels = [
        // Toyota
        'Tacoma', '4Runner', 'Tundra', 'Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius',
        // Honda
        'Civic', 'CR-V', 'Accord', 'Pilot',
        // Jeep
        'Wrangler', 'Gladiator',
        // Subaru
        'WRX', 'Outback', 'Crosstrek', 'Forester',
        // Trucks & Others
        'F-150', 'Silverado', 'Sierra', 'Mustang', 'Corvette', '911'
    ]

    if (luxuryMakes.includes(make)) {
        rate += 0.08 // Reduced from 0.10 to 0.08 as per plan
    }

    const normalizedModel = model.toLowerCase()
    if (highResaleModels.some(m => normalizedModel.includes(m.toLowerCase()))) {
        rate -= 0.03 // Value retention discount
    }

    // 3. Age Factor
    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    if (age <= 3) {
        rate += 0.05 // New cars lose value fastest
    } else if (age <= 7) {
        rate -= 0.02 // Mid-age cars (4-7 years) have a slight reduction but not as much as older ones
    } else if (age > 15) {
        rate -= 0.08 // Very old cars (bottomed out, heavily depreciated)
    } else if (age > 7) {
        rate -= 0.05 // Older cars have flatter depreciation curve
    }

    // Cap minimum rate to avoid unrealistic values (e.g. old civic shouldn't be 0)
    return Math.max(0.05, Number(rate.toFixed(3)))
}
