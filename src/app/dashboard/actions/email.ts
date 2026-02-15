'use server'

import { resend } from '@/utils/api/resend'
import WeeklySummaryEmail from '@/emails/WeeklySummary'
import { createClient } from '@/utils/supabase/server'

export async function sendWeeklyReport(emailTo?: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // If no specifically provided email, try to use user's email
        const targetEmail = emailTo || user?.email

        if (!targetEmail || !user) {
            return { success: false, error: 'No authenticated user or email address found.' }
        }

        // Fetch Real Weekly Stats
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 7) // Last 7 days

        // 1. Get Weekly Entries
        const { data: weeklyEntries } = await supabase
            .from('daily_entries')
            .select(`
                id,
                date,
                platform_earnings ( amount, tips, miles, hours ),
                expenses ( amount, category )
            `)
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0])

        // 2. Fetch Profile/Vehicle for Calculations
        const { data: profile } = await supabase.from('profiles').select('state_code').eq('id', user.id).single()
        const { data: vehicle } = await supabase.from('vehicles').select('mpg').eq('user_id', user.id).eq('is_primary', true).single()

        const stateCode = profile?.state_code || 'DEFAULT'
        const mpg = vehicle?.mpg || 25

        // 3. Dynamically fetch gas price (reuse logic if possible, or just fetch)
        // For server action speed, we might want to skip external API if not cached, but let's try to be accurate
        // We'll import the cached getter
        const { getGasPrice } = await import('@/utils/api/external')
        const currentGasPrice = await getGasPrice(stateCode)
        const { calculateFinancials } = await import('@/utils/calculations')

        let totalGross = 0
        let totalExpenses = 0 // Explicit expenses
        let totalMiles = 0

        if (weeklyEntries) {
            weeklyEntries.forEach(entry => {
                entry.platform_earnings.forEach((p: any) => {
                    totalGross += (p.amount || 0) + (p.tips || 0)
                    totalMiles += (p.miles || 0)
                })
                entry.expenses.forEach((e: any) => {
                    totalExpenses += (e.amount || 0)
                })
            })
        }

        // Calculate Financials (Net Profit including Fuel & Wear)
        const financials = calculateFinancials({
            grossEarnings: totalGross,
            expenses: totalExpenses,
            miles: totalMiles,
            stateCode,
            mpg,
            gasPrice: currentGasPrice
        })

        const realStats = {
            gross: totalGross,
            expenses: totalExpenses + financials.fuelCost + financials.wearCost, // Total Real Costs
            netProfit: financials.netProfit,
            miles: totalMiles,
            dateRange: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }

        const { data, error } = await resend.emails.send({
            from: 'GigTracker <onboarding@resend.dev>',
            to: [targetEmail],
            subject: `Weekly Report: $${financials.netProfit.toFixed(0)} Profit 🚀`,
            react: WeeklySummaryEmail(realStats),
        })

        if (error) {
            console.error('Resend Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Failed to send email.' }
    }
}
