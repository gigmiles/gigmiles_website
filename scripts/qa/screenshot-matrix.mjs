#!/usr/bin/env node
// Responsive QA matrix for gigmiles.app.
//
//   node scripts/qa/screenshot-matrix.mjs --url https://gigmiles.app --out ../qa/baseline --label live-before
//   node scripts/qa/screenshot-matrix.mjs --url http://localhost:3000 --out ../qa/after --assert
//
// For every viewport it loads the page, records layout metrics (horizontal
// overflow, header height, hero/story geometry, first CTA position, the empty
// band below the pinned scroll story) and saves a first-viewport screenshot plus
// a screenshot taken half-way through the hero runway. Output: PNGs,
// metrics.json and report.md in --out. With --assert the process exits 1 when a
// layout rule fails, so the matrix can gate a release.
//
// Uses the puppeteer already present in node_modules. Never touches analytics:
// navigator.sendBeacon is stubbed before any page script runs.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i]
  if (!a.startsWith('--')) continue
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) args.set(a.slice(2), true)
  else { args.set(a.slice(2), next); i += 1 }
}

const url = String(args.get('url') || 'http://localhost:3000')
const out = path.resolve(String(args.get('out') || 'qa-out'))
const label = String(args.get('label') || 'run')
const assertMode = Boolean(args.get('assert'))
const pagePaths = String(args.get('paths') || '/').split(',').map((p) => p.trim()).filter(Boolean)

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const VIEWPORTS = [
  { name: '375x812', width: 375, height: 812, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: false },
  { name: '820x1180', width: 820, height: 1180, mobile: false },
  { name: '1024x768', width: 1024, height: 768, mobile: false },
  { name: '1280x720', width: 1280, height: 720, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '2560x1440', width: 2560, height: 1440, mobile: false },
  { name: '1440x900-reduced-motion', width: 1440, height: 900, mobile: false, reducedMotion: true },
]

function safeName(p) {
  return p === '/' ? 'home' : p.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '_')
}

async function launch() {
  try {
    return await puppeteer.launch({ headless: true })
  } catch (error) {
    console.warn('[qa] bundled Chromium unavailable, trying installed Chrome:', error.message)
    return puppeteer.launch({ headless: true, channel: 'chrome' })
  }
}

const METRICS_SCRIPT = () => {
  const q = (s) => document.querySelector(s)
  const rect = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) }
  }
  const hero = q('.hero-scroll') || q('.hero')
  const cta = q('.hero .conversion-cta, .intro .conversion-cta, .conversion-cta')
  const header = q('header.nav, header')
  const story = q('#story') || q('.story')
  const intro = q('.intro')
  const stage = q('.stage')
  const stickyBar = q('.sticky-cta')
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    scrollY: Math.round(window.scrollY),
    scrollEnabled: hero ? hero.getAttribute('data-scroll-enabled') : null,
    header: rect(header),
    hero: hero ? Object.assign(rect(hero), { minHeight: getComputedStyle(hero).minHeight }) : null,
    intro: rect(intro),
    story: rect(story),
    stage: stage ? Object.assign(rect(stage), { cssHeight: getComputedStyle(stage).height }) : null,
    cta: rect(cta),
    stickyBar: stickyBar ? Object.assign(rect(stickyBar), { visible: stickyBar.getAttribute('data-visible') }) : null,
    h1FontSize: q('h1') ? getComputedStyle(q('h1')).fontSize : null,
  }
}

async function measurePage(page, vp, pagePath) {
  const results = { viewport: vp.name, path: pagePath, warnings: [] }
  await page.evaluateOnNewDocument(() => {
    // Keep QA runs out of the analytics tables.
    Object.defineProperty(navigator, 'sendBeacon', { value: () => true, configurable: true })
  })
  await page.setUserAgent(vp.mobile ? MOBILE_UA : (await page.browser().userAgent()).replace('HeadlessChrome', 'Chrome'))
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: vp.mobile, hasTouch: vp.mobile })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: vp.reducedMotion ? 'reduce' : 'no-preference' }])
  await page.goto(new URL(pagePath, url).toString(), { waitUntil: 'networkidle2', timeout: 90000 })
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await new Promise((r) => setTimeout(r, 400))

  const base = `${safeName(pagePath)}__${vp.name}`
  await page.screenshot({ path: path.join(out, `${base}__top.png`) })
  results.top = await page.evaluate(METRICS_SCRIPT)

  // Half-way through the hero runway: the pinned story is the worst case for
  // the large-screen band. Then the end of the runway (bridge should arrive).
  if (results.top.hero && results.top.hero.height > vp.height) {
    const runway = Math.max(0, results.top.hero.height - vp.height)
    for (const [tag, fraction] of [['mid', 0.5], ['end', 1.0]]) {
      const target = Math.round(results.top.hero.top + results.top.scrollY + runway * fraction)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target)
      await new Promise((r) => setTimeout(r, 500))
      const m = await page.evaluate(METRICS_SCRIPT)
      const pinnedBottom = Math.max(m.story ? m.story.bottom : 0, m.intro ? m.intro.bottom : 0)
      m.emptyBandBelowPinned = m.story ? Math.max(0, m.innerHeight - pinnedBottom) : null
      results[tag] = m
      await page.screenshot({ path: path.join(out, `${base}__hero-${tag}.png`) })
    }
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: path.join(out, `${base}__full.png`), fullPage: true })

  // Rules. Only the ones that hold for every design; hero-specific checks are
  // gated on scroll mode being active.
  const t = results.top
  if (t.scrollWidth > t.innerWidth) results.warnings.push(`horizontal overflow: scrollWidth ${t.scrollWidth} > innerWidth ${t.innerWidth}`)
  if (vp.mobile && t.header && t.header.height > 72) results.warnings.push(`mobile header ${t.header.height}px > 72px`)
  if (t.cta && (t.cta.top < 0 || t.cta.bottom > t.innerHeight)) results.warnings.push(`first CTA not inside the first viewport (top ${t.cta.top}, bottom ${t.cta.bottom})`)
  if (t.scrollEnabled === 'true' && results.mid && results.mid.emptyBandBelowPinned > 40) results.warnings.push(`empty band below pinned story: ${results.mid.emptyBandBelowPinned}px`)
  if (vp.reducedMotion && t.scrollEnabled === 'true') results.warnings.push('scroll mode active under prefers-reduced-motion')
  return results
}

async function main() {
  fs.mkdirSync(out, { recursive: true })
  const browser = await launch()
  const all = []
  try {
    for (const pagePath of pagePaths) {
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage()
        try {
          const r = await measurePage(page, vp, pagePath)
          all.push(r)
          console.log(`[qa] ${pagePath} ${vp.name}: ${r.warnings.length ? r.warnings.join('; ') : 'ok'}`)
        } catch (error) {
          all.push({ viewport: vp.name, path: pagePath, error: String(error), warnings: [`error: ${error.message}`] })
          console.log(`[qa] ${pagePath} ${vp.name}: ERROR ${error.message}`)
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    await browser.close()
  }

  const stamp = new Date().toISOString()
  fs.writeFileSync(path.join(out, 'metrics.json'), JSON.stringify({ label, url, stamp, results: all }, null, 2))
  const lines = [
    `# Responsive QA — ${label}`,
    '',
    `- URL: ${url}`,
    `- Captured: ${stamp}`,
    '',
    '| Page | Viewport | Overflow | Header | Hero h | Scroll mode | Stage | Band mid | CTA top/bottom | Doc h | Warnings |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ]
  for (const r of all) {
    const t = r.top || {}
    const band = r.mid && r.mid.emptyBandBelowPinned != null ? `${r.mid.emptyBandBelowPinned}px` : '—'
    lines.push(`| ${r.path} | ${r.viewport} | ${t.scrollWidth && t.scrollWidth > t.innerWidth ? `YES ${t.scrollWidth}` : 'no'} | ${t.header ? t.header.height : '—'} | ${t.hero ? t.hero.height : '—'} | ${t.scrollEnabled ?? '—'} | ${t.stage ? t.stage.height : '—'} | ${band} | ${t.cta ? `${t.cta.top}/${t.cta.bottom}` : '—'} | ${t.scrollHeight ?? '—'} | ${r.warnings.join('; ') || 'ok'} |`)
  }
  fs.writeFileSync(path.join(out, 'report.md'), lines.join('\n') + '\n')
  const failures = all.filter((r) => r.warnings.length)
  console.log(`[qa] done: ${all.length} captures, ${failures.length} with warnings → ${out}`)
  if (assertMode && failures.length) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
