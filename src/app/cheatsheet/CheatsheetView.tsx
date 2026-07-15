/**
 * CheatsheetView — the cheat-sheet rendered as native, mobile-friendly HTML
 * so a visitor can read it inline without downloading anything. Same content
 * as the PDF (public/downloads/GigMiles_Cheat_Sheet_2026.pdf); canonical
 * numbers and approved tax language only. Shown on the /cheatsheet success
 * state; the PDF download stays as an optional "keep it" action.
 */

const TEAL = '#0E4F4F'
const MINT = '#5EEAD4'
const GOLD = '#FFC83D'
const INK = '#0F172A'
const BODY = '#334155'
const BORDER = '#E2E8F0'
const SURFACE = '#F8FAFC'
const OUTFIT = 'var(--font-outfit), system-ui, sans-serif'

function Card({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#22C58B',
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <h3
          style={{
            fontFamily: OUTFIT,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: TEAL,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

const CHECKLIST = [
  ['Log shift time', 'exact start and end.'],
  ['Track all miles', 'odometer at start and end of every session.'],
  ['Fuel purchases', 'keep every fill-up receipt.'],
  ['Parking & tolls', 'record every fee paid while working.'],
  ['Phone & accessories', 'mounts, chargers, data used for work.'],
  ['Platform fees', 'note what each app withholds.'],
]

export function CheatsheetView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: BODY, fontSize: 13.5, lineHeight: 1.45 }}>
      <Card n="1" title="Daily Tracking Checklist">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {CHECKLIST.map(([b, rest]) => (
            <li key={b} style={{ padding: '4px 0 4px 22px', position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  border: '1.6px solid #22C58B',
                }}
              />
              <b style={{ color: INK }}>{b}</b> — {rest}
            </li>
          ))}
        </ul>
      </Card>

      <Card n="2" title="Know Your Per-Mile Cost">
        <p style={{ margin: '0 0 6px' }}>
          Your car costs money every mile — knowing the number helps you pick profitable shifts.
        </p>
        <p style={{ margin: '0 0 6px' }}>
          <b style={{ color: INK }}>Wear &amp; tear:</b> base $0.15/mi, adjusted for your car (+$0.07 luxury, −$0.03
          high-resale, age-adjusted; leased = $0 wear).
        </p>
        <p style={{ margin: 0 }}>
          <b style={{ color: INK }}>Fuel:</b> your car&apos;s real MPG (auto-filled from FuelEconomy.gov) at live
          state gas prices.
        </p>
      </Card>

      <div style={{ background: TEAL, borderRadius: 12, padding: '16px 18px', color: '#eafffa' }}>
        <h3
          style={{
            fontFamily: OUTFIT,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: MINT,
            margin: '0 0 10px',
          }}
        >
          Example Shift — What You Actually Kept
        </h3>
        {[
          ['Gross earnings', '$235'],
          ['Vehicle costs (fuel + wear, combined)', '−$43'],
          ['Estimated tax set-aside', '−$17'],
        ].map(([l, v]) => (
          <div
            key={l}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13.5,
              padding: '4px 0',
              borderBottom: '1px solid rgba(94,234,212,0.18)',
            }}
          >
            <span style={{ color: '#bfe9e0' }}>{l}</span>
            <span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0 0' }}>
          <span style={{ color: GOLD, fontWeight: 800 }}>Net income (take-home)</span>
          <span style={{ color: GOLD, fontWeight: 800, fontSize: 15 }}>$175</span>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: MINT }}>105</div>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#bfe9e0' }}>
              miles driven
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: MINT }}>74%</div>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#bfe9e0' }}>
              of every gross dollar kept
            </div>
          </div>
        </div>
      </div>

      <Card n="3" title="Estimated Tax Set-Aside Habit">
        <p style={{ margin: '0 0 6px' }}>
          Put money aside for taxes all year — not just in April. Organized, estimated set-aside numbers based on what
          you enter become clean tax-season records.
        </p>
        <p style={{ margin: '0 0 6px' }}>
          Cleaner numbers for your tax professional mean a smoother season. Your actual tax situation may differ.
        </p>
        <p style={{ margin: 0, fontStyle: 'italic', fontSize: 12, color: '#64748B' }}>
          Always consult a licensed tax professional for personalized tax advice.
        </p>
      </Card>

      <Card n="4" title="Quarterly Rhythm">
        <p style={{ margin: '0 0 6px' }}>
          Don&apos;t wait until April. Every quarter: review your mileage log, match receipts to entries, and total
          what you set aside.
        </p>
        <p style={{ margin: 0 }}>
          Then hand clean numbers to your tax pro — organized records are the whole game.
        </p>
      </Card>

      <div
        style={{
          background: SURFACE,
          border: `1.5px solid ${BORDER}`,
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 13,
          color: INK,
        }}
      >
        <b>The GigMiles app tracks all of this automatically</b> — your exact car, your state, and your filing
        situation. Free forever — no card.
      </div>
    </div>
  )
}
