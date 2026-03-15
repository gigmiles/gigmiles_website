import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logToFile } from '../debug'

export async function createClient() {
    let cookieStore;
    try {
        cookieStore = await cookies()
    } catch (e) {
        // Fallback for Next.js static export build time
        cookieStore = {
            getAll: () => [],
            set: () => {}
        } as any;
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        logToFile(`[ServerClient] Setting ${cookiesToSet.length} cookies: ${cookiesToSet.map(c => c.name).join(', ')}`)
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        logToFile(`[ServerClient] Failed to set cookies (expected in SC, unexpected in Action)`)
                    }
                },
            },
        }
    )
}
