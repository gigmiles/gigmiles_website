import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { logToFile } from '../debug'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const allCookies = request.cookies.getAll()
                    logToFile(`[Middleware] Cookies count: ${allCookies.length} | Names: ${allCookies.map(c => c.name).join(', ')}`)
                    return allCookies
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    logToFile(`[Middleware] Path: ${request.nextUrl.pathname} | User: ${user?.id || "None"}`)

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/vibe-playground') ||
        request.nextUrl.pathname === '/'

    if (!user && !isAuthRoute) {
        logToFile(`[Middleware] Unauthenticated access to ${request.nextUrl.pathname}, redirecting to /login`)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
