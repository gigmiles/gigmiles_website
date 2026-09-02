#!/usr/bin/env node
// Measures the anchors the seams need from the delivered plates, as fractions of the plate:
//   P1: the pale receipt/label on the top bag near the centre (the burn's zoom rect)
//   P3: the receipt tape's top and bottom edges (the ledger line)
//   P4: the green route: its main horizontal y and a sampled polyline (the self-drawing stroke)
//   P5: the phone's black glass rectangle (the real screen)
//
//   node scripts/video/plates-measure.mjs --plates <dir> [--out <json>]

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
const dir = path.resolve(String(args.get('plates')))
const outFile = args.get('out') ? path.resolve(String(args.get('out'))) : path.join(dir, 'measure.json')
const find = prefix => { const f = fs.readdirSync(dir).find(x => x.toLowerCase().startsWith(prefix) && /\.(png|jpe?g|webp)$/i.test(x)); return f ? path.join(dir, f) : null }

async function raw(file) {
  const {data, info} = await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject: true})
  return {data, w: info.width, h: info.height, px: (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i + 1], data[i + 2]] }}
}
function bbox(img, test, region = [0, 0, 1, 1]) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, n = 0
  const [rx, ry, rw, rh] = region
  for (let y = Math.floor(ry * img.h); y < Math.floor((ry + rh) * img.h); y += 1) for (let x = Math.floor(rx * img.w); x < Math.floor((rx + rw) * img.w); x += 1) {
    if (!test(img.px(x, y))) continue
    n += 1; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
  }
  return n ? {x: x0 / img.w, y: y0 / img.h, w: (x1 - x0) / img.w, h: (y1 - y0) / img.h, n} : null
}
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b

const result = {}

// P1: pale label near the centre-left band of the top bag.
const p1 = find('p1')
if (p1) {
  const img = await raw(p1)
  const box = bbox(img, c => lum(c) > 160 && c[0] >= c[2], [0.26, 0.40, 0.2, 0.2])
  result.p1 = {file: path.basename(p1), label: box}
}

// P3: the tape = bright rows across the middle column band.
const p3 = find('p3')
if (p3) {
  const img = await raw(p3)
  const rows = []
  for (let y = 0; y < img.h; y += 1) {
    let bright = 0
    for (let x = Math.floor(img.w * 0.4); x < Math.floor(img.w * 0.6); x += 2) if (lum(img.px(x, y)) > 222) bright += 1
    if (bright > (img.w * 0.2 / 2) * 0.8) rows.push(y)
  }
  const tape = rows.length ? {top: rows[0] / img.h, bottom: rows[rows.length - 1] / img.h} : null
  const env = bbox(img, c => lum(c) > 168 && lum(c) < 215 && c[0] > c[2], [0.1, 0.12, 0.7, 0.3])
  result.p3 = {file: path.basename(p3), tape, envelope: env}
}

// P4: the green route. Column by column, the y of green pixels (g dominant, darker than paper).
const p4 = find('p4')
if (p4) {
  const img = await raw(p4)
  const isRoute = ([r, g, b]) => g > r + 18 && g > b + 18 && g < 150 && g > 40
  const poly = []
  const hist = new Map()
  for (let x = 0; x < img.w; x += 8) {
    const ys = []
    for (let y = Math.floor(img.h * 0.15); y < Math.floor(img.h * 0.7); y += 1) if (isRoute(img.px(x, y))) ys.push(y)
    if (!ys.length) continue
    poly.push([x / img.w, ys[Math.floor(ys.length / 2)] / img.h])
    for (const y of ys) { const k = Math.round(y / 4); hist.set(k, (hist.get(k) || 0) + 1) }
  }
  let bestK = 0, bestN = 0
  for (const [k, n] of hist) if (n > bestN) { bestN = n; bestK = k }
  result.p4 = {file: path.basename(p4), routeY: (bestK * 4) / img.h, polyline: poly.filter((_, i) => i % 3 === 0)}
}

// P5: the phone = the darkest large rectangle near the centre.
const p5 = find('p5')
if (p5) {
  const img = await raw(p5)
  const box = bbox(img, c => lum(c) < 34, [0.4, 0.42, 0.2, 0.22])
  result.p5 = {file: path.basename(p5), phone: box}
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2))
console.log(JSON.stringify({p1: result.p1?.label, p3: result.p3?.tape, p3env: result.p3?.envelope, p4: result.p4?.routeY, p4points: result.p4?.polyline?.length, p5: result.p5?.phone}, null, 1))
