import {ANDROID_PLAY_STORE_URL, IOS_APP_STORE_URL} from '@/config/app'

// JSON-LD for the home page. Facts only, from config and PRODUCT_FACTS:
// the app is free; Pro is an optional $9.99/mo or $99.99/yr upgrade. No ratings,
// review counts or download figures are claimed (the site has none it can
// honestly show), and the description repeats the planning-estimate framing.
const ORIGIN = 'https://gigmiles.app'

export function homeStructuredData() {
  const organization = {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'GigMiles',
    url: ORIGIN,
    logo: `${ORIGIN}/brand/icons/icon-180.png`,
    sameAs: [IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL],
  }
  const website = {
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: ORIGIN,
    name: 'GigMiles',
    publisher: {'@id': `${ORIGIN}/#organization`},
  }
  const app = {
    '@type': 'SoftwareApplication',
    '@id': `${ORIGIN}/#app`,
    name: 'GigMiles: Driver Mileage & Tax',
    alternateName: 'GigMiles',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'iOS, Android',
    url: ORIGIN,
    downloadUrl: `${ORIGIN}/download`,
    installUrl: [IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL],
    description: 'Net profit tracker for gig drivers. Log earnings, miles and expenses; see estimated net after vehicle costs and an estimated tax set-aside. Estimates for planning, not tax advice.',
    isAccessibleForFree: true,
    offers: [
      {'@type': 'Offer', name: 'Free core', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock'},
      {'@type': 'Offer', name: 'GigMiles Pro, monthly', price: '9.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock'},
      {'@type': 'Offer', name: 'GigMiles Pro, annual', price: '99.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock'},
    ],
    publisher: {'@id': `${ORIGIN}/#organization`},
  }
  return {'@context': 'https://schema.org', '@graph': [organization, website, app]}
}

export function StructuredData() {
  const json = JSON.stringify(homeStructuredData()).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}
