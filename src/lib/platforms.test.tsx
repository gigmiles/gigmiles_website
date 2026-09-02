import {describe, expect, it} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {ApprovedHome} from '@/components/editorial/ApprovedHome'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {CinematicHome} from '@/components/cinematic/CinematicHome'
import {PLATFORMS_FAQ, PLATFORMS_LINE, PLATFORM_NOTICE, PLATFORM_WORDS, QUICK_PICK_PLATFORMS} from './platforms'

// The naming rules from outputs/2026-09-02/website_platforms/TRADEMARK_NOTES.md,
// as tests: plain text, adjectives of a generic noun, never a heading, never
// a relationship word, first-mention symbols, the notice on every page.
const RELATIONSHIP = /\b(official|partner|partnership|partnered|integrated with|powered by|certified|approved by|sponsored)\b/i
const POSSESSIVE = /\b(Uber|Lyft|DoorDash|Instacart|Amazon|Grubhub|Shipt|Spark Driver|Roadie|Veho|Gopuff|Favor|Curri)(’s|'s|s\b)/
const BARE_WORKS_WITH = /works with (Uber|Lyft|DoorDash|Instacart|Amazon|Grubhub|Shipt|Spark)/i

const copy = [PLATFORMS_LINE, PLATFORMS_FAQ.question, ...PLATFORMS_FAQ.answer]
const everything = [...copy, PLATFORM_NOTICE]

describe('platform naming rules', () => {
  it('names marks as adjectives, without relationship words, possessives or plurals', () => {
    for (const text of copy) expect(text, text).not.toMatch(RELATIONSHIP)
    for (const text of everything) {
      expect(text, text).not.toMatch(POSSESSIVE)
      expect(text, text).not.toMatch(BARE_WORKS_WITH)
      expect(text).not.toContain('—')
    }
    expect(PLATFORMS_LINE).toMatch(/on the .* platforms/)
    expect(PLATFORMS_FAQ.answer[0]).toMatch(/Spark Driver™ shifts/)
  })

  it('carries the first-mention symbols the owners ask for and the Amazon sentence', () => {
    expect(PLATFORMS_LINE).toContain('Instacart®')
    expect(PLATFORMS_LINE).toContain('Spark Driver™')
    expect(PLATFORM_NOTICE).toContain('not affiliated with, endorsed by or sponsored by')
    expect(PLATFORM_NOTICE).toContain('this app was not created or endorsed by Amazon')
    expect(PLATFORM_NOTICE).toContain('Uber Technologies, Inc.')
    expect(PLATFORM_NOTICE).toContain('Walmart Inc.')
    expect(QUICK_PICK_PLATFORMS).toHaveLength(8)
  })

  it('never names a dead brand', () => {
    for (const text of everything) expect(text).not.toMatch(/Postmates|Caviar|Point Pickup|Drizly|Waitr|Relay|Skip The Dishes|Cornershop/)
  })

  it('appears on the live home and the cinematic page, once each, outside every heading', () => {
    for (const html of [renderToStaticMarkup(<WebsiteShell><ApprovedHome heroMode="scroll" variant="v2"/></WebsiteShell>), renderToStaticMarkup(<WebsiteShell><CinematicHome/></WebsiteShell>)]) {
      expect(html.split(PLATFORMS_LINE).length - 1).toBe(1)
      expect(html.split(PLATFORM_NOTICE).length - 1).toBe(1)
      const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(m => m[1].replace(/<[^>]+>/g, ''))
      for (const heading of headings) for (const word of PLATFORM_WORDS) expect(heading, `heading names ${word}`).not.toMatch(new RegExp(`\\b${word}\\b`))
      expect(html).not.toMatch(/<img[^>]*(uber|lyft|doordash|instacart|grubhub|shipt|spark|amazon)[^>]*>/i)
    }
    const home = renderToStaticMarkup(<ApprovedHome heroMode="scroll" variant="v2"/>)
    expect(home).toContain(PLATFORMS_FAQ.question)
    expect(home).toContain(PLATFORMS_FAQ.answer[1])
  })

  it('keeps the notice on every shell page, even those that name no platform', () => {
    const html = renderToStaticMarkup(<WebsiteShell><p>page</p></WebsiteShell>)
    expect(html).toContain('site-footer-notice')
    expect(html).toContain(PLATFORM_NOTICE)
  })
})
