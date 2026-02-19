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
        console.warn('APIFY_API_TOKEN is missing. Using internal estimation.');
        return estimateVehicleValue(year, make, model, mileage);
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

        console.log("[Apify] Raw Items Received:", JSON.stringify(items, null, 2));

        if (!items || items.length === 0) {
            console.warn('[Apify] No items found for vehicle.');
            return null;
        }

        const data = items[0] as unknown as ApifyItem;

        // --- Validation: Ensure the data actually matches the requested vehicle ---
        const returnedYear = data.year?.toString();
        const returnedMake = data.make?.toString().toLowerCase();

        const yearMatch = !returnedYear || returnedYear === year;
        const makeMatch = !returnedMake || make.toLowerCase().includes(returnedMake) || returnedMake.includes(make.toLowerCase());

        if (!yearMatch || !makeMatch) {
            console.warn(`[Apify] Data mismatch detected. Requested: ${year} ${make}. Received: ${returnedYear} ${returnedMake}. Falling back to internal estimation.`);
            return estimateVehicleValue(year, make, model, mileage);
        }

        let estimatedValue = 0;

        // Helper to parse price strings more robustly
        const parsePriceString = (str: string): number => {
            if (!str || typeof str !== 'string') return 0;
            // Remove common currency symbols and hidden characters
            const cleaned = str.replace(/[$,\s]/g, '');
            // If it contains a range like "4000-6000"
            if (cleaned.includes('-')) {
                const parts = cleaned.split('-').map(p => parseFloat(p));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    return Math.round((parts[0] + parts[1]) / 2);
                }
            }
            const val = parseFloat(cleaned);
            return isNaN(val) ? 0 : val;
        };

        if (typeof data === 'object') {
            // Priority 1: Private Seller Range
            if (data.private_seller_valuation_range) {
                estimatedValue = parsePriceString(data.private_seller_valuation_range);
                console.log(`[Apify] Found private_seller_valuation_range: ${data.private_seller_valuation_range} -> ${estimatedValue}`);
            }
            // Priority 2: Trade-In Range
            if (!estimatedValue && data.trade_in_valuation_range) {
                estimatedValue = parsePriceString(data.trade_in_valuation_range);
                console.log(`[Apify] Found trade_in_valuation_range: ${data.trade_in_valuation_range} -> ${estimatedValue}`);
            }

            // Priority 3: Direct numerical values
            if (!estimatedValue) {
                if (typeof data.price === 'number') estimatedValue = data.price;
                else if (typeof data.value === 'number') estimatedValue = data.value;
                else if (typeof data.valuation === 'number') estimatedValue = data.valuation;
                else if (typeof data.market_average === 'number') estimatedValue = data.market_average;

                if (estimatedValue) {
                    console.log(`[Apify] Found direct numerical value: ${estimatedValue}`);
                }
            }
        }

        if (!estimatedValue || estimatedValue < 1000) {
            console.warn('[Apify] Could not extract valid value. Using internal estimation.');
            return estimateVehicleValue(year, make, model, mileage);
        }

        // --- Sanity Guard: Prevent impossible values (e.g. $5k Tesla) ---
        const { guardVehicleValue } = await import('@/utils/sanity-guards');
        const guarded = guardVehicleValue(estimatedValue, parseInt(year), make);

        if (!guarded.isValid) {
            console.warn(`[Apify] Sanity Guard triggered: ${guarded.reason}. Falling back to internal estimation.`);
            return estimateVehicleValue(year, make, model, mileage);
        }

        // 3. Update Cache
        VEHICLE_VALUE_CACHE.set(cacheKey, {
            value: estimatedValue,
            timestamp: Date.now()
        })

        console.log(`[Apify] Final estimated value for ${cacheKey}: $${estimatedValue}`);

        return {
            marketAverage: estimatedValue,
            currency: 'USD',
            source: 'Market Data (voyn/car-valuation-api)'
        }

    } catch (error) {
        console.error('[Apify] Fetch Error:', error)
        return estimateVehicleValue(year, make, model, mileage);
    }
}

/**
 * Internal estimation logic for when API fails or returns invalid data.
 * Especially useful for new vehicles where market data is sparse.
 */
function estimateVehicleValue(year: string, make: string, model: string, mileage: number): VehicleValueResponse {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - parseInt(year));

    // Base MSRP estimations for common gig platforms
    let baseMsrp = 30000;
    const lowerMake = make.toLowerCase();
    const lowerModel = model.toLowerCase();

    if (lowerMake.includes('tesla')) {
        baseMsrp = lowerModel.includes('x') || lowerModel.includes('s') ? 85000 : 45000;
        if (lowerModel.includes('y')) baseMsrp = 48000;
    } else if (lowerMake.includes('toyota') || lowerMake.includes('honda')) {
        baseMsrp = 32000;
    } else if (lowerMake.includes('bmw') || lowerMake.includes('mercedes') || lowerMake.includes('audi')) {
        baseMsrp = 55000;
    }

    // Depreciation: 15% first year, 10% thereafter, plus mileage penalty
    let estimatedValue = baseMsrp;
    for (let i = 0; i < age; i++) {
        estimatedValue *= (i === 0 ? 0.85 : 0.90);
    }

    // Mileage deduction ($0.15 per mile is a harsh but safe car-value deduction)
    estimatedValue -= (mileage * 0.12);

    const finalValue = Math.max(2000, Math.round(estimatedValue));

    return {
        marketAverage: finalValue,
        currency: 'USD',
        source: 'Internal Estimate (MSRP Based)'
    };
}
