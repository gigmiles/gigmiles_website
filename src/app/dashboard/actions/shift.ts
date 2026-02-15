'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetches the currently active shift for the authenticated user.
 */
export async function getActiveShift() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active shift:', error)
        return null
    }

    return data
}

/**
 * Starts a new shift session.
 */
export async function startShift() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Check if there's already an active shift
    const active = await getActiveShift()
    if (active) return { success: false, message: 'Shift already active' }

    const { data, error } = await supabase
        .from('shifts')
        .insert({
            user_id: user.id,
            start_time: new Date().toISOString(),
            is_active: true
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, shift: data }
}

/**
 * Ends the specified shift session.
 */
export async function endShift(shiftId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('shifts')
        .update({
            end_time: new Date().toISOString(),
            is_active: false
        })
        .eq('id', shiftId)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, shift: data }
}
