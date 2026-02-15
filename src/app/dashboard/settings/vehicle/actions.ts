"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDepreciationRate } from '@/utils/calculations'

export async function saveVehicleAction(formData: FormData, vehicleId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = parseInt(formData.get('year') as string)
    const mpg = parseFloat(formData.get('mpg') as string)
    const depreciation_rate = parseFloat(formData.get('depreciation_rate') as string)
    const ownership_type = formData.get('ownership_type') as string || 'owned'
    const monthly_payment = parseFloat(formData.get('monthly_payment') as string) || 0
    const monthly_insurance = parseFloat(formData.get('monthly_insurance') as string) || 0
    const payment_cycle = formData.get('payment_cycle') as string || 'monthly'
    const fuel_type = formData.get('fuel_type') as string || 'gasoline'
    const electricity_cost_per_kwh = parseFloat(formData.get('electricity_cost_per_kwh') as string) || 0.15

    if (vehicleId) {
        // Update existing
        const { error } = await supabase
            .from('vehicles')
            .update({
                make,
                model,
                year,
                mpg,
                depreciation_rate,
                ownership_type,
                monthly_payment,
                monthly_insurance,
                payment_cycle,
                fuel_type,
                electricity_cost_per_kwh
            })
            .eq('id', vehicleId)
            .eq('user_id', user.id)
        if (error) {
            console.error('Save Vehicle ERROR (Update):', error)
            throw error
        }
    } else {
        // Check if this is the first vehicle
        const { count } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // Insert new
        const { error } = await supabase
            .from('vehicles')
            .insert({
                user_id: user.id,
                make,
                model,
                year,
                mpg,
                depreciation_rate,
                ownership_type,
                monthly_payment,
                monthly_insurance,
                payment_cycle,
                fuel_type,
                electricity_cost_per_kwh,
                is_primary: count === 0 // Make primary if it's the first one
            })
        if (error) {
            console.error('Save Vehicle ERROR (Insert):', error)
            throw error
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings/vehicle')
    return { success: true }
}

export async function deleteVehicleAction(vehicleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Don't delete if it's primary unless it's the only one
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('is_primary')
        .eq('id', vehicleId)
        .single()

    if (vehicle?.is_primary) {
        const { count } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (count && count > 1) {
            return { success: false, error: 'Cannot delete primary vehicle. Switch to another vehicle first.' }
        }
    }

    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
        .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings/vehicle')
    return { success: true }
}
