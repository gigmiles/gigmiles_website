import { describe, it, expect } from 'vitest'
import {
  sanitizeTag,
  iosCtFor,
  buildIosStoreUrl,
  buildAndroidStoreUrl,
  IOS_APP_STORE_URL,
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

describe('buildIosStoreUrl', () => {
  it('leaves canonical URL unchanged for organic (empty ct) — symmetric with Android', () => {
    expect(buildIosStoreUrl('', IOS_APP_STORE_URL)).toBe(IOS_APP_STORE_URL)
  })
  it('appends ct= for a campaign visitor', () => {
    expect(buildIosStoreUrl('reddit', IOS_APP_STORE_URL)).toBe(`${IOS_APP_STORE_URL}?ct=reddit`)
  })
  it('does not double-stamp when ct already present', () => {
    const already = `${IOS_APP_STORE_URL}?ct=existing`
    expect(buildIosStoreUrl('reddit', already)).toBe(already)
  })
  it('regex guard does not false-trigger on other params ending in ct=', () => {
    // a future param like ?product= must NOT be mistaken for ct=
    const base = `${IOS_APP_STORE_URL}?product=1`
    expect(buildIosStoreUrl('reddit', base)).toBe(`${base}&ct=reddit`)
  })
  it('passes through the coming-soon sentinel', () => {
    expect(buildIosStoreUrl('reddit', '#')).toBe('#')
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
