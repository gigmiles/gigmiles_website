import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'
import { calcRealNet, parseCalcParams } from '@/lib/calculatorMath'

// Dynamic share card for a /calculator result.
//
// The self-perpetuating loop: a driver runs their numbers → shares the URL
// (which already carries the inputs as ?g=&mi=&h=&v=&r=) → the link unfurls as
// a card showing THEIR result → someone else clicks → runs their own numbers.
//
// Why a route handler instead of calculator/opengraph-image.tsx: Next's
// file-based OG convention receives route params only, never the query string,
// so it structurally cannot render a per-result card. generateMetadata DOES get
// searchParams, so the page points its og:image here. (File-based metadata also
// outranks generateMetadata, which is why calculator/opengraph-image.tsx had to
// be deleted rather than kept as a fallback — it would have won every time.)
//
// The math is imported, never re-implemented: the card and the page cannot
// disagree about a number that is about to be screenshotted.

// Node runtime, not edge: the brand font is read off disk (same approach as the
// static OG cards), and `fs` doesn't exist on edge. Read once per cold start.
const FONTS = [
  { name: 'Outfit', weight: 900 as const, style: 'normal' as const, data: readFileSync(join(process.cwd(), 'public/brand/fonts/Outfit-Black.ttf')) },
  { name: 'Outfit', weight: 500 as const, style: 'normal' as const, data: readFileSync(join(process.cwd(), 'public/brand/fonts/Outfit-Medium.ttf')) },
]

const W = 1200
const H = 630

const MINT = '#5EEAD4'
const GREEN = '#10B981'
const INK = 'rgba(255,255,255,0.92)'
const MUTED = 'rgba(255,255,255,0.55)'
const FAINT = 'rgba(255,255,255,0.12)'
const BG = 'linear-gradient(to bottom right, #0E4F4F, #0A3C3C)'

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams

  // Parsed by the SAME function the page uses, so a shared link can never
  // advertise a number the page then contradicts. Out-of-range input resolves
  // to the default on both sides rather than to a ceiling here and a default
  // there — the divergence this route shipped with.
  const { gross, miles, hours, vehicle, costPerMile } = parseCalcParams(sp)

  // A result card needs a result: bare /calculator gets the generic card, but
  // any calc param present means the page WILL show a result (garbage values
  // included, which resolve to the defaults on both sides).
  const hasResult = ['g', 'mi', 'h', 'v', 'r'].some(k => sp.has(k)) && gross > 0

  if (!hasResult) {
    // Deliberately carries NO example numbers. The canonical set ($235 → $175)
    // comes from the app's actual-cost model and cannot be reproduced by this
    // page's IRS-rate math ($235/105mi resolves to ~$133 here), so printing it
    // would send anyone who typed those inputs to a different answer and make
    // the tool look broken. Inventing a different pair is barred by
    // GIGMILES_CANONICAL_NUMBERS rule 1. No number is the honest third option.
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: BG, fontFamily: 'Outfit', padding: '0 76px' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 900, color: MINT, letterSpacing: '-1.5px', marginBottom: 40 }}>
            gigmiles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 82, fontWeight: 800, color: INK, letterSpacing: '-3px', lineHeight: 1.06 }}>
            <span>What do you</span>
            <span>actually keep?</span>
          </div>
          <div style={{ display: 'flex', fontSize: 27, color: MUTED, marginTop: 26 }}>
            Gross pay, minus miles, fuel and estimated taxes.
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: MINT, marginTop: 44 }}>
            gigmiles.app/calculator
          </div>
        </div>
      ),
      { width: W, height: H, fonts: FONTS },
    )
  }

  const r = calcRealNet({ gross, miles, hours, vehicle, costPerMile })
  const pctKept = Math.round(r.pctKept * 100)

  const context = [
    `${Math.round(miles).toLocaleString('en-US')} mi`,
    hours > 0 ? `${hours} hrs` : null,
    vehicle === 'ebike' ? 'e-bike' : null,
  ].filter(Boolean).join(' · ')

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: BG, fontFamily: 'Outfit', padding: '0 76px' }}>
        {/* wordmark + the inputs, so the card is self-explanatory out of context */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, color: MINT, letterSpacing: '-1.4px' }}>
            gigmiles
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: MUTED, letterSpacing: '1px' }}>
            {context}
          </div>
        </div>

        {/* The contrast IS the story. Phrasing per the approved canonical
            usage pattern ("$235 on the screen … in your pocket"). */}
        <div style={{ display: 'flex', flexDirection: 'column', letterSpacing: '-3.5px', lineHeight: 1.04 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 88, fontWeight: 800, color: MUTED }}>{money(gross)}</span>
            <span style={{ fontSize: 34, fontWeight: 500, color: MUTED, letterSpacing: '-0.5px' }}>on the app.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 128, fontWeight: 800, color: GREEN }}>{money(r.net)}</span>
            <span style={{ fontSize: 34, fontWeight: 500, color: INK, letterSpacing: '-0.5px' }}>in your pocket.</span>
          </div>
        </div>

        {/* Never "tax owed" — this is a planning set-aside, not a liability. */}
        <div style={{ display: 'flex', fontSize: 25, color: MUTED, marginTop: 30 }}>
          {`−${money(r.vehicleCost)} vehicle costs   ·   −${money(r.seTax)} est. tax set-aside   ·   ${pctKept}% kept`}
        </div>

        <div style={{ display: 'flex', width: '100%', height: 1, background: FAINT, marginTop: 30, marginBottom: 24 }} />

        {/* The pull to the app. The honest hook IS the sales pitch: this figure
            used a default car, so the viewer's own number is genuinely
            different — and only the app can close that gap. Claims limited to
            PRODUCT_FACTS-verified personalization (vehicle DB, state tax/fuel,
            filing status). No privacy/security claim: PRODUCT_FACTS documents
            none, and this card is public. */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 27, fontWeight: 900, color: INK, letterSpacing: '-0.5px' }}>
              {vehicle === 'car'
                ? 'This used an average car. Yours isn’t average.'
                : 'This used default bike costs. Yours are different.'}
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: MUTED, marginTop: 8 }}>
              {vehicle === 'car'
                ? 'GigMiles runs it on your exact vehicle, your state and your filing status.'
                : 'GigMiles runs it on your bike’s real efficiency, your state and your filing status.'}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 25, fontWeight: 900, color: MINT }}>gigmiles.app</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: FONTS },
  )
}
