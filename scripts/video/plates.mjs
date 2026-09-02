#!/usr/bin/env node
// Plate encoder for the cinematic hero, film v3 ("the bag").
//
//   node scripts/video/plates.mjs --placeholders [--sheet-out <dir>]
//   node scripts/video/plates.mjs --plates <dir> [--sheet-out <dir>]
//
// --placeholders cuts stills from the operator's painted clips (frame dumps on
// OneDrive) for plates 1, 2 and 5 and synthesises the two paper plates (the
// ledger sheet and the plan, the plan as a base plus two alpha layers), so the
// seams can be felt on localhost before the paintings arrive.
// --plates <dir> takes the operator's paintings: p1-*.png … p5-*.png and,
// optionally, p4a-*.png p4b-*.png p4c-*.png as the plan's layers.
//
// Outputs (public/cinematic/plates): p1..p5.webp at 1080×1920, p1-m..p5-m.webp
// at 540×960, p4-l1/p4-l2 (+ -m) with alpha, poster.webp (720×1280),
// poster-m.webp (390×693), plates.json with sizes and sha1s, and with
// --sheet-out a contact sheet of the five plates.

import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i]
  if (!a.startsWith('--')) continue
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) args.set(a.slice(2), true)
  else { args.set(a.slice(2), next); i += 1 }
}
const OUT = path.resolve(String(args.get('out') || 'public/cinematic/plates'))
const SHEET_OUT = args.get('sheet-out') ? path.resolve(String(args.get('sheet-out'))) : null
const CLIPS = 'C:/Users/LENOVO/OneDrive/Masaüstü/ajans/outputs/2026-09-02/website_cinematic/painted_production/clips'
const W = 1080, H = 1920, MW = 540, MH = 960
const LIMITS = {plate: 340_000, mobile: 130_000, poster: 60_000}
const PAPER = '#e5eddf'
fs.mkdirSync(OUT, {recursive: true})

const sha1 = file => createHash('sha1').update(fs.readFileSync(file)).digest('hex')
const bytes = file => fs.statSync(file).size

// Deterministic grain so two runs produce the same bytes.
function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function grainBuffer(w, h, alpha, seed) {
  const rnd = mulberry32(seed)
  const buf = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i += 1) { const v = Math.round(90 + rnd() * 110); buf[i * 4] = v; buf[i * 4 + 1] = v; buf[i * 4 + 2] = v; buf[i * 4 + 3] = alpha }
  return buf
}

async function paperSheet(seed) {
  const grain = await sharp(grainBuffer(W, H, 26, seed), {raw: {width: W, height: H, channels: 4}}).png().toBuffer()
  const vignette = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx="30%" cy="18%" r="95%"><stop offset="0" stop-color="#fff9ea" stop-opacity=".22"/><stop offset=".45" stop-color="#e5eddf" stop-opacity="0"/><stop offset="1" stop-color="#2c4a3c" stop-opacity=".22"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`)
  return sharp({create: {width: W, height: H, channels: 3, background: PAPER}}).composite([{input: grain, blend: 'overlay'}, {input: vignette}]).png().toBuffer()
}

// P3: the receipt tape lying flat (lower edge at 48 %) and a sealed envelope.
function ledgerSvg() {
  const tapeTop = Math.round(H * 0.405), tapeBottom = Math.round(H * 0.48), x0 = Math.round(W * 0.15), x1 = Math.round(W * 0.85)
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><filter id="s" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>
  <rect x="${x0 + 10}" y="${tapeTop + 14}" width="${x1 - x0}" height="${tapeBottom - tapeTop}" fill="#5a6a5c" opacity=".35" filter="url(#s)"/>
  <rect x="${x0}" y="${tapeTop}" width="${x1 - x0}" height="${tapeBottom - tapeTop}" fill="#f7f8f3"/>
  <g transform="translate(${Math.round(W * 0.55)} ${Math.round(H * 0.3)}) rotate(-8)">
    <rect x="-150" y="-92" width="300" height="184" fill="#5a6a5c" opacity=".3" filter="url(#s)" transform="translate(8 12)"/>
    <rect x="-150" y="-92" width="300" height="184" fill="#efe8d6"/>
    <path d="M-150 -92 L0 8 L150 -92" fill="none" stroke="#d6cdb6" stroke-width="3"/>
  </g>
</svg>`)
}

// P4 base: the street grid and a bridge in the top margin, in graphite.
function planBaseSvg() {
  const lines = []
  for (let x = 0.08; x <= 0.92; x += 0.12) lines.push(`<line x1="${W * x}" y1="${H * 0.12}" x2="${W * x}" y2="${H * 0.9}"/>`)
  for (let y = 0.14; y <= 0.9; y += 0.076) lines.push(`<line x1="${W * 0.06}" y1="${H * y}" x2="${W * 0.94}" y2="${H * y}"/>`)
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g stroke="#5b615a" stroke-width="2" opacity=".55">${lines.join('')}</g>
  <path d="M${W * 0.2} ${H * 0.085} Q ${W * 0.5} ${H * 0.03} ${W * 0.8} ${H * 0.085}" fill="none" stroke="#5b615a" stroke-width="3" opacity=".6"/>
  <g stroke="#5b615a" stroke-width="2" opacity=".5">${[0.3, 0.4, 0.5, 0.6, 0.7].map(x => `<line x1="${W * x}" y1="${H * 0.085}" x2="${W * x}" y2="${H * (0.05 + Math.abs(x - 0.5) * 0.07)}"/>`).join('')}</g></svg>`)
}

// P4 layer 1: the routes (the main one through the anchor), the clock, the state outline. Alpha.
function planRoutesSvg() {
  const y = H * 0.48
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <path d="M${W * 0.04} ${y} L${W * 0.32} ${y} L${W * 0.32} ${y - H * 0.076} L${W * 0.56} ${y - H * 0.076} L${W * 0.56} ${y} L${W * 0.96} ${y}" fill="none" stroke="#2f5a48" stroke-width="7" stroke-linejoin="round" opacity=".9"/>
  <path d="M${W * 0.32} ${y} L${W * 0.32} ${y + H * 0.152} L${W * 0.68} ${y + H * 0.152}" fill="none" stroke="#2f5a48" stroke-width="3.5" stroke-dasharray="14 10" opacity=".8"/>
  <path d="M${W * 0.68} ${y - H * 0.076} L${W * 0.68} ${y - H * 0.228} L${W * 0.8} ${y - H * 0.228}" fill="none" stroke="#2f5a48" stroke-width="3.5" stroke-dasharray="14 10" opacity=".8"/>
  <g transform="translate(${W * 0.22} ${H * 0.3})" fill="none" stroke="#4a4f49" stroke-width="4"><circle r="62"/><line x1="0" y1="0" x2="0" y2="-40"/><line x1="0" y1="0" x2="28" y2="16"/></g>
  <path transform="translate(${W * 0.2} ${H * 0.72}) scale(2.2)" d="M-40 -18 L-4 -24 L18 -20 L34 -8 L36 6 L20 4 L10 14 L26 26 L8 30 L-10 20 L-26 24 L-42 8 Z" fill="none" stroke="#4a4f49" stroke-width="1.6" opacity=".8"/>
</svg>`)
}

// P4 layer 2: the sedan, the e-bike, the bag and the tower, as pencil objects. Alpha.
function planObjectsSvg() {
  const y = H * 0.48
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <g transform="translate(${W * 0.36} ${y})" fill="#dfe6d8" stroke="#4a4f49" stroke-width="4"><rect x="-60" y="-28" width="120" height="56" rx="14"/><rect x="-34" y="-20" width="68" height="40" rx="8" fill="none"/></g>
  <g transform="translate(${W * 0.64} ${y - H * 0.04})" fill="none" stroke="#4a4f49" stroke-width="4"><circle cx="-34" cy="0" r="16"/><circle cx="34" cy="0" r="16"/><path d="M-34 0 L-6 -26 L26 -26 L34 0"/><rect x="-12" y="-46" width="30" height="24" fill="#dfe6d8"/></g>
  <g transform="translate(${W * 0.5} ${H * 0.4})" fill="#dfe6d8" stroke="#4a4f49" stroke-width="4"><path d="M-30 -36 L30 -36 L36 36 L-36 36 Z"/><path d="M-14 -36 L-10 -52 L10 -52 L14 -36" fill="none"/></g>
  <g transform="translate(${W * 0.78} ${H * 0.22})" fill="#e6ecdf" stroke="#4a4f49" stroke-width="4"><path d="M-46 80 L-46 -60 L10 -90 L10 50 Z"/><path d="M10 -90 L60 -64 L60 76 L10 50" fill="#d3dccb"/><path d="M-46 80 L10 50 L60 76" fill="none"/></g>
</svg>`)
}

async function synthPlate(id) {
  if (id === 'p3') return sharp(await paperSheet(3)).composite([{input: ledgerSvg()}]).png().toBuffer()
  if (id === 'p4') return sharp(await paperSheet(4)).composite([{input: planBaseSvg()}]).png().toBuffer()
  throw new Error(`no synth for ${id}`)
}

async function svgLayer(svg) {
  return sharp(svg).ensureAlpha().png().toBuffer()
}

async function encodePlate(id, input, {alpha = false} = {}) {
  const desktop = path.join(OUT, `${id}.webp`)
  const mobile = path.join(OUT, `${id}-m.webp`)
  const base = sharp(input)
  if (alpha) {
    await base.clone().resize(W, H, {fit: 'cover'}).webp({quality: 90, alphaQuality: 90}).toFile(desktop)
    await sharp(input).resize(MW, MH, {fit: 'cover'}).webp({quality: 88, alphaQuality: 88}).toFile(mobile)
  } else {
    await base.clone().resize(W, H, {fit: 'cover', position: 'centre'}).webp({quality: 82}).toFile(desktop)
    await sharp(input).resize(MW, MH, {fit: 'cover', position: 'centre'}).webp({quality: 80}).toFile(mobile)
  }
  return {desktop: {file: path.basename(desktop), bytes: bytes(desktop), sha1: sha1(desktop)}, mobile: {file: path.basename(mobile), bytes: bytes(mobile), sha1: sha1(mobile)}}
}

// --tone-test <dir>: p1-a.*, p1-b.*, p1-c.* become p1-<x>.webp, p1-<x>-m.webp and poster-<x>(-m).webp for the ?p1= switch.
if (args.get('tone-test')) {
  const dir = path.resolve(String(args.get('tone-test')))
  const result = {generated: new Date().toISOString(), variants: {}}
  for (const v of ['a', 'b', 'c']) {
    const file = fs.readdirSync(dir).find(f => f.toLowerCase().startsWith(`p1-${v}`) && /\.(png|jpe?g|webp)$/i.test(f))
    if (!file) continue
    const src = path.join(dir, file)
    const meta = await sharp(src).metadata()
    const enc = await encodePlate(`p1-${v}`, src)
    const poster = path.join(OUT, `poster-${v}.webp`)
    for (const q of [80, 72, 64]) { await sharp(path.join(OUT, `p1-${v}.webp`)).resize(720, 1280).webp({quality: q}).toFile(poster); if (bytes(poster) <= LIMITS.poster) break }
    await sharp(path.join(OUT, `p1-${v}.webp`)).resize(390, 693).webp({quality: 78}).toFile(path.join(OUT, `poster-${v}-m.webp`))
    result.variants[v] = {source: src, width: meta.width, height: meta.height, ...enc, poster: bytes(poster)}
    console.log(`[plates] tone test ${v}: ${file} ${meta.width}×${meta.height} → ${enc.desktop.bytes} B desktop, ${enc.mobile.bytes} B mobile, poster ${bytes(poster)} B`)
  }
  fs.writeFileSync(path.join(OUT, 'tone-test.json'), JSON.stringify(result, null, 2))
  process.exit(0)
}

const manifest = {generated: new Date().toISOString(), mode: args.get('placeholders') ? 'placeholders' : 'plates', plates: {}, layers: {}}
const sources = {}

if (args.get('placeholders')) {
  sources.p1 = path.join(CLIPS, 'beat1-recognition-frames/frame-05-2.00s.png')
  sources.p2 = path.join(CLIPS, 'beat2-tension-frames/frame-04-1.50s.png')
  sources.p5 = path.join(CLIPS, 'beat5b-departure-frames/frame-05-2.00s.png')
  for (const [id, file] of Object.entries(sources)) if (!fs.existsSync(file)) { console.error(`plates: missing ${file}`); process.exit(2) }
  sources.p3 = await synthPlate('p3')
  sources.p4 = await synthPlate('p4')
  manifest.layers.p4 = [await encodePlate('p4-l1', await svgLayer(planRoutesSvg()), {alpha: true}), await encodePlate('p4-l2', await svgLayer(planObjectsSvg()), {alpha: true})]
} else if (args.get('plates')) {
  const dir = path.resolve(String(args.get('plates')))
  const find = prefix => fs.readdirSync(dir).find(f => f.toLowerCase().startsWith(prefix) && /\.(png|jpe?g|webp)$/i.test(f))
  // Plates the operator has not delivered yet fall back to the placeholder cut, so a partial set still encodes.
  const fallback = {p1: path.join(CLIPS, 'beat1-recognition-frames/frame-05-2.00s.png'), p2: path.join(CLIPS, 'beat2-tension-frames/frame-04-1.50s.png'), p5: path.join(CLIPS, 'beat5b-departure-frames/frame-05-2.00s.png')}
  const missing = []
  for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) {
    const file = find(`${id}-`) || find(id)
    if (file) { sources[id] = path.join(dir, file); continue }
    missing.push(id)
    sources[id] = id === 'p3' || id === 'p4' ? await synthPlate(id) : fallback[id]
  }
  const l1 = find('p4b'), l2 = find('p4c'), base = find('p4a')
  if (base) sources.p4 = path.join(dir, base)
  if (l1 && l2) manifest.layers.p4 = [await encodePlate('p4-l1', path.join(dir, l1), {alpha: true}), await encodePlate('p4-l2', path.join(dir, l2), {alpha: true})]
  else if (missing.includes('p4')) manifest.layers.p4 = [await encodePlate('p4-l1', await svgLayer(planRoutesSvg()), {alpha: true}), await encodePlate('p4-l2', await svgLayer(planObjectsSvg()), {alpha: true})]
  manifest.missing = missing
  if (missing.length) console.log(`[plates] placeholders kept for: ${missing.join(', ')}`)
} else {
  console.error('plates: --placeholders or --plates <dir> is required')
  process.exit(2)
}

for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) {
  const src = sources[id]
  const meta = await sharp(src).metadata()
  manifest.plates[id] = {source: typeof src === 'string' ? src : 'synthesised', width: meta.width, height: meta.height, ...(await encodePlate(id, src))}
}

// Poster: the first plate, so the first frame the visitor sees is the first frame the scrub shows.
const poster = path.join(OUT, 'poster.webp')
const posterM = path.join(OUT, 'poster-m.webp')
for (const q of [80, 72, 64]) { await sharp(path.join(OUT, 'p1.webp')).resize(720, 1280).webp({quality: q}).toFile(poster); if (bytes(poster) <= LIMITS.poster) break }
await sharp(path.join(OUT, 'p1.webp')).resize(390, 693).webp({quality: 78}).toFile(posterM)
manifest.poster = {file: 'poster.webp', bytes: bytes(poster), sha1: sha1(poster)}
manifest.posterMobile = {file: 'poster-m.webp', bytes: bytes(posterM), sha1: sha1(posterM)}
manifest.total = {desktop: Object.values(manifest.plates).reduce((s, p) => s + p.desktop.bytes, 0) + (manifest.layers.p4 ?? []).reduce((s, l) => s + l.desktop.bytes, 0), mobile: Object.values(manifest.plates).reduce((s, p) => s + p.mobile.bytes, 0) + (manifest.layers.p4 ?? []).reduce((s, l) => s + l.mobile.bytes, 0)}
fs.writeFileSync(path.join(OUT, 'plates.json'), JSON.stringify(manifest, null, 2))

if (SHEET_OUT) {
  fs.mkdirSync(SHEET_OUT, {recursive: true})
  const cw = 270, ch = 480
  const tiles = []
  const ids = ['p1', 'p2', 'p3', 'p4', 'p5']
  for (let i = 0; i < ids.length; i += 1) {
    let img = sharp(path.join(OUT, `${ids[i]}.webp`))
    if (ids[i] === 'p4' && manifest.layers.p4) img = img.composite([{input: path.join(OUT, 'p4-l1.webp')}, {input: path.join(OUT, 'p4-l2.webp')}])
    tiles.push({input: await img.png().toBuffer().then(b => sharp(b).resize(cw, ch).png().toBuffer()), left: i * (cw + 8), top: 0})
  }
  await sharp({create: {width: ids.length * (cw + 8), height: ch, channels: 3, background: '#ff00aa'}}).composite(tiles).png().toFile(path.join(SHEET_OUT, 'plates-sheet.png'))
}

const over = []
for (const [id, p] of Object.entries(manifest.plates)) { if (p.desktop.bytes > LIMITS.plate) over.push(`${id} desktop ${p.desktop.bytes}`); if (p.mobile.bytes > LIMITS.mobile) over.push(`${id} mobile ${p.mobile.bytes}`) }
for (const [id, p] of Object.entries(manifest.plates)) console.log(`[plates] ${id}: ${p.desktop.bytes} B desktop, ${p.mobile.bytes} B mobile (${p.width}×${p.height} source)`)
console.log(`[plates] poster ${manifest.poster.bytes} B, mobile poster ${manifest.posterMobile.bytes} B; totals desktop ${manifest.total.desktop} B, mobile ${manifest.total.mobile} B`)
if (over.length) { console.error(`[plates] over budget: ${over.join(', ')}`); process.exit(1) }
