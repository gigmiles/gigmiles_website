// Free vs Pro, straight from PRODUCT_FACTS. Pro is optional; the free core is
// the product. "10-day trial" is always Pro's trial. Prices: $9.99/mo, $99.99/yr.
// Copy status: draft for operator approval (gate B).
export const FREE_FEATURES = [
  'Manual earnings, mileage and expense entry',
  'Receipt scan, on your phone',
  'Today and this-week net view',
  'Vehicle cost and vehicle value cards',
  'Live regional fuel prices',
  'Timer shifts',
  'Day and week history',
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
    <div className="plan-column" role="rowgroup">
      <div className="plan-head" role="row"><span role="columnheader">Free</span><span>No card. No ads.</span></div>
      <ul>{FREE_FEATURES.map(f => <li key={f} role="row">{f}</li>)}</ul>
    </div>
    <div className="plan-column plan-pro" role="rowgroup">
      <div className="plan-head" role="row"><span role="columnheader">Pro</span><span>Optional. $9.99/mo or $99.99/yr.</span></div>
      <ul>{PRO_FEATURES.map(f => <li key={f} role="row">{f}</li>)}</ul>
      <p className="plan-trial">Pro has a 10-day free trial. No card for that either.</p>
    </div>
    <p className="plan-footnote">Pro is an option, not the starting line. The free core stays free.</p>
  </div>
}
