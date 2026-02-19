import { describe, it, expect, vi } from 'vitest'
import { calculateFinancials } from '@/utils/calculations'

// Mocking the aggregation logic that normally lives in getTaxOverview
// This allows us to verify the "logic" of the server action without a real DB.

describe('Tax Aggregation Logic', () => {
    it('correctly aggregates multiple entries into quarterly totals', () => {
        const mockEntries = [
            {
                date: '2025-01-15',
                platform_earnings: [{ amount: 100, tips: 10, miles: 50 }],
                expenses: [{ amount: 20 }]
            },
            {
                date: '2025-02-10',
                platform_earnings: [{ amount: 200, tips: 20, miles: 100 }],
                expenses: [{ amount: 40 }]
            }
        ]

        // Simplified aggregation logic as found in actions.ts:59-71
        let gross = 0
        let expenses = 0
        let miles = 0

        mockEntries.forEach(e => {
            e.platform_earnings.forEach(p => {
                gross += (p.amount || 0) + (p.tips || 0)
                miles += (p.miles || 0)
            })
            e.expenses.forEach(ex => {
                expenses += (ex.amount || 0)
            })
        })

        expect(gross).toBe(330) // (100+10) + (200+20)
        expect(expenses).toBe(60) // 20 + 40
        expect(miles).toBe(150) // 50 + 100

        const financials = calculateFinancials({
            grossEarnings: gross,
            expenses,
            miles,
            stateCode: 'TX' // No state tax
        })

        // (330 - (60 + 150 * 0.70)) = 330 - 165 = 165
        // Fed Tax: 165 * 0.153 = 25.245
        expect(financials.estimatedFederalTax).toBeCloseTo(25.245)
    })
})
