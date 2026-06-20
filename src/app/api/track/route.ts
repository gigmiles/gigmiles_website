import { NextRequest } from 'next/server'

// Lightweight, dependency-free pageview/click beacon for the guerrilla
// campaign. The bridge page POSTs (via navigator.sendBeacon) a small JSON
// blob; we emit one structured log line per event. On Vercel these are
// queryable in the project's Logs / Observability — enough to see scan
// volume and bounce (pageview without a store click) per city.
//
// This is intentionally minimal: the AUTHORITATIVE attribution lives in
// (a) App Store Connect / Play Console campaign tokens appended to the store
// links, and (b) promo_codes.redemption_count in Supabase. Swap this for
// Vercel Web Analytics later if richer dashboards are wanted.
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const body = text ? JSON.parse(text) : {}
    // eslint-disable-next-line no-console
    console.log('[gm-track]', JSON.stringify(body))
  } catch {
    // never let a malformed beacon 500 — analytics is best-effort
  }
  return new Response(null, { status: 204 })
}
