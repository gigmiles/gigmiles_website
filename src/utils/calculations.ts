export const IRS_STANDARD_MILEAGE_RATE_2025 = 0.70 // Prompt said $0.70 for 2025

// Federal Self-Employment Tax Rate ~15.3%
export const FEDERAL_SE_TAX_RATE = 0.153

// Simplified State Tax Rates (Map or Object)
export const STATE_TAX_RATES: Record<string, number> = {
    'CA': 0.06, // Approx effective rate
    'TX': 0.00,
    'NY': 0.05,
    'FL': 0.00,
    // Add more as needed or default
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
    fuelType?: 'gasoline' | 'electric'
    electricityPrice?: number // $/kWh
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
    fuelType = 'gasoline',
    electricityPrice = 0.15
}: CalculationInput) {
    // Ensure numeric parity (Sanitize inputs)
    const safeMiles = Number(miles) || 0
    const safeMpg = Number(mpg) || 25
    const safeGasPrice = Number(gasPrice) || 4.50
    const safeGross = Number(grossEarnings) || 0
    const safeExpenses = Number(expenses) || 0

    // 1. Amortized Fixed Costs (Daily/Weekly/Monthly to Daily)
    const safeMonthlyInsurance = Number(monthlyInsurance) || 0
    const safeMonthlyLease = Number(monthlyLease) || 0

    let dailyLease = 0
    if (paymentCycle === 'daily') {
        dailyLease = safeMonthlyLease
    } else if (paymentCycle === 'weekly') {
        dailyLease = safeMonthlyLease / 7
    } else {
        dailyLease = safeMonthlyLease / 30
    }

    const dailyFixedCosts = dailyLease + (safeMonthlyInsurance / 30)

    // 2. Fuel Cost
    // For Gasoline: (Miles / MPG) * GasPrice
    // For Electric: (Miles / MPGe) * ElectricityPrice * 33.7 
    // (Note: 33.7 kWh is the EPA standard for 1 Gallon of Gasoline Equivalent)
    const fuelCost = manualFuel !== undefined
        ? Number(manualFuel)
        : (fuelType === 'electric'
            ? (safeMpg > 0 ? (safeMiles / safeMpg) * 33.7 * (Number(electricityPrice) || 0.15) : 0)
            : (safeMpg > 0 ? (safeMiles / safeMpg) * safeGasPrice : 0))

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
        wearCost,
        insuranceCost: directInsurance + dailyFixedCosts,
        dailyFixedCosts,
        totalRealCosts,
        estimatedTax: totalEstimatedTax,
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


export function calculateProfitMargin(netProfit: number, grossIncome: number): number {
    if (grossIncome === 0) return 0
    return Number(((netProfit / grossIncome) * 100).toFixed(2))
}

export function getDepreciationRate(make: string, model: string): number {
    // Basic estimation based on vehicle type
    // This can be enhanced with a more detailed database later
    const luxuryMakes = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Tesla', 'Porsche', 'Land Rover']

    if (luxuryMakes.includes(make)) {
        return 0.25 // Higher depreciation for luxury vehicles ($0.25/mile)
    }

    return 0.15 // Standard depreciation ($0.15/mile)
}
