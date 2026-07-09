'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SiteBeacon — site-wide campaign analytics, mounted once in the root layout.
 *
 * A visitor lands from gigmiles.app/reddit|/tiktok|/ig (307 → / with utm_*),
 * browses, and maybe heads for the app. This component:
 *   1. Captures utm_* on first touch and keeps them in sessionStorage so
 *      attribution survives client-side navigation.
 *   2. Resolves coarse geo once (/api/geo, Vercel edge headers) so every
 *      event carries country/region/city — no GPS prompt.
 *   3. Sends a `pageview` beacon (with page path + geo) on every route change.
 *   4. Catches download intent site-wide: clicks on App Store / Play links
 *      (store_click) AND clicks on internal /download or /getgigmiles links
 *      (download_click), so the funnel is captured even though /download
 *      auto-redirects to the store on mobile (which is not an anchor click).
 * Events land in Supabase `campaign_events` next to the guerrilla-campaign
 * rows; funnel queries filter on utm_source.
 *
 * /getgigmiles keeps its own richer beacon (geo greeting, ct/referrer
 * stamping) — SiteBeacon skips that route to avoid double counting.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const STORAGE_KEY = 'gm_attribution'

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>
type Geo = { country: string | null; region: string | null; city: string | null }

function loadAttribution(): Attribution {
  try {
    const url = new URL(window.location.href)
    const fromUrl: Attribution = {}
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k)
      if (v) fromUrl[k] = v.slice(0, 64)
    }
    if (Object.keys(fromUrl).length) {
      // First touch wins for the session; a new tagged arrival overwrites.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl))
      return fromUrl
    }
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Attribution) : {}
  } catch {
    return {}
  }
}

function beacon(event: string, payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ event, ts: Date.now(), ...payload })
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

const EMPTY_GEO: Geo = { country: null, region: null, city: null }

export function SiteBeacon() {
  const pathname = usePathname()
  const attributionRef = useRef<Attribution>({})
  const geoRef = useRef<Geo>(EMPTY_GEO)
  // A single in-flight geo lookup shared across pageviews. Pageviews AWAIT it
  // before beaconing so the very first (landing) event carries geo, instead of
  // racing the async fetch and sending nulls.
  const geoReadyRef = useRef<Promise<Geo> | null>(null)

  function getGeo(): Promise<Geo> {
    if (!geoReadyRef.current) {
      geoReadyRef.current = fetch('/api/geo', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(g => {
          const geo: Geo = g
            ? { country: g.country ?? null, region: g.region ?? null, city: g.city ?? null }
            : EMPTY_GEO
          geoRef.current = geo
          return geo
        })
        .catch(() => EMPTY_GEO)
    }
    return geoReadyRef.current
  }

  // Pageview on every route change. /getgigmiles has its own beacon.
  useEffect(() => {
    if (!pathname || pathname.startsWith('/getgigmiles')) return
    const utm = loadAttribution()
    attributionRef.current = utm
    let cancelled = false
    // Wait for geo, but never block the beacon longer than 1.2s (a slow/absent
    // /api/geo must not cost us the pageview — sendBeacon still fires on unload).
    const timeout = new Promise<Geo>(res => setTimeout(() => res(geoRef.current), 1200))
    Promise.race([getGeo(), timeout]).then(geo => {
      if (!cancelled) beacon('pageview', { page: pathname, ...utm, ...geo })
    })
    return () => {
      cancelled = true
    }
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
      const common = {
        page: window.location.pathname,
        ...attributionRef.current,
        ...geoRef.current,
      }
      if (store) {
        // Direct store link (e.g. the /download desktop badges).
        beacon('store_click', { store, ...common })
      } else if (/(^|\/)(download|getgigmiles|waitlist)(\/|$|\?)/.test(href)) {
        // Download-intent click on an internal link (the site's "Download App"
        // CTAs point at /waitlist; the smart bridge is /download). On mobile
        // these then auto-redirect to the store (not an anchor click), so this
        // is the last event we can reliably capture for that path.
        beacon('download_click', { ...common })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
