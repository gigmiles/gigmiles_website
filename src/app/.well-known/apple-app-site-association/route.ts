import { NextResponse } from 'next/server'

// Apple Universal Links association file. Served with an explicit
// application/json content-type — Vercel serves the static public/ copy as
// application/octet-stream, which some Apple AASA validators reject. A route
// handler + NextResponse.json() guarantees the right content-type. The path
// (https://gigmiles.app/.well-known/apple-app-site-association) MUST stay
// redirect-free (apex is the canonical Vercel domain; www → apex).
//
// force-static so it prerenders to a static asset (also valid under
// output: 'export'). Keep in sync with the appID in the iOS entitlements
// (Runner.entitlements → applinks:gigmiles.app) + the Android assetlinks.json.
export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'VBT2X7QG46.com.gigmilesinc.app',
          paths: ['/auth/callback', '/auth/*'],
        },
      ],
    },
    webcredentials: {
      apps: ['VBT2X7QG46.com.gigmilesinc.app'],
    },
  })
}
