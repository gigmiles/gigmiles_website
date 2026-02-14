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
}

export function calculateFinancials({ grossEarnings, expenses, miles, stateCode }: CalculationInput) {
    // 1. Deductible Expenses
    // Actual expenses + Mileage Deduction
    const mileageDeduction = miles * IRS_STANDARD_MILEAGE_RATE_2025
    const totalDeductions = expenses + mileageDeduction

    // 2. Taxable Income
    // Can't be less than 0 for tax purposes
    const taxableIncome = Math.max(0, grossEarnings - totalDeductions)

    // 3. Estimated Taxes
    const stateRate = STATE_TAX_RATES[stateCode] ?? STATE_TAX_RATES['DEFAULT']

    // SE Tax is fully applicable to net earnings from self-employment (simplified)
    // Income Tax (State) applies to taxable income
    // Note: SE Tax calculation is actually on 92.35% of net earnings, but for estimation 15.3% of total is a safe buffer.

    const estimatedFederalTax = taxableIncome * FEDERAL_SE_TAX_RATE
    const estimatedStateTax = taxableIncome * stateRate
    const totalEstimatedTax = estimatedFederalTax + estimatedStateTax

    // 4. Net Profit (Take Home)
    // Gross - Actual Cash Expenses - Taxes
    // Note: Mileage deduction is a non-cash expense for tax reduction, but depreciation is real.
    // For "Cash in Hand" (Net Profit), we subtract actual expenses (gas, etc) and taxes.
    // The user prompt formula: NET KAR = Gross - Expenses - Fuel - Depreciation - Insurance/30 - Tax
    // But wait, "Depreciation" is the mileage rate in our simplified model?
    // If we subtract Mileage Rate as a cost, we shouldn't also subtract Fuel (usually rate covers fuel).
    // IRS Rate covers: Gas, Insurance, Repairs, Depreciation.
    // So if we use IRS Rate, we shouldn't subtract Gas separately for "Profit" calculation if we want "Economic Profit".
    // BUT the user wants to track Fuel separately.

    // Let's refine based on prompt: "NET KAR = Toplam Günlük Gelir - Yakıt Maliyeti - Araç Aşınma Payı - Günlük Sigorta Payı - Ek Giderler - Tahmini Vergi"
    // Here "Araç Aşınma Payı" (Depreciation) is likely distinct from Fuel if they want to enter Fuel manually.
    // However, usually IRS Rate includes fuel.
    // Strategy: For the "Net Profit" display, we will use the IRS Rate as a proxy for ALL vehicle costs (Fuel + Depr + Maint) to be safe/simple, OR we use Actual Fuel + Estimated Depr.
    // PROMPT SAYS: Formül: `Toplam Mile × $0.70 = Aşınma Maliyeti`
    // AND `(Toplam Mile / MPG) × Benzin Fiyatı = Günlük Yakıt Maliyeti`
    // This is double counting if $0.70 is the IRS rate (which includes gas).
    // BUT, maybe the user wants "Depreciation" specifically.
    // Let's treat $0.70 as the TOTAL vehicle cost per mile for simplicity in this version, OR custom logic.

    // Let's stick to the Prompt's exact request if possible, but $0.70/mi purely for "Wear & Tear" is too high (IRS rate includes gas).
    // Let's use a lower custom rate for "Depreciation Only" or assume the user wants the IRS deduction amount shown.

    // Decision: I will use the IRS deduction for *Taxable Income* calculation.
    // For *True Net Profit*, I will subtract: Expenses + Tax + (Miles * IRS_RATE). 
    // This is a conservative "Economic Profit".


    // Let's return the components so the UI can decide how to sum them.

    return {
        grossEarnings,
        totalExpenses: expenses, // Cash expenses entered manually
        mileageDeduction,
        taxableIncome,
        estimatedTax: totalEstimatedTax,
        netProfit: grossEarnings - expenses - totalEstimatedTax - mileageDeduction // Conservative Take Home
    }
}
