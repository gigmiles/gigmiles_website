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

// Builds an App Store link carrying campaign attribution. Apple's rules:
// ct= is the campaign token (alphanumeric + underscore, <=40 chars) and only
// registers in App Store Connect when pt= (provider token) is also present.
export function buildIosStoreUrl(ct: string, base: string = IOS_APP_STORE_URL): string {
  if (base === '#') return base
  const sep = base.includes('?') ? '&' : '?'
  const pt = APPLE_PROVIDER_TOKEN ? `pt=${APPLE_PROVIDER_TOKEN}&` : ''
  return `${base}${sep}${pt}ct=${ct}`
}

// Smart download URL — detects platform on the /download page
export const DOWNLOAD_URL = '/download'

// Primary CTA points to /download which auto-redirects
export const APP_STORE_URL = DOWNLOAD_URL
