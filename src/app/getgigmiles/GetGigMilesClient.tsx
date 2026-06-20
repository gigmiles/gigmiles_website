'use client'

import { useEffect, useState } from 'react'

/**
 * GetGigMilesClient — the guerrilla-campaign "smart bridge" page.
 *
 * A driver scans a premium physical item (microfiber cloth / headrest sign)
 * handed out in LA & Las Vegas. This page:
 *   1. Detects their device and shows the right store button.
 *   2. Reads coarse geo (state-level) from /api/geo to greet them and to
 *      attribute the scan to a city/state WITHOUT a per-city QR — one QR,
 *      one design, attribution by IP region (plus an optional ?src= override).
 *   3. Stamps the store links with campaign tokens (App Store `ct`, Play
 *      `referrer`) so installs are attributable in the store consoles.
 *   4. Explains the +7-day Pro bonus and exactly how to redeem it.
 *
 * BRAND: this page is built to GigMiles Brand Guidelines v1.0 — Deep Teal
 * field (#0E4F4F), Mint accent (#5EEAD4), Outfit (display/wordmark) + Inter
 * (UI/body), slate neutrals for the receipt surface, and the semantic
 * Emerald/Rose pair for earnings-positive / expense-negative. It intentionally
 * diverges from the site's emerald-on-dark theme to be 100% on-brand.
 */

// ── Brand palette (Guidelines §03) ───────────────────────────────────────────
const TEAL = '#0E4F4F' // primary background
const TEAL_DEEP = '#0A3C3C' // darker teal for subtle vignette only
const MINT = '#5EEAD4' // primary mark + accent
const INK = '#0F172A' // slate-900
const BODY = '#475569' // slate-600
const BORDER = '#E2E8F0' // slate-200
const EMERALD = '#10B981' // earnings · positive
const ROSE = '#E11D48' // expense · negative
const SURFACE = '#F8FAFC' // slate-50 receipt surface

const OUTFIT = 'var(--font-outfit), system-ui, sans-serif'
const INTER = 'var(--font-inter), system-ui, sans-serif'

const PROMO_CODE = 'GETGIGMILES'

type Platform = 'ios' | 'android' | 'desktop' | 'detecting'

function detectPlatform(): Platform {
  const ua = navigator.userAgent || ''
  const iOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ reports as Macintosh but is multi-touch
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  if (iOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

// Sanitize to App Store `ct` rules (alphanumeric + underscore, <=40 chars).
function sanitizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

function appendIosToken(url: string, tag: string): string {
  if (url === '#') return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}ct=${tag}`
}

function appendAndroidReferrer(url: string, tag: string): string {
  if (url === '#') return url
  const referrer = encodeURIComponent(
    `utm_source=qr&utm_medium=physical&utm_campaign=${tag}`,
  )
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}referrer=${referrer}`
}

const REGION_LABEL: Record<string, string> = {
  CA: 'Los Angeles',
  NV: 'Las Vegas',
  WA: 'Seattle',
  AZ: 'Phoenix',
  TX: 'Texas',
  NY: 'New York',
}

function beacon(event: string, payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ event, ts: Date.now(), ...payload })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', body)
    }
  } catch {
    /* best-effort */
  }
}

export function GetGigMilesClient({
  iosUrl: iosBase,
  androidUrl: androidBase,
}: {
  iosUrl: string
  androidUrl: string
}) {
  const [platform, setPlatform] = useState<Platform>('detecting')
  const [greeting, setGreeting] = useState<string | null>(null)
  const [iosUrl, setIosUrl] = useState(iosBase)
  const [androidUrl, setAndroidUrl] = useState(androidBase)

  useEffect(() => {
    const p = detectPlatform()
    setPlatform(p)

    // Optional manual override: ?src=vegas wins over IP geo (for a specific
    // booth/event). Otherwise we derive the tag from IP region after fetch.
    const params = new URLSearchParams(window.location.search)
    const srcParam = params.get('src')

    let cancelled = false

    async function resolveGeo() {
      let region: string | null = null
      let city: string | null = null
      let country: string | null = null
      try {
        const res = await fetch('/api/geo', { cache: 'no-store' })
        if (res.ok) {
          const g = await res.json()
          region = g.region
          city = g.city
          country = g.country
        }
      } catch {
        /* fall through to neutral */
      }
      if (cancelled) return

      // Attribution tag: explicit src wins, else country_region, else qr.
      const tag = sanitizeTag(
        srcParam
          ? `src_${srcParam}`
          : region
            ? `${country || 'us'}_${region}`
            : 'qr_unknown',
      )

      setIosUrl(appendIosToken(iosBase, tag))
      setAndroidUrl(appendAndroidReferrer(androidBase, tag))

      // Greeting: prefer a known region label, else the raw city, else none.
      const label =
        (region && REGION_LABEL[region]) || city || null
      if (label) setGreeting(label)

      beacon('pageview', {
        platform: p,
        src: srcParam || null,
        region,
        city,
        country,
        tag,
      })
    }

    resolveGeo()
    return () => {
      cancelled = true
    }
  }, [iosBase, androidBase])

  const iosLive = iosUrl !== '#'
  const androidLive = androidUrl !== '#'

  // Which primary button to feature based on device.
  const showIosPrimary = platform === 'ios'
  const showAndroidPrimary = platform === 'android'

  function onStoreClick(store: 'ios' | 'android') {
    beacon('store_click', { store, platform })
  }

  return (
    <main
      style={{
        fontFamily: INTER,
        color: '#EAF6F4',
        background: `radial-gradient(120% 90% at 50% -10%, ${TEAL} 0%, ${TEAL} 55%, ${TEAL_DEEP} 100%)`,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 22px calc(28px + env(safe-area-inset-bottom))',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        {/* Wordmark — Outfit Black Italic 900, −0.04em, Mint on Teal (§05) */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
          <span
            style={{
              fontFamily: OUTFIT,
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: '-0.04em',
              color: MINT,
              lineHeight: 1,
            }}
          >
            gigmiles
          </span>
        </div>

        {/* Hero */}
        <header style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: INTER,
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: MINT,
              marginBottom: 14,
            }}
          >
            {greeting ? `Welcome, ${greeting} drivers` : 'For drivers · by a driver'}
          </div>
          <h1
            style={{
              fontFamily: OUTFIT,
              fontStyle: 'italic',
              fontWeight: 800,
              fontSize: 30,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            You drove all day.
            <br />
            <span style={{ color: MINT }}>Here&apos;s what you actually kept.</span>
          </h1>
          <p
            style={{
              marginTop: 14,
              color: '#CFE6E2',
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            GigMiles tracks gas, mileage, and taxes across Uber, DoorDash, Lyft,
            and Flex — and shows one honest number.
          </p>
        </header>

        {/* Receipt card — the thesis. Slate-50 surface, semantic Emerald/Rose */}
        <section
          aria-label="Example shift"
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 18,
            padding: '18px 18px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          }}
        >
          <Row label="Gross earnings" value="$235" valueColor={INK} />
          <Row label="Vehicle costs" value="−$27" valueColor={ROSE} />
          <Row label="Estimated taxes" value="−$42" valueColor={ROSE} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 12,
              marginTop: 6,
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <span style={{ color: INK, fontWeight: 800, fontSize: 15 }}>
              Real take-home
            </span>
            <span
              style={{
                color: EMERALD,
                fontWeight: 900,
                fontSize: 22,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              $166
            </span>
          </div>
          <p
            style={{
              margin: '10px 0 0',
              color: BODY,
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            $69 went to the road &amp; the IRS. Most drivers never see it.
          </p>
        </section>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {iosLive && (
            <StoreButton
              kind={showIosPrimary ? 'primary' : 'secondary'}
              href={iosUrl}
              onClick={() => onStoreClick('ios')}
              label="Download on the App Store"
              icon={<AppleIcon />}
            />
          )}
          {androidLive && (
            <StoreButton
              kind={showAndroidPrimary ? 'primary' : 'secondary'}
              href={androidUrl}
              onClick={() => onStoreClick('android')}
              label="Get it on Google Play"
              icon={<PlayIcon />}
            />
          )}
          {!iosLive && !androidLive && (
            <a
              href="https://gigmiles.app"
              style={{
                ...btnBase,
                background: 'transparent',
                color: '#FFFFFF',
                border: `1px solid rgba(255,255,255,0.22)`,
              }}
            >
              See how it works
            </a>
          )}

          {/* Trust micro-copy directly under the CTA */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 12.5,
              color: '#9FC4BE',
              margin: '2px 0 0',
            }}
          >
            Free · No credit card · 17 days of Pro
          </p>
        </div>

        {/* +7 bonus — the reason this page exists */}
        <section
          style={{
            background: 'rgba(94,234,212,0.10)',
            border: `1px solid rgba(94,234,212,0.30)`,
            borderRadius: 18,
            padding: 18,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: INTER,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: TEAL,
              background: MINT,
              padding: '4px 9px',
              borderRadius: 6,
              marginBottom: 11,
            }}
          >
            Your bonus
          </span>
          <h2
            style={{
              fontFamily: OUTFIT,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: '0 0 7px',
            }}
          >
            7 extra days of Pro — on us
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: '#D4ECE8', margin: 0 }}>
            Everyone gets 10 days free. Because you picked this up in person, we
            add 7 more — <strong style={{ color: '#FFFFFF' }}>17 days of full
            Pro</strong>, no card.
          </p>
          <div
            style={{
              marginTop: 13,
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            <Step n={1}>Download and create your account.</Step>
            <Step n={2}>
              At sign-up, enter the code in the{' '}
              <strong style={{ color: '#FFFFFF' }}>referral / promo code</strong>{' '}
              field.
            </Step>
            <Step n={3}>
              Use the code{' '}
              <strong
                style={{
                  color: MINT,
                  fontFamily: OUTFIT,
                  fontStyle: 'italic',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                }}
              >
                {PROMO_CODE}
              </strong>{' '}
              — your 7 days apply instantly.
            </Step>
          </div>
        </section>

        {/* Trust row */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: '#7FA8A2',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Estimates, not tax advice · Your data stays private · Cancel anytime
        </p>

        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#6E938E',
            margin: 0,
          }}
        >
          <a
            href="https://gigmiles.app"
            style={{ color: '#A9D2CC', textDecoration: 'none' }}
          >
            gigmiles.app
          </a>
        </p>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '7px 0',
        fontSize: 14,
        color: BODY,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          color: valueColor,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  width: '100%',
  padding: 16,
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 800,
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
}

function StoreButton({
  kind,
  href,
  label,
  icon,
  onClick,
}: {
  kind: 'primary' | 'secondary'
  href: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  const primary = kind === 'primary'
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        ...btnBase,
        background: primary ? MINT : 'rgba(255,255,255,0.06)',
        color: primary ? TEAL : '#FFFFFF',
        border: primary ? '0' : '1px solid rgba(255,255,255,0.16)',
      }}
    >
      {icon}
      {label}
    </a>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
      <span
        style={{
          flex: 'none',
          width: 21,
          height: 21,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          color: MINT,
          fontSize: 12,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 13.5, lineHeight: 1.45, color: '#E8F4F1' }}>
        {children}
      </span>
    </div>
  )
}

function AppleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.78c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.85 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 5.84c.64-.78 1.07-1.85.95-2.93-.92.04-2.04.61-2.7 1.38-.59.69-1.11 1.79-.97 2.85 1.03.08 2.08-.52 2.72-1.3z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.6 20.5l8.4-8.5-8.4-8.5c-.36.2-.6.58-.6 1.04v14.92c0 .46.24.84.6 1.04zM13.8 13.3l2.3 2.3-9.4 5.4 7.1-7.7zm0-2.6L6.7 3l9.4 5.4-2.3 2.3zM18 12l2.9 1.7c.5.3.5 1.05 0 1.35L18 16.7l-2.5-2.35L18 12z" />
    </svg>
  )
}
