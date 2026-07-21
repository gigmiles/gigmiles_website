// Visitor device class, from the browser user-agent.
//
// NOT the same thing as src/lib/platform.ts — that one wraps Capacitor and
// answers "which shell is this code running in", which is always 'web' for a
// site visitor. This answers "what is the visitor holding", which is what
// decides where a Download click should go and which device class an analytics
// beacon belongs to.
//
// Kept in one place because DownloadButton branches on it for routing and
// SiteBeacon stamps it on every beacon; two copies of this regex would drift
// apart and silently disagree in the funnel data.

export type VisitorDevice = 'ios' | 'android' | 'desktop'

export function visitorDevice(): VisitorDevice {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/android/i.test(ua)) return 'android'
  // iPadOS 13+ reports a desktop Safari UA; the touch-point check is the
  // standard way to still recognise it.
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  return iOS ? 'ios' : 'desktop'
}
