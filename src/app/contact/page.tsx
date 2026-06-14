import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact & FAQ | GigMiles',
  description:
    'Frequently asked questions about GigMiles — mileage tracking, net profit, tax estimates, and exports — plus how to reach our support team.',
}

// Static support page used as the App Store / Google Play "Support URL".
// FAQ content mirrors the in-app Support screen
// (gigmiles-mobile/lib/features/support/screens/support_screen.dart). When the
// in-app FAQ changes, update this list to keep them in sync. Dynamic values are
// resolved for the current tax year: 2026 IRS standard mileage rate = 72.5¢/mi.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'How is the tax estimate calculated?',
    a: 'GigMiles uses 2026 IRS progressive brackets with your filing status and state, plus self-employment tax (15.3% on 92.35% of net profit). Mileage and expense deductions are applied before calculating your taxable income. The actual amount depends on your full financial picture — consult a tax professional for precise figures.',
  },
  {
    q: 'Should I track mileage or gas receipts?',
    a: 'For most gig workers, the IRS standard mileage rate (72.5¢/mile in 2026) gives a larger deduction than actual expenses. Track your mileage with GigMiles — if you drive a lot, this is almost always the better option.',
  },
  {
    q: 'Can I deduct EV charging costs?',
    a: 'Yes. If you drive an electric vehicle, you can deduct actual electricity costs for business use instead of the standard mileage rate. Use the "Actual Expenses" method and log your kWh and cost per charge.',
  },
  {
    q: 'What counts as wear & tear?',
    a: "Vehicle depreciation is the biggest hidden cost for gig workers. GigMiles estimates it using your vehicle's age, make, and mileage. This is factored into your net profit display so you see your real earnings — not just the gross.",
  },
  {
    q: 'How do I set my Active Platforms?',
    a: "There's no manual toggle — a platform becomes Active the first time you log an earnings entry for it. Tap the + button → Earnings, pick the platform, and it'll appear under Profile → My Platforms (which is read-only and just surfaces what you've been driving for). To deactivate a platform, simply stop logging entries for it.",
  },
  {
    q: 'How often does dashboard data refresh?',
    a: 'Dashboard stats refresh every time you open the app or add a new entry. Pull down to manually refresh. Data is synced in real-time via Supabase.',
  },
  {
    q: 'How is my Net Profit calculated?',
    a: 'Net Profit = Gross Earnings + Tips − Platform Fees − Logged Expenses − Mileage Deduction (IRS standard rate × business miles) − Estimated Vehicle Wear & Tear. This gives you what you actually keep, not just the gross payout your platform shows.',
  },
  {
    q: 'Does GigMiles handle my taxes?',
    a: 'GigMiles estimates your potential tax liability — including federal, self-employment, and state tax — based solely on the data you enter. The Tax Center projects your annual tax using your current earning pace, and provides quarterly estimates based on what you actually earned in that specific quarter. This helps you plan your set-asides more realistically if you started driving mid-year. GigMiles is a preparation aid, not a tax preparer. We do not file your taxes. You can generate a Schedule C Worksheet from the Tax tab to share with your licensed CPA or tax professional.',
  },
  {
    q: 'What does GPS Shift Tracking actually record?',
    a: 'When you tap Start Shift, GigMiles auto-records: total miles driven (every leg, even between dropoffs), start and end location, shift duration, and your business purpose. These are exactly the records the IRS requires for the standard mileage deduction — so you stay audit-ready without writing anything down.',
  },
  {
    q: 'Mileage deduction vs. actual expenses — which is better?',
    a: 'For most gig drivers, the IRS standard mileage rate wins because it bundles fuel, depreciation, maintenance, and insurance into a single per-mile rate. Actual expenses can win if you drive an EV with low electricity costs or have a high-cost vehicle with low miles. To compare both methods against your real entries, open the Tax tab → Advanced → What-If Simulator — it shows the deduction numbers for each method side-by-side. Note: the IRS does not allow you to change methods mid-tax-year. Strategy: start with standard mileage → you can switch to actual expenses next year; start with actual expenses → you usually cannot switch back to mileage in later years. For further details, please visit the IRS official webpage.',
  },
  {
    q: 'How do I export everything for my CPA?',
    a: 'Open the Tax tab and tap Schedule C Worksheet. You can download a Schedule C-ready PDF or CSV covering every shift, entry, mile, and expense for the year. The worksheet is a preparation aid for your CPA — not a filed tax return. Available on Pro.',
  },
  {
    q: 'What happens when my trial ends?',
    a: "Free features stay free forever — adding earnings and expenses, OCR scan, your Dashboard, and the weekly Shift History tab. Pro features (GPS Shift Tracking, full Insights, Tax Estimate Wizard, exports, AI Today's Brief) lock until you upgrade. Nothing is deleted; your data is always yours.",
  },
  {
    q: 'What is Day Finalization and why does it run?',
    a: 'GigMiles automatically finalizes each calendar day at your local 23:59. We snapshot that day\'s total miles plus your fixed costs (insurance + vehicle payment) into a daily summary. Each trip from that day then gets its share of the fixed costs distributed mileage-weighted: a 50-mile dinner shift carries more of the day\'s insurance than a 5-mile breakfast run on the same day. Why? It gives you a reliable per-trip net profit number. Without finalization, your trip cost would shift every time you logged another trip on the same day — the math couldn\'t settle. With finalization, today shows as "in progress" (Fixed-Cost Allocation = $0 with an info icon explaining the wait), and once 23:59 hits, the share locks in deterministically. If you edit, add, or delete a past day\'s entry, that day re-finalizes automatically.',
  },
  {
    q: 'How does GigMiles estimate my year-end taxes if I started mid-year?',
    a: 'We use a "Forward Projection" method to provide a more realistic estimate for your planning. Instead of assuming you worked all year, GigMiles calculates your daily average profit starting strictly from your first earning entry, and projects that pace to the end of the year. This provides a grounded estimate for your tax bracket without inflating numbers for the months you weren\'t driving. Note that these are estimates only, and actual tax liabilities may vary based on your full financial picture.',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="text-emerald-500 text-sm font-medium hover:text-emerald-400 transition-colors"
        >
          ← GigMiles
        </a>

        <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-white">
          Contact &amp; FAQ
        </h1>
        <p className="mt-4 text-slate-400 leading-relaxed">
          Answers to the questions GigMiles drivers ask most. Can&apos;t find
          what you need? Reach our support team below — we usually respond within
          24 hours.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-emerald-500 uppercase">
          Frequently Asked
        </h2>

        <div className="mt-4 space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4 transition-colors open:border-emerald-500/30 open:bg-slate-900/70"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white marker:hidden">
                <span>{item.q}</span>
                <span className="shrink-0 text-emerald-500 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-7">
          <h2 className="text-xs font-bold tracking-[0.15em] text-emerald-500 uppercase">
            Still need help?
          </h2>
          <p className="mt-3 text-slate-400">
            Email our support team and we&apos;ll get back to you, usually within
            24 hours.
          </p>
          <a
            href="mailto:support@gigmiles.app?subject=GigMiles%20Support"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0B1120] transition-colors hover:bg-emerald-400"
          >
            Contact Support
          </a>
          <p className="mt-4 text-xs text-slate-500">
            For legal or privacy requests:{' '}
            <a
              href="mailto:legal@gigmiles.app"
              className="text-emerald-500 hover:text-emerald-400"
            >
              legal@gigmiles.app
            </a>
          </p>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-slate-600">
          GigMiles is a record-keeping and tax-preparation aid, not a tax
          preparer. Tax figures shown in the app are estimates — consult a
          licensed tax professional for advice specific to your situation.
        </p>
      </div>
    </div>
  )
}
