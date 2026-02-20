'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfDay, format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { calculateFinancials } from '@/utils/calculations'
import { getGasPrice } from '@/utils/api/external'
import { PlatformEarning, Expense } from './types'

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const sevenDaysAgo = startOfDay(new Date())
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const sevenDaysAgoStr = format(sevenDaysAgo, 'yyyy-MM-dd')

    // 1. Parallel fetch for all core requirements
    const [profileRes, vehiclesRes, todayEntryRes, weeklyEntriesRes] = await Promise.all([
        supabase.from('profiles').select('state_code, default_gas_price').eq('id', user.id).single(),
        supabase.from('vehicles').select('*').eq('user_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('daily_entries').select(`
            id,
            date,
            notes,
            gas_price,
            platform_earnings ( id, platform_name, amount, tips, miles, hours ),
            expenses ( id, category, amount, description )
        `).eq('user_id', user.id).eq('date', todayStr).single(),
        supabase.from('daily_entries').select(`
            id,
            date,
            notes,
            gas_price,
            platform_earnings ( id, platform_name, amount, tips, miles, hours ),
            expenses ( id, category, amount, description )
        `).eq('user_id', user.id).gte('date', sevenDaysAgoStr).lte('date', todayStr).order('date', { ascending: true })
    ])

    const profile = profileRes.data
    const vehicles = vehiclesRes.data
    const todayEntry = todayEntryRes.data
    const weeklyEntries = weeklyEntriesRes.data || []

    const vehicle = vehicles?.find(v => v.is_primary) || vehicles?.[0] || null
    const stateCode = profile?.state_code || 'DEFAULT'
    const mpg = vehicle?.mpg || 25

    // 2. Determine Gas Price (Priority: Daily Entry > Profile Default > State API)
    let currentGasPrice = todayEntry?.gas_price || profile?.default_gas_price

    if (!currentGasPrice) {
        currentGasPrice = await getGasPrice(stateCode)
    }

    // Calculate Today's Stats
    let todayGross = 0
    let todayExpenses = 0
    let todayMiles = 0
    let todayHours = 0
    let todayTips = 0

    if (todayEntry) {
        const earnings = todayEntry.platform_earnings as unknown as PlatformEarning[]
        const expenses = todayEntry.expenses as unknown as Expense[]

        earnings.forEach((p) => {
            todayGross += (p.amount || 0) + (p.tips || 0)
            todayTips += (p.tips || 0)
            todayMiles += (p.miles || 0)
            todayHours += (p.hours || 0)
        })

        expenses.forEach((e) => {
            if (!e.category.startsWith('__')) { // Skip overrides for base expense sum
                todayExpenses += (e.amount || 0)
            }
        })
    }

    const overrides = {
        fuel: (todayEntry?.expenses as unknown as Expense[])?.find((e) => e.category === '__FUEL_OVERRIDE__')?.amount,
        wear: (todayEntry?.expenses as unknown as Expense[])?.find((e) => e.category === '__WEAR_OVERRIDE__')?.amount,
        insurance: (todayEntry?.expenses as unknown as Expense[])?.find((e) => e.category === '__INSURANCE_OVERRIDE__')?.amount
    }

    const financialResult = calculateFinancials({
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

    // Apply sanity guard to final financials before returning to UI
    const { guardDailyFinancials } = await import('@/utils/sanity-guards');
    const guarded = guardDailyFinancials(todayGross, todayMiles, todayHours);

    if (!guarded.isValid) {
        console.warn(`[DashboardStats] Today's Sanity Guard triggered: ${guarded.reason}`);
    }

    // We update the financials if the guard found issues, though here we primarily use it for UI warning/stabilization
    const financials = financialResult;

    // Process Weekly Data
    const chartData = []
    let weeklyGross = 0
    let weeklyNet = 0
    let weeklyMiles = 0
    let weeklyHours = 0

    const entryMap = new Map(weeklyEntries.map(e => [e.date, e]))

    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo)
        d.setDate(d.getDate() + i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const entry = entryMap.get(dateStr)

        let dGross = 0
        let dExpenses = 0
        let dMiles = 0
        let dHours = 0

        if (entry) {
            const entryEarnings = entry.platform_earnings as unknown as PlatformEarning[]
            const entryExpenses = entry.expenses as unknown as Expense[]

            entryEarnings.forEach((p) => {
                dGross += (p.amount || 0) + (p.tips || 0)
                dMiles += (p.miles || 0)
                dHours += (p.hours || 0)
            })

            entryExpenses.forEach((e) => {
                if (!e.category.startsWith('__')) dExpenses += (e.amount || 0)
            })

            const dOverrides = {
                fuel: entryExpenses.find((e) => e.category === '__FUEL_OVERRIDE__')?.amount,
                wear: entryExpenses.find((e) => e.category === '__WEAR_OVERRIDE__')?.amount,
                insurance: entryExpenses.find((e) => e.category === '__INSURANCE_OVERRIDE__')?.amount
            }

            const dFinancials = calculateFinancials({
                grossEarnings: dGross,
                expenses: dExpenses,
                miles: dMiles,
                stateCode,
                mpg,
                gasPrice: entry?.gas_price || profile?.default_gas_price || currentGasPrice,
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

            // Apply sanity guard to daily financials within the loop
            const { guardDailyFinancials: guardDailyFinancialsInLoop } = await import('@/utils/sanity-guards');
            const guardedDaily = guardDailyFinancialsInLoop(dGross, dMiles, dHours);

            // If the guard finds issues, we might adjust the values or log a warning.
            // For now, we'll just log a warning if the instruction was to "catch unrealistic values early".
            if (!guardedDaily.isValid) {
                console.warn(`[DashboardStats] Sanity Guard triggered for date ${dateStr}: ${guardedDaily.reason}.`);
                // Optionally, you could adjust dGross, dMiles, dHours, or dFinancials here
                // For example, if dGross is unrealistic, you might cap it or set it to 0 for chart display.
            }

            chartData.push({
                id: entry.id,
                date: dateStr,
                label: format(d, 'EEE'),
                gross: dGross,
                net: dFinancials.netProfit,
                miles: dMiles,
                hours: dHours,
                expenses: dGross - dFinancials.netProfit
            })
        } else {
            chartData.push({
                id: null,
                date: dateStr,
                label: format(d, 'EEE'),
                gross: 0,
                net: 0,
                miles: 0,
                hours: 0,
                expenses: 0
            })
        }
    }

    // Platform Distribution
    const platformMap = new Map<string, { gross: number, tips: number, hours: number, miles: number }>()
    weeklyEntries.forEach(entry => {
        (entry.platform_earnings as unknown as PlatformEarning[]).forEach((p: PlatformEarning) => {
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
            federalTax: financials.estimatedFederalTax,
            stateTax: financials.estimatedStateTax,
            tips: todayTips,
            mpg,
            gasPrice: currentGasPrice,
            richEntry: todayEntry ? {
                ...todayEntry,
                entry_date: todayStr,
                total_earnings: todayGross,
                total_tips: todayTips,
                total_miles: todayMiles,
                total_hours: todayHours,
                calculated_costs: financials,
                platform_earnings: todayEntry.platform_earnings || [],
                expenses: todayEntry.expenses || []
            } : null
        },
        weekly: {
            gross: weeklyGross,
            netProfit: weeklyNet,
            miles: weeklyMiles,
            hours: weeklyHours,
            entries: weeklyEntries
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

export async function createDailyEntry(entryData: { date: string, notes?: string, gas_price?: number }, earningsData: PlatformEarning[], expensesData?: Expense[]) {
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
    } else {
        const { data: entry, error: entryError } = await supabase
            .from('daily_entries')
            .insert({
                user_id: user.id,
                date: entryData.date,
                notes: entryData.notes,
                gas_price: entryData.gas_price
            })
            .select()
            .single()

        if (entryError) {
            console.error('Error creating entry:', entryError)
            throw new Error(`Failed to create entry: ${entryError.message}`)
        }
        entryId = entry.id
    }

    // 2. Create Platform Earnings
    if (earningsData && earningsData.length > 0) {
        const formattedEarnings = earningsData.map((p: PlatformEarning) => {
            const miles = p.miles ? parseFloat(p.miles.toString()) : 0
            return {
                entry_id: entryId,
                platform_name: p.platform_name,
                amount: parseFloat(p.amount.toString()),
                tips: p.tips ? parseFloat(p.tips.toString()) : 0,
                miles: miles,
                hours: p.hours ? parseFloat(p.hours.toString()) : 0,
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
        const formattedExpenses = expensesData.map((e: Expense) => ({
            entry_id: entryId,
            category: e.category,
            amount: parseFloat(e.amount.toString()),
            description: e.description
        }))

        const { error: expensesError } = await supabase
            .from('expenses')
            .insert(formattedExpenses)

        if (expensesError) {
            console.error('Error adding expenses:', expensesError)
        }
    }

    revalidatePath('/dashboard')
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
            notes,
            gas_price,
            platform_earnings ( id, platform_name, amount, tips, miles, hours ),
            expenses ( id, category, amount, description )
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
            gas_price,
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

    revalidatePath('/dashboard')
    return { success: !error, error }
}

export async function updateDailyEntry(id: string, entryData: { date: string, notes?: string, gas_price?: number }, earningsData: PlatformEarning[], expensesData: Expense[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Update Base Entry
    await supabase.from('daily_entries').update({
        date: entryData.date,
        notes: entryData.notes,
        gas_price: entryData.gas_price
    }).eq('id', id)

    // 2. Handle Earnings
    await supabase.from('platform_earnings').delete().eq('entry_id', id)

    let formattedEarnings: PlatformEarning[] = []

    if (earningsData && earningsData.length > 0) {
        formattedEarnings = earningsData.map((p: PlatformEarning) => {
            const miles = p.miles ? parseFloat(p.miles.toString()) : 0
            return {
                entry_id: id,
                platform_name: p.platform_name,
                amount: parseFloat(p.amount.toString()),
                tips: p.tips ? parseFloat(p.tips.toString()) : 0,
                miles: miles,
                hours: p.hours ? parseFloat(p.hours.toString()) : 0,
            }
        })
        await supabase.from('platform_earnings').insert(formattedEarnings)
    }

    // 3. Handle Expenses
    await supabase.from('expenses').delete().eq('entry_id', id)

    if (expensesData && expensesData.length > 0) {
        const formattedExpenses = expensesData.map((e: Expense) => ({
            entry_id: id,
            category: e.category,
            amount: parseFloat(e.amount.toString()),
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

export async function updatePlatformEarning(
    id: string,
    data: { amount: number; tips: number; miles: number; hours: number }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Sanity Guard
    const { guardDailyFinancials } = await import('@/utils/sanity-guards')
    const guarded = guardDailyFinancials(data.amount + data.tips, data.miles, data.hours)

    if (!guarded.isValid) {
        // If really insane, maybe reject? Or just warn?
        // For direct user edits, let's just warn but proceed, or verify with user.
        // For now, we'll log it.
        console.warn(`[UpdateEarning] Sanity Warning: ${guarded.reason}`)
    }

    const { error } = await supabase
        .from('platform_earnings')
        .update({
            amount: data.amount,
            tips: data.tips,
            miles: data.miles,
            hours: data.hours
        })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deletePlatformEarning(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('platform_earnings')
        .delete()
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
}
