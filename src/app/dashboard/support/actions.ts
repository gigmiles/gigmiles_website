'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitSupportTicket(subject: string, message: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Insert into database
    const { error } = await supabase
        .from('support_tickets')
        .insert({
            user_id: user.id,
            subject,
            message,
            status: 'open'
        })

    if (error) {
        console.error('Error submitting support ticket:', error)
        return { success: false, error: 'Database error' }
    }

    return { success: true }
}
