import { calculateFinancials, getDepreciationRate } from './src/utils/calculations';

function testCalculations() {
    console.log('Running tests for calculations.ts...');

    // Test 1: getDepreciationRate for a Luxury car (BMW 2025)
    // Base 0.15 + Luxury 0.08 + Age 0.05 = 0.28
    const luxuryRate = getDepreciationRate('BMW', '3 Series', 2025);
    console.log(`Test 1 (BMW 2025): Expected 0.28, Got: ${luxuryRate}`);
    if (Math.abs(luxuryRate - 0.28) < 0.01) console.log('✅ Pass'); else console.log('❌ Fail');

    // Test 2: getDepreciationRate for a High Resale car (Toyota Camry 2020)
    // Base 0.15 - Resale 0.03 - Age 0.02 (Mid-age reduction) = 0.10
    const toyotaRate = getDepreciationRate('Toyota', 'Camry', 2020);
    console.log(`Test 2 (Toyota 2020): Expected 0.10, Got: ${toyotaRate}`);
    if (Math.abs(toyotaRate - 0.10) < 0.01) console.log('✅ Pass'); else console.log('❌ Fail');

    // Test 3: calculateFinancials basic check
    const financials = calculateFinancials({
        grossEarnings: 1000,
        expenses: 100,
        miles: 100,
        stateCode: 'CA',
        ownershipType: 'owned'
    });
    console.log('Test 3 (Financials):', {
        gross: financials.grossEarnings,
        net: financials.netProfit,
        tax: financials.estimatedTax
    });
    if (financials.netProfit !== undefined) console.log('✅ Pass'); else console.log('❌ Fail');

    console.log('Tests complete.');
}

try {
    testCalculations();
} catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
}
