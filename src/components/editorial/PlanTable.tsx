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

export function PlanTable() {
  return <div className="plan-table" role="table" aria-label="Free and Pro features">
    <div className="plan-column" role="rowgroup" data-reveal="">
      <div className="plan-head" role="row"><span role="columnheader">Free</span><span>No card. No ads.</span></div>
      <ul>{FREE_FEATURES.map(f => <li key={f} role="row">{f}</li>)}</ul>
    </div>
    <div className="plan-column plan-pro" role="rowgroup" data-reveal="" style={{'--d': '120ms'} as React.CSSProperties}>
      <div className="plan-head" role="row">
        <span role="columnheader">Pro</span>
        <span>Optional. $9.99/mo or $99.99/yr.</span>
        <span className="plan-badge">Everything here is free for 10 days</span>
      </div>
      <ul>{PRO_FEATURES.map(f => <li key={f} role="row">{f}</li>)}</ul>
      <p className="plan-trial">No card for the trial either, and the ten days do not start until you log your first trip. Invite a driver and Pro stays open another seven days, up to two invites.</p>
    </div>
    <p className="plan-footnote">Pro is an option, not the starting line. The free core stays free.</p>
  </div>
}
