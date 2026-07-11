import { type NextRequest, type NextFetchEvent, NextResponse } from 'next/server'
import { CAMPAIGN_LINKS, campaignDestination, campaignKeyFromPath } from '@/lib/campaign-links'

// Next.js 16 renamed the `middleware` file convention to `proxy`. Same runtime
// (edge, runs before routing); the export is now `proxy` instead of `middleware`.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fire-and-forget server-side hit log for a campaign short-link. Unlike the
// client SiteBeacon, this runs before any ad-blocker can intervene, so it is an
// AUTHORITATIVE landing count. event='redirect_hit' distinguishes it from the
// client 'pageview' — compare the two to measure ad-block / bounce loss.
function logRedirectHit(request: NextRequest, key: string): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return Promise.resolve()
  const link = CAMPAIGN_LINKS[key]
  const h = request.headers
  const hCity = h.get('x-vercel-ip-city')
  const row = {
    event: 'redirect_hit',
    page: `/${key}`,
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: 'driver_education',
    utm_content: link.utm_content,
    country: h.get('x-vercel-ip-country'),
    region: h.get('x-vercel-ip-country-region'),
    city: hCity ? decodeURIComponent(hCity) : null,
  }
  return fetch(`${SUPABASE_URL}/rest/v1/campaign_events`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  }).catch(() => {
    /* best-effort — a failed log must never block the redirect */
  })
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const key = campaignKeyFromPath(request.nextUrl.pathname)
  if (key) {
    // Log server-side (doesn't delay the user), then 307 to the UTM'd homepage.
    event.waitUntil(logRedirectHit(request, key))
    const dest = new URL(campaignDestination(CAMPAIGN_LINKS[key]), request.url)
    // Preserve inbound query params through the 307 (e.g. Reddit's rdt_cid
    // click id, without which the Reddit Pixel can't match sessions to ads).
    // Our own campaign utm_* values are already on dest and always win.
    request.nextUrl.searchParams.forEach((value, k) => {
      if (!dest.searchParams.has(k)) dest.searchParams.append(k, value)
    })
    return NextResponse.redirect(dest, 307)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
