'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSupportTickets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // For now, allow access if the user is authenticated. 
    // In a real app, you'd check for an 'is_admin' flag or similar.
    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            profiles:user_id ( full_name, email )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching support tickets:', error)
        return null
    }

    return data
}

export async function updateTicketStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Error updating ticket status:', error)
        return { success: false }
    }

    revalidatePath('/dashboard/admin/messages')
    return { success: true }
}
