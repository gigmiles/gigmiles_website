'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
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

    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('mpg')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    const stateCode = profile?.state_code || 'DEFAULT'
    const mpg = vehicle?.mpg || 25

    const today = new Date()
    // 1. Get Today's Entry
    const { data: todayEntry } = await supabase
        .from('daily_entries')
        .select(`
      id,
      platform_earnings ( amount, tips, miles, hours ),
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

    // 2. Fetch Dynamic Gas Price
    const currentGasPrice = await getGasPrice(stateCode)

    const financials = calculateFinancials({
        grossEarnings: todayGross,
        expenses: todayExpenses,
        miles: todayMiles,
        stateCode,
        mpg,
        gasPrice: currentGasPrice
    })

    // Debugging Fuel Calculation
    console.log(`[DashboardStats] Date: ${format(today, 'yyyy-MM-dd')}, Gross: ${todayGross}, Miles: ${todayMiles}, MPG: ${mpg}, FuelCost: ${financials.fuelCost}`)

    return {
        today: {
            gross: todayGross,
            netProfit: financials.netProfit,
            expenses: todayExpenses,
            miles: todayMiles,
            hours: todayHours,
            fuelCost: financials.fuelCost,
            wearCost: financials.wearCost,
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
        }
    }
}

export async function createDailyEntry(entryData: any, earningsData: any[], expensesData?: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Create Daily Entry
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

    // 1.5 Get Vehicle Depreciation Rate
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('depreciation_rate')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    const depreciationRate = vehicle?.depreciation_rate || 0

    // 2. Create Platform Earnings
    let totalMiles = 0
    if (earningsData && earningsData.length > 0) {
        const formattedEarnings = earningsData.map((p: any) => {
            const miles = p.miles ? parseFloat(p.miles) : 0
            totalMiles += miles
            return {
                entry_id: entry.id,
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

    // 2.5 Auto-Calculate Depreciation Expense
    const depreciationAmount = totalMiles * depreciationRate
    let finalExpenses = expensesData ? [...expensesData] : []

    if (depreciationAmount > 0) {
        // Check if Depreciation expense already manually added? (Assuming not for now, or just append)
        finalExpenses.push({
            category: 'Depreciation',
            amount: depreciationAmount,
            description: `Automated: ${totalMiles} mi @ $${depreciationRate}/mi`
        })
    }

    // 3. Create Expenses
    if (finalExpenses.length > 0) {
        const formattedExpenses = finalExpenses.map((e: any) => ({
            entry_id: entry.id,
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

    return { success: true, entryId: entry.id }
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

    // 1.5 Get Vehicle Rate
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('depreciation_rate')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

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

    // Filter out old automated depreciation to avoid duplicates
    let finalExpenses = expensesData ? expensesData.filter((e: any) => !e.description?.startsWith('Automated:')) : []

    const depreciationAmount = totalMiles * depreciationRate
    if (depreciationAmount > 0) {
        finalExpenses.push({
            category: 'Depreciation',
            amount: depreciationAmount,
            description: `Automated: ${totalMiles} mi @ $${depreciationRate}/mi`
        })
    }

    if (finalExpenses.length > 0) {
        const formattedExpenses = finalExpenses.map((e: any) => ({
            entry_id: id,
            category: e.category,
            amount: parseFloat(e.amount),
            description: e.description
        }))
        await supabase.from('expenses').insert(formattedExpenses)
    }

    return { success: true }
}
