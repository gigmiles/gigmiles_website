// ─── App Store URLs ────────────────────────────────────────────────────────────
// Update these when Apple/Google developer accounts are active.

// iOS: live — Apple ID 6777805244 (App Store Connect → App Information).
export const IOS_APP_STORE_URL = 'https://apps.apple.com/app/id6777805244'
// Android: deterministic from the package id — live the moment Play publishes.
export const ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gigmiles.gigmiles_app'
export const BUNDLE_ID = 'com.gigmiles.gigmilesApp'
export const APPLE_TEAM_ID = 'XXXXXXXXXX'     // TODO: fill from Apple Developer portal

// TODO: APPLE_PROVIDER_TOKEN — App Store Connect provider token (pt=).
// Without pt=, App Store Connect ignores the ct= campaign token entirely, so
// iOS campaign attribution records nothing. Get it from App Store Connect →
// Analytics → campaign link generator. The value arrives separately; once it
// is set here, buildIosStoreUrl() appends pt= + ct= automatically.
export const APPLE_PROVIDER_TOKEN = ''

// Campaign attribution carried on a store link, sourced from the visitor's
// session utm (see src/lib/storeAttribution.ts). cid is an optional per-visitor
// id that lets the app build a true web→install join (Android only; see below).
export type StoreUtm = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  cid?: string
}

// Normalize a value into an Apple ct token: alphanumeric + underscore, <=40
// chars (Apple's documented App Analytics limit). Non-alnum collapses to '_'.
export function sanitizeTag(s: string, max = 40): string {
  return s.replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, max)
}

// The Apple ct token for a visitor: campaign wins, else source. Empty when the
// visitor has no campaign identity — callers then leave the URL canonical.
export function iosCtFor(utm: StoreUtm): string {
  return sanitizeTag(utm.utm_campaign || utm.utm_source || '')
}

// Builds an App Store link carrying campaign attribution. Apple's rules:
// ct= is the campaign token (<=40 chars) and only registers in App Store
// Connect when pt= (provider token) is also present. When ct is empty (no
// campaign) we return the URL UNCHANGED — organic clicks stay canonical, and
// iOS behaves symmetrically with Android (which also no-ops on empty utm).
export function buildIosStoreUrl(ct: string, base: string = IOS_APP_STORE_URL): string {
  if (base === '#') return base
  if (!ct) return base
  if (/[?&]ct=/.test(base)) return base // already attributed — don't double-stamp
  const sep = base.includes('?') ? '&' : '?'
  const pt = APPLE_PROVIDER_TOKEN ? `pt=${APPLE_PROVIDER_TOKEN}&` : ''
  return `${base}${sep}${pt}ct=${sanitizeTag(ct)}`
}

// Builds a Play Store link carrying a Play Install Referrer. Google's format is
// referrer=<the utm query string, URL-encoded once as a whole>, e.g.
// referrer=utm_source%3Dreddit%26utm_medium%3Dpaid_social%26utm_campaign%3Dx.
// Play Console's UTM acquisition report needs BOTH utm_source and utm_medium, so
// we default medium to 'referral' when a source is present but medium is not.
// utm values come from our own campaign definitions (URL-safe snake_case), so a
// single encode is correct and cannot double-encode. Returns the base UNCHANGED
// when there is no campaign identity.
export function buildAndroidStoreUrl(utm: StoreUtm, base: string = ANDROID_PLAY_STORE_URL): string {
  if (base === '#') return base
  const source = utm.utm_source
  const campaign = utm.utm_campaign
  if (!source && !campaign) return base // organic — stay canonical
  if (/[?&]referrer=/.test(base)) return base // already attributed
  const parts = [
    `utm_source=${source || 'direct'}`,
    `utm_medium=${utm.utm_medium || 'referral'}`,
  ]
  if (campaign) parts.push(`utm_campaign=${campaign}`)
  if (utm.utm_content) parts.push(`utm_content=${utm.utm_content}`)
  if (utm.cid) parts.push(`cid=${utm.cid}`) // per-visitor join key (app reads it)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}referrer=${encodeURIComponent(parts.join('&'))}`
}

// Smart download URL — detects platform on the /download page
export const DOWNLOAD_URL = '/download'

// Primary CTA points to /download which auto-redirects
export const APP_STORE_URL = DOWNLOAD_URL
