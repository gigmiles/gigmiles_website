#!/usr/bin/env node
// Import approved Flutter fixture captures (PNG, 780×1688 = 390×844 @2x) as
// feature-tour assets: crop to the 780×1560 (1:2) frame the tour uses, encode
// WebP under 60 KB, and write public/editorial/tour-<id>.webp.
//
//   node scripts/design/import-captures.mjs --src <dir with tour-*.png> --map dashboard=home,shifts=shifts,tax-breakdown=tax,insights=insights
//
// Run scripts/images.mjs afterwards for the -390 variants.

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
const src = path.resolve(String(args.get('src') || '.'))
const out = path.resolve('public/editorial')
const LIMIT = 60_000
const map = Object.fromEntries(String(args.get('map') || '').split(',').filter(Boolean).map((pair) => pair.split('=')))

async function main() {
  for (const [capture, id] of Object.entries(map)) {
    const file = path.join(src, `tour-${capture}.png`)
    if (!fs.existsSync(file)) { console.log(`[captures] missing ${file}, skipped`); continue }
    const input = fs.readFileSync(file)
    const meta = await sharp(input).metadata()
    const width = meta.width, height = Math.min(meta.height, Math.round(width * 2))
    let quality = 82
    let buffer = await sharp(input).extract({ left: 0, top: 0, width, height }).webp({ quality }).toBuffer()
    while (buffer.length > LIMIT && quality > 40) {
      quality -= 6
      buffer = await sharp(input).extract({ left: 0, top: 0, width, height }).webp({ quality }).toBuffer()
    }
    if (buffer.length > LIMIT) throw new Error(`tour-${id}.webp still ${buffer.length} bytes at quality ${quality}`)
    const target = path.join(out, `tour-${id}.webp`)
    fs.writeFileSync(target, buffer)
    console.log(`[captures] ${path.basename(file)} → tour-${id}.webp ${width}×${height} q${quality} (${buffer.length} bytes)`)
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
