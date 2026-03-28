import type { Metadata } from 'next'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import { DownloadClient } from './DownloadClient'

export const metadata: Metadata = {
  title: 'Download GigMiles',
  description: 'Download GigMiles on iOS or Android and start tracking your real earnings.',
}

export default function DownloadPage() {
  return (
    <DownloadClient
      iosUrl={IOS_APP_STORE_URL}
      androidUrl={ANDROID_PLAY_STORE_URL}
    />
  )
}
