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

    // Auto-redirect on mobile if URL is real (not "#")
    if (p === 'ios' && iosUrl !== '#') {
      window.location.href = iosUrl
    } else if (p === 'android' && androidUrl !== '#') {
      window.location.href = androidUrl
    }
  }, [iosUrl, androidUrl])

  const comingSoon = iosUrl === '#' && androidUrl === '#'

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-xl font-black text-emerald-400">G</span>
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
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                GigMiles is currently in final review. We&apos;ll notify early access users the moment it&apos;s live.
              </p>
            </div>

            {/* Notify CTA */}
            <a
              href="mailto:support@gigmiles.app?subject=Notify me when GigMiles launches"
              className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-tight hover:bg-emerald-400 transition-colors"
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
              <p className="text-slate-400 font-medium text-sm">
                {platform === 'ios'
                  ? 'Redirecting to the App Store…'
                  : platform === 'android'
                  ? 'Redirecting to Google Play…'
                  : 'Choose your platform below.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {/* iOS */}
              <a
                href={iosUrl !== '#' ? iosUrl : undefined}
                className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl border font-bold text-sm transition-all
                  ${platform === 'ios'
                    ? 'bg-emerald-500 border-emerald-500 text-black'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download on App Store
              </a>

              {/* Android */}
              <a
                href={androidUrl !== '#' ? androidUrl : undefined}
                className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl border font-bold text-sm transition-all
                  ${platform === 'android'
                    ? 'bg-emerald-500 border-emerald-500 text-black'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 10.9225 1 13.8596 1 17.3471h22c0-3.4875-1.6889-6.4246-5.1185-8.0257"/>
                </svg>
                Get it on Google Play
              </a>
            </div>
          </>
        )}

        <Link
          href="/"
          className="text-slate-600 text-xs font-medium hover:text-slate-400 transition-colors"
        >
          ← Back to gigmiles.app
        </Link>
      </div>
    </div>
  )
}
