'use client'

import {useEffect, useRef} from 'react'
import type {TourScreen} from '@/components/editorial/FeatureTour'
import {DownloadButton} from '@/components/ui/DownloadButton'
import {CtaLabel} from '@/components/ui/CtaLabel'
import {installDeck} from './deck'

// The four approved captures as a pinned deck. Server-rendered complete: on a
// narrow viewport, under reduced motion and with no JavaScript the cards are a
// plain vertical list, which is also what a screen reader walks. The deck
// grammar is an enhancement the controller adds on top.

const GROUNDS = ['#0f3b30', '#174a3b', '#205a46', '#2a6b52']

// The cards carry the capture, a title, one sentence and, where one is
// approved, a figure. They used to carry three or four proof bullets each as
// well; with the plan table's seventeen the page ran to forty-six bullet
// points below the film and read as a feature grid. The proofs live in the
// captures now, which is where a visitor looks anyway. The figures hook stays
// for a card that earns one later.
interface DeckExtra { figures?: Array<{value: string; unit?: string; caption: string}> }
const EXTRAS: Record<string, DeckExtra> = {}

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
              {/* "FREE" is not a feature of a card; the offer was made on the
                  first screen. Only a Pro note is worth a label here. */}
              {screen.tag.replace(/^FREE(\s*·\s*)?/, '') && <span className="deck-tag">{screen.tag.replace(/^FREE(\s*·\s*)?/, '')}</span>}
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
                <DownloadButton className="button conversion-cta deck-cta" data-cta-placement={`deck-${screen.id}`}><CtaLabel label={null}/></DownloadButton>
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
