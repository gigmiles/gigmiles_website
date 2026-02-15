
import { calculateFinancials, calculateHourlyRate, calculatePerMile, calculateProfitMargin } from './src/utils/calculations';

function runTests() {
    console.log("=== CALCULATIONS VERIFICATION TEST ===")

    // Test Case 1: Standard Scenario
    const input1 = {
        grossEarnings: 1000,
        expenses: 50,
        miles: 200,
        stateCode: 'CA',
        mpg: 25,
        gasPrice: 4.00,
        wearRate: 0.30
    };

    console.log("\nTest Case 1: Standard Run (CA)");
    console.log("Input:", input1);
    const result1 = calculateFinancials(input1);
    console.log("Result:", result1);

    // Validation 1
    // Fuel Cost = (200 / 25) * 4.00 = 32
    // Wear Cost = 200 * 0.30 = 60
    // Mileage Deduction = 200 * 0.70 = 140
    // Taxable Income = 1000 - (50 + 140) = 810
    // Est. Fed Tax = 810 * 0.153 = 123.93
    // Est. State Tax (CA 6%) = 810 * 0.06 = 48.60
    // Total Tax = 172.53
    // Total Real Costs = 50 + 32 + 60 + 5 (daily insurance) = 147
    // Net Profit = 1000 - 147 - 172.53 = 680.47

    console.log("Expected Fuel Cost: 32");
    console.log("Actual Fuel Cost:", result1.fuelCost);
    console.log("Expected Net Profit: ~680.47");
    console.log("Actual Net Profit:", result1.netProfit);


    // Test Case 2: Zero Income
    const input2 = {
        grossEarnings: 0,
        expenses: 20,
        miles: 50,
        stateCode: 'TX',
        mpg: 20,
        gasPrice: 3.50
    }
    console.log("\nTest Case 2: Zero Income (TX)");
    const result2 = calculateFinancials(input2);
    console.log("Result:", result2);

    // Metrics Test
    console.log("\nMetrics Test (Based on Case 1):");
    const hourly = calculateHourlyRate(result1.netProfit, 20); // 20 hours
    console.log(`Hourly (20hrs): ${hourly} (Expected: ${(680.47 / 20).toFixed(2)})`);

    const perMile = calculatePerMile(result1.netProfit, input1.miles);
    console.log(`Per Mile: ${perMile} (Expected: ${(680.47 / 200).toFixed(2)})`);
}

runTests();
