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

// --- API Stability (Circuit Breaker) ---
const API_STATUS = new Map<string, { lastFail: number, failCount: number }>()
const BACKOFF_MS = 60000 // 1 minute cooldown after failure

function isApiDown(domain: string): boolean {
    const status = API_STATUS.get(domain)
    if (!status || status.failCount < 2) return false
    return (Date.now() - status.lastFail) < BACKOFF_MS
}

function recordFail(domain: string) {
    const status = API_STATUS.get(domain) || { lastFail: 0, failCount: 0 }
    API_STATUS.set(domain, { lastFail: Date.now(), failCount: status.failCount + 1 })
}

function recordSuccess(domain: string) {
    API_STATUS.delete(domain)
}

// --- FuelEconomy.gov API ---
// No API Key required.

export async function getVehicleModels(year: string, make: string): Promise<string[]> {
    if (isApiDown('fueleconomy.gov')) {
        console.warn('[getVehicleModels] Circuit breaker active. Skipping fetch.')
        return []
    }

    const url = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
            },
            signal: controller.signal
        })

        if (!response.ok) {
            recordFail('fueleconomy.gov')
            return []
        }

        const data = await response.json()
        recordSuccess('fueleconomy.gov')
        if (!data.menuItem) return []
        const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem]
        return items.map((item: any) => item.value)
    } catch (error: any) {
        recordFail('fueleconomy.gov')
        return []
    } finally {
        clearTimeout(timeoutId)
    }
}

export interface MPGResponse {
    value: number
    fuelType: 'gasoline' | 'electric'
}

export async function getEstimatedMPG(year: string, make: string, model: string): Promise<MPGResponse | null> {
    if (isApiDown('fueleconomy.gov')) return null

    const url = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
            },
            signal: controller.signal
        })

        if (!response.ok) {
            recordFail('fueleconomy.gov')
            return null
        }
        const data = await response.json()
        if (!data.menuItem) {
            recordSuccess('fueleconomy.gov')
            return null
        }

        const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem]
        if (items.length === 0) {
            recordSuccess('fueleconomy.gov')
            return null
        }

        const vehicleId = items[0].value
        const mpgUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`

        const mpgResponse = await fetch(mpgUrl, {
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        })

        if (!mpgResponse.ok) {
            recordFail('fueleconomy.gov')
            return null
        }
        const mpgData = await mpgResponse.json()
        recordSuccess('fueleconomy.gov')

        const isEV = mpgData.atvType === 'EV'
        let value = 0

        if (isEV) {
            // Efficiency (mi/kWh) = 100 / combE (kWh/100 miles)
            const combE = parseFloat(mpgData.combE)
            value = combE > 0 ? parseFloat((100 / combE).toFixed(2)) : 0
        } else {
            value = parseFloat(mpgData.comb08)
        }

        return {
            value,
            fuelType: isEV ? 'electric' : 'gasoline'
        }

    } catch (error: any) {
        recordFail('fueleconomy.gov')
        return null
    } finally {
        clearTimeout(timeoutId)
    }
}


// --- FuelPrices (Apify) ---
// Replacing CollectAPI with johnvc/fuelprices (ID: 0wi38CtP5zEKifljx)
// Implements simple caching via Global Map (in-memory).

const GAS_PRICE_CACHE = new Map<string, { price: number, timestamp: number }>()
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 Hours

export async function getGasPrice(stateCode: string): Promise<number> {
    const cacheKey = stateCode.toUpperCase().trim()
    const cached = GAS_PRICE_CACHE.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        console.log(`[GasPrice] Serving cached gas price for ${cacheKey}`)
        return cached.price
    }

    const apiToken = process.env.APIFY_API_TOKEN
    // Fallback if no token (DEMO/MOCK)
    if (!apiToken) {
        console.warn('APIFY_API_TOKEN is missing for gas price. Using fallback.')
        return 3.50
    }

    try {
        console.log(`[GasPrice] Fetching gas price for: ${stateCode}`)
        const { ApifyClient } = await import('apify-client')
        const client = new ApifyClient({ token: apiToken })

        // This is a "Pay Per Result" actor, very efficient.
        const run = await client.actor('0wi38CtP5zEKifljx').call({
            search: `${stateCode} USA`,
            maxItems: 10
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.warn(`[GasPrice] No data found for ${stateCode}.`)
            return cached?.price || 3.50
        }

        // Calculate Average Price from Results
        let totalPrice = 0;
        let count = 0;

        items.forEach((item: any) => {
            // Priority: price_credit, then price_cash
            const price = item.price_credit || item.price_cash || item.price;
            if (typeof price === 'number' && price > 0) {
                totalPrice += price;
                count++;
            } else if (typeof price === 'string') {
                const numeric = parseFloat(price.replace(/[^0-9.]/g, ''));
                if (!isNaN(numeric) && numeric > 0) {
                    totalPrice += numeric;
                    count++;
                }
            }
        });

        const averagePrice = count > 0 ? parseFloat((totalPrice / count).toFixed(2)) : (cached?.price || 3.50);

        // Update Cache
        GAS_PRICE_CACHE.set(cacheKey, { price: averagePrice, timestamp: Date.now() })
        return averagePrice

    } catch (error) {
        console.error('[GasPrice] Fetch Error:', error)
        return cached?.price || 3.50
    }
}
