import {StoreBadges} from '@/components/ui/StoreBadges'

// Verifiable facts only (PRODUCT_FACTS + privacy policy wording). No counts,
// stars, press logos or testimonials: the site has none it can honestly show.
// Store URLs come from StoreBadges/config, never from this file.
// Copy status: draft for operator approval (gate B) except the two lines the
// live hero already uses.
export const TRUST_FACTS = [
  'Free core. No card. No ads.',
  'Estimates for planning. Not tax advice.',
  'Receipt scan runs on your phone.',
  'Analytics and ad measurement are consent-gated.',
  'Delete your account in the app. Personal data is permanently deleted within 30 days.',
] as const

export function TrustStrip() {
  return <section className="wrap trust-strip" aria-label="What you can count on">
    <ul className="trust-facts">
      {TRUST_FACTS.map(fact => <li key={fact}>{fact}</li>)}
    </ul>
    <div className="store-choices trust-stores" aria-label="Available on the App Store and Google Play">
      <StoreBadges/>
    </div>
  </section>
}
