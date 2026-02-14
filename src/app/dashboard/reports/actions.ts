import { createClient } from '@/utils/supabase/server'
import { startOfWeek, endOfWeek, subDays, format, startOfDay, endOfDay } from 'date-fns'

export async function getWeeklyStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const today = new Date()
    const sevenDaysAgo = subDays(today, 6)
    const start = startOfDay(sevenDaysAgo).toISOString()

    // Fetch entries for the last 7 days
    const { data: entries } = await supabase
        .from('daily_entries')
        .select(`
      date,
      platform_earnings ( platform_name, amount, tips, miles, hours ),
      expenses ( amount, category )
    `)
        .eq('user_id', user.id)
        .gte('date', format(sevenDaysAgo, 'yyyy-MM-dd'))
        .lte('date', format(today, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

    if (!entries) return { dailyData: [], platformData: [] }

    // 1. Process Daily Data for Bar Chart
    const dailyDataMap = new Map<string, { date: string; earnings: number; expenses: number }>()

    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
        const d = subDays(today, 6 - i)
        const dateStr = format(d, 'yyyy-MM-dd')
        dailyDataMap.set(dateStr, { date: format(d, 'MMM dd'), earnings: 0, expenses: 0 })
    }

    // 2. Process Platform Data for Pie Chart
    const platformMap = new Map<string, number>()

    entries.forEach((entry: any) => {
        const dayStat = dailyDataMap.get(entry.date)
        if (dayStat) {
            // Sum Earnings
            let dailyEarnings = 0
            entry.platform_earnings.forEach((p: any) => {
                const total = (p.amount || 0) + (p.tips || 0)
                dailyEarnings += total

                // Add to Platform Map
                const currentPlat = platformMap.get(p.platform_name) || 0
                platformMap.set(p.platform_name, currentPlat + total)
            })
            dayStat.earnings += dailyEarnings

            // Sum Expenses
            let dailyExpenses = 0
            entry.expenses.forEach((e: any) => {
                dailyExpenses += (e.amount || 0)
            })
            dayStat.expenses += dailyExpenses
        }
    })

    // Convert Maps to Arrays
    const dailyData = Array.from(dailyDataMap.values())
    const platformData = Array.from(platformMap.entries()).map(([name, value]) => ({
        name,
        value
    }))

    return {
        dailyData,
        platformData
    }
}
