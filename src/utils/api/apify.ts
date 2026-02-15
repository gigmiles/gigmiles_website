'use server'

import { ApifyClient } from 'apify-client';

// --- Types ---
interface VehicleValueResponse {
    marketAverage: number
    currency: string
    source: string
}

// Reuse the same cache structure as other APIs
const VEHICLE_VALUE_CACHE = new Map<string, { value: number, timestamp: number }>()
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 Hours (Values don't change hourly)

export async function getVehicleMarketValue(year: string, make: string, model: string, mileage: number): Promise<VehicleValueResponse | null> {
    const cacheKey = `${year}-${make}-${model}-${mileage}`.toLowerCase()

    // 1. Check Cache
    const cached = VEHICLE_VALUE_CACHE.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        console.log(`[Apify] Serving cached vehicle value for ${cacheKey}`)
        return {
            marketAverage: cached.value,
            currency: 'USD',
            source: 'Cache'
        }
    }

    // 2. Initialize Apify
    const apiToken = process.env.APIFY_API_TOKEN

    // DEMO MODE: If no token, return a realistic mock value so the UI can be tested.
    if (!apiToken) {
        console.warn('APIFY_API_TOKEN is missing. Using DEMO/MOCK value.')
        const baseValue = 28500
        const age = new Date().getFullYear() - parseInt(year)
        // Simple depreciation logic for demo
        const estimatedValue = baseValue * Math.pow(0.85, age) - (mileage * 0.05)

        await new Promise(resolve => setTimeout(resolve, 800)) // Fake network delay

        return {
            marketAverage: Math.max(2000, Math.round(estimatedValue)),
            currency: 'USD',
            source: 'Demo Mode (Add API Token for Real Data)'
        }
    }

    const client = new ApifyClient({
        token: apiToken,
    });

    try {
        console.log(`[Apify] Fetching vehicle value for: ${year} ${make} ${model} (${mileage} miles)`)

        // Using a generic scraper or a specific actor
        // For this example, we'll interface with a hypothetical "cars-com-scraper" or similar.
        // In a real scenario, you'd find the specific Actor ID (e.g., 'epctex/cars-com-scraper').

        // This is a PLACEHOLDER implementation for the actual actor call
        // We need to define the input correctly based on the chosen actor.

        // Example logic for "epctex/cars-com-scraper":
        /*
        const run = await client.actor('epctex/cars-com-scraper').call({
            searchArgs: {
                year_min: parseInt(year),
                year_max: parseInt(year),
                makes: [make],
                models: [model],
                maximum_distance: 100 // Local market
            },
            maxItems: 5
        });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        // Calculate average price from items
        */

        // PROVISIONAL: Returning a mock value based on "algorithm" until Actor is finalized/paid
        const baseValue = 25000
        const age = new Date().getFullYear() - parseInt(year)
        const depreciation = (age * 1500) + (mileage * 0.08)
        const estimatedValue = Math.max(2000, baseValue - depreciation)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // 3. Update Cache
        VEHICLE_VALUE_CACHE.set(cacheKey, {
            value: estimatedValue,
            timestamp: Date.now()
        })

        return {
            marketAverage: estimatedValue,
            currency: 'USD',
            source: 'Estimated (Apify Placeholder)'
        }

    } catch (error) {
        console.error('[Apify] Fetch Error:', error)
        return null
    }
}
