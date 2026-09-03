// The label every "get the app" button carries. Two things it settles:
//
// The brand is set, not spelled: the button carries the lockup the header and
// footer already draw, the mark then the wordmark in Outfit black italic with
// its trademark, so the name looks the same everywhere on the site. The verb
// mark doubles as the G of "Get", so the button still says what it does while
// the brand does the saying. The accessible name spells it out in full for
// anyone who cannot see the mark. It is drawn as text rather than the SVG in
// public/brand/wordmark, because that file relies on Outfit being present and
// an <img> would not have it: the mark would silently fall back to another
// typeface. The accessible name stays "Get GigMiles — free" through the
// aria-label on the wrapper, so a screen reader hears the sentence, not a mark.
//
// No arrow. An arrow pointing up and to the right is the web's sign for
// "leaves this page"; on a download button it promises the wrong thing.
export function CtaLabel({label = 'free'}: {label?: string}) {
  return <span className="cta-label" aria-label={`Get GigMiles — ${label}`}>
    <img className="cta-mark" src="/brand/icons/icon-180.png" width={32} height={32} alt="" aria-hidden="true" decoding="async"/>
    <span aria-hidden="true">et</span>
    <span className="cta-wordmark" aria-hidden="true">
      <span className="brand-wordmark">gigmiles</span><sup className="brand-trademark">™</sup>
    </span>
    <span aria-hidden="true"> — {label}</span>
  </span>
}
