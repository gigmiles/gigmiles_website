// Client-only helper: turn the visitor's session attribution into an
// attributed store URL. Single place sessionStorage is read for URL building.
//
// The attribution reflects the MOST RECENT tagged touch (SiteBeacon overwrites
// gm_attribution on every tagged arrival — last-touch, not first-touch). cid is
// a stable per-visitor id minted once per session (SiteBeacon), carried on the
// Android referrer so the app can build a true web→install join. iOS ct cannot
// hold a cid (40-char limit), so iOS stays campaign-aggregate only.

import {
  buildIosStoreUrl,
  buildAndroidStoreUrl,
  iosCtFor,
  type StoreUtm,
} from '@/config/app'

const STORAGE_KEY = 'gm_attribution'
const CID_KEY = 'gm_cid'

export function readGmAttribution(): StoreUtm {
  if (typeof window === 'undefined') return {}
  let utm: StoreUtm = {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) utm = JSON.parse(raw) as StoreUtm
  } catch {
    utm = {}
  }
  try {
    const cid = sessionStorage.getItem(CID_KEY)
    if (cid) utm.cid = cid
  } catch {
    /* ignore */
  }
  return utm
}

// Decorate a store URL with the visitor's campaign context. store tells us which
// builder to use; base defaults to the canonical constant inside each builder.
// Returns base unchanged when the visitor has no campaign identity.
export function attributedStoreUrl(store: 'ios' | 'android', base?: string): string {
  const utm = readGmAttribution()
  return store === 'ios'
    ? buildIosStoreUrl(iosCtFor(utm), base)
    : buildAndroidStoreUrl(utm, base)
}
