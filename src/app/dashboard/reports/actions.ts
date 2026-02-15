import { createClient } from '@/utils/supabase/server'
import { startOfWeek, endOfWeek, subDays, format, startOfDay, endOfDay } from 'date-fns'

export async function getReportsData(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date())
    const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(subDays(end, 6))

    // Fetch entries for the date range
    const { data: entries } = await supabase
        .from('daily_entries')
        .select(`
      date,
      platform_earnings ( platform_name, amount, tips, miles, hours ),
      expenses ( amount, category )
    `)
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

    if (!entries) return { dailyData: [], platformData: [] }

    // Fetch user's primary vehicle for depreciation rate
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('depreciation_rate')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    const depreciationRate = vehicle?.depreciation_rate || 0.15

    // 1. Process Daily Data
    const dailyDataMap = new Map<string, {
        date: string;
        earnings: number;
        expenses: number;
        netProfit: number;
        miles: number;
        depreciationCost: number;
    }>()

    // Initialize days in range with 0
    // Generate dates between start and end
    let loopDate = new Date(start)
    while (loopDate <= end) {
        const dateStr = format(loopDate, 'yyyy-MM-dd')
        dailyDataMap.set(dateStr, {
            date: format(loopDate, 'MMM dd'),
            earnings: 0,
            expenses: 0,
            netProfit: 0,
            miles: 0,
            depreciationCost: 0
        })
        loopDate.setDate(loopDate.getDate() + 1)
    }

    // 2. Process Platform Data for Pie Chart
    const platformMap = new Map<string, number>()

    type PlatformEarning = { platform_name: string; amount: number; tips: number; miles: number }
    type Expense = { amount: number }
    type Entry = { date: string; platform_earnings: PlatformEarning[]; expenses: Expense[] }

    (entries as unknown as Entry[]).forEach((entry) => {
        const dayStat = dailyDataMap.get(entry.date)
        if (dayStat) {
            // Sum Earnings & Miles
            let dailyEarnings = 0
            let dailyMiles = 0
            entry.platform_earnings.forEach((p: any) => {
                const total = (p.amount || 0) + (p.tips || 0)
                dailyEarnings += total
                dailyMiles += (p.miles || 0)

                // Add to Platform Map
                const currentPlat = platformMap.get(p.platform_name) || 0
                platformMap.set(p.platform_name, currentPlat + total)
            })
            dayStat.earnings += dailyEarnings
            dayStat.miles += dailyMiles

            // Sum Expenses
            let dailyExpenses = 0
            entry.expenses.forEach((e: any) => {
                dailyExpenses += (e.amount || 0)
            })
            dayStat.expenses += dailyExpenses

            // Calculate Depreciation & Net Profit
            // Net Profit = Earnings - Expenses - (Miles * Rate)
            dayStat.depreciationCost = dailyMiles * depreciationRate
            dayStat.netProfit = dailyEarnings - dailyExpenses - dayStat.depreciationCost
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
