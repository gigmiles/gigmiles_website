import { createClient } from '@/utils/supabase/server'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'

interface PlatformEarning {
    platform_name: string
    amount: number
    tips: number
    miles: number
    hours: number
}

interface Expense {
    amount: number
    category: string
    description: string | null
}

interface DatabaseEntry {
    date: string
    platform_earnings: PlatformEarning[]
    expenses: Expense[]
}

interface PlatformStats {
    gross: number
    tips: number
    hours: number
    miles: number
}

interface ExpenseItemDetail {
    amount: number
    description: string
    date: string
}

interface ExpenseCategory {
    category: string
    total: number
    items: ExpenseItemDetail[]
}

const knownPlatforms = [
    'uber',
    'uber eats',
    'lyft',
    'doordash',
    'grubhub',
    'instacart',
    'spark',
    'amazon flex'
]

function getPlatformColor(name: string): string {
    const normalized = name.toLowerCase()
    if (knownPlatforms.includes(normalized)) {
        return `var(--color-${normalized.replace(/\s+/g, '-')})`
    }
    return 'var(--color-other)'
}

export async function getReportsData(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date())
    const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(subDays(end, 6))

    // Fetch entries for the date range
    const { data: entries, error } = await supabase
        .from('daily_entries')
        .select(`
            date,
            platform_earnings ( platform_name, amount, tips, miles, hours ),
            expenses ( amount, category, description )
        `)
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

    if (error || !entries) {
        console.error('Error fetching reports data:', error)
        return { dailyData: [], platformData: [], expenseBreakdown: [] }
    }

    // Fetch user's primary vehicle for calculations
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    const { calculateFinancials } = await import('@/utils/calculations')

    // 1. Initialize Daily Data Map
    const dailyDataMap = new Map<string, {
        date: string;
        fullDate: string;
        earnings: number;
        expenses: number;
        netProfit: number;
        miles: number;
        depreciationCost: number;
    }>()

    const loopDate = new Date(start)
    while (loopDate <= end) {
        const dateStr = format(loopDate, 'yyyy-MM-dd')
        dailyDataMap.set(dateStr, {
            date: format(loopDate, 'MM/dd/yyyy'),
            fullDate: dateStr,
            earnings: 0,
            expenses: 0,
            netProfit: 0,
            miles: 0,
            depreciationCost: 0
        })
        loopDate.setDate(loopDate.getDate() + 1)
    }

    // 2. Initialize Platform and Expense Maps
    const platformMap = new Map<string, PlatformStats>()
    const expenseMap = new Map<string, ExpenseCategory>()

    // Type assertion with validation
    const typedEntries = entries as unknown as DatabaseEntry[]

    // Current gas price (could be fetched dynamically, using default for now)
    const currentGasPrice = 4.50

    typedEntries.forEach((entry) => {
        const dayStat = dailyDataMap.get(entry.date)
        if (dayStat) {
            let dailyEarnings = 0
            let dailyMiles = 0
            let dailyHours = 0

            // Earnings & Platform Stats
            entry.platform_earnings.forEach((p) => {
                const total = (p.amount || 0) + (p.tips || 0)
                dailyEarnings += total
                dailyMiles += (p.miles || 0)
                dailyHours += (p.hours || 0)

                const existing = platformMap.get(p.platform_name) || {
                    gross: 0,
                    tips: 0,
                    hours: 0,
                    miles: 0
                }

                platformMap.set(p.platform_name, {
                    gross: existing.gross + total,
                    tips: existing.tips + (p.tips || 0),
                    hours: existing.hours + (p.hours || 0),
                    miles: existing.miles + (p.miles || 0)
                })
            })

            dayStat.earnings += dailyEarnings
            dayStat.miles += dailyMiles

            // Manual Expenses & Overrides
            let dailyCashExpenses = 0
            let fuelOverride: number | undefined
            let wearOverride: number | undefined
            let insuranceOverride: number | undefined

            if (entry.expenses && Array.isArray(entry.expenses)) {
                entry.expenses.forEach((e) => {
                    // Check for overrides
                    if (e.category === '__FUEL_OVERRIDE__') fuelOverride = e.amount;
                    else if (e.category === '__WEAR_OVERRIDE__') wearOverride = e.amount;
                    else if (e.category === '__INSURANCE_OVERRIDE__') insuranceOverride = e.amount;
                    else {
                        // Regular expense
                        const amount = (e.amount || 0)
                        dailyCashExpenses += amount

                        // Update Expense Breakdown Map
                        let cat = e.category || 'Other'
                        if (cat === 'Other' && e.description) {
                            cat = e.description
                        }
                        const existing = expenseMap.get(cat) || {
                            category: cat,
                            total: 0,
                            items: []
                        }

                        existing.total += amount
                        existing.items.push({
                            amount,
                            description: e.description || 'No description',
                            date: entry.date
                        })
                        expenseMap.set(cat, existing)
                    }
                })
            }

            // Perform Comprehensive Financial Calculation
            const financials = calculateFinancials({
                grossEarnings: dailyEarnings,
                expenses: dailyCashExpenses,
                miles: dailyMiles,
                stateCode: 'CA', // Defaulting to CA or should come from user settings? Using placeholder from logic.
                mpg: vehicle?.mpg || 25,
                gasPrice: currentGasPrice,
                wearRate: vehicle?.depreciation_rate || 0.15,
                manualFuel: fuelOverride,
                manualWear: wearOverride,
                manualInsurance: insuranceOverride,
                ownershipType: vehicle?.ownership_type || 'owned',
                monthlyInsurance: vehicle?.monthly_insurance || 0,
                monthlyLease: vehicle?.monthly_payment || 0,
                paymentCycle: vehicle?.payment_cycle || 'monthly',
                fuelType: vehicle?.fuel_type || 'gasoline',
                electricityPrice: vehicle?.electricity_cost_per_kwh || 0.15
            })

            // Populate Breakdown for Depreciation/Wear if not manually overridden
            // calculateFinancials returns 'wearCost' which is either manual or calculated
            const depreciation = financials.wearCost
            dayStat.depreciationCost = depreciation

            if (depreciation > 0 && !wearOverride) {
                const depCat = 'Vehicle Wear'
                const existingDep = expenseMap.get(depCat) || {
                    category: depCat,
                    total: 0,
                    items: []
                }
                // Only add if not already added for this day? 
                // Currently grouped by day, so we push a new item for this day
                existingDep.total += depreciation
                existingDep.items.push({
                    amount: depreciation,
                    description: `Wear & Tear for ${dailyMiles.toFixed(1)} miles`,
                    date: entry.date
                })
                expenseMap.set(depCat, existingDep)
            }

            // Also populate Fuel Cost if significant and not manual
            if (financials.fuelCost > 0 && !fuelOverride) {
                const fuelCat = 'Estimated Fuel'
                const existingFuel = expenseMap.get(fuelCat) || { category: fuelCat, total: 0, items: [] }
                existingFuel.total += financials.fuelCost
                existingFuel.items.push({
                    amount: financials.fuelCost,
                    description: `Estimated fuel for ${dailyMiles.toFixed(1)} miles`,
                    date: entry.date
                })
                expenseMap.set(fuelCat, existingFuel)
            }

            // Sync Tax Estimates into the breakdown
            if (financials.estimatedTax > 0) {
                const taxCat = 'Tax Estimates'
                const existingTax = expenseMap.get(taxCat) || { category: taxCat, total: 0, items: [] }
                existingTax.total += financials.estimatedTax
                existingTax.items.push({
                    amount: financials.estimatedTax,
                    description: `Estimated Federal (${(financials.estimatedFederalTax / (financials.grossEarnings || 1) * 100).toFixed(1)}%) & State tax`,
                    date: entry.date
                })
                expenseMap.set(taxCat, existingTax)
            }

            // Sync Reports Logic with Dashboard Logic
            // Dashboard effectively says Expenses = Gross - Net
            // This includes Taxes as an 'Expense' in the visual sense of "Money Out"
            // financials.totalRealCosts includes Cash Expenses + Fuel + Wear + Insurance + Fixed
            // NetProfit = Gross - totalRealCosts - Taxes

            // To align with "Expenses = Gross - Net", we should set expenses to:
            dayStat.expenses = dailyEarnings - financials.netProfit
            dayStat.netProfit = financials.netProfit
        }
    })

    // 3. Convert Maps to Arrays and Add efficiency metrics
    const dailyData = Array.from(dailyDataMap.values())

    const platformData = Array.from(platformMap.entries()).map(([name, stats]) => {
        const hourlyRate = stats.hours > 0 ? stats.gross / stats.hours : 0
        const tipPct = stats.gross > 0 ? (stats.tips / stats.gross) * 100 : 0
        const earningsPerMile = stats.miles > 0 ? stats.gross / stats.miles : 0

        return {
            name,
            value: stats.gross, // For PieChart
            gross: stats.gross,
            tips: stats.tips,
            hours: stats.hours,
            miles: stats.miles,
            hourlyRate,
            tipPct,
            earningsPerMile,
            fill: getPlatformColor(name)
        }
    }).sort((a, b) => b.gross - a.gross)

    const expenseBreakdown = Array.from(expenseMap.values()).sort((a, b) => b.total - a.total)

    return {
        dailyData,
        platformData,
        expenseBreakdown
    }
}
