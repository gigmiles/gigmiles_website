
require('dotenv').config({ path: '.env.local' });
// Mock fetch if not available (node < 18), but tsx usually handles it.
// We need to import the function, but since it's a module, let's just replicate the logic 
// or import it if we can support ESM. The previous script used 'npx tsx', so imports work.

import { getGasPrice } from './src/utils/api/external';

async function testGasPrice() {
    console.log("=== GAS PRICE API TEST ===")

    // Test 1: Known State
    console.log("Fetching gas price for CA...")
    const priceCA = await getGasPrice('CA')
    console.log(`CA Gas Price: $${priceCA}`)

    // Test 2: Another State
    console.log("Fetching gas price for TX...")
    const priceTX = await getGasPrice('TX')
    console.log(`TX Gas Price: $${priceTX}`)

    // Test 3: Invalid State (Should handle gracefully or return fallback)
    console.log("Fetching gas price for INVALID...")
    const priceInvalid = await getGasPrice('INVALID')
    console.log(`Invalid State Gas Price: $${priceInvalid}`)
}

testGasPrice();
