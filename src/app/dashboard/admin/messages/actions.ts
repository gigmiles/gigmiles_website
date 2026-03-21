'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSupportTickets(callerEmail: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL || user.email !== callerEmail) return null

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

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) return { success: false }

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
