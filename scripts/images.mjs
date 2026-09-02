#!/usr/bin/env node
// Responsive image variants for the editorial pages.
//
//   node scripts/images.mjs            # emit -390.webp beside every 780px product/tour capture
//   node scripts/images.mjs --crop-w2  # one-off: crop w2.webp to the 460×130 region the widget shows
//
// The site serves raw <img> tags (next/image is disabled for the static export
// build), so the 390px variants feed srcSet/sizes on phones. Idempotent: a
// variant is regenerated only when the source is newer. Every output must stay
// under 60 KB, mirroring the ProductShowcase asset test.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve('public/editorial')
const LIMIT = 60_000
const args = new Set(process.argv.slice(2))

async function variant(source, width) {
  const target = source.replace(/\.webp$/, `-${width}.webp`)
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) {
    console.log(`[images] up to date: ${path.basename(target)}`)
    return
  }
  // Read into memory first: on Windows a sharp input stream can keep the file
  // handle open, which blocks writing next to (or over) the source.
  const input = fs.readFileSync(source)
  const meta = await sharp(input).metadata()
  if (!meta.width || meta.width <= width) {
    console.log(`[images] skip ${path.basename(source)}: ${meta.width}px wide`)
    return
  }
  const buffer = await sharp(input).resize({ width }).webp({ quality: 80 }).toBuffer()
  if (buffer.length > LIMIT) throw new Error(`${path.basename(target)} is ${buffer.length} bytes (> ${LIMIT})`)
  fs.writeFileSync(target, buffer)
  console.log(`[images] wrote ${path.basename(target)} (${buffer.length} bytes)`)
}

async function cropW2() {
  const source = path.join(dir, 'w2.webp')
  const input = fs.readFileSync(source)
  const meta = await sharp(input).metadata()
  if (meta.height === 130) { console.log('[images] w2.webp already cropped'); return }
  // The widget box is aspect-ratio 460/130 with overflow hidden, so only the
  // top 130 source pixels were ever visible. Keep exactly that region.
  const buffer = await sharp(input).extract({ left: 0, top: 0, width: meta.width, height: 130 }).webp({ quality: 85 }).toBuffer()
  fs.writeFileSync(source, buffer)
  console.log(`[images] cropped w2.webp to ${meta.width}×130 (${buffer.length} bytes)`)
}

async function main() {
  if (args.has('--crop-w2')) await cropW2()
  const sources = fs.readdirSync(dir)
    .filter((name) => /^(product-|tour-).*\.webp$/.test(name) && !/-\d+\.webp$/.test(name))
    .map((name) => path.join(dir, name))
  for (const source of sources) await variant(source, 390)
}

main().catch((error) => { console.error(error); process.exit(1) })
