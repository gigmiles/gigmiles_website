import type { Metadata } from 'next'
import CallbackClient from './callback-client'

export const metadata: Metadata = {
  title: 'TikTok authorization | GigMiles',
  // One-time OAuth landing for our own developer app — never useful in search.
  robots: { index: false, follow: false },
}

// TikTok OAuth redirect target, registered in the @gigmilesus developer app.
// This is NOT a user-facing login: the only visitor is us, once, during the
// manual authorization handshake (see the agency repo's tiktok_route_c
// submission pack). The `code` query param is read client-side so the page
// stays fully static — the mobile STATIC_EXPORT build must not break on it.
export default function TikTokCallbackPage() {
  return <CallbackClient />
}
