'use server'

import { getVehicleMarketValue } from '@/utils/api/apify'

export async function checkVehicleValue(year: number, make: string, model: string, mileage: number) {
    try {
        const value = await getVehicleMarketValue(year.toString(), make, model, mileage)
        return { success: true, data: value }
    } catch (error) {
        console.error('Error in checkVehicleValue:', error)
        return { success: false, error: 'Failed to fetch vehicle value' }
    }
}
