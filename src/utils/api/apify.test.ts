import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getVehicleMarketValue } from './apify'

// Mock ApifyClient
const { mockCall, mockListItems } = vi.hoisted(() => {
    return {
        mockCall: vi.fn(),
        mockListItems: vi.fn()
    }
})

vi.mock('apify-client', () => {
    return {
        ApifyClient: vi.fn(function () {
            return {
                actor: () => ({
                    call: mockCall
                }),
                dataset: () => ({
                    listItems: mockListItems
                })
            }
        })
    }
})

describe('getVehicleMarketValue', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.APIFY_API_TOKEN = 'test-token'
        mockCall.mockResolvedValue({ defaultDatasetId: 'test-dataset' })
    })

    afterEach(() => {
        process.env = originalEnv;
    })

    it('should use API data when valid and matches request', async () => {
        mockListItems.mockResolvedValue({
            items: [{
                year: 2024,
                make: 'Toyota',
                model: 'Camry',
                price: 28000
            }]
        })

        const result = await getVehicleMarketValue('2024', 'Toyota', 'Camry', 10000)

        expect(result).not.toBeNull()
        expect(result?.source).toContain('Market Data')
        expect(result?.marketAverage).toBe(28000)
    })

    it('should fallback to internal estimation on Year mismatch', async () => {
        mockListItems.mockResolvedValue({
            items: [{
                year: 2010, // Mismatch
                make: 'Toyota',
                model: 'Camry',
                price: 5000
            }]
        })

        // Use distinct mileage to bypass cache
        const result = await getVehicleMarketValue('2024', 'Toyota', 'Camry', 10001)

        expect(result).not.toBeNull()
        expect(result?.source).toContain('Internal Estimate')
        expect(result?.marketAverage).toBeGreaterThan(20000) // Should be much higher than 5000
    })

    it('should fallback to internal estimation on Make mismatch', async () => {
        mockListItems.mockResolvedValue({
            items: [{
                year: 2024,
                make: 'Honda', // Mismatch
                model: 'Camry',
                price: 28000
            }]
        })

        // Use distinct mileage to bypass cache
        const result = await getVehicleMarketValue('2024', 'Toyota', 'Camry', 10002)

        expect(result?.source).toContain('Internal Estimate')
    })

    it('should fallback to internal estimation if sanity guard triggers (low value)', async () => {
        mockListItems.mockResolvedValue({
            items: [{
                year: 2026,
                make: 'Tesla',
                model: 'Model Y',
                price: 5000 // Unrealistic for 2026 Tesla
            }]
        })

        const result = await getVehicleMarketValue('2026', 'Tesla', 'Model Y', 5000)

        expect(result?.source).toContain('Internal Estimate')
        expect(result?.marketAverage).toBeGreaterThan(40000)
    })

    it('should fallback to internal estimation on API failure', async () => {
        mockCall.mockRejectedValue(new Error('API Error'))

        const result = await getVehicleMarketValue('2024', 'Toyota', 'Camry', 10003)

        expect(result?.source).toContain('Internal Estimate')
    })
})
