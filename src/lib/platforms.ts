// Gig platforms the app labels, and the words the website may use about them.
//
// Source of truth for the catalog: the mobile app's GigPlatform lists
// (gigmiles-mobile lib/features/entry/models/entry.dart, a48ce83): eight
// quick-pick chips, a searchable long tail, and a free-text custom entry.
// Naming rules (agency: outputs/2026-09-02/website_platforms/TRADEMARK_NOTES.md):
// plain text only, marks used as adjectives of a generic noun, our name more
// prominent than theirs, never in headings, product names, domains or
// keywords, first-mention symbols where the owner asks for them (Instacart®,
// Spark Driver™), and the notice below on every page that names a platform.

/** Quick-pick platforms in the app, in the app's order, with the owner's preferred public form. */
export const QUICK_PICK_PLATFORMS = ['Uber', 'Uber Eats', 'Lyft', 'DoorDash', 'Instacart®', 'Amazon Flex', 'Grubhub', 'Spark Driver™'] as const

/** Long-tail platforms the app lists under "More", limited to brands active in the US in 2026. */
export const LONG_TAIL_PLATFORMS = ['Shipt', 'Roadie', 'Veho', 'Gopuff', 'Favor', 'Curri', 'GoShare', 'Dispatch', 'TaskRabbit'] as const

/** Lead sentence for the trust strip; the chips below it carry the names. "for" is the Amazon-approved pattern. */
export const PLATFORMS_LINE =
  'Built for drivers, couriers and shoppers, in a car or on an e-bike, on these platforms and on any other app you work for, logged by name.'

/** Text chips under the trust strip, in our own style (no logos, no platform colours).
 *  Spark Driver™ is named only in the FAQ answer (informational) and the notice: Walmart's guideline
 *  conditions even compatibility statements on written consent, so the promotional strip leaves it out. */
export const PROMO_PLATFORMS = ['Uber', 'Uber Eats', 'Lyft', 'DoorDash', 'Instacart®', 'Amazon Flex', 'Grubhub', 'Shipt'] as const
export const OTHER_CHIP = 'any other app, by name'

export const PLATFORMS_FAQ = {
  question: 'Which platforms does GigMiles work with?',
  answer: [
    'All of them. Uber, Uber Eats, Lyft, DoorDash, Instacart®, Amazon Flex, Grubhub and Spark Driver™ shifts are one tap to label. Shipt, Roadie, Veho, Gopuff, Favor, Curri, GoShare, Dispatch and TaskRabbit shifts sit one search away, and anything else is typed in by name.',
    'Every platform gets the same miles, hours, costs and estimated tax set-aside. Platform comparison, side by side, is a Pro feature.',
  ],
} as const

/** Site-wide notice: independence plus the attributions the owners publish. */
export const PLATFORM_NOTICE =
  'GigMiles is an independent app. It is not affiliated with, endorsed by or sponsored by any gig platform. Uber and Uber Eats are trademarks of Uber Technologies, Inc.; Lyft of Lyft, Inc.; DoorDash of DoorDash, Inc.; Instacart® of Maplebear Inc.; Amazon Flex of Amazon.com, Inc. or its affiliates, and this app was not created or endorsed by Amazon; Grubhub of Grubhub Holdings Inc.; Shipt of Shipt, Inc.; Spark Driver™ of Walmart Inc. or its affiliates. Other names are trademarks of their respective owners.'

/** Every platform word that must stay out of headings and product names. */
export const PLATFORM_WORDS = ['Uber', 'Lyft', 'DoorDash', 'Instacart', 'Amazon', 'Grubhub', 'Shipt', 'Spark', 'Roadie', 'Veho', 'Gopuff', 'Favor', 'Curri', 'GoShare', 'Dispatch', 'TaskRabbit'] as const
