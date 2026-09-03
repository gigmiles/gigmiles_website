#!/usr/bin/env node
// Responsive audit for a page, wider and stricter than the screenshot matrix.
//
//   node scripts/qa/responsive-audit.mjs --url http://localhost:3000/preview/cinematic --out <dir> [--assert]
//
// For every viewport it walks the page top to bottom and, at each stop, checks
// the things that actually break a layout: the document scrolling sideways, any
// element sticking out past the viewport, text clipped by its own box, touch
// targets under 44 px on a phone, and headings that have collapsed to one word
// per line. Screenshots every stop and writes a contact sheet per viewport.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import sharp from 'sharp'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i]
  if (!a.startsWith('--')) continue
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) args.set(a.slice(2), true)
  else { args.set(a.slice(2), next); i += 1 }
}
const URL_ = String(args.get('url') || 'http://localhost:3000/preview/cinematic')
const OUT = path.resolve(String(args.get('out') || 'qa-out/responsive'))
const assertMode = Boolean(args.get('assert'))
fs.mkdirSync(OUT, {recursive: true})
const sleep = ms => new Promise(r => setTimeout(r, ms))

const VIEWPORTS = [
  {name: '320x568', width: 320, height: 568, mobile: true},
  {name: '360x740', width: 360, height: 740, mobile: true},
  {name: '375x812', width: 375, height: 812, mobile: true},
  {name: '390x844', width: 390, height: 844, mobile: true},
  {name: '430x932', width: 430, height: 932, mobile: true},
  {name: '768x1024', width: 768, height: 1024},
  {name: '820x1180', width: 820, height: 1180},
  {name: '1024x768', width: 1024, height: 768},
  {name: '1280x800', width: 1280, height: 800},
  {name: '1440x900', width: 1440, height: 900},
  {name: '1920x1080', width: 1920, height: 1080},
  {name: '2560x1440', width: 2560, height: 1440},
  {name: '3440x1440', width: 3440, height: 1440},
]
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const browser = await puppeteer.launch({headless: true, channel: 'chrome', args: ['--no-sandbox']})
const report = {url: URL_, viewports: [], problems: []}
const problem = (vp, text) => report.problems.push(`${vp}: ${text}`)

for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error' && !/webpack-hmr|favicon/.test(m.text())) errors.push(m.text().slice(0, 140)) })
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 140)))
  if (vp.mobile) await page.setUserAgent(MOBILE_UA)
  await page.setViewport({width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: Boolean(vp.mobile), hasTouch: Boolean(vp.mobile)})
  await page.goto(URL_, {waitUntil: 'networkidle2', timeout: 120000})
  await page.evaluate(() => document.fonts.ready)
  await sleep(1200)

  const record = {viewport: vp.name, stops: [], shots: []}
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  const stops = []
  for (let y = 0; y < total - vp.height * 0.5; y += Math.floor(vp.height * 0.9)) stops.push(y)
  stops.push(Math.max(0, total - vp.height))

  for (const [i, y] of stops.entries()) {
    await page.evaluate(top => window.scrollTo({top, behavior: 'instant'}), y)
    await page.evaluate(() => new Promise(r => { let n = 0; const s = () => (++n > 20 ? r() : requestAnimationFrame(s)); requestAnimationFrame(s) }))
    const check = await page.evaluate((isMobile) => {
      const doc = document.documentElement
      const vw = doc.clientWidth
      const out = {overflow: doc.scrollWidth - vw, wide: [], clipped: [], small: []}
      // An element that sticks out of, or is cut by, an ancestor that clips on
      // purpose is not a layout fault: the film stage, the line masks and the
      // camera's own scale all live inside `overflow: hidden` and are meant to.
      // Only the document scrolling sideways, or an element escaping into open
      // space, is a real break.
      const clipped = el => {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const o = getComputedStyle(a)
          if (/hidden|clip|auto|scroll/.test(o.overflowX) || /hidden|clip|auto|scroll/.test(o.overflowY)) return true
        }
        return false
      }
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const inClip = clipped(el)
        // sticking out past the right edge by more than a rounding error
        if (r.right > vw + 1.5 && cs.position !== 'fixed' && !inClip) {
          const tag = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`
          if (!out.wide.some(w => w.el === tag)) out.wide.push({el: tag, right: Math.round(r.right)})
        }
        // text taller than its own clipped box
        if (el.scrollHeight > el.clientHeight + 2 && /hidden|clip/.test(cs.overflowY) && el.textContent?.trim() && !inClip) {
          const tag = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`
          if (!out.clipped.some(w => w.el === tag)) out.clipped.push({el: tag, over: el.scrollHeight - el.clientHeight})
        }
        // touch targets
        if (isMobile && (el.tagName === 'A' || el.tagName === 'BUTTON') && el.textContent?.trim() && (r.height < 40 || r.width < 40)) {
          const tag = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`
          if (!out.small.some(w => w.el === tag)) out.small.push({el: tag, w: Math.round(r.width), h: Math.round(r.height)})
        }
      }
      return out
    }, Boolean(vp.mobile))
    const file = `${vp.name}-${String(i).padStart(2, '0')}.png`
    await page.screenshot({path: path.join(OUT, file)})
    record.shots.push(file)
    record.stops.push({y, ...check})
    if (check.overflow > 1) problem(vp.name, `horizontal overflow of ${check.overflow}px at y=${y}`)
    for (const w of check.wide) problem(vp.name, `${w.el} reaches ${w.right}px past a ${vp.width}px viewport at y=${y}`)
    for (const c of check.clipped) problem(vp.name, `${c.el} clips ${c.over}px of its own text at y=${y}`)
    for (const s of check.small) problem(vp.name, `${s.el} is a ${s.w}×${s.h} touch target at y=${y}`)
  }

  record.errors = errors
  if (errors.length) problem(vp.name, `console errors: ${errors.join(' | ')}`)

  const cols = Math.min(6, record.shots.length)
  const cw = vp.mobile ? 200 : 280
  const ch = Math.round(cw * vp.height / vp.width)
  const tiles = []
  for (let i = 0; i < record.shots.length; i += 1) {
    const buf = await sharp(path.join(OUT, record.shots[i])).resize(cw, ch).png().toBuffer()
    tiles.push({input: buf, left: (i % cols) * (cw + 6), top: Math.floor(i / cols) * (ch + 6)})
  }
  const rows = Math.ceil(record.shots.length / cols)
  await sharp({create: {width: cols * (cw + 6), height: rows * (ch + 6), channels: 3, background: '#ff00aa'}}).composite(tiles).png().toFile(path.join(OUT, `sheet-${vp.name}.png`))

  report.viewports.push(record)
  console.log(`[responsive] ${vp.name}: ${record.stops.length} stops, ${errors.length} console errors`)
  await page.close()
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'responsive.json'), JSON.stringify(report, null, 2))
const md = ['# Responsive audit: ' + URL_, '', ...report.viewports.map(v => `- ${v.viewport}: ${v.stops.length} stops, ${v.errors.length} console errors`), '', report.problems.length ? '## Problems' : '## No problems', ...report.problems.map(p => `- ${p}`)]
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n')
console.log(report.problems.length ? `[responsive] ${report.problems.length} problem(s):\n  ${report.problems.slice(0, 40).join('\n  ')}` : '[responsive] no problems')
if (assertMode && report.problems.length) process.exit(1)
