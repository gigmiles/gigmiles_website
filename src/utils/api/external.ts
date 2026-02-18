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

export async function getEstimatedMPG(year: string, make: string, model: string): Promise<number | null> {
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
        return parseFloat(mpgData.comb08)

    } catch (error: any) {
        recordFail('fueleconomy.gov')
        return null
    } finally {
        clearTimeout(timeoutId)
    }
}


// --- CollectAPI (Gas Prices) ---
// Requires API Key.
// Implements simple caching via Global Map (in-memory) for persistence across requests in same lambda instance.

const GAS_PRICE_CACHE = new Map<string, { price: number, timestamp: number }>()
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000 // 6 Hours

export async function getGasPrice(stateCode: string): Promise<number> {
    const cacheKey = stateCode.toUpperCase().trim()
    const cached = GAS_PRICE_CACHE.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        return cached.price
    }

    if (isApiDown('collectapi.com')) {
        console.warn(`[GasPrice] Circuit breaker for collectapi.com. Using fallback for ${stateCode}.`)
        if (cached) return cached.price
        return 3.50
    }

    const apiKey = process.env.COLLECTAPI_KEY
    if (!apiKey) return cached?.price || 3.50

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // Fast timeout for dashboard

    try {
        const response = await fetch(
            `https://api.collectapi.com/gasPrice/stateUsaPrice?state=${stateCode}`,
            {
                headers: {
                    'authorization': `apikey ${apiKey}`,
                    'content-type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
                },
                signal: controller.signal
            }
        )

        if (!response.ok) {
            recordFail('collectapi.com')
            if (cached) return cached.price
            return 3.50
        }

        const data: any = await response.json()
        const priceStr = data.result?.state?.[0]?.gasoline
        const price = parseFloat(priceStr)

        if (isNaN(price)) {
            recordSuccess('collectapi.com')
            return cached?.price || 3.50
        }

        recordSuccess('collectapi.com')
        GAS_PRICE_CACHE.set(cacheKey, { price, timestamp: Date.now() })
        return price

    } catch (error: any) {
        recordFail('collectapi.com')
        if (cached) return cached.price
        return 3.50
    } finally {
        clearTimeout(timeoutId)
    }
}
