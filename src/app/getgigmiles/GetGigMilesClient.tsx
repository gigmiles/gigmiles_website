'use client'

import { useEffect, useRef, useState } from 'react'
import { buildIosStoreUrl } from '@/config/app'

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

// 'unknown' = server render + pre-hydration: both store badges are in the
// HTML so the page works with slow or blocked JS; detection then narrows it.
type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

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

function appendAndroidReferrer(url: string, tag: string): string {
  if (url === '#') return url
  const referrer = encodeURIComponent(
    `utm_source=qr&utm_medium=physical&utm_campaign=${tag}`,
  )
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}referrer=${referrer}`
}

// Play referrer carrying the page's own utm_* params verbatim (the physical
// QR codes encode utm_source/utm_medium/utm_campaign, not ?src=).
function appendAndroidReferrerFromUtm(url: string, utm: UtmParams): string {
  if (url === '#') return url
  const query = (['utm_source', 'utm_medium', 'utm_campaign'] as const)
    .filter(k => utm[k])
    .map(k => `${k}=${encodeURIComponent(utm[k] as string)}`)
    .join('&')
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}referrer=${encodeURIComponent(query)}`
}

type UtmParams = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

function readUtmParams(params: URLSearchParams): UtmParams {
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  }
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
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [greeting, setGreeting] = useState<string | null>(null)
  // Pre-stamped fallback tokens ship in the server HTML: a tap that lands
  // before hydration or the geo roundtrip still attributes as generic "qr".
  const [iosUrl, setIosUrl] = useState(() => buildIosStoreUrl('qr', iosBase))
  const [androidUrl, setAndroidUrl] = useState(() => appendAndroidReferrer(androidBase, 'qr'))
  // Resolved attribution tag, mirrored for the store_click beacon so funnel
  // queries can filter on tag alone without joining through utm columns.
  const tagRef = useRef('qr')

  useEffect(() => {
    const p = detectPlatform()
    setPlatform(p)

    // Campaign identity, in priority order: ?src= (manual booth/event
    // override, kept for backward compatibility) → utm_campaign (the physical
    // QR cloths encode utm_source/utm_medium/utm_campaign) → IP geo → generic.
    const params = new URLSearchParams(window.location.search)
    const srcParam = params.get('src')
    const utm = readUtmParams(params)
    const explicitTag = srcParam
      ? sanitizeTag(`src_${srcParam}`)
      : utm.utm_campaign
        ? sanitizeTag(utm.utm_campaign)
        : null

    // Explicit tags need no network roundtrip — stamp synchronously so the
    // attribution upgrade doesn't wait on /api/geo. Play referrer carries the
    // incoming utm_* verbatim when present.
    const hasUtm = Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign)
    if (explicitTag) {
      tagRef.current = explicitTag
      setIosUrl(buildIosStoreUrl(explicitTag, iosBase))
      setAndroidUrl(
        hasUtm && !srcParam
          ? appendAndroidReferrerFromUtm(androidBase, utm)
          : appendAndroidReferrer(androidBase, explicitTag),
      )
    }

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

      // Attribution tag: explicit (src / utm_campaign) wins and was already
      // stamped above — geo must not clobber it. Geo only fills the gap when
      // the visitor arrived with no campaign identity at all.
      const tag =
        explicitTag ??
        sanitizeTag(region ? `${country || 'us'}_${region}` : 'qr_unknown')
      tagRef.current = tag

      if (!explicitTag) {
        setIosUrl(buildIosStoreUrl(tag, iosBase))
        setAndroidUrl(appendAndroidReferrer(androidBase, tag))
      }

      // Greeting: prefer a known region label, else the raw city, else none.
      const label =
        (region && REGION_LABEL[region]) || city || null
      if (label) setGreeting(label)

      beacon('pageview', {
        platform: p,
        src: srcParam || null,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
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

  function onStoreClick(store: 'ios' | 'android') {
    const params = new URLSearchParams(window.location.search)
    const utm = readUtmParams(params)
    beacon('store_click', {
      store,
      platform,
      src: params.get('src'),
      tag: tagRef.current,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    })
  }

  // Official store badges (Apple / Google marketing guidelines require the
  // provided artwork; do not recolor or recreate). Attribution tokens + click
  // beacon ride on the wrapping link.
  const iosButton = (
    <a
      href={iosUrl}
      onClick={() => onStoreClick('ios')}
      aria-label="Download on the App Store"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/badges/app-store-badge.svg"
        alt="Download on the App Store"
        style={{ height: 52, width: 'auto', display: 'block' }}
      />
    </a>
  )
  const androidButton = (
    <a
      href={androidUrl}
      onClick={() => onStoreClick('android')}
      aria-label="Get it on Google Play"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/badges/google-play-badge.svg"
        alt="Get it on Google Play"
        style={{ height: 52, width: 'auto', display: 'block' }}
      />
    </a>
  )

  // Device-specific CTA: show ONLY the visitor's own store. If that store
  // isn't live yet (iOS pre-publish), show a coming-soon notice rather than
  // pushing them to the wrong store. Desktop/unknown sees whatever is live —
  // 'unknown' is also the server render, so both badges are in the HTML and
  // the page stays usable before (or without) JS.
  let storeCta: React.ReactNode
  if (platform === 'ios') {
    storeCta = iosLive ? iosButton : <ComingSoon store="the App Store" icon={<AppleIcon />} />
  } else if (platform === 'android') {
    storeCta = androidLive ? androidButton : <ComingSoon store="Google Play" icon={<PlayIcon />} />
  } else {
    storeCta = (
      <>
        {iosLive && iosButton}
        {androidLive && androidButton}
        {!iosLive && !androidLive && (
          <a
            href="https://gigmiles.app"
            style={{
              ...btnBase,
              background: 'transparent',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            See how it works
          </a>
        )}
      </>
    )
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
          {/* Canonical example — matches the live app screenshots: $235 → $175 */}
          <Row label="Gross earnings" value="$235" valueColor={INK} />
          <Row label="Vehicle costs" value="−$43" valueColor={ROSE} />
          <Row label="Estimated taxes" value="−$17" valueColor={ROSE} />
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
              $175
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
            $60 went to the road &amp; the IRS. Most drivers never see it.
          </p>
        </section>

        {/* CTA — device-specific (only the visitor's own store) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {storeCta}
          </div>

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

function ComingSoon({ store, icon }: { store: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        ...btnBase,
        background: 'rgba(255,255,255,0.06)',
        color: '#CFE6E2',
        border: '1px solid rgba(255,255,255,0.14)',
        cursor: 'default',
      }}
    >
      {icon}
      Coming soon on {store}
    </div>
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

// Official Google Play 4-colour mark (Google brand asset, gradients intact).
function PlayIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="134 307.5 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="gpA" x1="215.196" y1="319.454" x2="100.359" y2="434.291" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00a0ff" />
          <stop offset=".007" stopColor="#00a1ff" />
          <stop offset=".26" stopColor="#00beff" />
          <stop offset=".512" stopColor="#00d2ff" />
          <stop offset=".76" stopColor="#00dfff" />
          <stop offset="1" stopColor="#00e3ff" />
        </linearGradient>
        <linearGradient id="gpB" x1="297.578" y1="396.75" x2="132.007" y2="396.75" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe000" />
          <stop offset=".409" stopColor="#ffbd00" />
          <stop offset=".775" stopColor="#ffa500" />
          <stop offset="1" stopColor="#ff9c00" />
        </linearGradient>
        <linearGradient id="gpC" x1="235.969" y1="412.481" x2="80.242" y2="568.208" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff3a44" />
          <stop offset="1" stopColor="#c31162" />
        </linearGradient>
        <linearGradient id="gpD" x1="116.02" y1="261.07" x2="185.559" y2="330.609" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#32a071" />
          <stop offset=".069" stopColor="#2da771" />
          <stop offset=".476" stopColor="#15cf74" />
          <stop offset=".801" stopColor="#06e775" />
          <stop offset="1" stopColor="#00f076" />
        </linearGradient>
      </defs>
      <g transform="matrix(.181794 0 0 .181794 111.21426 251.37762)">
        <path d="M137.5 311.5c-2 2.1-3.2 5.4-3.2 9.6v151.3c0 4.2 1.2 7.5 3.2 9.6l.5.5 84.8-84.8v-2L138 310.9z" fill="url(#gpA)" />
        <path d="M251 426l-28.2-28.3v-2l28.3-28.3.6.4 33.5 19c9.6 5.4 9.6 14.3 0 19.8l-33.5 19z" fill="url(#gpB)" />
        <path d="M251.7 425.6l-28.9-28.9-85.3 85.3c3.1 3.3 8.4 3.8 14.2.4l100-56.8" fill="url(#gpC)" />
        <path d="M251.7 367.9l-100-56.8c-5.9-3.3-11.1-2.9-14.2.4l85.3 85.3z" fill="url(#gpD)" />
      </g>
    </svg>
  )
}
