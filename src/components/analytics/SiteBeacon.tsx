'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SiteBeacon — site-wide campaign analytics, mounted once in the root layout.
 *
 * Answers the paid/social attribution question the /getgigmiles bridge can't:
 * a visitor lands from gigmiles.app/reddit|/tiktok|/ig (307 → / with utm_*),
 * browses, and maybe clicks a store link. This component:
 *   1. Captures utm_* on first touch and keeps them in sessionStorage so
 *      attribution survives client-side navigation (the redirect strips the
 *      query only from later pages, not from the session).
 *   2. Sends a `pageview` beacon (with page path) on every route change.
 *   3. Listens for clicks on any App Store / Play Store link anywhere on the
 *      site and sends a `store_click` beacon with the same attribution.
 * Events land in Supabase `campaign_events` next to the guerrilla-campaign
 * rows; funnel queries filter on utm_source.
 *
 * /getgigmiles keeps its own richer beacon (geo greeting, ct/referrer
 * stamping) — SiteBeacon skips that route to avoid double counting.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const STORAGE_KEY = 'gm_attribution'

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

export function SiteBeacon() {
  const pathname = usePathname()
  const attributionRef = useRef<Attribution>({})

  // Pageview on every route change. /getgigmiles has its own beacon.
  useEffect(() => {
    if (!pathname || pathname.startsWith('/getgigmiles')) return
    const utm = loadAttribution()
    attributionRef.current = utm
    beacon('pageview', { page: pathname, ...utm })
  }, [pathname])

  // One capture-phase listener catches store-link clicks site-wide, so no
  // per-CTA wiring is needed and future store buttons are covered for free.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as Element | null)?.closest?.('a[href]')
      if (!anchor) return
      const store = storeFromHref(anchor.getAttribute('href') || '')
      if (!store) return
      if (window.location.pathname.startsWith('/getgigmiles')) return
      beacon('store_click', {
        store,
        page: window.location.pathname,
        ...attributionRef.current,
      })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
