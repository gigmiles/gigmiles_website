'use client'

import { useEffect, useState } from 'react'
import { CheatsheetView } from './CheatsheetView'

/**
 * CheatsheetClient — email-capture landing for the free 2026 cheat-sheet.
 *
 * Mobile-first on purpose: 80%+ of Reddit traffic is mobile, so the
 * headline + form sit above the fold on a 375px viewport. The hero must pay
 * off whatever the inbound ad promised: a generic hero against the 76¢-rate
 * ad converted 0/54 (R3, 2026-07-16), so the hero is variant-driven — see
 * CheatsheetVariant, picked server-side from utm_content in page.tsx.
 * The PDF is delivered instantly on submit — storage of the email is
 * best-effort and never blocks the download.
 *
 * BRAND: GigMiles Brand Guidelines v1.0 — Deep Teal field, Mint accent,
 * Outfit display / Inter body (same language as /getgigmiles).
 */

const TEAL = '#0E4F4F'
const MINT = '#5EEAD4'
const GOLD = '#FFC83D'
const INK = '#0F172A'
const BODY = '#475569'
const BORDER = '#E2E8F0'
const SURFACE = '#F8FAFC'

const OUTFIT = 'var(--font-outfit), system-ui, sans-serif'
const INTER = 'var(--font-inter), system-ui, sans-serif'

const PDF_URL = '/downloads/GigMiles_Cheat_Sheet_2026.pdf'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'done' | 'invalid'

type Utm = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  cid?: string
}

function readUtm(): Utm {
  const p = new URLSearchParams(window.location.search)
  const pick = (k: string) => p.get(k) || undefined
  return {
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    cid: pick('cid'),
  }
}

export type CheatsheetVariant = 'default' | 'rate76'

export function CheatsheetClient({
  variant = 'default',
}: {
  variant?: CheatsheetVariant
}) {
  // 'rate76' = arrived from an ad whose hook IS the 76¢ rate change. The hero
  // must pay that promise off immediately or the click bounces (R3: 0/54).
  const isRate76 = variant === 'rate76'
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('') // honeypot — bots fill it, humans never see it
  // Paid arrivals start UNGATED — 'done' is the post-submit state, i.e. the
  // sheet itself plus the app CTA, which is exactly what an ungated visitor
  // should land on. Why (2026-07-16): the email gate was built when the paid
  // KPI was "leads", and we retired that KPI — an address is a proxy, an
  // install is the thing we want. The gate also guards nothing: the PDF is a
  // public URL and CheatsheetView renders the whole sheet inline. Removing it
  // costs no measurement, because SiteBeacon's site-wide listener already
  // fires download_click on the /download CTA (and does NOT match the
  // /downloads/*.pdf save link, so app intent stays uncontaminated).
  // Organic/untagged traffic keeps the gate: it feeds the list, and nobody
  // clicked an ad promising a free sheet.
  const [status, setStatus] = useState<Status>(isRate76 ? 'done' : 'idle')
  const [utm, setUtm] = useState<Utm>({})

  useEffect(() => {
    setUtm(readUtm())
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
      setStatus('invalid')
      return
    }
    setStatus('submitting')
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, hp, page: '/cheatsheet', ...utm }),
      })
    } catch {
      // Best-effort storage: the driver still gets the sheet.
    }
    setStatus('done')
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: TEAL,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px 40px',
        fontFamily: INTER,
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div
          style={{
            fontFamily: OUTFIT,
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
            color: '#fff',
            marginBottom: 28,
          }}
        >
          GIG<span style={{ color: MINT }}>MILES</span>
        </div>

        <h1
          style={{
            fontFamily: OUTFIT,
            fontWeight: 800,
            fontSize: 'clamp(28px, 7vw, 40px)',
            lineHeight: 1.1,
            color: '#fff',
          }}
        >
          {isRate76 ? (
            <>
              The Mileage Rate Just Went Up to{' '}
              <span style={{ color: GOLD }}>76¢</span>.
            </>
          ) : (
            <>
              Know What You <span style={{ color: GOLD }}>Actually Keep</span>.
            </>
          )}
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.5, color: MINT }}>
          {isRate76
            ? 'The IRS raised it on July 1 — it was 72.5¢, and most drivers haven’t noticed. Here’s the free 2026 cheat-sheet, with the new number.'
            : 'Your gig app shows gross pay. We show your real net profit after miles, fuel, and taxes.'}
        </p>

        <div
          style={{
            marginTop: 24,
            background: '#fff',
            borderRadius: 14,
            padding: '22px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          }}
        >
          {status !== 'done' ? (
            <>
              <p style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 17, color: INK }}>
                Free one-page cheat-sheet (2026)
              </p>
              <ul
                style={{
                  margin: '10px 0 0',
                  padding: 0,
                  listStyle: 'none',
                  color: BODY,
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                {(isRate76
                  ? [
                      'Updated for the new 76¢ rate — and the 72.5¢ Jan–Jun split.',
                      'See your true take-home pay, not just the payout.',
                      'Track every business mile and vehicle cost automatically.',
                    ]
                  : [
                      'See your true take-home pay, not just the payout.',
                      'Track every business mile and vehicle cost automatically.',
                      'Organize cleaner records for tax season with ease.',
                    ]
                ).map(line => (
                  <li key={line} style={{ padding: '4px 0 4px 22px', position: 'relative' }}>
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 7,
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: MINT,
                      }}
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <form onSubmit={submit} style={{ marginTop: 16 }}>
                {/* Honeypot: visually hidden, tab-skipped. */}
                <input
                  type="text"
                  value={hp}
                  onChange={e => setHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  style={{ position: 'absolute', left: -9999, opacity: 0, height: 0 }}
                />
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, color: INK }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (status === 'invalid') setStatus('idle')
                  }}
                  placeholder="you@example.com"
                  style={{
                    marginTop: 6,
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontSize: 16,
                    border: `1.5px solid ${status === 'invalid' ? '#E11D48' : BORDER}`,
                    borderRadius: 10,
                    outline: 'none',
                    color: INK,
                    background: SURFACE,
                  }}
                />
                {status === 'invalid' && (
                  <p style={{ marginTop: 6, fontSize: 12.5, color: '#E11D48' }}>
                    That email doesn&apos;t look right — mind checking it?
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '13px 16px',
                    fontFamily: OUTFIT,
                    fontWeight: 800,
                    fontSize: 16,
                    color: TEAL,
                    background: MINT,
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    opacity: status === 'submitting' ? 0.7 : 1,
                  }}
                >
                  {status === 'submitting' ? 'One second…' : 'Get Your Free Cheat-Sheet'}
                </button>
              </form>
              <p style={{ marginTop: 10, fontSize: 12, color: BODY, textAlign: 'center' }}>
                No spam. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div>
              <p style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: 18, color: INK }}>
                Here&apos;s your cheat-sheet — read it right here.
              </p>
              <p style={{ marginTop: 4, fontSize: 13, color: BODY }}>
                No download needed. Want to keep a copy?{' '}
                <a href={PDF_URL} download style={{ color: TEAL, fontWeight: 700 }}>
                  Save the PDF
                </a>
                .
              </p>

              <div style={{ marginTop: 16 }}>
                <CheatsheetView />
              </div>

              {/* App / site router — the whole point is to move readers toward the app. */}
              <div
                style={{
                  marginTop: 20,
                  padding: '18px 16px',
                  background: TEAL,
                  borderRadius: 14,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: 16, color: '#fff', margin: 0 }}>
                  Let GigMiles do all of this for you.
                </p>
                <p style={{ marginTop: 6, fontSize: 13, color: MINT }}>
                  Your exact car, your state, your filing situation — tracked automatically.
                </p>
                <a
                  href="/download"
                  style={{
                    display: 'block',
                    marginTop: 14,
                    padding: '14px 22px',
                    fontFamily: OUTFIT,
                    fontWeight: 800,
                    fontSize: 16,
                    color: TEAL,
                    background: MINT,
                    borderRadius: 10,
                    textDecoration: 'none',
                  }}
                >
                  Get the GigMiles app — free, no card
                </a>
                <a
                  href="/"
                  style={{
                    display: 'inline-block',
                    marginTop: 12,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 600,
                  }}
                >
                  or see how it works →
                </a>
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: 16, fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>
          Tax estimates are for planning purposes only — not tax advice, not a
          filed return. Your actual tax situation may differ.
        </p>
      </div>
    </main>
  )
}
