import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDepreciationRate } from '@/utils/vehicle-data'

export async function updateVehicle(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch existing vehicle to get ID
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = parseInt(formData.get('year') as string)
    const mpg = parseFloat(formData.get('mpg') as string)

    // User provided rate takes precedence, otherwise lookup
    let depreciation_rate = parseFloat(formData.get('depreciation_rate') as string)

    // If user didn't explicitly set it (or it's 0/default), or we want to enforce model-based:
    // Logic: If the form sends a value, use it. If not (or if we want to be smart), look it up.
    // For now, let's respect the form, but if the form value is the *default* (e.g. 0.15) and we have a better match, use the match?
    // User request: "User inputs nothing extra... system knows Camry is $0.15". 
    // So if the input is empty or default, we override.

    const lookupRate = getDepreciationRate(make, model)
    if (!depreciation_rate || depreciation_rate === 0.15) {
        // If it's the generic default, try to find a specific one
        if (lookupRate !== 0.20) { // 0.20 is our fallback in utility
            depreciation_rate = lookupRate
        }
    }

    if (vehicle) {
        await supabase
            .from('vehicles')
            .update({ make, model, year, mpg, depreciation_rate })
            .eq('id', vehicle.id)
    } else {
        await supabase
            .from('vehicles')
            .insert({ user_id: user.id, make, model, year, mpg, depreciation_rate, is_primary: true })
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/settings/vehicle')
}
