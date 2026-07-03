'use client'

import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL, DOWNLOAD_URL } from '@/config/app'

// Device-aware store redirect. iOS → App Store, Android → Google Play,
// desktop/unknown → the /download smart page (which shows both). Store URLs
// come from the single source of truth in src/config/app.ts.
function getStoreUrl(): string {
  if (typeof navigator === 'undefined') return DOWNLOAD_URL
  const ua = navigator.userAgent || ''
  if (/android/i.test(ua)) return ANDROID_PLAY_STORE_URL
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  if (iOS) return IOS_APP_STORE_URL
  return DOWNLOAD_URL
}

interface DownloadButtonProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function DownloadButton({ className, style, children }: DownloadButtonProps) {
  const handleClick = () => {
    window.location.href = getStoreUrl()
  }

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {children ?? 'Download App'}
    </button>
  )
}
