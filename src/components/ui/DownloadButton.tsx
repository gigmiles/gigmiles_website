'use client'

import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL, DOWNLOAD_URL } from '@/config/app'
import { attributedStoreUrl } from '@/lib/storeAttribution'

// Device-aware store redirect. iOS → App Store, Android → Google Play,
// desktop/unknown → the /download smart page (which shows both). Store URLs
// come from the single source of truth in src/config/app.ts and are decorated
// with the visitor's campaign context (ct= / install referrer).
function getStoreUrl(): 'desktop' | { store: 'ios' | 'android'; url: string } {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/android/i.test(ua)) return { store: 'android', url: attributedStoreUrl('android', ANDROID_PLAY_STORE_URL) }
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  if (iOS) return { store: 'ios', url: attributedStoreUrl('ios', IOS_APP_STORE_URL) }
  return 'desktop'
}

// This button navigates via window.location (not an anchor), so SiteBeacon's
// click listener can't record it — fire the store_click beacon here.
function beaconStoreClick(store: 'ios' | 'android') {
  try {
    let utm: Record<string, string> = {}
    const stored = sessionStorage.getItem('gm_attribution')
    if (stored) utm = JSON.parse(stored)
    let cid: string | null = null
    try { cid = sessionStorage.getItem('gm_cid') } catch { /* ignore */ }
    const body = JSON.stringify({
      event: 'store_click',
      ts: Date.now(),
      store,
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
      window.location.href = DOWNLOAD_URL
      return
    }
    beaconStoreClick(target.store)
    window.location.href = target.url
  }

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {children ?? 'Download App'}
    </button>
  )
}
