import { createClient } from '@/utils/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { calculateFinancials } from '@/utils/calculations'

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

    const stateCode = profile?.state_code || 'DEFAULT'

    const today = new Date()
    // const start = startOfDay(today).toISOString() // Unused for now if we use string format

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

    if (todayEntry) {
        todayEntry.platform_earnings.forEach((p: any) => {
            todayGross += (p.amount || 0) + (p.tips || 0)
            todayMiles += (p.miles || 0)
            todayHours += (p.hours || 0)
        })

        todayEntry.expenses.forEach((e: any) => {
            todayExpenses += (e.amount || 0)
        })
    }

    const financials = calculateFinancials({
        grossEarnings: todayGross,
        expenses: todayExpenses,
        miles: todayMiles,
        stateCode
    })

    return {
        today: {
            gross: todayGross,
            netProfit: financials.netProfit,
            expenses: todayExpenses,
            miles: todayMiles,
            hours: todayHours,
            hasEntry: !!todayEntry,
            estimatedTax: financials.estimatedTax
        }
    }
}
