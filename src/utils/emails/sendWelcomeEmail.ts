import { resend } from '@/utils/api/resend'
import WelcomeEmail from '@/emails/WelcomeEmail'
import { createClient } from '@/utils/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigmiles.app'
const EMAIL_FROM = process.env.EMAIL_FROM || 'Gigmiles <onboarding@resend.dev>'

export async function sendWelcomeEmail(userId: string): Promise<void> {
    try {
        const supabase = await createClient()

        // Fetch profile — member_number and welcome_email_sent
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, member_number, welcome_email_sent')
            .eq('id', userId)
            .single()

        // Skip if already sent
        if (profile?.welcome_email_sent) return

        // Fetch auth email
        const { data: { user } } = await supabase.auth.admin.getUserById(userId)
        const email = user?.email
        if (!email) return

        const memberNumber: number | null = profile?.member_number ?? null
        const isFoundingMember = memberNumber !== null && memberNumber <= 500
        const firstName = profile?.full_name?.split(' ')[0] || email.split('@')[0]

        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [email],
            subject: isFoundingMember
                ? `You're Founding Member #${memberNumber?.toString().padStart(4, '0')} 🎉`
                : `Welcome to Gigmiles, ${firstName}!`,
            react: WelcomeEmail({ firstName, memberNumber, isFoundingMember, appUrl: APP_URL }),
        })

        if (error) {
            console.error('[sendWelcomeEmail] Resend error:', error)
            return
        }

        // Mark as sent
        await supabase
            .from('profiles')
            .update({ welcome_email_sent: true })
            .eq('id', userId)

    } catch (err) {
        // Non-fatal — don't block auth flow
        console.error('[sendWelcomeEmail] Error:', err)
    }
}
