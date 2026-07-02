import { NextRequest } from 'next/server'

// Durable campaign beacon for the /getgigmiles guerrilla bridge page.
// The page POSTs (via navigator.sendBeacon) a small JSON blob per event
// (pageview, store_click). We insert it into Supabase `campaign_events` so the
// full scan → store-click → redeem funnel survives the whole campaign window
// (Vercel logs have short retention). Best-effort: never let a bad beacon 500.
//
// Authoritative conversions still live in promo_codes.redemption_count /
// promo_redemptions; install-by-city also shows in App Store Connect (ct=) and
// Play Console (referrer=). This table is the WEB funnel (scans + bounce).
export const runtime = 'edge'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function s(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return null
  const str = String(v).slice(0, max)
  return str.length ? str : null
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const b = text ? JSON.parse(text) : {}
    const event = s(b.event, 32)

    if (
      SUPABASE_URL &&
      SUPABASE_ANON &&
      (event === 'pageview' || event === 'store_click')
    ) {
      const row = {
        event,
        src: s(b.src, 64),
        platform: s(b.platform, 16),
        store: s(b.store, 16),
        country: s(b.country, 8),
        region: s(b.region, 16),
        city: s(b.city, 80),
        tag: s(b.tag, 40),
      }
      await fetch(`${SUPABASE_URL}/rest/v1/campaign_events`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
      })
    }
  } catch {
    // best-effort — analytics must never break the page
  }
  return new Response(null, { status: 204 })
}
