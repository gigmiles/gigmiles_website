'use client'

import Script from 'next/script'
import { REDDIT_PIXEL_ID } from '@/config/app'

/**
 * RedditPixel — loads the Reddit Ads pixel base code, mounted once in the
 * root layout next to SiteBeacon. Renders nothing until REDDIT_PIXEL_ID is
 * set in src/config/app.ts, so the plumbing can ship ahead of the pixel id.
 *
 * Event strategy (mirrors our own funnel, fired from SiteBeacon so both
 * systems see the same moments):
 *   PageVisit    → initial visit from this base snippet; later route
 *                  changes from SiteBeacon
 *   ViewContent  → download-intent click (SiteBeacon download_click)
 *   Lead         → store handoff (SiteBeacon store_click)
 * No SignUp event: signup happens in-app and is not web-observable — wiring
 * it would be a false claim.
 *
 * The pixel is client-side and ad-block-lossy (~25% measured); it exists to
 * feed Reddit's optimizer, NOT as our measurement. The authoritative funnel
 * stays server-side (redirect_hit in campaign_events).
 */

// Official Reddit pixel bootstrap (queues rdt() calls until pixel.js loads).
const BOOTSTRAP = `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);`

export function RedditPixel() {
  if (!REDDIT_PIXEL_ID) return null
  return (
    <Script id="reddit-pixel" strategy="afterInteractive">
      {`${BOOTSTRAP}rdt('init','${REDDIT_PIXEL_ID}');rdt('track','PageVisit');`}
    </Script>
  )
}

// Safe fire-and-forget tracker for SiteBeacon — no-ops when the pixel is
// disabled or blocked. Never throws.
export function redditTrack(event: 'PageVisit' | 'ViewContent' | 'Lead') {
  try {
    if (!REDDIT_PIXEL_ID) return
    const w = window as unknown as { rdt?: (...args: unknown[]) => void }
    w.rdt?.('track', event)
  } catch {
    /* best-effort — analytics must never break the page */
  }
}
