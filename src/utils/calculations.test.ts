import { describe, it, expect } from 'vitest'
import { calculateFinancials, getDepreciationRate, IRS_STANDARD_MILEAGE_RATE_2025 } from './calculations'

describe('calculateFinancials', () => {
    it('correctly calculates basic financials for an owned gasoline vehicle in a taxed state (AL)', () => {
        const input = {
            grossEarnings: 1000,
            expenses: 100,
            miles: 100,
            stateCode: 'AL',
            mpg: 20,
            gasPrice: 4.00,
            wearRate: 0.35,
            ownershipType: 'owned',
            monthlyInsurance: 300,
            monthlyLease: 0,
            paymentCycle: 'monthly',
            fuelType: 'gasoline' as const
        }

        const result = calculateFinancials(input)

        // Fuel: (100 / 20) * 4 = 20
        expect(result.fuelCost).toBe(20)

        // Wear: 100 * 0.35 = 35
        expect(result.wearCost).toBe(35)

        // Insurance (300 / 30) = 10
        expect(result.dailyFixedCosts).toBe(10)

        // Deductions: 100 (expenses) + (100 * 0.70 [IRS rate]) = 170
        expect(result.mileageDeduction).toBe(70)

        // Taxable Income: 1000 - 170 = 830
        // Fed Tax (15.3%): 830 * 0.153 = 126.99
        // State Tax (AL 4%): 830 * 0.04 = 33.2
        expect(result.estimatedFederalTax).toBeCloseTo(126.99)
        expect(result.estimatedStateTax).toBeCloseTo(33.2)
    })

    it('handles zero values gracefully', () => {
        const result = calculateFinancials({
            grossEarnings: 0,
            expenses: 0,
            miles: 0,
            stateCode: 'TX'
        })
        expect(result.netProfit).toBe(0)
        expect(result.totalRealCosts).toBe(0)
    })

    it('correctly calculates for electric vehicles', () => {
        const result = calculateFinancials({
            grossEarnings: 500,
            expenses: 50,
            miles: 100,
            stateCode: 'TX', // 0% state tax
            mpg: 3.5, // Efficiency (mi/kWh)
            fuelType: 'electric',
            electricityPrice: 0.15
        })

        // (100 / 3.5) * 0.15 = 4.285...
        expect(result.fuelCost).toBeCloseTo(4.29, 1)
        expect(result.estimatedStateTax).toBe(0)
    })
})

describe('getDepreciationRate', () => {
    it('assigns higher rates to luxury brands', () => {
        const teslaRate = getDepreciationRate('Tesla', 'Model 3', 2025)
        const toyotaRate = getDepreciationRate('Toyota', 'Camry', 2025)
        expect(teslaRate).toBeGreaterThan(toyotaRate)
    })

    it('factors in high resale models', () => {
        const tacomaRate = getDepreciationRate('Toyota', 'Tacoma', 2020)
        const averageRate = getDepreciationRate('Generic', 'Car', 2020)
        // Both are same age, but Tacoma has high resale discount
        expect(tacomaRate).toBeLessThan(averageRate)
    })

    it('handles older vehicles correctly', () => {
        const oldCarRate = getDepreciationRate('Honda', 'Civic', 2005)
        const midCarRate = getDepreciationRate('Honda', 'Civic', 2018)
        // Depreciation curve flattens for very old cars
        expect(oldCarRate).toBeLessThan(midCarRate)
    })
})
