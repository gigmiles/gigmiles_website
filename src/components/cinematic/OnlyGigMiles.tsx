// "Only GigMiles does this." — three claims no other tracker can make, each
// shown on the real screen that makes it (rendered from the app source,
// 1.1.0+29, with the site's example inputs). The plan leads: the target is
// derived from the driver's own living costs and work days, not from a
// slogan. Server-rendered complete; the reveal is an enhancement.

interface Claim {
  id: string
  tag?: string
  title: string
  body: string
  figure: {value: string; caption: string}
  images: Array<{src: string; alt: string}>
}

const LEAD: Claim = {
  id: 'plan',
  tag: 'PRO',
  title: 'Your target starts from your rent.',
  body: 'Enter your living costs, pick your work days and hours. GigMiles turns that into the net you need and the gross to aim for, then shows whether you are on pace today, this week, this month. On a heavy day it tells you to stop.',
  figure: {value: '$4,523', caption: 'gross to aim for, from $2,400 of living costs and six work days'},
  images: [
    {src: '/editorial/only-plan-setup.webp', alt: 'Example GigMiles plan setup: living costs Rent $1,650, Groceries $450, Utilities $180, Phone & internet $120; work days Monday to Saturday, 8 hours a day; a 10% buffer and a $300 monthly savings target. Example inputs, not a customer’s plan.'},
    {src: '/editorial/only-plan-week.webp', alt: 'Example GigMiles Your plan screen on This week: $612 net so far of a $685 weekly target, marked Ahead of pace, $24 needed per day with 3 work days left, then the required income ladder ending in $4,523 gross to aim for. Example inputs, not a customer’s plan.'},
  ],
}

const CLAIMS: Claim[] = [
  {
    id: 'split',
    title: 'Multi-platform shift, each platform with its own miles.',
    body: 'Switch mid-shift or split afterwards. Time, miles and earnings land on the platform you were actually driving for.',
    figure: {value: '105.0 mi', caption: 'one shift, split across DoorDash, Uber Eats and Instacart'},
    images: [
      {src: '/editorial/tour-split.webp', alt: 'Example GigMiles split-by-platform screen: one shift divided into DoorDash, Uber Eats and Instacart blocks, 46.6, 32.0 and 26.5 miles, 105.0 miles in total. Example inputs, not a customer’s shift.'},
    ],
  },
  {
    id: 'vehicles',
    title: 'Standard mileage on the car. Actual costs on the e-bike. Same year.',
    body: 'The IRS election is made per vehicle. GigMiles applies it per vehicle and labels the year “Mixed” on your worksheet.',
    figure: {value: '2 methods', caption: 'one tax year, one worksheet'},
    images: [
      {src: '/editorial/only-vehicles.webp', alt: 'Example GigMiles My vehicle screen: a 2023 Toyota Prius, hybrid, 52 MPG, tax method Standard Mileage following the account setting; and a 2025 Rad Power RadRunner e-bike, 25 mi/kWh, tax method Actual Expenses because e-bikes cannot use the IRS mileage rate. Example inputs, not a customer’s garage.'},
    ],
  },
]

function Media({images, pair}: {images: Claim['images']; pair?: boolean}) {
  return <div className={`only-media${pair ? ' only-media-pair' : ''}`}>
    {images.map(img => <img key={img.src} src={img.src} alt={img.alt} width={780} height={1560} loading="lazy" decoding="async"/>)}
  </div>
}

function Copy({claim, heading}: {claim: Claim; heading: 'h3'}) {
  const H = heading
  return <div className="only-copy">
    {claim.tag && <span className="only-tag">{claim.tag}</span>}
    <H className="only-title">{claim.title}</H>
    <p className="only-text">{claim.body}</p>
    <p className="only-figure"><strong>{claim.figure.value}</strong><span>{claim.figure.caption}</span></p>
  </div>
}

export function OnlyGigMiles() {
  return <section className="only" id="only" aria-labelledby="only-heading">
    <div className="wrap">
      <h2 id="only-heading" className="only-heading">Only GigMiles does this.<br/><span>Three things no other tracker has.</span></h2>

      <article className="only-lead" data-card={LEAD.id} data-reveal="">
        <Copy claim={LEAD} heading="h3"/>
        <Media images={LEAD.images} pair/>
      </article>

      <div className="only-grid">
        {CLAIMS.map((claim, i) => <article key={claim.id} className="only-card" data-card={claim.id} data-reveal="" style={{'--d': `${(i + 1) * 90}ms`} as React.CSSProperties}>
          <Copy claim={claim} heading="h3"/>
          <Media images={claim.images}/>
        </article>)}
      </div>

      <p className="only-note">Example inputs on an example plan and example vehicles. Not a customer&rsquo;s data.</p>
    </div>
  </section>
}
