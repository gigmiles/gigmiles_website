import { ImageResponse } from 'next/og'

// Static OG card for /ebike — generated once at build time.
export const dynamic = 'force-static'

export const alt = 'E-Bike Delivery Cost Calculator — What Couriers Actually Spend Per Mile'
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
          gap: 24,
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
        {/* The contrast: bike cost vs the IRS car rate */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 22,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: '-4px',
          }}
        >
          <span style={{ color: '#10B981' }}>~6¢</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 40 }}>/ mile, not</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>72.5¢</span>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          The real cost of delivering on an e-bike
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
          Electricity · Battery · Wear
        </div>
      </div>
    ),
    { ...size },
  )
}
