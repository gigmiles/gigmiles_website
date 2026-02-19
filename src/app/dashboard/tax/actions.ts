import { createClient } from '@/utils/supabase/server'
import { calculateFinancials } from '@/utils/calculations'
import { format } from 'date-fns'
import { PlatformEarning, Expense } from '@/app/dashboard/types'

// IRS Quarter Definitions
const QUARTERS = [
    { id: 1, name: 'Q1 (Jan-Mar)', start: '01-01', end: '03-31', due: 'Apr 15' },
    { id: 2, name: 'Q2 (Apr-May)', start: '04-01', end: '05-31', due: 'Jun 15' },
    { id: 3, name: 'Q3 (Jun-Aug)', start: '06-01', end: '08-31', due: 'Sep 15' },
    { id: 4, name: 'Q4 (Sep-Dec)', start: '09-01', end: '12-31', due: 'Jan 15' },
]

export async function getTaxOverview() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const currentYear = new Date().getFullYear()

    // 1. Get User Profile for State Code (Tax Rate)
    const { data: profile } = await supabase
        .from('profiles')
        .select('state_code')
        .eq('id', user.id)
        .single()

    const stateCode = profile?.state_code || 'DEFAULT'

    // 2. Fetch All Entries for Current Year
    const { data: entries } = await supabase
        .from('daily_entries')
        .select(`
      date,
      platform_earnings ( amount, tips, miles ),
      expenses ( amount )
    `)
        .eq('user_id', user.id)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)

    // 3. Fetch Tax Payments
    const { data: payments } = await supabase
        .from('tax_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', currentYear)

    // 4. Aggregate per Quarter
    const quarterStats = QUARTERS.map(q => {
        // Filter entries for this quarter
        const qEntries = entries?.filter((e) => {
            const d = e.date as string // YYYY-MM-DD
            const md = d.substring(5) // MM-DD
            return md >= q.start && md <= q.end
        }) || []

        let gross = 0
        let expenses = 0
        let miles = 0

        qEntries.forEach((e) => {
            (e.platform_earnings as unknown as PlatformEarning[]).forEach((p) => {
                gross += (p.amount || 0) + (p.tips || 0)
                miles += (p.miles || 0)
            })
                ; (e.expenses as unknown as Expense[]).forEach((ex) => {
                    expenses += (ex.amount || 0)
                })
        })

        const financials = calculateFinancials({
            grossEarnings: gross,
            expenses,
            miles,
            stateCode
        })

        const paidAmount = payments
            ?.filter((p) => p.quarter === q.id)
            .reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0

        return {
            id: q.id,
            name: q.name,
            due: q.due,
            estimatedTax: financials.estimatedTax,
            paid: paidAmount,
            remaining: Math.max(0, financials.estimatedTax - paidAmount),
            isCurrent: isDateInQuarter(new Date(), q.start, q.end)
        }
    })

    return quarterStats
}

function isDateInQuarter(date: Date, startMMDD: string, endMMDD: string) {
    const md = format(date, 'MM-dd')
    return md >= startMMDD && md <= endMMDD
}

export async function addTaxPayment(quarter: number, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const currentYear = new Date().getFullYear()

    const { error } = await supabase
        .from('tax_payments')
        .insert({
            user_id: user.id,
            quarter,
            year: currentYear,
            amount_paid: amount,
            payment_date: new Date().toISOString()
        })

    if (error) throw error
    return { success: true }
}
