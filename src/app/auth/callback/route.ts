import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/utils/emails/sendWelcomeEmail'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    let searchParams, origin, code, next;
    try {
        const url = new URL(request.url)
        searchParams = url.searchParams
        origin = url.origin
        code = searchParams.get('code')
        // Validate redirect to prevent open redirect attacks
        const rawNext = searchParams.get('next') ?? '/'
        const allowedPaths = ['/dashboard', '/onboarding', '/welcome', '/']
        next = allowedPaths.includes(rawNext) ? rawNext : '/dashboard'
    } catch {
        // Fallback for mock static URL reads
        return NextResponse.json({ success: true })
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const userId = sessionData.user?.id
            const referredByCode = sessionData.user?.user_metadata?.referred_by_code as string | undefined

            // Persist referral code from signup metadata → profile row
            if (userId && referredByCode) {
                supabase
                    .from('profiles')
                    .update({ referred_by_code: referredByCode })
                    .eq('id', userId)
                    .eq('referred_by_code', null as unknown as string) // only if not already set
                    .then(() => {})
            }

            // Fire welcome email (non-blocking, only sends once per user)
            if (userId) {
                sendWelcomeEmail(userId).catch(() => {})
            }
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
            // Ensure no double slashes and redirect to welcome by default
            const redirectUrl = new URL(next === '/' ? '/welcome' : next, baseUrl)
            return NextResponse.redirect(redirectUrl.toString())
        }
    }

    // return the user to login page with an error parameter
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
    const errorUrl = new URL('/login?error=auth-callback-error', baseUrl)
    return NextResponse.redirect(errorUrl.toString())
}
