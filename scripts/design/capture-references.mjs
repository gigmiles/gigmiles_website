#!/usr/bin/env node
// Reference captures for design-dna: screenshots at several scroll depths plus
// the loaded font faces, the computed type of the first heading and the page
// background, so colour and type measurements come from real pixels.
//
//   node scripts/design/capture-references.mjs --out "<dir>" [--sites pear.no,...]

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
const OUT = path.resolve(String(args.get('out') || 'qa-out/references'))
const SITES = {
  pear: 'https://pear.no/',
  elevate: 'https://www.elevatehomescriptions.com/',
  grassfeld: 'https://www.grassfeld.com/?r=0',
  oleum: 'https://www.oleumbudget.com/',
}
const wanted = args.get('sites') ? String(args.get('sites')).split(',') : Object.keys(SITES)
fs.mkdirSync(OUT, {recursive: true})
const sleep = ms => new Promise(r => setTimeout(r, ms))

const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage']})
const summary = {}
for (const key of wanted) {
  const url = SITES[key]
  if (!url) continue
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36')
  await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 1})
  const record = {url, shots: [], error: null}
  try {
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 90000})
    await page.evaluate(() => document.fonts.ready)
    await sleep(1500)
    const heights = [0, 0.5, 1, 2, 3, 5, 8, 12]
    for (const h of heights) {
      await page.evaluate(vh => window.scrollTo({top: vh * window.innerHeight, behavior: 'instant'}), h)
      await sleep(1400)
      const file = `${key}-1440-${String(h).replace('.', '_')}vh.png`
      await page.screenshot({path: path.join(OUT, file)})
      record.shots.push(file)
    }
    record.metrics = await page.evaluate(() => {
      const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight} ${f.style}`)
      const h1 = document.querySelector('h1') || document.querySelector('h2')
      const cs = h1 ? getComputedStyle(h1) : null
      const body = getComputedStyle(document.body)
      const p = document.querySelector('main p, p')
      const pcs = p ? getComputedStyle(p) : null
      return {
        title: document.title,
        fonts: [...new Set(fonts)],
        bodyFont: body.fontFamily, bodyBg: body.backgroundColor, bodyColor: body.color,
        h1: cs ? {text: h1.textContent.trim().slice(0, 80), fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform} : null,
        p: pcs ? {fontFamily: pcs.fontFamily, fontSize: pcs.fontSize, lineHeight: pcs.lineHeight, maxWidth: pcs.maxWidth} : null,
        scrollHeight: document.documentElement.scrollHeight,
        uppercaseCount: [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).textTransform === 'uppercase').length,
        videos: [...document.querySelectorAll('video')].map(v => ({src: v.currentSrc || v.getAttribute('src') || '', autoplay: v.autoplay, muted: v.muted, loop: v.loop, poster: v.getAttribute('poster') || ''})),
        canvases: document.querySelectorAll('canvas').length,
        stickies: [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).position === 'sticky').length,
      }
    })
    await page.setViewport({width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true})
    await page.reload({waitUntil: 'networkidle2', timeout: 90000})
    await sleep(1500)
    for (const h of [0, 1, 3]) {
      await page.evaluate(vh => window.scrollTo({top: vh * window.innerHeight, behavior: 'instant'}), h)
      await sleep(1200)
      const file = `${key}-390-${h}vh.png`
      await page.screenshot({path: path.join(OUT, file)})
      record.shots.push(file)
    }
  } catch (err) {
    record.error = String(err).slice(0, 300)
  }
  summary[key] = record
  console.log(key, record.error ? `ERROR ${record.error}` : `${record.shots.length} shots, fonts: ${(record.metrics?.fonts || []).slice(0, 6).join(' | ')}`)
  await page.close()
}
await browser.close()
fs.writeFileSync(path.join(OUT, 'references.json'), JSON.stringify(summary, null, 2))
