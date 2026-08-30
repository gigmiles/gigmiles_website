import {DownloadButton} from '@/components/ui/DownloadButton'
import {PersonalizationStory} from './PersonalizationStory'
// Approved 2026-08-30 preview, transcribed into native React markup.
export function ApprovedHome(){return <>

<section className="hero wrap" aria-labelledby="headline">

<div className="intro">
<p className="eyebrow">
{"FOR GIG DRIVERS"}
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
<span aria-hidden="true">
{"↗"}
</span>
</DownloadButton>
<a className="text-link" href="#details">
{"See how it works "}
<span aria-hidden="true">
{"↓"}
</span>
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

<PersonalizationStory>

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

<img className="context-photo" src="/editorial/state.webp" alt="Illustrative AI-generated American city at dusk, not a specific state" width="1000" height="1250" decoding="async" loading="lazy" />
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

<img className="context-photo" src="/editorial/day-job.webp" alt="Illustrative AI-generated closed work laptop beside a clearly visible insulated food delivery bag, blank badge and keys" width="1000" height="667" decoding="async" loading="lazy" />
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
<img src="/editorial/w2.webp" width="460" height="1128" alt="Archived GigMiles Flutter component: Other Income (Optional), with Yes, No and Skip choices" decoding="async" loading="lazy" />
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
</div>
<button className="play" type="button" id="play" aria-label="Play story">
{"Play story"}
</button>
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
<a href="#details" aria-label="Explore how your details inform the estimate">
{"↓"}
</a>
</div>
</section>

<section className="details wrap" id="details" aria-labelledby="details-title">
<div className="section-heading">
<p className="eyebrow">
{"LESS GUESSING. MORE CONTEXT."}
</p>
<h2 id="details-title">
{"The small details."}
<br  />
{"The bigger picture."}
</h2>
<p>
{"No form to fill out here. Just a closer look at what informs the estimates in GigMiles."}
</p>
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

<section className="records">
<div className="wrap records-inner">
<div>
<p className="eyebrow">
{"BUILT FOR GIG WORKERS."}
</p>
<h2>
{"Your miles."}
<br  />
{"Your earnings."}
<br  />
{"Your expenses."}
</h2>
<p className="record-promise">
{"Less scattered. More in view."}
</p>
</div>
<div className="records-copy">
<p>
{"Your work, in one place."}
<br  />
{"Not another spreadsheet."}
</p>
<ol className="first-shift">
<li>
<strong>
{"Add your details."}
</strong>
<span>
{"Vehicle, state and optional day-job income."}
</span>
</li>
<li>
<strong>
{"Log your shift."}
</strong>
<span>
{"Record earnings, miles and expenses."}
</span>
</li>
<li>
<strong>
{"See the bigger picture."}
</strong>
<span>
{"Review your cost and tax estimates."}
</span>
</li>
</ol>
<DownloadButton className="button conversion-cta on-paper" data-cta-placement="records">
{"Get GigMiles — free "}
<span aria-hidden="true">
{"↗"}
</span>
</DownloadButton>
</div>
</div>
</section>
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
<span aria-hidden="true">
{"↗"}
</span>
</DownloadButton>
<p className="confidence">
{"No card. No ads."}
</p>
</div>
<div className="plan-details">
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
</div>
</section>

<section className="faq wrap" id="questions">
<p className="eyebrow">
{"GOOD TO KNOW"}
</p>
<h2>
{"A clearer picture."}
<br  />
{"Not a final tax answer."}
</h2>
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
<details>
<summary>
{"Can I try a calculation here?"}
<span aria-hidden="true">
{"+"}
</span>
</summary>
<p>
{"The hero explains the relationships between inputs. Our separate "}
<a href="/calculator">
{"web calculator"}
</a>
{" lets you try a simplified estimate, with its limits explained. It does not include state or W-2 personalization."}
</p>
</details>
</div>
</section>

<section className="wrap home-resources">
<p className="eyebrow">
{"EXPLORE A LITTLE FURTHER"}
</p>
<h2>
{"Try the numbers."}
<br  />
{"Understand the context."}
</h2>
<div className="home-resource-grid">
<a href="/calculator">
<h3>
{"Your quick estimate."}
</h3>
<p>
{"Enter your own figures in the simplified web calculator. Its limits are clearly explained."}
</p>
<span>
{"Open calculator ↗"}
</span>
</a>
<a href="/blog">
<h3>
{"Your next good question."}
</h3>
<p>
{"Browse the GigMiles guides on costs, records and choosing the right tool."}
</p>
<span>
{"Explore the journal ↗"}
</span>
</a>
</div>
</section>
<section className="download conversion-close" id="download">
<div className="wrap">
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
<span aria-hidden="true">
{"↗"}
</span>
</DownloadButton>
<p className="close-trust">
{"Free core · No card · No ads"}
</p>
<p className="close-small">
{"Optional Pro upgrades. Estimates for planning, not tax advice."}
</p>
</div>
</section>

</>}
