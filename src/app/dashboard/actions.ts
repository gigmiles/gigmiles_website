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

    // 2. Create Platform Earnings
    if (earningsData && earningsData.length > 0) {
        const formattedEarnings = earningsData.map((p: any) => ({
            entry_id: entry.id,
            platform_name: p.platform_name,
            amount: parseFloat(p.amount),
            tips: p.tips ? parseFloat(p.tips) : 0,
            miles: p.miles ? parseFloat(p.miles) : 0,
            hours: p.hours ? parseFloat(p.hours) : 0,
        }))

        const { error: earningsError } = await supabase
            .from('platform_earnings')
            .insert(formattedEarnings)

        if (earningsError) {
            console.error('Error adding earnings:', earningsError)
            // Cleanup?
        }
    }

    // 3. Create Expenses
    if (expensesData && expensesData.length > 0) {
        const formattedExpenses = expensesData.map((e: any) => ({
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
