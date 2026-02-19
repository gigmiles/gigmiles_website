const { calculateFinancials, getDepreciationRate } = require('./src/utils/calculations'); // eslint-disable-line @typescript-eslint/no-require-imports

function testCalculations() {
    console.log('Running tests for calculations.ts...');

    // Test 1: getDepreciationRate for a Luxury car
    const luxuryRate = getDepreciationRate('BMW', '3 Series', 2024);
    console.log(`Test 1 (BMW 2024): Expected > 0.15, Got: ${luxuryRate}`);
    if (luxuryRate > 0.15) console.log('✅ Pass'); else console.log('❌ Fail');

    // Test 2: getDepreciationRate for a High Resale car
    const toyotaRate = getDepreciationRate('Toyota', 'Camry', 2020);
    console.log(`Test 2 (Toyota 2020): Expected < 0.15, Got: ${toyotaRate}`);
    if (toyotaRate < 0.15) console.log('✅ Pass'); else console.log('❌ Fail');

    // Test 3: calculateFinancials basic check
    const financials = calculateFinancials({
        grossEarnings: 1000,
        expenses: 100,
        miles: 100,
        stateCode: 'CA',
        ownershipType: 'owned'
    });
    console.log('Test 3 (Financials):', financials);
    if (financials.netProfit !== undefined) console.log('✅ Pass'); else console.log('❌ Fail');

    console.log('Tests complete.');
}

try {
    testCalculations();
} catch (error) {
    console.error('Test execution failed:', error);
}
