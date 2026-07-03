import type { Metadata } from 'next'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import { AuthCallbackClient } from './AuthCallbackClient'

// Supabase email verify / password-recovery redirects here after confirming the
// token. This page bounces the browser into the native app (custom scheme) so
// the Supabase SDK can complete the session — fixing the prior 404 dead-end.
export const metadata: Metadata = {
  title: 'GigMiles — Continue in the app',
  robots: { index: false, follow: false },
}

export default function AuthCallbackPage() {
  return (
    <AuthCallbackClient
      iosUrl={IOS_APP_STORE_URL}
      androidUrl={ANDROID_PLAY_STORE_URL}
    />
  )
}
