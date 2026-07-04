import { ImageResponse } from 'next/og'

// Static OG card for /calculator — generated once at build time.
export const dynamic = 'force-static'

export const alt = 'Gig Driver Net Income Calculator — What You Actually Keep'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const teal = '#0E4F4F'
const tealDeep = '#0A3C3C'
const mint = '#5EEAD4'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to bottom right, ${teal}, ${tealDeep})`,
          fontFamily: 'sans-serif',
          gap: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 900,
            fontStyle: 'italic',
            color: mint,
            letterSpacing: '-2px',
          }}
        >
          gigmiles
        </div>
        {/* The receipt line — the page's thesis as numbers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: '-4px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>$235</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 56 }}>→</span>
          <span style={{ color: '#10B981' }}>$121</span>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: '0px',
          }}
        >
          Gig Driver Net Income Calculator
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: mint,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          What you actually keep
        </div>
      </div>
    ),
    { ...size },
  )
}
