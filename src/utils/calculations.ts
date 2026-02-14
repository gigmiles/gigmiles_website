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
}

export function calculateFinancials({
    grossEarnings,
    expenses,
    miles,
    stateCode,
    mpg = 25,
    gasPrice = 4.50, // Updated standard baseline
    wearRate = 0.35
}: CalculationInput) {
    // Ensure numeric parity (Sanitize inputs)
    const safeMiles = Number(miles) || 0
    const safeMpg = Number(mpg) || 25
    const safeGasPrice = Number(gasPrice) || 4.50
    const safeGross = Number(grossEarnings) || 0
    const safeExpenses = Number(expenses) || 0

    // 1. Tax Logic
    const mileageDeduction = safeMiles * IRS_STANDARD_MILEAGE_RATE_2025
    const totalDeductions = safeExpenses + mileageDeduction
    const taxableIncome = Math.max(0, safeGross - totalDeductions)

    const stateRate = STATE_TAX_RATES[stateCode] ?? STATE_TAX_RATES['DEFAULT']
    const estimatedFederalTax = taxableIncome * FEDERAL_SE_TAX_RATE
    const estimatedStateTax = taxableIncome * stateRate
    const totalEstimatedTax = estimatedFederalTax + estimatedStateTax

    // 2. Real-World Business Profit logic
    // Fuel Cost = (Miles / MPG) * GasPrice
    const fuelCost = safeMpg > 0 ? (safeMiles / safeMpg) * safeGasPrice : 0

    // Wear & Tear
    const wearCost = safeMiles * wearRate

    // Daily Insurance
    const dailyInsurance = 5.00

    const totalRealCosts = safeExpenses + fuelCost + wearCost + dailyInsurance

    return {
        grossEarnings: safeGross,
        cashExpenses: safeExpenses,
        fuelCost,
        wearCost,
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
