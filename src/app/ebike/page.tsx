import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import { EbikeClient } from './EbikeClient'

export const metadata: Metadata = {
  title: 'E-Bike Delivery Cost Calculator — What Couriers Actually Spend Per Mile',
  description:
    'You can’t claim the IRS standard mileage rate on an e-bike. Estimate your real actual-expense cost — electricity, battery wear, and mechanical wear — per mile, for tax-season records.',
  alternates: { canonical: 'https://gigmiles.app/ebike' },
  openGraph: {
    type: 'website',
    url: 'https://gigmiles.app/ebike',
    title: 'E-Bike Delivery Cost Calculator — Real Cost Per Mile',
    description:
      'Standard mileage doesn’t apply to bikes. Estimate your actual-expense cost — electricity, battery, and mechanical wear — the way couriers should track it.',
    siteName: 'GigMiles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Bike Delivery Cost Calculator — Real Cost Per Mile',
    description:
      'Standard mileage doesn’t apply to bikes. Estimate your actual-expense cost per mile for tax-season records.',
  },
}

// FAQ copy is the single source for both the visible block and the JSON-LD.
const FAQS = [
  {
    q: 'Can I use the IRS standard mileage rate on an e-bike?',
    a: 'No. The IRS standard mileage rate applies only to a car, van, pickup, or panel truck — that is the IRS’s own wording. A bicycle, electric or not, is not on that list. There is no e-bike mileage rate. E-bike couriers deduct actual expenses instead: the real, documented costs of operating the bike for business.',
  },
  {
    q: 'What counts as an actual expense on a delivery e-bike?',
    a: 'Three buckets. Electricity to charge the battery (pennies per mile). Battery wear — a battery is a consumable rated for roughly 500–1,000 charge cycles, so a share of its replacement cost is spent on every mile. And mechanical wear — tires, brake pads, chain, and tune-ups, which a daily loaded delivery bike burns through far faster than a weekend bike.',
  },
  {
    q: 'How is electricity cost per mile calculated?',
    a: 'Miles ÷ your bike’s efficiency (miles per kWh) × your utility’s rate per kWh. This calculator defaults to about 25 mi/kWh — a realistic figure for a loaded, stop-and-go delivery e-bike — and $0.17/kWh, the US residential average. Edit both to match your own bike and electricity bill.',
  },
  {
    q: 'Why is my e-bike deduction so much smaller than a car driver’s?',
    a: 'Because an e-bike genuinely costs far less to operate — often around 6 cents a mile versus the IRS car rate of 76 cents (as of July 1, 2026). That is the whole appeal of the bike. It also means a smaller documented deduction on the same miles, so budget your estimated tax set-aside with that in mind rather than a car-driver rule of thumb.',
  },
  {
    q: 'Does this replace a tax professional?',
    a: 'No. This is a planning and record-keeping estimate, not tax advice, and it is not your final tax bill — that depends on your other income, filing status, state, and deductions not entered here. Keep your receipts and ride log, and hand clean numbers to a licensed tax professional.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function EbikePage() {
  return (
    <main className="min-h-screen bg-[#0A3C3C]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Minimal header */}
      <header className="flex items-center justify-between px-5 md:px-14 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/brand/icons/icon-180.png" alt="GigMiles" width={26} height={26} className="rounded-[7px]" />
          <span className="text-[#5EEAD4] text-[18px] italic font-black tracking-[-0.04em] leading-none font-[family-name:var(--font-outfit)]">gigmiles</span>
        </Link>
        <Link
          href="/download"
          className="text-white/60 text-[13px] tracking-[0.04em] border border-white/[0.14] px-4 py-2 hover:border-white/30 hover:text-white/85 transition-all font-[family-name:var(--font-space-grotesk)]"
        >
          Get the app
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* H1 + intro */}
        <p className="text-[#5EEAD4] text-[12px] tracking-[0.18em] uppercase mb-4 font-[family-name:var(--font-space-grotesk)] flex items-center gap-3">
          <span className="w-5 h-px bg-[#5EEAD4] opacity-60 inline-block" />
          E-bike cost calculator
        </p>
        <h1 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,5vw,46px)] mb-3 max-w-2xl">
          What an e-bike really costs per mile
        </h1>
        <p className="text-[#94A3B8] text-[14px] leading-relaxed mb-8 sm:mb-10 max-w-xl font-[family-name:var(--font-dm-sans)]">
          You can’t claim the IRS standard mileage rate on a bike — couriers deduct
          actual expenses. Estimate yours across the three buckets that matter:
          electricity, battery wear, and mechanical wear.
        </p>

        {/* Quotable, self-contained answer up top — the "pre-digested" format AI
            answer engines lift. Tax-safe. */}
        <div className="mb-8 sm:mb-10 border-l-2 border-[#5EEAD4]/70 bg-[#0C4646]/60 px-5 py-4">
          <p className="text-[#5EEAD4] text-[11px] tracking-[0.18em] uppercase mb-2 font-[family-name:var(--font-space-grotesk)]">
            The short answer
          </p>
          <p className="text-white/85 text-[14px] leading-relaxed font-[family-name:var(--font-dm-sans)] max-w-2xl">
            No — you can&apos;t use the IRS standard mileage rate on an e-bike; that
            rate is only for cars, vans, and trucks. E-bike couriers deduct actual
            expenses instead — electricity, battery wear, and mechanical wear — which
            usually work out to around 6 cents a mile. Keep your receipts and hand
            clean numbers to a licensed tax professional. Estimates for planning, not
            tax advice.
          </p>
        </div>

        <EbikeClient />

        {/* The three buckets, explained */}
        <section className="mt-12 grid sm:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.07]">
          {[
            { t: 'Electricity', d: 'Cheapest and easiest to forget. Miles ÷ your mi/kWh × your utility rate — right off the bill. Pennies per mile, but tracking it builds the habit that captures the big stuff.' },
            { t: 'Battery', d: 'The consumable engine. A pack is good for ~500–1,000 cycles; spread its replacement cost over its cycle life and your miles per charge and you get a real per-mile cost, months before the bill arrives.' },
            { t: 'Mechanical', d: 'Tires, brake pads, chain, tune-ups — a daily loaded delivery bike eats them far faster than a weekend bike. Deductible under actual expenses if you keep the receipts.' },
          ].map(b => (
            <div key={b.t} className="bg-[#0C4646] px-5 py-6 flex flex-col gap-2">
              <h3 className="text-[#5EEAD4] text-[13px] tracking-[0.08em] uppercase font-[family-name:var(--font-space-grotesk)]">{b.t}</h3>
              <p className="text-[#94A3B8] text-[13px] leading-relaxed font-[family-name:var(--font-dm-sans)]">{b.d}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4 border border-white/[0.07] bg-[#0C4646] px-6 py-8 text-center">
          <p className="text-white/85 text-[15px] font-[family-name:var(--font-dm-sans)] max-w-md">
            GigMiles tracks all three buckets automatically — car or e-bike — and keeps
            tax-season records for you. 10 days free, no card.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={IOS_APP_STORE_URL} aria-label="Download on the App Store" className="inline-flex transition-transform active:scale-[0.97]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/badges/app-store-badge.svg" alt="Download on the App Store" className="h-[52px] w-auto" />
            </a>
            <a href={ANDROID_PLAY_STORE_URL} aria-label="Get it on Google Play" className="inline-flex transition-transform active:scale-[0.97]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/badges/google-play-badge.svg" alt="Get it on Google Play" className="h-[52px] w-auto" />
            </a>
          </div>
        </div>

        {/* Fine print */}
        <p className="mt-6 text-white/40 text-[11px] leading-relaxed font-[family-name:var(--font-dm-sans)] italic max-w-2xl">
          Estimates for planning and record-keeping only — not tax advice and not
          earnings claims. The IRS standard mileage rate does not apply to bicycles or
          e-bikes; figures here use the actual-expense method. Defaults model a delivery
          e-bike at ~25 mi/kWh, $0.17/kWh, and $0.05/mile combined battery and mechanical
          wear; edit them to your own costs. Your actual tax situation may differ —
          consult a licensed tax professional.
        </p>

        {/* FAQ */}
        <section className="mt-14" aria-label="Frequently asked questions">
          <h2 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.02em] text-[clamp(20px,3vw,28px)] mb-6">
            Common questions
          </h2>
          <div className="flex flex-col">
            {FAQS.map(f => (
              <details key={f.q} className="group border-b border-white/[0.07]">
                <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none text-white/75 text-[14px] leading-snug hover:text-white transition-colors font-[family-name:var(--font-space-grotesk)]">
                  {f.q}
                  <span className="text-white/50 text-base leading-none mt-0.5 flex-shrink-0 transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#94A3B8] text-[13px] leading-relaxed pb-5 max-w-2xl font-[family-name:var(--font-dm-sans)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/calculator" className="text-[#5EEAD4] text-[13px] font-[family-name:var(--font-space-grotesk)] hover:opacity-80 transition-opacity">
            Car driver? Use the net-income calculator →
          </Link>
          <Link href="/" className="text-white/45 text-[13px] font-[family-name:var(--font-space-grotesk)] hover:opacity-80 transition-opacity">
            gigmiles.app
          </Link>
        </p>
      </div>
    </main>
  )
}
