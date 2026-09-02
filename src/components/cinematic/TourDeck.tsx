'use client'

import {useEffect, useRef} from 'react'
import type {TourScreen} from '@/components/editorial/FeatureTour'
import {DownloadButton} from '@/components/ui/DownloadButton'
import {ArrowUpRight} from '@/components/editorial/Glyph'
import {installDeck} from './deck'

// The four approved captures as a pinned deck. Server-rendered complete: on a
// narrow viewport, under reduced motion and with no JavaScript the cards are a
// plain vertical list, which is also what a screen reader walks. The deck
// grammar is an enhancement the controller adds on top.

const GROUNDS = ['#0f3b30', '#174a3b', '#205a46', '#2a6b52']

// What each card adds beyond the capture. The deck is where the product is
// argued, so every card carries its own proofs and the Pro card carries the
// most: it is the one asking for money. Every line is verifiable in
// GIGMILES_PRODUCT_FACTS.md, and the two Insights figures are the approved
// WEB-TOUR-1 outputs ($24 per hour, $1.8 per mile) from the same example shift
// the rest of the page uses. No per-platform figures are shown: the app
// compares platforms, but we have no approved numbers for individual ones.
interface DeckExtra { figures?: Array<{value: string; unit?: string; caption: string}>; bullets: string[] }
const EXTRAS: Record<string, DeckExtra> = {
  home: {bullets: ['Today and this week, after costs', 'Live fuel prices for your state', 'Home-screen widget on iOS and Android']},
  shifts: {bullets: ['Timer shifts or manual entry', 'Edit a shift, add one you forgot, undo a delete', 'Day and week history']},
  tax: {bullets: ['Self-employment, federal and state, worked separately', 'Schedule C worksheet on screen', 'PDF and CSV export for your tax professional (Pro)']},
  insights: {
    figures: [{value: '$24', unit: '/hr', caption: 'Profit per hour'}, {value: '$1.8', unit: '/mi', caption: 'Profit per mile'}],
    bullets: ['Earnings, hours, miles and net for every platform you work', 'Trend charts by week, month and quarter', 'What-if mileage simulator', 'Standard mileage against actual expenses, side by side'],
  },
}

export function TourDeck({screens, heading}: {screens: TourScreen[]; heading: React.ReactNode}) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    return installDeck(root)
  }, [])

  return <section className="deck" id="tour" data-deck="static" ref={rootRef} aria-labelledby="deck-title">
    <div className="deck-stage">
      <div className="wrap deck-inner">
        <h2 id="deck-title" className="deck-heading">{heading}</h2>
        <div className="deck-cards">
          {screens.map((screen, i) => <article
            key={screen.id}
            className="deck-card"
            data-card={screen.id}
            style={{'--ground': GROUNDS[i] ?? GROUNDS[GROUNDS.length - 1], '--z': String(screens.length - i)} as React.CSSProperties}
          >
            <div className="deck-head">
              <span className="deck-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="deck-tag">{screen.tag}</span>
            </div>
            <div className="deck-body">
              <div className="deck-copy">
                <h3 className="deck-title">{screen.title}</h3>
                <p className="deck-text">{screen.body}</p>
                {EXTRAS[screen.id]?.figures
                  ? <div className="deck-figures">
                      {EXTRAS[screen.id].figures!.map(f => <p key={f.caption} className="deck-figure">
                        <strong>{f.value}<i>{f.unit}</i></strong>
                        <span>{f.caption}</span>
                      </p>)}
                    </div>
                  : screen.figure && <p className="deck-figure">
                      <strong>{screen.figure.prefix ?? ''}{screen.figure.value.toLocaleString('en-US', {minimumFractionDigits: screen.figure.decimals ?? 0, maximumFractionDigits: screen.figure.decimals ?? 0})}{screen.figure.suffix ?? ''}</strong>
                      <span>{screen.figure.caption}</span>
                    </p>}
                {EXTRAS[screen.id] && <ul className="deck-bullets">
                  {EXTRAS[screen.id].bullets.map(b => <li key={b}>{b}</li>)}
                </ul>}
                <DownloadButton className="button conversion-cta deck-cta" data-cta-placement={`deck-${screen.id}`}>
                  Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
                </DownloadButton>
              </div>
              <div className="deck-media">
                {screen.image
                  ? <img src={`/editorial/${screen.image}`} alt={screen.alt ?? ''} width={780} height={1560} loading="lazy" decoding="async"/>
                  : <span className="deck-placeholder" aria-hidden="true"/>}
              </div>
            </div>
          </article>)}
        </div>
        <p className="deck-note">Example inputs on an example vehicle. Not a customer&rsquo;s earnings.</p>
      </div>
    </div>
  </section>
}
