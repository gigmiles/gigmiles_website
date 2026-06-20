import type { Metadata } from 'next'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import { GetGigMilesClient } from './GetGigMilesClient'

// Campaign bridge page — distributed via a single QR on physical items in
// LA & Las Vegas. noindex: this is a paid-acquisition landing surface, not
// public content we want ranked.
export const metadata: Metadata = {
  title: 'GigMiles — Get the app',
  description:
    'Download GigMiles and get extended Pro. Built for gig drivers — know what you actually kept after gas, mileage, and taxes.',
  robots: { index: false, follow: false },
}

export default function GetGigMilesPage() {
  return (
    <GetGigMilesClient
      iosUrl={IOS_APP_STORE_URL}
      androidUrl={ANDROID_PLAY_STORE_URL}
    />
  )
}
