import type { Metadata } from 'next'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {ApprovedDownload} from '@/components/editorial/ApprovedDownload'
import {StoreRedirect} from '@/components/editorial/StoreRedirect'

export const metadata: Metadata = {
  title: 'Download GigMiles',
  description: 'Download GigMiles on iOS or Android and start tracking your real earnings.',
  alternates: {canonical:'https://gigmiles.app/download'},
}

export default function DownloadPage() {
  return (
    <WebsiteShell><StoreRedirect
      iosUrl={IOS_APP_STORE_URL}
      androidUrl={ANDROID_PLAY_STORE_URL}
    /><ApprovedDownload/></WebsiteShell>
  )
}
