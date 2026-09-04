// Free vs Pro, straight from PRODUCT_FACTS. Pro is optional; the free core is
// the product. "10-day trial" is always Pro's trial. Prices: $9.99/mo, $99.99/yr.
// Copy status: draft for operator approval (gate B).
//
// The trial is stated inside the Pro column and nowhere else. That is the whole
// trick: the section's frame stays "free to start, free to keep using", and the
// ten days read as something extra attached to Pro rather than as the terms of
// the app. Leading with the trial once taught real drivers that GigMiles is a
// subscription, so the subject is always named and the order never changes.
// Both mechanics were read from the app source on 2026-09-03 and recorded in
// PRODUCT_FACTS: the ten days do not start until the first trip is logged, and
// a successful invite adds seven days, twice at most.
export const FREE_FEATURES = [
  'Manual earnings, mileage and expense entry',
  'Receipt scan, on your phone',
  'Today and this-week net view',
  'Vehicle cost and vehicle value cards',
  'Live regional fuel prices',
  'Timer shifts',
  'Day and week history',
  'Home-screen widget on iOS and Android',
  'Tax center on screen, with a Schedule C worksheet',
  'Take-home calculator',
] as const

export const PRO_FEATURES = [
  'Automatic GPS tracking',
  'Month and year views',
  'Platform comparison and trend charts',
  'What-if mileage simulator',
  'Quarterly detail',
  'PDF and CSV export for your tax professional',
  'AI Today’s Brief and Burnout Meter',
] as const

const sentence = (items: readonly string[]) => items.join('. ') + '.'

export function PlanTable() {
  // Free is the spine and Pro is a note beside it, which is the shape of the
  // offer: the free core is the product and Pro is optional. The features are
  // set as running prose rather than two lists, because with the deck's proofs
  // the page had run to forty-six bullet points and read as a feature grid.
  // The trial is still stated inside Pro and nowhere else, and the footnote
  // sits beside the table rather than inside it.
  return <>
  <div className="plan-table" aria-label="Free and Pro">
    <div className="plan-column" data-reveal="">
      {/* The section note two lines above already says "No card. No ads." */}
      <div className="plan-head"><span>Free</span></div>
      <p className="plan-prose">{sentence(FREE_FEATURES)}</p>
    </div>
    <aside className="plan-column plan-pro" data-reveal="" style={{'--d': '120ms'} as React.CSSProperties}>
      <div className="plan-head">
        <span>Pro</span>
        <span>Optional. $9.99/mo or $99.99/yr.</span>
      </div>
      <p className="plan-prose"><strong>Everything here is free for 10 days.</strong> {sentence(PRO_FEATURES)}</p>
      <p className="plan-trial">No card for the trial either, and the ten days do not start until you log your first trip. Invite a driver and Pro stays open another seven days, up to two invites.</p>
    </aside>
  </div>
  <p className="plan-footnote">Pro is an option, not the starting line.</p>
  </>
}
