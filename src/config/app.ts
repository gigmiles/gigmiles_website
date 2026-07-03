// ─── App Store URLs ────────────────────────────────────────────────────────────
// Update these when Apple/Google developer accounts are active.

// iOS: live — Apple ID 6777805244 (App Store Connect → App Information).
export const IOS_APP_STORE_URL = 'https://apps.apple.com/app/id6777805244'
// Android: deterministic from the package id — live the moment Play publishes.
export const ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gigmiles.gigmiles_app'
export const BUNDLE_ID = 'com.gigmiles.gigmilesApp'
export const APPLE_TEAM_ID = 'XXXXXXXXXX'     // TODO: fill from Apple Developer portal

// Smart download URL — detects platform on the /download page
export const DOWNLOAD_URL = '/download'

// Primary CTA points to /download which auto-redirects
export const APP_STORE_URL = DOWNLOAD_URL
