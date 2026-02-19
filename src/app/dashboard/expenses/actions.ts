'use server'

import { createClient } from '@/utils/supabase/server'
import { Expense } from '@/app/dashboard/types'

export async function getExpenseStats(dateRange: { start: string; end: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    try {
        // Get all daily entries in date range
        const { data: entries, error } = await supabase
            .from('daily_entries')
            .select('date, expenses')
            .eq('user_id', user.id)
            .gte('date', dateRange.start)
            .lte('date', dateRange.end)
            .order('date', { ascending: false })

        if (error) {
            console.error('Error fetching expenses:', error)
            return {
                expenses: [],
                byCategory: {},
                total: 0
            }
        }

        // Flatten all expenses from all entries
        const allExpenses: Expense[] = []
        entries?.forEach(entry => {
            if (entry.expenses && Array.isArray(entry.expenses)) {
                (entry.expenses as unknown as Expense[]).forEach((expense) => {
                    allExpenses.push({
                        ...expense,
                        date: entry.date
                    })
                })
            }
        })

        // Aggregate by category
        const byCategory: Record<string, { total: number; count: number; items: Expense[] }> = {}

        allExpenses.forEach(expense => {
            const category = expense.category || 'Other'
            if (!byCategory[category]) {
                byCategory[category] = { total: 0, count: 0, items: [] }
            }
            const amount = expense.amount || 0
            byCategory[category].total += amount
            byCategory[category].count += 1
            byCategory[category].items.push(expense)
        })

        const total = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0)

        return {
            expenses: allExpenses,
            byCategory,
            total
        }
    } catch (error) {
        console.error('Error in getExpenseStats:', error)
        return {
            expenses: [],
            byCategory: {},
            total: 0
        }
    }
}
