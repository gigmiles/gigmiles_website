import { NextRequest, NextResponse } from 'next/server'

// Edge route that returns the visitor's coarse geolocation from Vercel's
// edge headers. Used by the /getgigmiles guerrilla-campaign bridge page to
// attribute scans to a city/state (LA vs Las Vegas vs organic spread) WITHOUT
// a per-city QR code and WITHOUT prompting the user for GPS permission.
//
// Reliability note: state/region (e.g. CA vs NV) is far more reliable than
// city on mobile carrier networks — the bridge page keys attribution off
// `region` for that reason. Locally (no Vercel edge) all fields come back
// null and the page falls back to a neutral greeting.
export const runtime = 'edge'

export function GET(req: NextRequest) {
  const h = req.headers
  const rawCity = h.get('x-vercel-ip-city')

  return NextResponse.json(
    {
      country: h.get('x-vercel-ip-country'),         // e.g. "US"
      region: h.get('x-vercel-ip-country-region'),   // e.g. "CA" / "NV" / "WA"
      city: rawCity ? decodeURIComponent(rawCity) : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
