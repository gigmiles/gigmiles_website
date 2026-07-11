'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { attributedStoreUrl } from '@/lib/storeAttribution'
import { redditTrack } from '@/components/analytics/RedditPixel'

/**
 * SiteBeacon — site-wide campaign analytics, mounted once in the root layout.
 *
 * A visitor lands from gigmiles.app/reddit|/tiktok|/ig (307 → / with utm_*),
 * browses, and maybe heads for the app. This component:
 *   1. Captures utm_* on first touch and keeps them in sessionStorage so
 *      attribution survives client-side navigation.
 *   2. Sends a `pageview` beacon (with page path) on every route change.
 *   3. Catches download intent site-wide: clicks on App Store / Play links
 *      (store_click) AND clicks on internal /download, /waitlist, /getgigmiles
 *      links (download_click), so the funnel is captured even though those
 *      auto-redirect to the store on mobile (not an anchor click).
 *
 * Geo (country/region/city) is stamped SERVER-SIDE in /api/track from the
 * request's Vercel edge headers — robust against client caching and any
 * client-fetch race. The client sends no geo.
 *
 * /getgigmiles keeps its own richer beacon (geo greeting, ct/referrer
 * stamping) — SiteBeacon skips that route to avoid double counting.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const STORAGE_KEY = 'gm_attribution'
const CID_KEY = 'gm_cid'

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>

function loadAttribution(): Attribution {
  try {
    const url = new URL(window.location.href)
    const fromUrl: Attribution = {}
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k)
      if (v) fromUrl[k] = v.slice(0, 64)
    }
    if (Object.keys(fromUrl).length) {
      // Last tagged touch wins: a new tagged arrival overwrites the session's
      // stored attribution (this is last-touch, not first-touch).
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl))
      return fromUrl
    }
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Attribution) : {}
  } catch {
    return {}
  }
}

// Stable per-visitor id, minted once per session. Carried on beacons and on the
// Android install referrer so a web session can eventually be joined to an
// install/signup (app-side). Best-effort — never throws.
function getCid(): string | null {
  try {
    let cid = sessionStorage.getItem(CID_KEY)
    if (!cid && typeof crypto !== 'undefined' && crypto.randomUUID) {
      cid = crypto.randomUUID()
      sessionStorage.setItem(CID_KEY, cid)
    }
    return cid
  } catch {
    return null
  }
}

function beacon(event: string, payload: Record<string, unknown>) {
  try {
    const cid = getCid()
    const body = JSON.stringify({ event, ts: Date.now(), ...(cid ? { cid } : {}), ...payload })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', body)
  } catch {
    /* best-effort — analytics must never break the page */
  }
}

function storeFromHref(href: string): 'ios' | 'android' | null {
  if (href.includes('apps.apple.com')) return 'ios'
  if (href.includes('play.google.com')) return 'android'
  return null
}

export function SiteBeacon() {
  const pathname = usePathname()
  const attributionRef = useRef<Attribution>({})

  // Pageview on every route change. /getgigmiles has its own beacon.
  useEffect(() => {
    if (!pathname || pathname.startsWith('/getgigmiles')) return
    const utm = loadAttribution()
    attributionRef.current = utm
    beacon('pageview', { page: pathname, ...utm })
    redditTrack('PageVisit')
  }, [pathname])

  // One capture-phase listener catches download intent site-wide, so no
  // per-CTA wiring is needed and future buttons are covered for free.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as Element | null)?.closest?.('a[href]')
      if (!anchor) return
      if (window.location.pathname.startsWith('/getgigmiles')) return
      const href = anchor.getAttribute('href') || ''
      const store = storeFromHref(href)
      const common = { page: window.location.pathname, ...attributionRef.current }
      if (store) {
        // Direct store link (e.g. the /download desktop badges). Decorate the
        // href with the visitor's campaign context (ct= for iOS, install
        // referrer for Android) BEFORE the browser navigates — no-ops for
        // organic visitors, so canonical links stay canonical.
        const decorated = attributedStoreUrl(store, href)
        if (decorated !== href) anchor.setAttribute('href', decorated)
        beacon('store_click', { store, ...common })
        redditTrack('Lead')
      } else if (/(^|\/)(download|getgigmiles|waitlist)(\/|$|\?)/.test(href)) {
        // Download-intent click on an internal link (the site's "Download App"
        // CTAs point at /waitlist; the smart bridge is /download). On mobile
        // these then auto-redirect to the store (not an anchor click), so this
        // is the last event we can reliably capture for that path.
        beacon('download_click', { ...common })
        redditTrack('ViewContent')
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
