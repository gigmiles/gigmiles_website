'use server'

import { ApifyClient } from 'apify-client';

// --- Types ---
interface VehicleValueResponse {
    marketAverage: number
    currency: string
    source: string
}

interface ApifyItem {
    private_seller_valuation_range?: string;
    trade_in_valuation_range?: string;
    price?: number;
    value?: number;
    valuation?: number;
    market_average?: number;
    [key: string]: unknown;
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

        // Using voyn/car-valuation-api
        const run = await client.actor('voyn/car-valuation-api').call({
            year: parseInt(year),
            make: make,
            model: model,
            mileage: mileage,
            zipCode: "90210" // Default ZIP
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log("[Apify] Raw Items:", JSON.stringify(items, null, 2));

        if (!items || items.length === 0) {
            console.warn('[Apify] No items found for vehicle.');
            return null;
        }

        const data = items[0] as unknown as ApifyItem;
        let estimatedValue = 0;

        // Helper to parse range string "4000-6000" -> 5000
        const parseRange = (rangeStr: string): number => {
            if (!rangeStr || typeof rangeStr !== 'string') return 0;
            const parts = rangeStr.split('-').map(p => parseFloat(p.trim().replace(/[^0-9.]/g, '')));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return Math.round((parts[0] + parts[1]) / 2);
            }
            if (parts.length === 1 && !isNaN(parts[0])) {
                return parts[0];
            }
            return 0;
        };

        if (typeof data === 'object') {
            // Priority 1: Private Seller Range
            if (data.private_seller_valuation_range) {
                estimatedValue = parseRange(data.private_seller_valuation_range);
            }
            // Priority 2: Trade-In Range
            if (!estimatedValue && data.trade_in_valuation_range) {
                estimatedValue = parseRange(data.trade_in_valuation_range);
            }

            // Priority 3: Direct numerical values
            if (!estimatedValue) {
                if (typeof data.price === 'number') estimatedValue = data.price;
                else if (typeof data.value === 'number') estimatedValue = data.value;
                else if (typeof data.valuation === 'number') estimatedValue = data.valuation;
                else if (typeof data.market_average === 'number') estimatedValue = data.market_average;
            }
        }

        if (!estimatedValue) {
            console.warn('[Apify] Could not extract value from item:', data);
            return null;
        }

        // 3. Update Cache
        VEHICLE_VALUE_CACHE.set(cacheKey, {
            value: estimatedValue,
            timestamp: Date.now()
        })

        return {
            marketAverage: estimatedValue,
            currency: 'USD',
            source: 'Market Data (voyn/car-valuation-api)'
        }

    } catch (error) {
        console.error('[Apify] Fetch Error:', error)
        return null
    }
}
