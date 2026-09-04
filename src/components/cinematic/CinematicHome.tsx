import {DownloadButton} from '@/components/ui/DownloadButton'
import {CtaLabel} from '@/components/ui/CtaLabel'
import {TOUR_SCREENS} from '@/components/editorial/ApprovedHome'
import {EstimateProof} from '@/components/editorial/EstimateProof'
import {PlanTable} from '@/components/editorial/PlanTable'
import {CINEMATIC_ASSETS} from './cinematic-cues'
import {HomeFaq} from '@/components/editorial/HomeFaq'
import {RevealObserver} from '@/components/editorial/RevealObserver'
import {StickyCta} from '@/components/editorial/StickyCta'
import {TrustStrip} from '@/components/editorial/TrustStrip'
import '@/components/editorial/home-v2.css'
import '@/components/editorial/home-flow.css'
import './cinematic.css'
import './deck.css'
import {CinematicHero} from './CinematicHero'
import {PlatesHero} from './PlatesHero'
import {TourDeck} from './TourDeck'
import type {P1Variant} from './plate-cues'

// Cinematic home: the film stage, then the paper hand-off, then the live
// sections in the order a driver meets them (how the estimate is built, the
// app on a phone, free versus Pro, the close). Copy below the film is the
// approved live copy, verbatim, minus the eyebrows the taste rules cap.
export function CinematicHome({variant = 'film', plateVariant}: {variant?: 'film' | 'plates'; plateVariant?: P1Variant}) {
  return <div className="cine-page">
    {variant === 'plates' ? <PlatesHero variant={plateVariant}/> : <CinematicHero layout="portrait"/>}

    <div className="cine-body">
    <section className="cine-after" aria-labelledby="cine-after-title">
      <div className="wrap cine-after-inner">
        <div>
          <h2 id="cine-after-title">Know what<br/><span>you actually keep.</span></h2>
          <p className="cine-after-lead">Earnings, vehicle costs and estimated taxes.<br/>A clearer picture of your work.</p>
        </div>
        <TrustStrip tone="product"/>
      </div>
    </section>

    <EstimateProof interactive/>

    {/* One paragraph and no cards: the film's argument in prose, between the
        calculator that just proved it and the deck that shows the app. Every
        clause but the last is an approved line from the film, the trust strip
        or the closing; the last clause is a draft for the operator. */}
    <section className="cine-essay" aria-label="What the number means">
      <div className="wrap">
        <p>The screen shows gross. It never shows what the drive cost you. Fuel, wear and an estimated tax set-aside come out first, and what is left depends on your vehicle, your state and an optional day job. <strong>GigMiles keeps those details together, so the number on your phone is the one you actually keep.</strong></p>
      </div>
    </section>

    <TourDeck screens={TOUR_SCREENS} heading={<>See it on your phone.<br/><span>Before you download.</span></>}/>

    <section className="free-section wrap" id="free" aria-labelledby="free-title">
      <div className="free-heading">
        <h2 id="free-title">Free to start.<br/><em>Free to keep using.</em></h2>
        <p>The core stays free.<br/>Pro is an option, not the starting line.</p>
        <DownloadButton className="button conversion-cta" data-cta-placement="cinematic-free"><CtaLabel/></DownloadButton>
        <p className="confidence">No card. No ads.</p>
      </div>
      <PlanTable/>
    </section>

    {/* The approved questions ride along: the film hero is shorter than the
        page it replaces, and these are the answers search actually reads. */}
    <HomeFaq variant="v2"/>

    {/* The page ends where the film ended: the same rear seat at dawn, the
        same dark phone, with the offer beside it. */}
    <section className="cine-bookend" id="download" aria-labelledby="bookend-title">
      <div className="wrap cine-bookend-inner">
        <figure className="cine-bookend-frame" data-reveal="">
          <img src={CINEMATIC_ASSETS.last} width={900} height={1603} alt="The rear seat at dawn, from the end of the film: the delivery bag, a key, a receipt and a phone." loading="lazy" decoding="async"/>
        </figure>
        <div className="cine-bookend-copy" data-reveal="" style={{'--d': '120ms'} as React.CSSProperties}>
          <h2 id="bookend-title">Stop guessing.<br/><em>Start with your next shift.</em></h2>
          <p>Bring your earnings, costs and records together.</p>
          <DownloadButton className="button conversion-cta on-paper" data-cta-placement="cinematic-closing"><CtaLabel/></DownloadButton>
          <p className="close-trust">Free core · No card · No ads</p>
          <p className="close-small">Optional Pro upgrades. Estimates for planning, not tax advice.</p>
        </div>
      </div>
    </section>

    </div>

    <StickyCta heroSelector="#cine-hero"/>
    <RevealObserver/>
  </div>
}
