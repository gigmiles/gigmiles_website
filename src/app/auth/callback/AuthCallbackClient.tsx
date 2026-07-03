'use client'

import { useEffect, useState } from 'react'

// Auth callback bridge. Supabase's email verify / password-recovery does a
// 302 redirect here (https://gigmiles.app/auth/callback?code=...). Universal /
// App Links do NOT open the native app on a redirect (only on a direct tap),
// so we bounce the browser to the app's CUSTOM SCHEME, which DOES open it —
// the Supabase Flutter SDK then completes the PKCE session on the device.
// Handles both signup-confirm and password-reset (same redirect URL).

const TEAL = '#0E4F4F'
const MINT = '#5EEAD4'
const OUTFIT = 'var(--font-outfit), system-ui, sans-serif'
const INTER = 'var(--font-inter), system-ui, sans-serif'

const APP_SCHEME = 'gigmiles://login-callback'

function isMobileUA(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return (
    /iphone|ipad|ipod|android/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  )
}

export function AuthCallbackClient({
  iosUrl,
  androidUrl,
}: {
  iosUrl: string
  androidUrl: string
}) {
  const [deepLink, setDeepLink] = useState(APP_SCHEME)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const search = window.location.search || ''
    const hash = window.location.hash || ''
    const link = APP_SCHEME + search + hash
    setDeepLink(link)

    // Surface a Supabase auth error if one came back (expired/invalid link).
    const merged = new URLSearchParams(
      search.replace(/^\?/, '') +
        (hash.startsWith('#') ? '&' + hash.slice(1) : ''),
    )
    const e = merged.get('error_description') || merged.get('error')
    if (e) {
      setError(e.replace(/\+/g, ' '))
      return
    }

    // Auto-open the app on mobile (custom schemes open from the browser).
    // Desktop: skip auto-nav (would throw a "can't open" dialog); show badges.
    if (isMobileUA()) {
      const t = setTimeout(() => {
        window.location.href = link
      }, 500)
      return () => clearTimeout(t)
    }
  }, [])

  const iosLive = iosUrl !== '#'
  const androidLive = androidUrl !== '#'

  return (
    <main
      style={{
        fontFamily: INTER,
        color: '#EAF6F4',
        background: `radial-gradient(120% 90% at 50% -10%, ${TEAL} 0%, ${TEAL} 55%, #0A3C3C 100%)`,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 22px calc(28px + env(safe-area-inset-bottom))',
        WebkitFontSmoothing: 'antialiased',
        textAlign: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <span
          style={{
            fontFamily: OUTFIT,
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: '-0.04em',
            color: MINT,
            lineHeight: 1,
          }}
        >
          gigmiles
        </span>

        {error ? (
          <>
            <h1 style={{ fontFamily: OUTFIT, fontStyle: 'italic', fontWeight: 800, fontSize: 24, color: '#FFFFFF', margin: 0 }}>
              This link didn&apos;t work
            </h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#CFE6E2', margin: 0 }}>
              {error}. Open the GigMiles app and request a new link.
            </p>
          </>
        ) : (
          <>
            <div
              aria-hidden
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(94,234,212,0.14)',
                border: `1px solid rgba(94,234,212,0.4)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: MINT,
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              ✓
            </div>
            <h1 style={{ fontFamily: OUTFIT, fontStyle: 'italic', fontWeight: 800, fontSize: 24, color: '#FFFFFF', margin: 0 }}>
              You&apos;re all set
            </h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#CFE6E2', margin: 0 }}>
              Opening the GigMiles app to finish signing you in. If it doesn&apos;t
              open automatically, tap below.
            </p>
          </>
        )}

        {/* Primary: open the native app via the custom scheme */}
        <a
          href={deepLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 300,
            padding: 15,
            borderRadius: 14,
            background: MINT,
            color: TEAL,
            fontSize: 16,
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Open the GigMiles app
        </a>

        {/* Fallback: don't have the app? Official store badges. */}
        {(iosLive || androidLive) && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 12.5, color: '#9FC4BE', margin: 0 }}>Don&apos;t have the app yet?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {iosLive && (
                <a href={iosUrl} aria-label="Download on the App Store" style={{ display: 'inline-flex' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/badges/app-store-badge.svg" alt="Download on the App Store" style={{ height: 46, width: 'auto', display: 'block' }} />
                </a>
              )}
              {androidLive && (
                <a href={androidUrl} aria-label="Get it on Google Play" style={{ display: 'inline-flex' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/badges/google-play-badge.svg" alt="Get it on Google Play" style={{ height: 46, width: 'auto', display: 'block' }} />
                </a>
              )}
            </div>
          </div>
        )}

        <p style={{ fontSize: 11.5, color: '#7FA8A2', lineHeight: 1.6, margin: '6px 0 0' }}>
          Open this on the phone where you signed up.{' '}
          <a href="https://gigmiles.app" style={{ color: '#A9D2CC', textDecoration: 'none' }}>
            gigmiles.app
          </a>
        </p>
      </div>
    </main>
  )
}
