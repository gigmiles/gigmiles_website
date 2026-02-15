'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { calculateFinancials } from '@/utils/calculations'
import { getGasPrice } from '@/utils/api/external'

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get Profile for State Code
    const { data: profile } = await supabase
        .from('profiles')
        .select('state_code')
        .eq('id', user.id)
        .single()

    // Get Vehicles
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, year, mpg, depreciation_rate, is_primary, ownership_type, monthly_payment, monthly_insurance, payment_cycle, fuel_type, electricity_cost_per_kwh')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

    let vehicle = vehicles?.find(v => v.is_primary) || vehicles?.[0] || null

    const stateCode = profile?.state_code || 'DEFAULT'
    const mpg = vehicle?.mpg || 25

    const today = new Date()
    // 1. Get Today's Entry
    const { data: todayEntry } = await supabase
        .from('daily_entries')
        .select(`
      id,
      platform_earnings ( platform_name, amount, tips, miles, hours ),
      expenses ( amount, category )
    `)
        .eq('user_id', user.id)
        .eq('date', format(today, 'yyyy-MM-dd'))
        .single()

    // Calculate Today's Stats
    let todayGross = 0
    let todayExpenses = 0
    let todayMiles = 0
    let todayHours = 0
    let todayTips = 0

    if (todayEntry) {
        todayEntry.platform_earnings.forEach((p: any) => {
            todayGross += (p.amount || 0) + (p.tips || 0)
            todayTips += (p.tips || 0)
            todayMiles += (p.miles || 0)
            todayHours += (p.hours || 0)
        })

        todayEntry.expenses.forEach((e: any) => {
            todayExpenses += (e.amount || 0)
        })
    }

    // 1.5 Extract Overrides
    const overrides = {
        fuel: todayEntry?.expenses.find((e: any) => e.category === '__FUEL_OVERRIDE__')?.amount,
        wear: todayEntry?.expenses.find((e: any) => e.category === '__WEAR_OVERRIDE__')?.amount,
        insurance: todayEntry?.expenses.find((e: any) => e.category === '__INSURANCE_OVERRIDE__')?.amount
    }

    // 2. Fetch Dynamic Gas Price
    const currentGasPrice = await getGasPrice(stateCode)

    const financials = calculateFinancials({
        grossEarnings: todayGross,
        expenses: todayExpenses,
        miles: todayMiles,
        stateCode,
        mpg,
        gasPrice: currentGasPrice,
        wearRate: vehicle?.depreciation_rate || 0.35,
        manualFuel: overrides.fuel,
        manualWear: overrides.wear,
        manualInsurance: overrides.insurance,
        ownershipType: vehicle?.ownership_type || 'owned',
        monthlyInsurance: vehicle?.monthly_insurance || 0,
        monthlyLease: vehicle?.monthly_payment || 0,
        paymentCycle: vehicle?.payment_cycle || 'monthly',
        fuelType: vehicle?.fuel_type || 'gasoline',
        electricityPrice: vehicle?.electricity_cost_per_kwh || 0.15
    })

    // Debugging Fuel Calculation
    console.log(`[DashboardStats] Date: ${format(today, 'yyyy-MM-dd')}, Gross: ${todayGross}, Miles: ${todayMiles}, MPG: ${mpg}, FuelCost: ${financials.fuelCost}`)

    // 3. Get Last 7 Days for Chart
    const sevenDaysAgo = startOfDay(new Date())
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const { data: weeklyEntries } = await supabase
        .from('daily_entries')
        .select(`
            id,
            date,
            platform_earnings ( platform_name, amount, tips, miles, hours ),
            expenses ( amount, category )
        `)
        .eq('user_id', user.id)
        .gte('date', format(sevenDaysAgo, 'yyyy-MM-dd'))
        .lte('date', format(today, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

    // Process Weekly Data
    const chartData = []
    let weeklyGross = 0
    let weeklyNet = 0
    let weeklyMiles = 0
    let weeklyHours = 0

    // Create a map for quick lookup
    const entryMap = new Map(weeklyEntries?.map(e => [e.date, e]) || [])

    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo)
        d.setDate(d.getDate() + i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const entry = entryMap.get(dateStr)

        let dGross = 0
        let dExpenses = 0
        let dMiles = 0
        let dHours = 0
        let dTips = 0

        if (entry) {
            entry.platform_earnings.forEach((p: any) => {
                dGross += (p.amount || 0) + (p.tips || 0)
                dTips += (p.tips || 0)
                dMiles += (p.miles || 0)
                dHours += (p.hours || 0)
            })
            entry.expenses.forEach((e: any) => {
                dExpenses += (e.amount || 0)
            })

            const dOverrides = {
                fuel: entry.expenses.find((e: any) => e.category === '__FUEL_OVERRIDE__')?.amount,
                wear: entry.expenses.find((e: any) => e.category === '__WEAR_OVERRIDE__')?.amount,
                insurance: entry.expenses.find((e: any) => e.category === '__INSURANCE_OVERRIDE__')?.amount
            }

            const dFinancials = calculateFinancials({
                grossEarnings: dGross,
                expenses: dExpenses,
                miles: dMiles,
                stateCode,
                mpg,
                gasPrice: currentGasPrice, // Use current gas price for simplicity or fetch historical?
                wearRate: vehicle?.depreciation_rate || 0.35,
                manualFuel: dOverrides.fuel,
                manualWear: dOverrides.wear,
                manualInsurance: dOverrides.insurance,
                ownershipType: vehicle?.ownership_type || 'owned',
                monthlyInsurance: vehicle?.monthly_insurance || 0,
                monthlyLease: vehicle?.monthly_payment || 0,
                paymentCycle: vehicle?.payment_cycle || 'monthly',
                fuelType: vehicle?.fuel_type || 'gasoline',
                electricityPrice: vehicle?.electricity_cost_per_kwh || 0.15
            })

            weeklyGross += dGross
            weeklyNet += dFinancials.netProfit
            weeklyMiles += dMiles
            weeklyHours += dHours

            chartData.push({
                date: dateStr,
                label: format(d, 'EEE'),
                gross: dGross,
                net: dFinancials.netProfit
            })
        } else {
            chartData.push({
                date: dateStr,
                label: format(d, 'EEE'),
                gross: 0,
                net: 0
            })
        }
    }

    // 4. Platform Distribution (Last 7 Days)
    const platformMap = new Map<string, { gross: number, tips: number, hours: number, miles: number }>()
    weeklyEntries?.forEach(entry => {
        entry.platform_earnings.forEach((p: any) => {
            const name = p.platform_name || 'Other'
            const existing = platformMap.get(name) || { gross: 0, tips: 0, hours: 0, miles: 0 }
            platformMap.set(name, {
                gross: existing.gross + (p.amount || 0) + (p.tips || 0),
                tips: existing.tips + (p.tips || 0),
                hours: existing.hours + (p.hours || 0),
                miles: existing.miles + (p.miles || 0)
            })
        })
    })

    const platformDistribution = Array.from(platformMap.entries()).map(([name, stats]) => ({
        name,
        value: stats.gross,
        tips: stats.tips,
        hours: stats.hours,
        miles: stats.miles,
        fill: `var(--color-${name.toLowerCase().replace(/\s+/g, '-')})`
    })).sort((a, b) => b.value - a.value)

    return {
        today: {
            gross: todayGross,
            netProfit: financials.netProfit,
            expenses: todayExpenses,
            miles: todayMiles,
            hours: todayHours,
            fuelCost: financials.fuelCost,
            wearCost: financials.wearCost,
            dailyInsurance: financials.insuranceCost,
            totalRealCosts: financials.totalRealCosts,
            hasEntry: !!todayEntry,
            estimatedTax: financials.estimatedTax,
            tips: todayTips,
            mpg,
            gasPrice: currentGasPrice,
            // Bolt Component Compatibility
            richEntry: todayEntry ? {
                ...todayEntry,
                entry_date: format(today, 'yyyy-MM-dd'),
                total_earnings: todayGross,
                total_tips: todayTips,
                total_miles: todayMiles,
                total_hours: todayHours,
                calculated_costs: financials, // Inject calculated financials
                platform_earnings: todayEntry.platform_earnings || [],
                expenses: todayEntry.expenses || []
            } : null
        },
        weekly: {
            gross: weeklyGross,
            netProfit: weeklyNet,
            miles: weeklyMiles,
            hours: weeklyHours,
            entries: weeklyEntries || []
        },
        chartData,
        platformDistribution,
        vehicles: vehicles || [],
        activeVehicleId: vehicle?.id || null
    }
}

export async function switchPrimaryVehicle(vehicleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Remove primary status from all user vehicles
    await supabase
        .from('vehicles')
        .update({ is_primary: false })
        .eq('user_id', user.id)

    // 2. Set new primary vehicle
    const { error } = await supabase
        .from('vehicles')
        .update({ is_primary: true })
        .eq('id', vehicleId)
        .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
}

export async function createDailyEntry(entryData: any, earningsData: any[], expensesData?: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Check/Create Daily Entry
    let entryId = ''

    // Check for existing
    const { data: existingEntry } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', entryData.date)
        .single()

    if (existingEntry) {
        console.log("Entry exists, appending new data:", existingEntry.id)
        entryId = existingEntry.id
        // Optional: Append notes? For now, we leave notes as is or maybe update if provided?
        if (entryData.notes) {
            // We could append notes, but let's keep it simple for now and just add the financial data
        }
    } else {
        const { data: entry, error: entryError } = await supabase
            .from('daily_entries')
            .insert({
                user_id: user.id,
                date: entryData.date,
                notes: entryData.notes
            })
            .select()
            .single()

        if (entryError) {
            console.error('Error creating entry:', entryError)
            throw new Error(`Failed to create entry: ${entryError.message}`)
        }
        entryId = entry.id
    }

    // Get Vehicle Depreciation Rate
    let { data: vehicle } = await supabase
        .from('vehicles')
        .select('depreciation_rate')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle()

    if (!vehicle) {
        const { data: anyVehicle } = await supabase
            .from('vehicles')
            .select('depreciation_rate')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
        vehicle = anyVehicle
    }

    const depreciationRate = vehicle?.depreciation_rate || 0

    // 2. Create Platform Earnings
    let totalMiles = 0
    if (earningsData && earningsData.length > 0) {
        const formattedEarnings = earningsData.map((p: any) => {
            const miles = p.miles ? parseFloat(p.miles) : 0
            totalMiles += miles
            return {
                entry_id: entryId,
                platform_name: p.platform_name,
                amount: parseFloat(p.amount),
                tips: p.tips ? parseFloat(p.tips) : 0,
                miles: miles,
                hours: p.hours ? parseFloat(p.hours) : 0,
            }
        })

        const { error: earningsError } = await supabase
            .from('platform_earnings')
            .insert(formattedEarnings)

        if (earningsError) {
            console.error('Error adding earnings:', earningsError)
        }
    }

    // 3. Create Expenses
    if (expensesData && expensesData.length > 0) {
        const formattedExpenses = expensesData.map((e: any) => ({
            entry_id: entryId,
            category: e.category,
            amount: parseFloat(e.amount),
            description: e.description
        }))

        const { error: expensesError } = await supabase
            .from('expenses')
            .insert(formattedExpenses)

        if (expensesError) {
            console.error('Error adding expenses:', expensesError)
        }
    }

    return { success: true, entryId: entryId }
}
export async function getRecentEntries(limit = 5) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('daily_entries')
        .select(`
            id,
            date,
            platform_earnings ( amount, tips ),
            expenses ( amount )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit)

    return data || []
}

export async function getEntryById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('daily_entries')
        .select(`
            id,
            date,
            notes,
            platform_earnings ( id, platform_name, amount, tips, miles, hours ),
            expenses ( id, category, amount, description )
        `)
        .eq('user_id', user.id)
        .eq('id', id)
        .single()

    return data
}

export async function deleteDailyEntry(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', id)

    return { success: !error, error }
}

export async function updateDailyEntry(id: string, entryData: any, earningsData: any[], expensesData: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Update Base Entry
    await supabase.from('daily_entries').update({ date: entryData.date, notes: entryData.notes }).eq('id', id)

    // Get Vehicle Rate
    let { data: vehicle } = await supabase
        .from('vehicles')
        .select('depreciation_rate')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle()

    if (!vehicle) {
        const { data: anyVehicle } = await supabase
            .from('vehicles')
            .select('depreciation_rate')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
        vehicle = anyVehicle
    }

    const depreciationRate = vehicle?.depreciation_rate || 0

    // 2. Handle Earnings
    await supabase.from('platform_earnings').delete().eq('entry_id', id)

    let totalMiles = 0
    let formattedEarnings: any[] = []

    if (earningsData && earningsData.length > 0) {
        formattedEarnings = earningsData.map((p: any) => {
            const miles = p.miles ? parseFloat(p.miles) : 0
            totalMiles += miles
            return {
                entry_id: id,
                platform_name: p.platform_name,
                amount: parseFloat(p.amount),
                tips: p.tips ? parseFloat(p.tips) : 0,
                miles: miles,
                hours: p.hours ? parseFloat(p.hours) : 0,
            }
        })
        await supabase.from('platform_earnings').insert(formattedEarnings)
    }

    // 3. Handle Expenses
    await supabase.from('expenses').delete().eq('entry_id', id)

    if (expensesData && expensesData.length > 0) {
        const formattedExpenses = expensesData.map((e: any) => ({
            entry_id: id,
            category: e.category,
            amount: parseFloat(e.amount),
            description: e.description
        }))
        await supabase.from('expenses').insert(formattedExpenses)
    }

    return { success: true }
}

/**
 * Saves a manual cost override (e.g. Fuel, Wear, Insurance)
 */
export async function saveCostOverride(date: string, category: string, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Ensure a daily entry exists for this date
    let { data: entry } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

    if (!entry) {
        const { data: newEntry, error: createError } = await supabase
            .from('daily_entries')
            .insert({ user_id: user.id, date })
            .select('id')
            .single()
        if (createError) throw createError
        entry = newEntry
    }

    const entryId = entry.id

    // 2. Clear existing override for this category
    await supabase
        .from('expenses')
        .delete()
        .eq('entry_id', entryId)
        .eq('category', category)

    // 3. Insert new override
    if (amount !== undefined && amount !== null) {
        const { error } = await supabase
            .from('expenses')
            .insert({
                entry_id: entryId,
                category: category,
                amount: amount,
                description: `Manual Override`
            })
        if (error) throw error
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Adds a new direct expense for a specific date.
 */
export async function addExpense(date: string, expense: { category: string, amount: number, description: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Ensure a daily entry exists for this date
    let { data: entry } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

    if (!entry) {
        const { data: newEntry, error: createError } = await supabase
            .from('daily_entries')
            .insert({ user_id: user.id, date })
            .select('id')
            .single()
        if (createError) throw createError
        entry = newEntry
    }

    const { error } = await supabase
        .from('expenses')
        .insert({
            entry_id: entry.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description
        })

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Deletes a specific expense.
 */
export async function deleteExpense(expenseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
}
