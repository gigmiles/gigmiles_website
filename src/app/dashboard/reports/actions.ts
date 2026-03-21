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

const PLATFORM_FILL_COLORS: Record<string, string> = {
    'uber': '#FFFFFF',
    'uber eats': '#06C167',
    'lyft': '#FF00BF',
    'doordash': '#FF3008',
    'grubhub': '#FF8000',
    'instacart': '#43B02A',
    'spark': '#0071CE',
    'amazon flex': '#FF9900',
    'roadie': '#10B981',
    'shipt': '#6366F1',
    'gopuff': '#00A3E0',
    'favor': '#F59E0B',
    'point pickup': '#8B5CF6',
    'other': '#64748B',
}
const FALLBACK_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4', '#F97316']

function getPlatformColor(name: string, idx: number = 0): string {
    return PLATFORM_FILL_COLORS[name.toLowerCase()] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
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
        return { 
            dailyData: [], 
            platformData: [], 
            expenseBreakdown: [],
            prevTotals: { gross: 0, net: 0, miles: 0 } 
        }
    }

    // Fetch user's profile and primary vehicle for calculations
    const [{ data: vehicle }, { data: profile }] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', user.id).eq('is_primary', true).maybeSingle(),
        supabase.from('profiles').select('state_code, default_gas_price').eq('id', user.id).maybeSingle()
    ])

    const userStateCode = profile?.state_code || 'DEFAULT'
    const userGasPrice = profile?.default_gas_price || 3.50

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
    const currentGasPrice = userGasPrice

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
                stateCode: userStateCode,
                mpg: vehicle?.mpg || 25,
                gasPrice: currentGasPrice,
                wearRate: vehicle?.depreciation_rate || 0.35,
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

    const platformData = Array.from(platformMap.entries()).map(([name, stats], idx) => {
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
            fill: getPlatformColor(name, idx)
        }
    }).sort((a, b) => b.gross - a.gross)

    const expenseBreakdown = Array.from(expenseMap.values()).sort((a, b) => b.total - a.total)

    // Previous period — same duration, shifted back
    const periodMs = end.getTime() - start.getTime()
    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(prevEnd.getTime() - periodMs)

    const { data: prevEntries } = await supabase
        .from('daily_entries')
        .select('platform_earnings ( amount, tips, miles ), expenses ( amount, category )')
        .eq('user_id', user.id)
        .gte('date', format(prevStart, 'yyyy-MM-dd'))
        .lte('date', format(prevEnd, 'yyyy-MM-dd'))

    let prevGross = 0, prevNet = 0, prevMiles = 0
    if (prevEntries) {
        for (const entry of prevEntries as any[]) {
            let dayGross = 0, dayMiles = 0, dayExpenses = 0
            for (const p of entry.platform_earnings || []) {
                dayGross += (p.amount || 0) + (p.tips || 0)
                dayMiles += p.miles || 0
            }
            for (const e of entry.expenses || []) {
                if (!['__FUEL_OVERRIDE__', '__WEAR_OVERRIDE__', '__INSURANCE_OVERRIDE__'].includes(e.category)) {
                    dayExpenses += e.amount || 0
                }
            }
            prevGross += dayGross
            prevNet += dayGross - dayExpenses
            prevMiles += dayMiles
        }
    }

    return {
        dailyData,
        platformData,
        expenseBreakdown,
        prevTotals: { gross: prevGross, net: prevNet, miles: prevMiles }
    }
}
