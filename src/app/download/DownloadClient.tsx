'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Platform = 'ios' | 'android' | 'desktop' | 'detecting'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function DownloadClient({
  iosUrl,
  androidUrl,
}: {
  iosUrl: string
  androidUrl: string
}) {
  const [platform, setPlatform] = useState<Platform>('detecting')

  useEffect(() => {
    const p = detectPlatform()
    setPlatform(p)

    // Fire a store_click beacon BEFORE the mobile auto-redirect. The redirect
    // is a window.location assignment, not an anchor click, so SiteBeacon's
    // click listener can't see it — this is the only place the mobile store
    // handoff (the highest-intent event) can be recorded. Carries the session's
    // utm_* from sessionStorage so it attributes to reddit/tiktok/etc.
    function beaconStoreClick(store: 'ios' | 'android') {
      try {
        let utm: Record<string, string> = {}
        const stored = sessionStorage.getItem('gm_attribution')
        if (stored) utm = JSON.parse(stored)
        const body = JSON.stringify({
          event: 'store_click',
          ts: Date.now(),
          store,
          page: '/download',
          ...utm,
        })
        if (navigator.sendBeacon) navigator.sendBeacon('/api/track', body)
      } catch {
        /* best-effort */
      }
    }

    // Auto-redirect on mobile if URL is real (not "#")
    if (p === 'ios' && iosUrl !== '#') {
      beaconStoreClick('ios')
      window.location.href = iosUrl
    } else if (p === 'android' && androidUrl !== '#') {
      beaconStoreClick('android')
      window.location.href = androidUrl
    }
  }, [iosUrl, androidUrl])

  const comingSoon = iosUrl === '#' && androidUrl === '#'

  return (
    <div className="min-h-screen bg-[#0E4F4F] flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#5EEAD4]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 flex items-center justify-center">
            <span className="text-xl font-black text-[#5EEAD4]">G</span>
          </div>
          <span className="text-lg font-black text-white tracking-tight">GIGMILES</span>
        </div>

        {comingSoon ? (
          <>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Coming Soon</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                App Store launch<br />coming soon.
              </h1>
              <p className="text-slate-300 font-medium text-sm leading-relaxed">
                GigMiles is currently in final review. We&apos;ll notify early access users the moment it&apos;s live.
              </p>
            </div>

            {/* Notify CTA */}
            <a
              href="mailto:support@gigmiles.app?subject=Notify me when GigMiles launches"
              className="w-full py-4 rounded-2xl bg-[#5EEAD4] text-black font-black text-sm uppercase tracking-tight hover:bg-[#5EEAD4] transition-colors"
            >
              Notify Me at Launch
            </a>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Download GigMiles
              </h1>
              <p className="text-slate-300 font-medium text-sm">
                {platform === 'ios'
                  ? 'Redirecting to the App Store…'
                  : platform === 'android'
                  ? 'Redirecting to Google Play…'
                  : 'Choose your platform below.'}
              </p>
            </div>

            {/* Official store badges (Apple / Google guidelines) */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              <a
                href={iosUrl !== '#' ? iosUrl : undefined}
                aria-label="Download on the App Store"
                className="inline-flex"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/badges/app-store-badge.svg"
                  alt="Download on the App Store"
                  className="h-[52px] w-auto"
                />
              </a>
              <a
                href={androidUrl !== '#' ? androidUrl : undefined}
                aria-label="Get it on Google Play"
                className="inline-flex"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/badges/google-play-badge.svg"
                  alt="Get it on Google Play"
                  className="h-[52px] w-auto"
                />
              </a>
            </div>
          </>
        )}

        <Link
          href="/"
          className="text-slate-300 text-xs font-medium hover:text-slate-300 transition-colors"
        >
          ← Back to gigmiles.app
        </Link>
      </div>
    </div>
  )
}
