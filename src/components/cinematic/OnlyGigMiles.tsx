// "Only GigMiles does this." — the plan, on the two real screens that make it,
// then four short claims each carried by a detail cut from a real screen
// (rendered from the app source, 1.1.0+29, with the site's example inputs).
// No paragraphs under the claims: one sentence each, the picture does the rest.
// Server-rendered complete; the reveal is an enhancement.

interface Screen { src: string; alt: string; width: number; height: number }
interface Claim {
  id: string
  tag?: string
  title: string
  body: string
  figure?: {value: string; caption: string}
  cut: Screen
}

const LEAD = {
  id: 'plan',
  tag: 'PRO',
  title: 'Your target starts from your rent.',
  body: 'Enter your living costs, pick your work days and hours. GigMiles turns that into the net you need and the gross to aim for, then shows whether you are on pace today, this week, this month. On a heavy day it tells you to stop.',
  figure: {value: '$4,523', caption: 'gross to aim for, from $2,400 of living costs and six work days'},
  screens: [
    {src: '/editorial/only-plan-setup.webp', width: 780, height: 1560, alt: 'Example GigMiles plan setup: living costs Rent $1,650, Groceries $450, Utilities $180, Phone & internet $120; work days Monday to Saturday, 8 hours a day; a 10% buffer and a $300 monthly savings target. Example inputs, not a customer’s plan.'},
    {src: '/editorial/only-plan-week.webp', width: 780, height: 1560, alt: 'Example GigMiles Your plan screen on This week: $612 net so far of a $685 weekly target, marked Ahead of pace, $24 needed per day with 3 work days left, then the required income ladder ending in $4,523 gross to aim for. Example inputs, not a customer’s plan.'},
  ] as Screen[],
}

const CLAIMS: Claim[] = [
  {
    id: 'personal',
    title: 'Your state, your filing status, your day job.',
    body: 'The estimate uses your state’s rate, your filing status, and stacks gig income on a W-2 job if you have one.',
    cut: {src: '/editorial/only-w2.webp', width: 800, height: 619, alt: 'Tax estimation settings: state California; filing status Single selected among Married Filing Jointly, Married Filing Separately and Head of Household; W-2 job answered Yes with annual W-2 wages of $52,000, so gig income is stacked on the W-2 bracket in the estimate. Example inputs.'},
  },
  {
    id: 'vehicles',
    title: 'A different tax method per vehicle.',
    body: 'Standard mileage on the car, actual costs on the e-bike, in the same year.',
    cut: {src: '/editorial/only-vehicle-methods.webp', width: 736, height: 577, alt: 'Two vehicle cards: 2023 Toyota Prius, tax method Standard Mileage, following the account setting; Rad Power RadRunner e-bike, tax method Actual Expenses, because e-bikes cannot use the IRS mileage rate. Example inputs.'},
  },
  {
    id: 'split',
    title: 'Miles per platform, in one shift.',
    body: 'Switch mid-shift or split afterwards; time, miles and earnings land on the platform you were driving for.',
    cut: {src: '/editorial/only-split-band.webp', width: 820, height: 320, alt: 'A shift timeline split into three platform blocks with two 10-minute stops marked, 9:00 AM to 5:00 PM, 105.0 miles, 8h 00m. Example inputs.'},
  },
  {
    id: 'coach',
    title: 'A coach that tells you to stop.',
    body: 'On a heavy week it asks for a lighter day, never for more hours.',
    cut: {src: '/editorial/only-capacity.webp', width: 780, height: 240, alt: 'Capacity panel: Heavy day, 8.0 h worked today, Strain 62%, and the line “Long days this week. Keep tomorrow lighter.” Example inputs.'},
  },
]

export function OnlyGigMiles() {
  return <section className="only" id="only" aria-labelledby="only-heading">
    <div className="wrap">
      <h2 id="only-heading" className="only-heading">Only GigMiles does this.</h2>
      <p className="only-lead-line">Every number is yours: your vehicle, your state, your filing status, your work days.</p>

      <article className="only-lead" data-card={LEAD.id} data-reveal="">
        <div className="only-copy">
          <span className="only-tag">{LEAD.tag}</span>
          <h3 className="only-title">{LEAD.title}</h3>
          <p className="only-text">{LEAD.body}</p>
          <p className="only-figure"><strong>{LEAD.figure.value}</strong><span>{LEAD.figure.caption}</span></p>
        </div>
        <div className="only-media only-media-pair">
          {LEAD.screens.map(s => <img key={s.src} src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async"/>)}
        </div>
      </article>

      <div className="only-grid">
        {CLAIMS.map((claim, i) => <article key={claim.id} className="only-card" data-card={claim.id} data-reveal="" style={{'--d': `${(i + 1) * 80}ms`} as React.CSSProperties}>
          <h3 className="only-title">{claim.title}</h3>
          <p className="only-text">{claim.body}</p>
          <figure className="only-cut">
            <img src={claim.cut.src} alt={claim.cut.alt} width={claim.cut.width} height={claim.cut.height} loading="lazy" decoding="async"/>
          </figure>
        </article>)}
      </div>

      <p className="only-note">Example inputs on an example plan and example vehicles. Not a customer&rsquo;s data.</p>
    </div>
  </section>
}
