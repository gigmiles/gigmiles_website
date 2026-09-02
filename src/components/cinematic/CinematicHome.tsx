import {DownloadButton} from '@/components/ui/DownloadButton'
import {TOUR_SCREENS} from '@/components/editorial/ApprovedHome'
import {EstimateProof} from '@/components/editorial/EstimateProof'
import {FeatureTour} from '@/components/editorial/FeatureTour'
import {ArrowUpRight} from '@/components/editorial/Glyph'
import {PlanTable} from '@/components/editorial/PlanTable'
import {RevealObserver} from '@/components/editorial/RevealObserver'
import {StickyCta} from '@/components/editorial/StickyCta'
import {TrustStrip} from '@/components/editorial/TrustStrip'
import '@/components/editorial/home-v2.css'
import '@/components/editorial/home-flow.css'
import './cinematic.css'
import {CinematicHero} from './CinematicHero'
import {PlatesHero} from './PlatesHero'

// Cinematic home: the film stage, then the paper hand-off, then the live
// sections in the order a driver meets them (how the estimate is built, the
// app on a phone, free versus Pro, the close). Copy below the film is the
// approved live copy, verbatim, minus the eyebrows the taste rules cap.
export function CinematicHome({variant = 'film'}: {variant?: 'film' | 'plates'}) {
  return <div className="cine-page">
    {variant === 'plates' ? <PlatesHero/> : <CinematicHero layout="portrait"/>}

    <div className="cine-body">
    <section className="cine-after" aria-labelledby="cine-after-title">
      <div className="wrap cine-after-inner">
        <div>
          <h2 id="cine-after-title">Know what<br/><span>you actually keep.</span></h2>
          <p className="cine-after-lead">Earnings, vehicle costs and estimated taxes.<br/>A clearer picture of your work.</p>
        </div>
        <TrustStrip/>
      </div>
    </section>

    <EstimateProof interactive/>

    <FeatureTour screens={TOUR_SCREENS} heading={<>See it on your phone.<br/><span>Before you download.</span></>}/>

    <section className="free-section wrap" id="free" aria-labelledby="free-title">
      <div className="free-heading">
        <h2 id="free-title">Free to start.<br/><em>Free to keep using.</em></h2>
        <p>The core stays free.<br/>Pro is an option, not the starting line.</p>
        <DownloadButton className="button conversion-cta" data-cta-placement="cinematic-free">
          Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
        </DownloadButton>
        <p className="confidence">No card. No ads.</p>
      </div>
      <PlanTable/>
    </section>

    <section className="download conversion-close" id="download">
      <div className="wrap" data-reveal="">
        <h2>Stop guessing.<br/><em>Start with your next shift.</em></h2>
        <p>Bring your earnings, costs and records together.</p>
        <DownloadButton className="button conversion-cta on-paper" data-cta-placement="cinematic-closing">
          Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
        </DownloadButton>
        <p className="close-trust">Free core · No card · No ads</p>
        <p className="close-small">Optional Pro upgrades. Estimates for planning, not tax advice.</p>
      </div>
    </section>

    </div>

    <StickyCta heroSelector="#cine-hero"/>
    <RevealObserver/>
  </div>
}
