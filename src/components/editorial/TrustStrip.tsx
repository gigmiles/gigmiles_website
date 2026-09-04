import {StoreBadges} from '@/components/ui/StoreBadges'
import {OTHER_CHIP, PLATFORMS_LINE, PLATFORMS_SENTENCE, PROMO_PLATFORMS} from '@/lib/platforms'

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

// The `product` tone leads with what the app does rather than what it promises
// not to do. The three handling and consent lines are not dropped: they move to
// the footer (PRIVACY_FACTS), where they sit next to the privacy policy for
// every page instead of interrupting the first screen after the film. The tax
// wording stays on the page twice regardless, in the film's closing statement
// and in the closing section.
export const PRODUCT_FACTS = [
  'Free core. No card. No ads.',
  'Your vehicle’s real cost per mile, not a flat guess.',
  'Built for a car or an e-bike.',
  'Your state and an optional day job, in the math.',
] as const

export const PRIVACY_FACTS = [
  'Receipt scan runs on your phone.',
  'Analytics and ad measurement are consent-gated.',
  'Delete your account in the app. Personal data is permanently deleted within 30 days.',
] as const

export function TrustStrip({tone = 'facts'}: {tone?: 'facts' | 'product'}) {
  const facts = tone === 'product' ? PRODUCT_FACTS : TRUST_FACTS
  return <section className="wrap trust-strip" data-tone={tone} aria-label="What you can count on">
    <ul className="trust-facts">
      {facts.map((fact, i) => <li key={fact} data-reveal="" style={{'--d': `${i * 70}ms`} as React.CSSProperties}>{fact}</li>)}
    </ul>
    {tone === 'product'
      // The film home names the platforms in one sentence. The chip row was
      // one of eleven pill shapes on that page; the words are the same.
      ? <p className="trust-platforms" data-reveal="" style={{'--d': '330ms'} as React.CSSProperties}>{PLATFORMS_SENTENCE}</p>
      : <>
        <p className="trust-platforms" data-reveal="" style={{'--d': '330ms'} as React.CSSProperties}>{PLATFORMS_LINE}</p>
        <ul className="platform-chips" aria-label="Platforms with their own label in the app" data-reveal="" style={{'--d': '360ms'} as React.CSSProperties}>
          {PROMO_PLATFORMS.map(name => <li key={name}>{name}</li>)}
          <li className="platform-chip-other">{OTHER_CHIP}</li>
        </ul>
      </>}
    <div className="store-choices trust-stores" data-reveal="" style={{'--d': '380ms'} as React.CSSProperties} aria-label="Available on the App Store and Google Play">
      <StoreBadges/>
    </div>
  </section>
}
