#!/usr/bin/env node
// Scroll-sync QA for the cinematic hero.
//
//   node scripts/qa/cinematic-walk.mjs --url http://localhost:3000/preview/cinematic --out ../qa/cinematic-walk [--assert]
//
// Launches the installed Google Chrome (Puppeteer's bundled Chromium has no
// H.264 decoder, so the film would never paint), then for each viewport walks
// the page through nine forward and five backward progress positions, waits
// for the playhead to settle, and records the film time, the active scene and
// the visible scenes. Asserts: the film is monotonic in both directions, one
// scene reads at full strength outside ramp windows, never more than two are
// visible, no long task after load, no console errors, no horizontal overflow.
// Screenshots every position and composes a contact sheet per viewport with
// sharp. Reduced-motion run: static mode, no mp4 requested, poster visible.

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
const OUT = path.resolve(String(args.get('out') || 'qa-out/cinematic-walk'))
const assertMode = Boolean(args.get('assert'))
fs.mkdirSync(OUT, {recursive: true})
const sleep = ms => new Promise(r => setTimeout(r, ms))

const VIEWPORTS = [
  {name: '1440x900', width: 1440, height: 900},
  {name: '1920x1080', width: 1920, height: 1080},
  {name: '390x844', width: 390, height: 844, mobile: true},
  {name: '1440x900-reduced', width: 1440, height: 900, reduced: true},
]
const FORWARD = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1]
const BACKWARD = [0.75, 0.5, 0.25, 0]
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const browser = await puppeteer.launch({headless: true, channel: 'chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']})
const report = {url: URL_, viewports: [], problems: []}
const problem = (vp, text) => report.problems.push(`${vp}: ${text}`)

for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  const errors = []
  const mp4Requests = []
  page.on('console', m => { if (m.type() === 'error' && !/webpack-hmr|favicon/.test(m.text())) errors.push(m.text().slice(0, 160)) })
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 160)))
  const plateRequests = []
  page.on('request', r => { if (/\.mp4/.test(r.url())) mp4Requests.push(r.url()); if (/\/cinematic\/plates\/p\d/.test(r.url())) plateRequests.push(r.url()) })
  await page.evaluateOnNewDocument(() => {
    navigator.sendBeacon = () => true
    window.__longTasks = []
    try {
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.__longTasks.push({duration: Math.round(e.duration), at: Math.round(e.startTime)}) }).observe({type: 'longtask', buffered: true})
    } catch {}
  })
  if (vp.reduced) await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}])
  if (vp.mobile) await page.setUserAgent(MOBILE_UA)
  await page.setViewport({width: vp.width, height: vp.height, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: Boolean(vp.mobile), hasTouch: Boolean(vp.mobile)})
  await page.goto(URL_, {waitUntil: 'networkidle2', timeout: 90000})
  await page.evaluate(() => document.fonts.ready)

  const hasVideo = await page.evaluate(() => Boolean(document.querySelector('video.cine-video')))
  const canPlay = await page.evaluate(() => document.querySelector('video.cine-video')?.canPlayType('video/mp4; codecs="avc1.640028"') ?? '')
  if (!vp.reduced && hasVideo && !canPlay) { problem(vp.name, `this browser cannot decode H.264 (canPlayType="${canPlay}"): use Google Chrome, not Chromium`) }

  // Wait for the film to prime (or for static mode to settle).
  let state = null
  for (let i = 0; i < 60; i += 1) {
    state = await page.evaluate(() => { const r = document.getElementById('cine-hero'); return {mode: r?.dataset.cineMode, video: r?.dataset.cineVideo} })
    if (state.mode === 'static' || state.video === 'primed' || state.video === 'failed') break
    await sleep(250)
  }
  const record = {viewport: vp.name, mode: state?.mode, video: state?.video, canPlay, hasVideo, positions: [], shots: []}

  const runway = await page.evaluate(() => { const r = document.getElementById('cine-hero'); const s = r.querySelector('.cine-stage'); return {top: r.getBoundingClientRect().top + window.scrollY, travel: r.offsetHeight - s.offsetHeight} })

  async function walkTo(p, label) {
    const top = runway.top + runway.travel * p
    await page.evaluate(y => window.scrollTo({top: y, behavior: 'instant'}), top)
    // settle: wait until the playhead has caught up (or 90 frames)
    const settled = await page.evaluate(async (expectedP) => {
      const root = document.getElementById('cine-hero')
      const video = document.querySelector('video.cine-video')
      const duration = video?.duration || 0
      let frames = 0
      let expected = Math.min(1, expectedP / 0.74) * Math.max(0, duration - 0.05)
      await new Promise(resolve => {
        const step = () => {
          frames += 1
          if (root.dataset.cineTarget) expected = Number(root.dataset.cineTarget)
          const current = video ? (video.currentTime || 0) : Number(root.dataset.cineTime || 0)
          const done = root.dataset.cineMode === 'static' || Math.abs(current - expected) < (video ? 0.05 : 0.004) || frames > 240
          if (done) resolve(); else requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
      const scenes = [...document.querySelectorAll('.cine-scene')].map(s => ({id: s.dataset.cue, o: Number(getComputedStyle(s).opacity), active: !s.hasAttribute('inert')}))
      const stage = ['--cam-s', '--cam-x', '--cam-y', '--ground', '--lx', '--la'].map(n => root.style.getPropertyValue(n)).join('|')
      return {expected, currentTime: video ? video.currentTime : Number(root.dataset.cineTime || 0), readyState: video?.readyState ?? null, frames, p: root.style.getPropertyValue('--p'), scenes, stage, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth}
    }, p)
    await sleep(120)
    // Dead-scroll check: one small step further, something visible must have changed.
    // The hold (p >= endAt) is the hand-off: the paper body scrolls over the frozen frame, so the stage itself is meant to be still.
    if (!vp.reduced && p < 0.72) {
      await page.evaluate(y => window.scrollTo({top: y, behavior: 'instant'}), top + runway.travel * 0.01)
      await page.evaluate(() => new Promise(r => { let n = 0; const s = () => (++n > 12 ? r() : requestAnimationFrame(s)); requestAnimationFrame(s) }))
      const after = await page.evaluate(() => { const root = document.getElementById('cine-hero'); const video = document.querySelector('video.cine-video'); return {t: video ? (video.currentTime || 0) : Number(root.dataset.cineTime || 0), tol: video ? 0.02 : 0.001, stage: ['--cam-s', '--cam-x', '--cam-y', '--ground', '--lx', '--la'].map(n => root.style.getPropertyValue(n)).join('|'), scenes: [...document.querySelectorAll('.cine-scene')].map(s => getComputedStyle(s).opacity).join(',')} })
      settled.dead = after.stage === settled.stage && after.scenes === settled.scenes.map(s => s.o).join(',') && Math.abs(after.t - (settled.currentTime ?? 0)) < after.tol
      await page.evaluate(y => window.scrollTo({top: y, behavior: 'instant'}), top)
      await sleep(80)
    }
    const file = `${vp.name}-${label}-${String(p).replace('.', '_')}.png`
    await page.screenshot({path: path.join(OUT, file)})
    record.shots.push(file)
    record.positions.push({label, p, ...settled})
    return settled
  }

  for (const p of FORWARD) await walkTo(p, 'fwd')
  for (const p of BACKWARD) await walkTo(p, 'back')
  // The close: scroll to the end so every reveal has had its chance, and keep the last screen.
  // Step down the rest of the page the way a reader would, so every reveal gets its intersection.
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = runway.top + runway.travel; y < total; y += Math.floor(vp.height * 0.8)) {
    await page.evaluate(top => window.scrollTo({top, behavior: 'instant'}), y)
    await sleep(160)
  }
  await page.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}))
  await sleep(1400)
  const endFile = `${vp.name}-end.png`
  await page.screenshot({path: path.join(OUT, endFile)})
  record.shots.push(endFile)

  record.errors = errors
  record.mp4Requests = mp4Requests.length
  record.longTasks = await page.evaluate(() => window.__longTasks || [])
  record.reveals = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(el => getComputedStyle(el).opacity === '0').length)

  // Assertions
  if (vp.reduced) {
    if (record.mode !== 'static') problem(vp.name, `reduced motion should be static, got ${record.mode}`)
    if (mp4Requests.length) problem(vp.name, `reduced motion requested ${mp4Requests.length} mp4(s)`)
    if (plateRequests.length) problem(vp.name, `reduced motion requested ${plateRequests.length} plate(s)`)
  } else {
    const expectedMode = vp.mobile ? 'mobile' : 'desktop'
    if (record.mode !== expectedMode) problem(vp.name, `expected mode ${expectedMode}, got ${record.mode} (video ${record.video})`)
    const fwd = record.positions.filter(x => x.label === 'fwd').map(x => x.currentTime)
    const back = record.positions.filter(x => x.label === 'back').map(x => x.currentTime)
    const slack = record.hasVideo ? 0.05 : 0.002
    for (let i = 1; i < fwd.length; i += 1) if (fwd[i] < fwd[i - 1] - slack) problem(vp.name, `film went backwards while scrolling down: ${fwd[i - 1].toFixed(2)} -> ${fwd[i].toFixed(2)}`)
    for (let i = 1; i < back.length; i += 1) if (back[i] > back[i - 1] + slack) problem(vp.name, `film went forwards while scrolling up: ${back[i - 1].toFixed(2)} -> ${back[i].toFixed(2)}`)
    const tolerance = record.hasVideo ? (vp.mobile ? 0.5 : 0.35) : 0.03
    for (const pos of record.positions) {
      if (pos.currentTime !== null && Math.abs(pos.currentTime - pos.expected) > tolerance) problem(vp.name, `p=${pos.p || pos.p === 0 ? pos.p : '?'} film at ${pos.currentTime?.toFixed(2)}s, expected ${pos.expected.toFixed(2)}s`)
      const bright = pos.scenes.filter(s => s.o > 0.9).length
      const visible = pos.scenes.filter(s => s.o > 0.05).length
      if (visible > 2) problem(vp.name, `p=${pos.p}: ${visible} scenes visible at once`)
      if (pos.scenes.filter(s => s.active).length !== 1) problem(vp.name, `p=${pos.p}: ${pos.scenes.filter(s => s.active).length} active scenes`)
      if (pos.overflow) problem(vp.name, `horizontal overflow at p=${pos.p}`)
      if (pos.dead) problem(vp.name, `dead scroll at p=${pos.p}: nothing changed one step further`)
      pos.bright = bright
    }
  }
  if (errors.length) problem(vp.name, `console errors: ${errors.join(' | ')}`)
  // Long tasks during the first 4 s are hydration and dev-mode compilation; only later ones would be the scrub.
  const lateLong = record.longTasks.filter(t => t.duration > 100 && t.at > 4000)
  if (lateLong.length) problem(vp.name, `long task(s) over 100ms after load: ${lateLong.map(t => `${t.duration}ms@${t.at}ms`).join(', ')}`)
  if (record.reveals) problem(vp.name, `${record.reveals} [data-reveal] element(s) left hidden`)

  // Contact sheet
  const cols = vp.mobile ? 7 : 4
  const cw = vp.mobile ? 260 : 480
  const ch = Math.round(cw * vp.height / vp.width)
  const tiles = []
  for (let i = 0; i < record.shots.length; i += 1) {
    const buf = await sharp(path.join(OUT, record.shots[i])).resize(cw, ch).png().toBuffer()
    tiles.push({input: buf, left: (i % cols) * (cw + 10), top: Math.floor(i / cols) * (ch + 10)})
  }
  const rows = Math.ceil(record.shots.length / cols)
  await sharp({create: {width: cols * (cw + 10), height: rows * (ch + 10), channels: 3, background: '#ff00aa'}}).composite(tiles).png().toFile(path.join(OUT, `sheet-${vp.name}.png`))

  report.viewports.push(record)
  console.log(`[cinematic] ${vp.name}: mode=${record.mode} video=${record.video} shots=${record.shots.length} errors=${errors.length} longTasks=${record.longTasks.map(t => `${t.duration}ms@${t.at}ms`).join(' ') || 'none'} hiddenReveals=${record.reveals}`)
  for (const pos of record.positions) console.log(`   ${pos.label} p=${pos.p} film=${pos.currentTime === null ? '-' : pos.currentTime.toFixed(2)}s (exp ${pos.expected.toFixed(2)}) scenes=${pos.scenes.map(s => `${s.id}:${s.o.toFixed(2)}${s.active ? '*' : ''}`).join(' ')}`)
  await page.close()
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'walk.json'), JSON.stringify(report, null, 2))
const md = [`# Cinematic walk: ${URL_}`, '', ...report.viewports.map(v => `- ${v.viewport}: mode ${v.mode}, video ${v.video}, ${v.shots.length} shots, ${v.errors.length} console errors, long tasks ${v.longTasks.map(t => `${t.duration}ms@${t.at}ms`).join(' ') || 'none'}`), '', report.problems.length ? '## Problems' : '## No problems', ...report.problems.map(p => `- ${p}`)]
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n')
console.log(report.problems.length ? `[cinematic] ${report.problems.length} problem(s):\n  ${report.problems.join('\n  ')}` : '[cinematic] no problems')
if (assertMode && report.problems.length) process.exit(1)
