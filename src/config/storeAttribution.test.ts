import { describe, it, expect } from 'vitest'
import {
  sanitizeTag,
  iosCtFor,
  buildIosStoreUrl,
  buildAndroidStoreUrl,
  IOS_AVAILABLE,
  IOS_APP_STORE_URL,
  IOS_APP_STORE_URL_CANONICAL,
  ANDROID_PLAY_STORE_URL,
} from './app'

describe('sanitizeTag', () => {
  it('collapses non-alnum to underscore and trims', () => {
    expect(sanitizeTag('driver education!')).toBe('driver_education')
    expect(sanitizeTag('reddit')).toBe('reddit')
  })
  it('caps at 40 chars (Apple ct limit), not 30', () => {
    const long = 'a'.repeat(50)
    expect(sanitizeTag(long).length).toBe(40)
  })
})

describe('iosCtFor', () => {
  it('prefers campaign, falls back to source, empty when neither', () => {
    expect(iosCtFor({ utm_campaign: 'driver_education', utm_source: 'reddit' })).toBe('driver_education')
    expect(iosCtFor({ utm_source: 'reddit' })).toBe('reddit')
    expect(iosCtFor({})).toBe('')
  })
})

// These exercise the URL-building rules, so they run against the CANONICAL
// listing URL rather than IOS_APP_STORE_URL — the latter is the '#' sentinel
// whenever IOS_AVAILABLE is false, and every builder short-circuits on it.
describe('buildIosStoreUrl', () => {
  it('leaves canonical URL unchanged for organic (empty ct) — symmetric with Android', () => {
    expect(buildIosStoreUrl('', IOS_APP_STORE_URL_CANONICAL)).toBe(IOS_APP_STORE_URL_CANONICAL)
  })
  it('appends ct= for a campaign visitor', () => {
    expect(buildIosStoreUrl('reddit', IOS_APP_STORE_URL_CANONICAL)).toBe(`${IOS_APP_STORE_URL_CANONICAL}?ct=reddit`)
  })
  it('does not double-stamp when ct already present', () => {
    const already = `${IOS_APP_STORE_URL_CANONICAL}?ct=existing`
    expect(buildIosStoreUrl('reddit', already)).toBe(already)
  })
  it('regex guard does not false-trigger on other params ending in ct=', () => {
    // a future param like ?product= must NOT be mistaken for ct=
    const base = `${IOS_APP_STORE_URL_CANONICAL}?product=1`
    expect(buildIosStoreUrl('reddit', base)).toBe(`${base}&ct=reddit`)
  })
  it('passes through the coming-soon sentinel', () => {
    expect(buildIosStoreUrl('reddit', '#')).toBe('#')
  })
})

// The kill switch itself. Apple pulled the listing on 2026-07-29; while the
// appeal is open, nothing may emit a link to a 404. This pins the two halves
// together so flipping one without the other fails loudly.
describe('IOS_AVAILABLE kill switch', () => {
  it('resolves IOS_APP_STORE_URL to the sentinel while unavailable', () => {
    expect(IOS_APP_STORE_URL).toBe(IOS_AVAILABLE ? IOS_APP_STORE_URL_CANONICAL : '#')
  })
  it('never hands a campaign-stamped Apple link to a visitor while unavailable', () => {
    if (IOS_AVAILABLE) return
    expect(buildIosStoreUrl('reddit', IOS_APP_STORE_URL)).toBe('#')
    expect(buildIosStoreUrl('', IOS_APP_STORE_URL)).toBe('#')
  })
})

describe('buildAndroidStoreUrl', () => {
  it('leaves canonical URL unchanged for organic (no source/campaign)', () => {
    expect(buildAndroidStoreUrl({}, ANDROID_PLAY_STORE_URL)).toBe(ANDROID_PLAY_STORE_URL)
  })
  it('builds a single-encoded install referrer with default medium', () => {
    const url = buildAndroidStoreUrl({ utm_source: 'reddit', utm_campaign: 'driver_education' }, ANDROID_PLAY_STORE_URL)
    const referrer = new URL(url).searchParams.get('referrer')!
    // searchParams.get already decodes once → the raw utm query string
    expect(referrer).toBe('utm_source=reddit&utm_medium=referral&utm_campaign=driver_education')
  })
  it('preserves an explicit medium and includes cid + content', () => {
    const url = buildAndroidStoreUrl(
      { utm_source: 'reddit', utm_medium: 'paid_social', utm_campaign: 'x', utm_content: 'v1', cid: 'abc-123' },
      ANDROID_PLAY_STORE_URL,
    )
    const referrer = new URL(url).searchParams.get('referrer')!
    expect(referrer).toBe('utm_source=reddit&utm_medium=paid_social&utm_campaign=x&utm_content=v1&cid=abc-123')
  })
  it('is single-encoded, not double-encoded (raw url is percent-encoded once)', () => {
    const url = buildAndroidStoreUrl({ utm_source: 'reddit', utm_campaign: 'x' }, ANDROID_PLAY_STORE_URL)
    // one level of encoding: %3D for =, %26 for & — and NO %25 (double-encode)
    expect(url).toContain('referrer=utm_source%3Dreddit%26')
    expect(url).not.toContain('%25')
  })
  it('does not double-stamp when referrer already present', () => {
    const already = `${ANDROID_PLAY_STORE_URL}&referrer=already`
    expect(buildAndroidStoreUrl({ utm_source: 'reddit' }, already)).toBe(already)
  })
})
