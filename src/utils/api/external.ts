'use server'

import { cookies } from 'next/headers'

// --- Types ---
interface FuelEconomyResponse {
    menuItem: Array<{
        text: string
        value: string
    }>
}

interface GasPriceResponse {
    result: {
        state: Array<{
            currency: string
            name: string
            gasoline: string
            midGrade: string
            premium: string
            diesel: string
        }>
    }
}

// --- FuelEconomy.gov API ---
// No API Key required.
export async function getEstimatedMPG(year: string, make: string, model: string): Promise<number | null> {
    try {
        const response = await fetch(
            `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        )

        if (!response.ok) return null

        const data = await response.json()

        // This endpoint returns vehicle options (engines/transmissions). 
        // We need to get the specific vehicle ID to get the MPG, 
        // OR simpler: just try to get the 'comb08' (combined MPG) if available directly or via another call.
        // The user prompt example was: `data.menuItem[0].value.comb08`
        // However, the menu endpoint usually returns ID. 
        // Let's assume we pick the first option to get the vehicle ID, then fetch MPG.

        // Detailed flow typically: 
        // 1. Year/Make/Model -> Options (returns IDs)
        // 2. ID -> MPG

        if (!data.menuItem || data.menuItem.length === 0) return null

        const vehicleId = data.menuItem[0].value // taking the first engine option

        const mpgResponse = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`, {
            headers: { 'Accept': 'application/json' }
        })

        if (!mpgResponse.ok) return null

        const mpgData = await mpgResponse.json()
        return parseFloat(mpgData.comb08)

    } catch (error) {
        console.error('Error fetching MPG:', error)
        return null
    }
}


// --- CollectAPI (Gas Prices) ---
// Requires API Key.
// Implements simple caching via Global Map (in-memory) for persistence across requests in same lambda instance.
// Note: In serverless, this cache resets on cold starts. For better persistence, use Vercel KV.
// But user accepted Map for now.

const GAS_PRICE_CACHE = new Map<string, { price: number, timestamp: number }>()
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000 // 6 Hours

export async function getGasPrice(stateCode: string): Promise<number> {
    // 1. Check Cache
    const cacheKey = stateCode.toUpperCase().trim()
    console.log(`[GasPrice] Checking cache for key: ${cacheKey}`)
    const cached = GAS_PRICE_CACHE.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        console.log(`[GasPrice] Serving from Cache for ${stateCode}: ${cached.price}`)
        return cached.price
    }

    // 2. Fetch from API
    const apiKey = process.env.COLLECTAPI_KEY
    if (!apiKey) {
        console.warn('COLLECTAPI_KEY is missing. Using fallback.')
        return 3.50 // Fallback
    }

    console.log(`[GasPrice] Cache miss for ${cacheKey}. Fetching from API...`)

    try {
        const response = await fetch(
            `https://api.collectapi.com/gasPrice/stateUsaPrice?state=${stateCode}`,
            {
                headers: {
                    'authorization': `apikey ${apiKey}`,
                    'content-type': 'application/json'
                }
            }
        )

        if (!response.ok) {
            console.error('[GasPrice] API Error:', response.statusText)
            // Fallback if cache exists (even if stale)
            if (cached) return cached.price
            return 3.50
        }

        const data: any = await response.json()

        // CollectAPI structure for stateUsaPrice: 
        // { success: true, result: { state: [{ name: 'Washington', gasoline: '4.132', ... }] } }

        const priceStr = data.result?.state?.[0]?.gasoline
        const price = parseFloat(priceStr)

        if (isNaN(price)) return 3.50

        // 3. Update Cache
        GAS_PRICE_CACHE.set(cacheKey, {
            price,
            timestamp: Date.now()
        })

        return price

    } catch (error) {
        console.error('[GasPrice] Fetch Error:', error)
        return 3.50
    }
}
