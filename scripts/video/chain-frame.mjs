#!/usr/bin/env node
// Last-frame extractor for the chained film (film v4).
//
//   node scripts/video/chain-frame.mjs --in <clip.mp4> [--out <dir>]
//
// The film is one continuous 30 s move delivered as six 5 s clips, each
// generated from the last frame of the one before it. This pulls that frame
// out at full resolution so it can be fed straight back in as the next clip's
// first frame, and prints the clip's duration and size so drift is visible
// before it accumulates.

import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i]
  if (!a.startsWith('--')) continue
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) args.set(a.slice(2), true)
  else { args.set(a.slice(2), next); i += 1 }
}
const input = args.get('in') ? path.resolve(String(args.get('in'))) : null
if (!input || !fs.existsSync(input)) { console.error('chain-frame: --in <clip.mp4> is required'); process.exit(2) }
const outDir = path.resolve(String(args.get('out') || path.dirname(input)))
fs.mkdirSync(outDir, {recursive: true})

function run(bin, argv, label) {
  const res = spawnSync(bin, argv, {stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (res.status !== 0) { console.error(`${label}: ${bin} exited ${res.status}\n${res.stderr}`); process.exit(1) }
  return res.stdout
}

const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', input], 'ffprobe'))
const stream = probe.streams?.[0] ?? {}
const duration = Number(probe.format?.duration || 0)
const [num, den] = String(stream.r_frame_rate || '24/1').split('/').map(Number)
const fps = den ? num / den : num

// Seek just before the end so the decoder lands on the final complete frame.
const base = path.basename(input, path.extname(input))
const last = path.join(outDir, `${base}-last.png`)
const first = path.join(outDir, `${base}-first.png`)
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-sseof', '-0.2', '-i', input, '-frames:v', '1', '-update', '1', last], 'last frame')
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-frames:v', '1', '-update', '1', first], 'first frame')

console.log(`[chain] ${path.basename(input)}: ${stream.width}×${stream.height}, ${fps.toFixed(2)} fps, ${duration.toFixed(2)} s`)
console.log(`[chain] first frame → ${first}`)
console.log(`[chain] last frame  → ${last}   (feed this as the next segment's first frame)`)
