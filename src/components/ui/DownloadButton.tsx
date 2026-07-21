'use client'

import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL, DOWNLOAD_URL } from '@/config/app'
import { attributedStoreUrl } from '@/lib/storeAttribution'
import { visitorDevice } from '@/lib/visitorDevice'

// Device-aware store redirect. iOS → App Store, Android → Google Play,
// desktop/unknown → the /download smart page (which shows both). Store URLs
// come from the single source of truth in src/config/app.ts and are decorated
// with the visitor's campaign context (ct= / install referrer).
function getStoreUrl(): 'desktop' | { store: 'ios' | 'android'; url: string } {
  const device = visitorDevice()
  if (device === 'android') {
    return { store: 'android', url: attributedStoreUrl('android', ANDROID_PLAY_STORE_URL) }
  }
  if (device === 'ios') {
    return { store: 'ios', url: attributedStoreUrl('ios', IOS_APP_STORE_URL) }
  }
  return 'desktop'
}

// This button navigates via window.location (not an anchor), so SiteBeacon's
// click listener can't record it — fire the beacon here.
//
// Both branches must beacon. Until 2026-07-21 only the mobile branch did, so
// every desktop click on the site's primary CTA was invisible: no store_click
// (the visitor is going to /download, not a store) and no download_click
// (SiteBeacon only listens for anchor clicks). `download_click` therefore had
// zero rows in campaign_events despite being fully wired server-side.
function beaconIntent(event: 'store_click' | 'download_click', store?: 'ios' | 'android') {
  try {
    let utm: Record<string, string> = {}
    const stored = sessionStorage.getItem('gm_attribution')
    if (stored) utm = JSON.parse(stored)
    let cid: string | null = null
    try { cid = sessionStorage.getItem('gm_cid') } catch { /* ignore */ }
    const body = JSON.stringify({
      event,
      ts: Date.now(),
      platform: visitorDevice(),
      ...(store ? { store } : {}),
      page: window.location.pathname,
      ...(cid ? { cid } : {}),
      ...utm,
    })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', body)
  } catch {
    /* best-effort */
  }
}

interface DownloadButtonProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function DownloadButton({ className, style, children }: DownloadButtonProps) {
  const handleClick = () => {
    const target = getStoreUrl()
    if (target === 'desktop') {
      // Desktop heads to the /download smart page — that is download intent,
      // not a store handoff, so it is a download_click.
      beaconIntent('download_click')
      window.location.href = DOWNLOAD_URL
      return
    }
    beaconIntent('store_click', target.store)
    window.location.href = target.url
  }

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {children ?? 'Download App'}
    </button>
  )
}
