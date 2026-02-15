'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const full_name = formData.get('full_name') as string
    const state_code = formData.get('state_code') as string
    const city = formData.get('city') as string
    const zip_code = formData.get('zip_code') as string

    const { error } = await supabase
        .from('profiles')
        .update({ full_name, state_code, city, zip_code })
        .eq('id', user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/settings/profile')

    return { success: true }
}
