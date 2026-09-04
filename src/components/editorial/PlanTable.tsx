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

// The features are set in families, each with a short lead that says what
// the family is for, and the sentences run on after it like a dictionary
// entry. Ten lines with a hairline between them were a list with the bullets
// removed; three small chapters explain the product and read as a page. The
// leads are the only new words here (draft for the operator); every feature
// sentence is unchanged, and each feature belongs to exactly one family, which
// a test checks so nothing can drop out silently.
export const FREE_GROUPS: ReadonlyArray<{lead: string; items: readonly number[]}> = [
  {lead: 'Log the work.', items: [0, 1, 5, 6]},
  {lead: 'See the number.', items: [2, 3, 4, 7]},
  {lead: 'Plan for tax.', items: [8, 9]},
]
export const PRO_GROUPS: ReadonlyArray<{lead: string; items: readonly number[]}> = [
  {lead: 'Track automatically.', items: [0, 1, 4]},
  {lead: 'Compare and export.', items: [2, 3, 5, 6]},
]

const family = (features: readonly string[], group: {lead: string; items: readonly number[]}) =>
  <p key={group.lead} className="plan-group">
    <b className="plan-lead">{group.lead}</b>
    {group.items.map((n, i) => <span key={features[n]} className="plan-item">{features[n]}.{i < group.items.length - 1 ? ' ' : ''}</span>)}
  </p>

export function PlanTable() {
  // Free is the spine and Pro is a note beside it, which is the shape of the
  // offer: the free core is the product and Pro is optional. The trial is
  // still stated inside Pro and nowhere else, and the footnote sits beside the
  // table rather than inside it.
  return <>
  <div className="plan-table" aria-label="Free and Pro">
    <div className="plan-column" data-reveal="">
      <div className="plan-head"><span>Free</span></div>
      {FREE_GROUPS.map(g => family(FREE_FEATURES, g))}
    </div>
    <aside className="plan-column plan-pro" data-reveal="" style={{'--d': '120ms'} as React.CSSProperties}>
      <div className="plan-head">
        <span>Pro</span>
        <span>Optional. $9.99/mo or $99.99/yr.</span>
      </div>
      <p className="plan-ten"><strong>Everything here is free for 10 days.</strong></p>
      {PRO_GROUPS.map(g => family(PRO_FEATURES, g))}
      <p className="plan-trial">No card for the trial either, and the ten days do not start until you log your first trip. Invite a driver and Pro stays open another seven days, up to two invites.</p>
    </aside>
  </div>
  <p className="plan-footnote">Pro is an option, not the starting line.</p>
  </>
}
