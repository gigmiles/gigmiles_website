import {DownloadButton} from '@/components/ui/DownloadButton'
import {PersonalizationStory} from './PersonalizationStory'
import {ProductShowcase} from './ProductShowcase'
import {CalculatorEntry} from './CalculatorEntry'
import {TrustStrip} from './TrustStrip'
import {EstimateProof} from './EstimateProof'
import {PlanTable} from './PlanTable'
import {FeatureTour,type TourScreen} from './FeatureTour'
import {StickyCta} from './StickyCta'
import {RevealObserver} from './RevealObserver'
import {ArrowUpRight, ArrowDown} from './Glyph'
import './home-flow.css'
import './home-v2.css'

// Feature-tour stops. Images are the four offline captures of the real,
// unmodified Flutter screens with the canonical creative inputs ($235 gross,
// 8.0 h, 105.0 mi, 2023 Toyota Prius, CA); the engine-derived figures were
// approved as the website-only exception WEB-TOUR-1 (2026-09-02). Alt text
// states the visible figures and that they are example inputs, not a
// customer's earnings.
export const TOUR_SCREENS: TourScreen[] = [
  {id:'home',tag:'FREE',figure:{value:192,prefix:'$',caption:'Net this week, from $235 gross'},title:'Today’s number, after costs',body:'Net after vehicle costs and an estimated tax set-aside, for today and this week.',image:'tour-home.webp',alt:'Example GigMiles home screen: Net Income $192 for the week of Aug 31 to Sep 6, from $235 gross and $43 estimated costs; 105.0 miles, 8 hours, 1 trip, $24 per hour. Example inputs on a 2023 Toyota Prius in California, not a customer’s earnings.'},
  {id:'shifts',tag:'FREE',figure:{value:105,suffix:' mi',decimals:1,caption:'8 hours logged on Aug 31'},title:'Each shift, on record',body:'Hours and miles by day, with what you earned. Edit a shift, add one you forgot, undo a delete.',image:'tour-shifts.webp',alt:'Example shift history: Monday Aug 31, gross $235.00, net $191.90, 105.0 miles, 8 hours, a manual entry in CA. Example inputs, not a customer’s earnings.'},
  {id:'tax',tag:'FREE · EXPORT IS PRO',figure:{value:23,prefix:'$',caption:'Estimated tax to set aside, Q3 2026'},title:'Tax center, on screen',body:'Self-employment, federal and state estimates with a Schedule C worksheet. PDF and CSV export for your tax professional is Pro.',image:'tour-tax.webp',alt:'Example tax estimate breakdown for Q3 2026: estimated tax for preparation $23 (self-employment $22, federal $0, state $1) on $235 gross with an $80 mileage deduction, single filer. Estimates only, not tax advice.'},
  {id:'insights',tag:'PRO',figure:{value:24,prefix:'$',suffix:'/hr',caption:'Profit per hour this week'},title:'Insights by platform',body:'Dollars per hour and per mile by platform, trend charts and a what-if mileage simulator.',image:'tour-insights.webp',alt:'Example Insights screen (Pro): monthly profit trend with $235 gross and about $192 net in August, and a profit-per-hour and per-mile trend. Example inputs, not a customer’s earnings.'},
]
// Approved 2026-08-30 preview, transcribed into native React markup.
export function ApprovedHome({heroMode='timed',variant='live'}:{heroMode?:'timed'|'scroll';variant?:'live'|'v2'}){const v2=variant==='v2';return <>

<section className={'hero wrap'+(heroMode==='scroll'?' hero-scroll':'')} aria-labelledby="headline">

<div className="intro">
<p className="eyebrow">
{"NET PROFIT TRACKER FOR GIG DRIVERS"}
</p>
<h1 id="headline">
{"Your gig."}
<br  />
{"Your details."}
<br  />
<span>
{"Your estimate."}
</span>
</h1>
<p className="lead">
{"Your vehicle. Your state."}
<br  />
{"Your day job, too."}
</p>
<p className="sub">
{"Track earnings, miles and expenses. See estimated net profit after vehicle costs and taxes."}
</p>
<div className="actions">
<DownloadButton className="button conversion-cta" data-cta-placement="hero">
{"Get GigMiles — free "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</DownloadButton>
<a className="text-link" href="#details">
{"See how it works "}
<span aria-hidden="true" className="glyph"><ArrowDown/></span>
</a>
</div>
<p className="confidence">
{"Free core. "}
<span>
{"No card. No ads."}
</span>
</p>
<p className="pro-clarity">
{"Optional Pro upgrades."}
</p>
<p className="legal">
{"Estimates for planning. Not tax advice."}
</p>
</div>

<PersonalizationStory mode={heroMode}>

<div className="stage" id="stage">

<section className="scene vehicle active" id="scene-0" aria-labelledby="vehicle-title">
<img className="driver" src="/editorial/driver.webp" alt="Illustrative synthetic driver scene, not a customer testimonial" width="768" height="1376" decoding="async" loading="eager" fetchPriority="high" />
<div className="shade">

</div>
<div className="scene-top">
<span>
{"THE DETAILS MAKE IT YOURS"}
</span>
<span>
{"01 / 03"}
</span>
</div>
<div className="vehicle-label">
{"VEHICLE CONTEXT"}
<span>
{"Year · model · energy type"}
</span>
</div>
<div className="scene-bottom">
<p className="eyebrow">
{"WHAT YOU DRIVE MATTERS"}
</p>
<h2 id="vehicle-title">
{"Not every mile"}
<br  />
{"costs the same."}
</h2>
<div className="cause">
<span>
{"Your vehicle"}
</span>
<b aria-hidden="true">
{"→"}
</b>
<span>
{"Fuel, energy"}
<br  />
{"& wear estimates"}
</span>
</div>
</div>
</section>

<section className="scene state photo-scene" id="scene-1" aria-labelledby="state-title" hidden={true}>

<img className="context-photo" src="/editorial/state.webp" alt="Illustrative AI-generated American city at dusk, not a specific state" width="1000" height="1250" decoding="async" loading="eager" fetchPriority="low" />
<div className="context-shade">

</div>

<div className="scene-top">
<span>
{"LOCATION IS CONTEXT"}
</span>
<span>
{"02 / 03"}
</span>
</div>

<div className="context-content">
<p className="state-flag">
{"YOUR STATE"}
</p>
<h2 id="state-title">
{"Where you drive"}
<br  />
{"belongs in the picture."}
</h2>

<div className="state-relations">
<div>
<span className="dot" aria-hidden="true">

</span>
<strong>
{"Area energy prices"}
</strong>
<p>
{"Regional fuel & state electricity data."}
</p>
</div>
<div>
<span className="dot" aria-hidden="true">

</span>
<strong>
{"State tax estimates"}
</strong>
<p>
{"State context for your tax estimate."}
</p>
</div>
</div>

<p className="scene-footnote">
{"Area data, not the exact price at your pump."}
</p>
</div>
</section>

<section className="scene job photo-scene" id="scene-2" aria-labelledby="job-title" hidden={true}>

<img className="context-photo" src="/editorial/day-job.webp" alt="Illustrative AI-generated closed work laptop beside a clearly visible insulated food delivery bag, blank badge and keys" width="1000" height="667" decoding="async" loading="eager" fetchPriority="low" />
<div className="context-shade">

</div>

<div className="scene-top">
<span>
{"THE LIFE AROUND YOUR GIG"}
</span>
<span>
{"03 / 03"}
</span>
</div>

<div className="context-content">
<p className="optional">
{"OPTIONAL CONTEXT"}
</p>
<h2 id="job-title">
{"A day job, "}
<em>
{"too?"}
</em>
</h2>

<p className="job-copy">
{"W-2 income you enter helps inform"}
<br  />
{"your gig tax estimate."}
</p>

<div className="widget">
<img src="/editorial/w2.webp" width="460" height="130" alt="Archived GigMiles Flutter component: Other Income (Optional), with Yes, No and Skip choices" decoding="async" loading="lazy" />
</div>

<p className="scene-footnote">
{"Tax context. Not a vehicle expense."}
</p>
</div>
</section>

<section className="scene finish" id="scene-3" aria-labelledby="finish-title" hidden={true}>
<div className="scene-top">
<span>
{"YOUR DETAILS, CONNECTED"}
</span>
<span>
{"GIGMILES"}
</span>
</div>
<p className="eyebrow">
{"A MORE PERSONAL PICTURE"}
</p>
<h2 id="finish-title">
{"Built around"}
<br  />
{"what you enter."}
</h2>
<div className="finish-row">
<span>
{"Vehicle + area prices"}
</span>
<b aria-hidden="true">
{"→"}
</b>
<strong>
{"Running costs"}
</strong>
</div>
<div className="finish-row">
<span>
{"State + optional W-2"}
</span>
<b aria-hidden="true">
{"→"}
</b>
<strong>
{"Tax estimates"}
</strong>
</div>
<p className="finish-note">
{"Your miles, earnings and expenses"}
<br  />
{"bring the records together."}
</p>
</section>

</div>

<div className="story-controls">
<div className="chapters" role="group" aria-label="Choose a story chapter">
<button type="button" data-scene="0" aria-pressed="true">
{"Your vehicle"}
</button>
<button type="button" data-scene="1" aria-pressed="false">
{"Your state"}
</button>
<button type="button" data-scene="2" aria-pressed="false">
{"Your day job"}
</button>
{heroMode==='scroll' && <button type="button" data-scene="3" aria-pressed="false">Together</button>}
</div>
{heroMode==='timed' && <button className="play" type="button" id="play" aria-label="Play story">
{"Play story"}
</button>}
</div>

<p className="story-note" id="story-status" aria-live="polite">
{"Explore each detail at your own pace."}
</p>

</PersonalizationStory>

</section>

<section className="bridge benefit-bridge">
<div className="wrap bridge-inner">
<p>
{"Know what"}
<br  />
<strong>
{"you actually keep."}
</strong>
</p>
<span>
{"Earnings, vehicle costs and estimated taxes."}
<br  />
{"A clearer picture of your work."}
</span>
<a href="#details" aria-label="Explore how your details inform the estimate"><span aria-hidden="true" className="glyph"><ArrowDown/></span></a>
</div>
</section>
{v2 && <TrustStrip/>}

<section className="details wrap home-details" id="details" aria-labelledby="details-title">
<div className="section-heading">
<p className="eyebrow">
{"LESS GUESSING. MORE CONTEXT."}
</p>
<h2 id="details-title">
{"The small details."}
<br  />
{"The bigger picture."}
</h2>
<p className="details-intro">
{"Your vehicle, location and optional day-job income give your estimates context."}
</p>
<CalculatorEntry />
</div>

<div className="detail-list">

<details open={true}>
<summary>
<span className="number">
{"01"}
</span>
<span>
{"Your vehicle"}
<strong>
{"More than a mileage count."}
</strong>
</span>
<span className="expand" aria-hidden="true">
{"+"}
</span>
</summary>
<div className="detail-body">
<p>
{"Vehicle details and energy type help shape modeled fuel, electricity and wear costs. Your recorded miles give those estimates context."}
</p>
<div className="tags">
<span>
{"Vehicle details"}
</span>
<span>
{"Energy type"}
</span>
<span>
{"Recorded miles"}
</span>
</div>
<p className="small">
{"For cars and e-bikes, with different cost models. Estimates are not a measurement of actual mechanical wear."}
</p>
</div>
</details>

<details>
<summary>
<span className="number">
{"02"}
</span>
<span>
{"Your state"}
<strong>
{"Location changes the context."}
</strong>
</span>
<span className="expand" aria-hidden="true">
{"+"}
</span>
</summary>
<div className="detail-body">
<p>
{"Your state informs area energy-price data and estimated state tax. Those are two different inputs—not one fixed cost applied to every driver."}
</p>
<p className="small">
{"Fuel data is regional; electricity data is state-based where available. Defaults may be used when data is unavailable. These are not exact pump prices or final tax amounts."}
</p>
</div>
</details>

<details>
<summary>
<span className="number">
{"03"}
</span>
<span>
{"Your day job"}
<strong>
{"Your gig isn't always your only income."}
</strong>
</span>
<span className="expand" aria-hidden="true">
{"+"}
</span>
</summary>
<div className="detail-body">
<p>
{"If you have W-2 income, you can include an amount or income range in the app. That optional context, along with filing status, informs the gig tax estimate."}
</p>
<p className="small">
{"Choosing Yes alone doesn't supply an income amount. GigMiles doesn't automatically know your salary or complete financial situation. A range uses an approximate amount."}
</p>
</div>
</details>

</div>

</section>

{v2 && <EstimateProof interactive/>}
<ProductShowcase />
{v2 && <FeatureTour screens={TOUR_SCREENS} heading={<>See it on your phone.<br/><span>Before you download.</span></>}/>}
<section className="free-section wrap" id="free" aria-labelledby="free-title">
<div className="free-heading">
<p className="eyebrow">
{"START WITH WHAT YOU NEED"}
</p>
<h2 id="free-title">
{"Free to start."}
<br  />
<em>
{"Free to keep using."}
</em>
</h2>
<p>
{"The core stays free."}
<br  />
{"Pro is an option, not the starting line."}
</p>
<DownloadButton className="button conversion-cta" data-cta-placement="free-core">
{"Get GigMiles — free "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</DownloadButton>
<p className="confidence">
{"No card. No ads."}
</p>
</div>
{v2 ? <PlanTable/> : <div className="plan-details">
<div className="core-label">
<span>
{"GIGMILES FREE"}
</span>
<span>
{"YOUR EVERYDAY ESSENTIALS"}
</span>
</div>
<ul className="free-features">
<li>
<strong>
{"Log the work."}
</strong>
<span>
{"Manual earnings, mileage and expense records."}
</span>
</li>
<li>
<strong>
{"See your estimates."}
</strong>
<span>
{"Vehicle costs and estimated net profit."}
</span>
</li>
<li>
<strong>
{"Keep the week in view."}
</strong>
<span>
{"Today and this week, with your records together."}
</span>
</li>
</ul>
<div className="pro-note">
<p className="eyebrow">
{"WANT MORE AUTOMATION?"}
</p>
<h3>
{"That's where Pro comes in."}
</h3>
<p>
{"Automatic GPS tracking and PDF/CSV export for your tax professional are Pro features."}
</p>
</div>
</div>}
</section>

<section className="faq wrap home-faq" id="questions" aria-labelledby="questions-title" data-reveal="">
<div className="faq-heading">
<p className="eyebrow">
{"GOOD TO KNOW"}
</p>
<h2 id="questions-title">
{"A clearer picture."}
<br  />
{"Not a final tax answer."}
</h2>
</div>
<div className="faq-list">
<details>
<summary>
{"What can I use for free?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"Manual earnings, mileage and expense records, cost estimates and your today/this-week view are part of the free core. No card is required. Pro adds optional features such as automatic GPS tracking and PDF/CSV export."}
</p>
</details>
<details>
<summary>
{"Does it work for cars and e-bikes?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"Yes. GigMiles uses different cost models: fuel or energy and wear for your vehicle, and electricity plus battery and mechanical wear for e-bikes."}
</p>
</details>
<details>
<summary>
{"Do I need a W-2 job to use GigMiles?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"No. W-2 income is optional. If you don't provide it, the estimate doesn't include that day-job income."}
</p>
</details>
<details>
<summary>
{"Does GigMiles know my exact taxes?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"No. Estimates depend on the information you enter and the model's assumptions. Your actual tax situation may differ. GigMiles is a planning and records tool, not a tax-filing service."}
</p>
</details>
{v2 && <>
<details>
<summary>
{"What does an e-bike shift cost?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"GigMiles models e-bike costs as electricity (about 25 miles per kWh at your electricity price) plus battery and mechanical wear of about 5 cents per mile. E-bikes have no IRS standard mileage rate, so the app uses the actual-expense method."}
</p>
</details>
<details>
<summary>
{"What happens to my data?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"Analytics and ad measurement are consent-gated. Receipt scan runs on your phone. You can delete your account in the app, and personal data is permanently deleted within 30 days."}
</p>
</details>
</>}
</div>
</section>

<section className="wrap home-journal" aria-labelledby="journal-entry-title" data-reveal="">
<div>
<p className="eyebrow">THE GIGMILES JOURNAL</p>
<h2 id="journal-entry-title">Good questions. Clearer answers.</h2>
<p className="journal-summary">Practical guides to vehicle costs, keeping records and choosing the right tool.</p>
</div>
<a href="/blog">Read the guides <span aria-hidden="true" className="glyph"><ArrowUpRight/></span></a>
</section>
<section className="download conversion-close" id="download">
<div className="wrap" data-reveal="">
<p className="eyebrow">
{"YOUR NEXT SHIFT. A CLEARER PICTURE."}
</p>
<h2>
{"Stop guessing."}
<br  />
<em>
{"Start with your next shift."}
</em>
</h2>
<p>
{"Bring your earnings, costs and records together."}
</p>
<DownloadButton className="button conversion-cta on-paper" data-cta-placement="closing">
{"Get GigMiles — free "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</DownloadButton>
<p className="close-trust">
{"Free core · No card · No ads"}
</p>
<p className="close-small">
{"Optional Pro upgrades. Estimates for planning, not tax advice."}
</p>
</div>
</section>

{v2 && <StickyCta/>}
{v2 && <RevealObserver/>}
</>}
