import { calculateFinancials } from './calculations.js'

function test() {
    console.log('--- Testing Financial Calculations ---')

    const cases = [
        {
            name: 'Basic Case (No Miles, No Expenses)',
            input: { grossEarnings: 100, expenses: 0, miles: 0, stateCode: 'NY' },
            expectedTax: (100 * (0.153 + 0.05)), // SE Tax + NY Tax
            expectedNet: 100 - (100 * (0.153 + 0.05))
        },
        {
            name: 'Mileage Deduction Case',
            input: { grossEarnings: 200, expenses: 0, miles: 100, stateCode: 'CA' },
            // Deductions = 100 * 0.70 = 70
            // Taxable = 200 - 70 = 130
            // Tax = 130 * (0.153 + 0.06) = 130 * 0.213 = 27.69
            // Net = 200 - 0 - 27.69 - 70 = 102.31
            expectedTax: 27.69,
            expectedNet: 102.31
        },
        {
            name: 'No Taxable Income Case',
            input: { grossEarnings: 50, expenses: 20, miles: 50, stateCode: 'TX' },
            // Deductions = 20 + 35 = 55
            // Taxable = max(0, 50 - 55) = 0
            // Tax = 0
            // Net = 50 - 20 - 0 - 35 = -5 (Loss)
            expectedTax: 0,
            expectedNet: -5
        }
    ]

    cases.forEach(c => {
        const result = calculateFinancials(c.input)
        const taxMatch = Math.abs(result.estimatedTax - c.expectedTax) < 0.01
        const netMatch = Math.abs(result.netProfit - c.expectedNet) < 0.01

        console.log(`[${c.name}]`)
        console.log(`  Input: ${JSON.stringify(c.input)}`)
        console.log(`  Result: Tax=$${result.estimatedTax.toFixed(2)}, Net=$${result.netProfit.toFixed(2)}`)
        console.log(`  Status: ${taxMatch && netMatch ? '✅ PASSED' : '❌ FAILED'}`)
        if (!taxMatch) console.log(`    Expected Tax: $${c.expectedTax.toFixed(2)}`)
        if (!netMatch) console.log(`    Expected Net: $${c.expectedNet.toFixed(2)}`)
    })
}

test()
