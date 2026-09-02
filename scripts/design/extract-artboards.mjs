#!/usr/bin/env node
// Snapshot rendered sections of the local site into static Design Component
// artboards (.dc.html) with computed styles inlined, so a design canvas shows
// the real CSS pixel for pixel at the captured viewport.
//
//   node scripts/design/extract-artboards.mjs --url http://localhost:3000/preview/home-v2 --out ../canvas
//
// Writes Main/Mobile/Tablet (full pages), FeatureTour (three states),
// EstimateProof, TrustStrip, PlanTable, StickyCta artboards, canvas.json and
// images.json (the public/ files the artboards reference, for seeding).
// Review tooling only; nothing here ships to the site.

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
const url = String(args.get('url') || 'http://localhost:3000/preview/home-v2')
const out = path.resolve(String(args.get('out') || 'canvas'))
fs.mkdirSync(out, { recursive: true })

const FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,900&display=swap">'

// Runs inside the page. Clones `root` with computed styles inlined.
const SNAPSHOT = `(function (root, options) {
  const INLINE = new Set(['SPAN','A','B','STRONG','EM','SMALL','SUP','SUB','I','OUTPUT','LABEL','BR','TIME','CODE'])
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','LINK','META','IFRAME'])
  const SIZE_HEIGHT = new Set(['IMG','SVG','FIGURE','VIDEO'])
  const PROPS = ['display','flex-direction','flex-wrap','justify-content','align-items','align-self','align-content','flex-grow','flex-shrink','flex-basis','order','gap','row-gap','column-gap','grid-template-columns','grid-template-rows','grid-column','grid-row','grid-area','justify-self','place-content','justify-items',
    'padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left',
    'font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','text-align','text-decoration-line','text-decoration-color','text-underline-offset','text-decoration-thickness','white-space','word-break','overflow-wrap','font-variant-numeric','text-shadow','vertical-align',
    'color','background-color','background-image','background-size','background-position','background-repeat','opacity',
    'border-top-width','border-top-style','border-top-color','border-right-width','border-right-style','border-right-color','border-bottom-width','border-bottom-style','border-bottom-color','border-left-width','border-left-style','border-left-color',
    'border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','box-shadow','outline',
    'position','top','right','bottom','left','z-index','overflow-x','overflow-y','object-fit','object-position','aspect-ratio','max-width','min-width','min-height','max-height','box-sizing','isolation','transform','backdrop-filter','cursor','list-style-type','text-wrap','pointer-events']
  const DEFAULTS = new Map([['flex-grow','0'],['flex-shrink','1'],['flex-basis','auto'],['order','0'],['opacity','1'],['z-index','auto'],['position','static'],['transform','none'],['box-shadow','none'],['text-shadow','none'],['background-image','none'],['letter-spacing','normal'],['text-transform','none'],['font-style','normal'],['white-space','normal'],['overflow-x','visible'],['overflow-y','visible'],['min-width','0px'],['min-height','0px'],['max-width','none'],['max-height','none'],['isolation','auto'],['backdrop-filter','none'],['cursor','auto'],['aspect-ratio','auto'],['text-decoration-line','none'],['outline','rgb(0, 0, 0) none 0px'],['vertical-align','baseline'],['text-wrap','wrap'],['pointer-events','auto'],['align-self','auto'],['justify-self','auto'],['place-content','normal'],['justify-items','normal'],['align-content','normal'],['grid-column','auto'],['grid-row','auto'],['grid-area','auto'],['font-variant-numeric','normal'],['word-break','normal'],['overflow-wrap','normal'],['list-style-type','none'],['object-position','50% 50%'],['background-size','auto'],['background-position','0% 0%'],['background-repeat','repeat'],['text-underline-offset','auto'],['text-decoration-thickness','auto'],['text-decoration-color','rgb(0, 0, 0)']])
  const images = new Set()
  function mapFont(v) {
    return v.replace(/"?__Outfit_Fallback_[a-z0-9]+"?/gi, 'Arial').replace(/"?__Outfit_[a-z0-9]+"?/gi, 'Outfit')
      .replace(/"?__Inter_Fallback_[a-z0-9]+"?/gi, 'Arial').replace(/"?__Inter_[a-z0-9]+"?/gi, 'Inter')
  }
  function styleOf(cs, el, pseudo) {
    const decl = []
    for (const p of PROPS) {
      let v = cs.getPropertyValue(p)
      if (!v) continue
      if (DEFAULTS.get(p) === v) continue
      if (p.startsWith('border-') && p.endsWith('-width') && v === '0px') continue
      if (p.startsWith('border-') && p.endsWith('-style') && v === 'none') continue
      if (p.startsWith('border-') && p.endsWith('-color')) { const side = p.split('-')[1]; if (cs.getPropertyValue('border-' + side + '-width') === '0px') continue }
      if (p.startsWith('border-') && p.endsWith('-radius') && v === '0px') continue
      if ((p.startsWith('padding-') || p.startsWith('margin-')) && v === '0px') continue
      if (p === 'background-color' && v === 'rgba(0, 0, 0, 0)') continue
      if (p === 'font-family') v = mapFont(v)
      if (p === 'position' && v === 'sticky') v = 'relative'
      // A fixed bar has no viewport inside a static artboard: pin it to the frame instead.
      if (p === 'position' && v === 'fixed') v = 'absolute'
      if (p === 'top' && cs.position === 'fixed') continue
      if ((p === 'top' || p === 'left' || p === 'right' || p === 'bottom') && (cs.position === 'static' || cs.position === 'sticky')) continue
      if (p === 'display' && el && el.tagName === 'LI' && v === 'list-item') v = 'block'
      if (p === 'gap' && v === 'normal') continue
      if ((p === 'row-gap' || p === 'column-gap') && v === 'normal') continue
      if (p === 'grid-template-columns' && v === 'none') continue
      if (p === 'grid-template-rows' && v === 'none') continue
      if (p === 'text-align' && v === 'start') continue
      decl.push(p + ':' + v)
    }
    return decl
  }
  function pseudoNode(el, which) {
    const cs = getComputedStyle(el, which)
    const content = cs.getPropertyValue('content')
    if (!content || content === 'none' || content === 'normal') return null
    if (cs.display === 'none') return null
    const span = document.createElement('span')
    const decl = styleOf(cs, null, which)
    if (cs.display === 'inline') decl.push('display:inline-block')
    const w = cs.getPropertyValue('width'), h = cs.getPropertyValue('height')
    if (w && w !== 'auto') decl.push('width:' + w)
    if (h && h !== 'auto') decl.push('height:' + h)
    span.setAttribute('style', decl.join(';'))
    const text = content.replace(/^"|"$/g, '')
    if (text && !/^counter\\(|^attr\\(|^url\\(/.test(content)) span.textContent = text
    return span
  }
  function clone(el, depth) {
    if (SKIP.has(el.tagName)) return null
    if (el.hidden) return null
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return null
    const tag = el.tagName.toLowerCase()
    const node = document.createElement(tag)
    for (const attr of ['alt','role','aria-label','aria-hidden','aria-current','aria-pressed','aria-expanded','type','open','width','height','for','title']) {
      const v = el.getAttribute(attr); if (v !== null) node.setAttribute(attr, v)
    }
    if (tag === 'a') node.setAttribute('href', '#')
    if (tag === 'input') { node.setAttribute('type', el.getAttribute('type') || 'text'); if (el.checked) node.setAttribute('checked', '') ; if (el.value) node.setAttribute('value', el.value) }
    if (tag === 'img') {
      const src = el.getAttribute('src') || ''
      const base = src.split('/').pop().split('?')[0]
      if (src.startsWith('/')) { images.add(src); node.setAttribute('src', base) } else node.setAttribute('src', src)
    }
    const decl = styleOf(cs, el)
    const rect = el.getBoundingClientRect()
    const isInline = INLINE.has(el.tagName) || cs.display === 'inline'
    if (!isInline && depth > 0 && cs.position !== 'absolute') {
      decl.push('box-sizing:border-box')
      if (cs.display !== 'contents') decl.push('width:' + rect.width + 'px')
    }
    if (depth === 0) { decl.push('box-sizing:border-box'); decl.push('width:' + rect.width + 'px'); decl.push('margin:0 auto') }
    if (SIZE_HEIGHT.has(el.tagName) || el.classList.contains('stage') || el.classList.contains('product-device') || el.classList.contains('tour-placeholder') || el.classList.contains('widget') || el.classList.contains('tour-phone')) {
      decl.push('height:' + rect.height + 'px')
    }
    if (cs.position === 'absolute') {
      // Absolute children keep their own box relative to the nearest positioned ancestor.
      decl.push('box-sizing:border-box')
      if (cs.getPropertyValue('width') !== 'auto') decl.push('width:' + cs.getPropertyValue('width'))
      if (cs.getPropertyValue('height') !== 'auto') decl.push('height:' + cs.getPropertyValue('height'))
    }
    node.setAttribute('style', decl.join(';'))
    const before = pseudoNode(el, '::before'); if (before) node.appendChild(before)
    for (const child of el.childNodes) {
      if (child.nodeType === 3) { if (child.textContent.trim() || isInline || child.parentElement === el) node.appendChild(document.createTextNode(child.textContent)) }
      else if (child.nodeType === 1) { const c = clone(child, depth + 1); if (c) node.appendChild(c) }
    }
    const after = pseudoNode(el, '::after'); if (after) node.appendChild(after)
    return node
  }
  const rootEl = typeof root === 'string' ? document.querySelector(root) : root
  if (!rootEl) return { error: 'no element for ' + root }
  const cloned = clone(rootEl, 0)
  const rect = rootEl.getBoundingClientRect()
  return { html: cloned.outerHTML, width: Math.round(rect.width), height: Math.round(rect.height), images: [...images], bg: getComputedStyle(document.querySelector('.editorial-site') || document.body).backgroundColor }
})`

function artboard(title, inner, width, height, bg) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  ${FONT_LINK}
  <style>
    body { margin: 0; background: ${bg}; font-family: Outfit, Arial, sans-serif; }
    a { color: inherit; text-decoration: none; } a:hover { color: inherit; }
    details > summary { list-style: none; } summary::-webkit-details-marker { display: none; }
    * { -webkit-font-smoothing: antialiased; }
  </style>
</helmet>
<div style="width:${width}px;min-height:${height}px;background:${bg};box-sizing:border-box;position:relative;overflow:hidden" title="${title}">
${inner}
</div>
</x-dc>
</body>
</html>
`
}

async function main() {
  const browser = await puppeteer.launch({ headless: true }).catch(() => puppeteer.launch({ headless: true, channel: 'chrome' }))
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'sendBeacon', { value: () => true, configurable: true }) })
  const images = new Set()
  const boards = []
  const manifest = []

  async function load(width, height, { mobile = false, reduced = false } = {}) {
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }])
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 })
    await page.evaluate(() => document.fonts && document.fonts.ready)
    await page.evaluate(async () => {
      // Open every lazy image and settle layout.
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager' })
      window.scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 300)); window.scrollTo(0, 0)
    })
    await new Promise((r) => setTimeout(r, 500))
  }
  async function snap(name, selector, { prepare, label } = {}) {
    if (prepare) await page.evaluate(prepare)
    const result = await page.evaluate(`${SNAPSHOT}(${JSON.stringify(selector)}, {})`)
    if (result.error) throw new Error(result.error)
    result.images.forEach((i) => images.add(i))
    manifest.push({ name, width: result.width, height: result.height })
    return { ...result, label }
  }

  // Full pages. Reduced motion keeps the hero in its two-column manual form
  // (the sticky runway makes no sense in a static frame).
  await load(1440, 900, { reduced: true })
  let r = await snap('Main', '.editorial-site')
  boards.push({ file: 'Main.dc.html', html: artboard('Home v2 — 1440', r.html, r.width, r.height, r.bg), w: 1440, h: r.height })

  await load(768, 1024, { reduced: true })
  r = await snap('Tablet', '.editorial-site')
  boards.push({ file: 'Tablet.dc.html', html: artboard('Home v2 — 768', r.html, r.width, r.height, r.bg), w: 768, h: r.height })

  await load(390, 844, { mobile: true, reduced: true })
  r = await snap('Mobile', '.editorial-site', { prepare: `document.querySelector('.sticky-cta')?.setAttribute('data-visible','true')` })
  boards.push({ file: 'Mobile.dc.html', html: artboard('Home v2 — 390', r.html, r.width, r.height, r.bg), w: 390, h: r.height })
  const bar = await snap('StickyCta', '.sticky-cta')
  boards.push({ file: 'StickyCta.dc.html', html: artboard('Sticky mobile CTA — 390', bar.html.replace('position:fixed', 'position:relative'), 390, bar.height + 40, r.bg), w: 390, h: bar.height + 40 })

  // Sections at desktop width, sticky story allowed (tour needs the wide layout).
  await load(1440, 900, { reduced: false })
  const sections = [
    ['TrustStrip', '.trust-strip', 'Trust strip'],
    ['EstimateProof', '.estimate-proof', 'How the estimate is built'],
    ['PlanTable', '#free', 'Free vs Pro'],
  ]
  for (const [name, selector, title] of sections) {
    const s = await snap(name, selector)
    boards.push({ file: `${name}.dc.html`, html: artboard(title, s.html, s.width, s.height, s.bg), w: s.width, h: s.height })
  }
  // Feature tour: two states stacked, each with a small label. A short
  // viewport keeps the 60svh steps compact in the static frame.
  await load(1440, 640, { reduced: false })
  const states = [0, 2]
  const parts = []
  let total = 0
  for (const active of states) {
    const s = await snap('FeatureTour', '.feature-tour', { prepare: `(() => {
      const steps = [...document.querySelectorAll('.tour-step')]
      steps.forEach((li, i) => { if (i === ${active}) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current') })
      const phone = [...document.querySelectorAll('.tour-phone .product-device > *')]
      phone.forEach((el, i) => { if (i === ${active}) el.removeAttribute('hidden'); else el.setAttribute('hidden','') })
    })()` })
    parts.push(`<div style="padding:18px 40px 6px;font:600 12px/1 Outfit, Arial, sans-serif;letter-spacing:.14em;color:#a6d6ba">STATE · STEP ${active + 1} ACTIVE</div>${s.html}`)
    total += s.height + 44
  }
  boards.push({ file: 'FeatureTour.dc.html', html: artboard('Feature tour — states', parts.join('\n'), 1440, total, '#0b302b'), w: 1440, h: total })

  await browser.close()
  for (const b of boards) fs.writeFileSync(path.join(out, b.file), b.html)
  fs.writeFileSync(path.join(out, 'images.json'), JSON.stringify([...images], null, 2))
  fs.writeFileSync(path.join(out, 'boards.json'), JSON.stringify(boards.map(({ file, w, h }) => ({ file, w, h })), null, 2))
  console.log(boards.map((b) => `${b.file} ${b.w}×${b.h}`).join('\n'))
  console.log('images:', [...images].join(', '))
}

main().catch((error) => { console.error(error); process.exit(1) })
