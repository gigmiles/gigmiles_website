'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitSupportTicket(subject: string, message: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Mock sending the email/ticket for now
    console.log(`Support ticket received from ${user.email} - Subject: ${subject}`)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return { success: true }
}
