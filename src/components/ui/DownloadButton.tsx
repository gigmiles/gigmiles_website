'use client'

// Placeholder store URLs — swap these when app is live
const STORE_URLS = {
  ios: '#appstore',
  android: '#playstore',
}

function getStoreUrl(): string {
  if (typeof navigator === 'undefined') return STORE_URLS.ios
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return STORE_URLS.android
  return STORE_URLS.ios
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
