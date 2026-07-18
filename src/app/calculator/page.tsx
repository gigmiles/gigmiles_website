import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'
import { CalculatorClient } from './CalculatorClient'

const TITLE = 'Gig Driver Net Income Calculator — What You Actually Keep'
const DESC =
  'Gross pay is not your pay. See your real net after vehicle costs and self-employment tax — car or e-bike.'

// Shared results get a card showing THEIR numbers — the loop that makes this
// page spread. The calculator already mirrors its state into the URL
// (?g=&mi=&h=&v=&r=), so those params are forwarded to the OG route, which
// recomputes from the same calcRealNet. Bare/garbage params fall through to a
// generic card there.
//
// searchParams is read here on purpose, which makes /calculator dynamic (ƒ) —
// the same trade /cheatsheet already makes. Next's file-based
// opengraph-image.tsx cannot see the query string AND outranks this, so it was
// deleted; the canonical link stays param-free so shares don't split the page's
// SEO signal.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const sp = await searchParams
  const q = new URLSearchParams()
  for (const key of ['g', 'mi', 'h', 'v', 'r']) {
    const v = sp[key]
    if (typeof v === 'string' && v.length > 0 && v.length < 16) q.set(key, v)
  }
  const query = q.toString()
  const ogImage = `https://gigmiles.app/api/og/result${query ? `?${query}` : ''}`

  return {
    title: TITLE,
    description:
      'Enter gross earnings, miles, and hours — see your real net after vehicle costs (IRS 2026 mileage rate) and self-employment tax. Car and e-bike math included.',
    alternates: { canonical: 'https://gigmiles.app/calculator' },
    openGraph: {
      type: 'website',
      url: 'https://gigmiles.app/calculator',
      title: TITLE,
      description: DESC,
      siteName: 'GigMiles',
      images: [{ url: ogImage, width: 1200, height: 630, alt: TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESC,
      images: [ogImage],
    },
  }
}

// FAQ copy is the single source for both the visible block and the JSON-LD —
// Google requires the markup to match on-page content.
const FAQS = [
  {
    q: 'What is the IRS standard mileage rate for 2026?',
    a: 'The 2026 IRS business standard mileage rate is 76 cents per mile as of July 1, 2026 (it was 72.5 cents for the first half of the year), for cars, vans, pickups, and panel trucks. Because the IRS changed it mid-year, 2026 has two rates: multiply your July–December miles by 0.76 and your January–June miles by 0.725. Note what the rate is for: it is a DEDUCTION that lowers your taxable income, not a bill you paid. Most economical cars cost far less than 76 cents a mile to run, which is why the standard mileage method usually beats deducting actual expenses.',
  },
  {
    q: 'How is self-employment tax calculated for gig drivers?',
    a: 'Self-employment tax is 15.3% (12.4% Social Security + 2.9% Medicare) applied to 92.35% of your net earnings — gross income minus your business deductions. For a car the deduction is normally the standard mileage rate, so this calculator applies (gross − miles × 76¢) × 0.9235 × 15.3%, never less than $0. Your real cost of driving is a separate, usually smaller number, and it is what reduces your take-home pay.',
  },
  {
    q: 'Can I deduct miles on an e-bike?',
    a: 'Not with the standard mileage rate — the IRS limits it to cars, vans, pickups, and panel trucks. E-bike couriers deduct actual expenses instead: electricity, battery wear, tires, and maintenance. This calculator estimates e-bike costs at about $0.057 per mile (roughly 6 cents) by default — electricity plus battery and mechanical wear — and you can edit that rate to match your real costs. For a full electricity-and-wear breakdown, use the e-bike cost calculator.',
  },
  {
    q: 'Does this calculator include state income tax?',
    a: 'No. Version 1 covers self-employment tax only, which every gig driver owes regardless of income bracket. State income tax is not included — the GigMiles app calculates your state automatically.',
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

export default function CalculatorPage() {
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
          Net income calculator
        </p>
        <h1 className="text-white font-[family-name:var(--font-space-grotesk)] font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(28px,5vw,46px)] mb-3 max-w-2xl">
          What you actually keep
        </h1>
        <p className="text-[#94A3B8] text-[14px] leading-relaxed mb-8 sm:mb-10 max-w-lg font-[family-name:var(--font-dm-sans)]">
          Gross pay isn&apos;t your pay. Enter a shift — or a week — and see your
          real net after vehicle costs and self-employment tax.
        </p>

        {/* Quotable, self-contained answer up top — the "pre-digested" format AI
            answer engines lift. Canonical numbers, tax-safe. */}
        <div className="mb-8 sm:mb-10 border-l-2 border-[#5EEAD4]/70 bg-[#0C4646]/60 px-5 py-4">
          <p className="text-[#5EEAD4] text-[11px] tracking-[0.18em] uppercase mb-2 font-[family-name:var(--font-space-grotesk)]">
            The short answer
          </p>
          <p className="text-white/85 text-[14px] leading-relaxed font-[family-name:var(--font-dm-sans)] max-w-2xl">
            Your real hourly wage as a gig driver is your gross pay minus what
            driving actually cost you (fuel plus wear — commonly around 30–35
            cents a mile) minus a self-employment tax set-aside of 15.3%.
            The IRS 2026 standard mileage rate (76 cents a mile as of July 1) is
            a separate number: it is what you may <em>deduct</em>, so it lowers
            the tax you set aside — it is not what the driving cost. Example: a
            $235 gross day over 8 hours is roughly $175 take-home, about $22 an
            hour, not $29. Estimates for planning, not tax advice.
          </p>
        </div>

        <CalculatorClient />

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4 border border-white/[0.07] bg-[#0C4646] px-6 py-8 text-center">
          <p className="text-white/85 text-[15px] font-[family-name:var(--font-dm-sans)]">
            GigMiles does this automatically every shift — free forever, no card.
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
          Vehicle cost is what driving actually cost you — fuel plus wear — at an
          editable per-mile rate (car default $0.33/mile: fuel at $4.50/gal ÷ 25 MPG
          plus $0.15/mile wear, the same no-vehicle-data defaults the GigMiles app uses;
          your own car will differ). The IRS 2026 standard mileage rate of 76¢/mile
          (from July 1, 2026; 72.5¢ Jan–Jun) is the DEDUCTION, not the cost: self-employment
          tax = (gross − mileage deduction) × 92.35% × 15.3%, floored at $0. The IRS standard
          mileage rate does not apply to e-bikes, so a courier deducts actual expenses and
          the two figures coincide (default $0.057/mile, editable). Federal self-employment
          tax only — state income tax not included. Estimates for planning, not tax advice.
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
          <Link href="/ebike" className="text-[#5EEAD4] text-[13px] font-[family-name:var(--font-space-grotesk)] hover:opacity-80 transition-opacity">
            Deliver on an e-bike? Use the e-bike cost calculator →
          </Link>
          <Link href="/" className="text-white/45 text-[13px] font-[family-name:var(--font-space-grotesk)] hover:opacity-80 transition-opacity">
            gigmiles.app
          </Link>
        </p>
      </div>
    </main>
  )
}
