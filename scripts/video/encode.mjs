#!/usr/bin/env node
// Scroll-scrub encode pipeline for the cinematic hero.
//
//   node scripts/video/encode.mjs --in "a.mp4,b.mp4,c.mp4" --sheet-out "<dir>"
//   node scripts/video/encode.mjs --in "clip.mp4" --crf 22 --mobile-crf 24 --out public/cinematic
//
// Why this exists: a video that is scrubbed by scroll position has to seek to
// any frame instantly, so it needs a dense keyframe cadence (GOP 8 desktop,
// GOP 4 mobile), no audio track, and faststart. Posters are cut from the
// encoded files so the first frame the visitor sees is the first frame the
// scrub will show. Everything runs ffmpeg with argument arrays (no shell), so
// OneDrive paths with spaces or non-ASCII characters survive on Windows.
//
// Outputs (in --out, default public/cinematic):
//   hero-desktop.mp4, hero-mobile.mp4, hero-poster.webp, hero-poster-mobile.webp,
//   manifest.json, and (with --sheet-out) hero-sheet.png for cue authoring.

import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
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

// --in accepts "file[@start-end]" items; the optional @start-end trims that clip (seconds, re-encoded).
const inputs = String(args.get('in') || '').split(',').map(s => s.trim()).filter(Boolean).map(item => {
  const m = item.match(/^(.*)@([\d.]+)-([\d.]+)$/)
  return m ? {file: m[1], start: Number(m[2]), end: Number(m[3])} : {file: item}
})
if (inputs.length === 0) { console.error('encode: --in <file[@start-end][,file,...]> is required'); process.exit(2) }
const OUT = path.resolve(String(args.get('out') || 'public/cinematic'))
const SRC_DIR = path.resolve('.video-src')
const CRF = Number(args.get('crf') || 22)
const MOBILE_CRF = Number(args.get('mobile-crf') || 24)
const SHEET_OUT = args.get('sheet-out') ? path.resolve(String(args.get('sheet-out'))) : null
// --xfade <seconds>: cross-dissolve between consecutive clips (a hard cut reads as a slide under the scrub).
const XFADE = Number(args.get('xfade') || 0)
const LIMITS = {desktop: 6_500_000, mobile: 2_500_000, poster: 60_000}

fs.mkdirSync(OUT, {recursive: true})
fs.mkdirSync(SRC_DIR, {recursive: true})

function run(bin, argv, label) {
  const res = spawnSync(bin, argv, {stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
  if (res.status !== 0) {
    console.error(`${label}: ${bin} exited ${res.status}\n${res.stderr}`)
    process.exit(1)
  }
  return res.stdout
}

function probe(file) {
  const json = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', file], 'ffprobe')
  const data = JSON.parse(json)
  const s = data.streams?.[0] || {}
  const [num, den] = String(s.r_frame_rate || '30/1').split('/').map(Number)
  return {width: Number(s.width), height: Number(s.height), fps: den ? num / den : num, duration: Number(data.format?.duration || 0)}
}

function sha1(file) { return createHash('sha1').update(fs.readFileSync(file)).digest('hex') }
function bytes(file) { return fs.statSync(file).size }

// 1. Copy the sources next to the repo (OneDrive files hydrate on read) and probe them.
const sources = inputs.map((src, i) => {
  const abs = path.resolve(src.file)
  if (!fs.existsSync(abs)) { console.error(`encode: missing input ${abs}`); process.exit(2) }
  const local = path.join(SRC_DIR, `src-${i}${path.extname(abs).toLowerCase() || '.mp4'}`)
  fs.copyFileSync(abs, local)
  const info = probe(local)
  const start = src.start ?? 0
  const end = src.end !== undefined ? Math.min(src.end, info.duration) : info.duration
  return {src: abs, local, ...info, start, end, duration: Math.max(0, end - start), trimmed: src.start !== undefined || src.end !== undefined}
})
const portrait = sources[0].height > sources[0].width
const totalDuration = sources.reduce((sum, s) => sum + s.duration, 0)
console.log(`encode: ${sources.length} source(s), ${portrait ? 'portrait' : 'landscape'}, ${totalDuration.toFixed(2)}s total`)
for (const s of sources) console.log(`  ${path.basename(s.src)} ${s.width}x${s.height} ${s.fps.toFixed(2)}fps ${s.duration.toFixed(2)}s${s.trimmed ? ` (trim ${s.start}-${s.end})` : ''}`)

// 2. Master: one clean 30fps intermediate, sources normalised to a common frame.
const masterW = portrait ? 1080 : 1920
const masterH = portrait ? 1920 : 1080
const master = path.join(SRC_DIR, 'master.mp4')
const chains = sources.map((_, i) => `[${i}:v]fps=30,scale=${masterW}:${masterH}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${masterW}:${masterH}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[v${i}]`)
let join = null
if (sources.length > 1 && XFADE > 0) {
  // xfade chain: offset_k = (sum of the first k durations) - k * XFADE; every dissolve centre lands at offset + XFADE / 2.
  const parts = []
  let acc = sources[0].duration
  let prev = '[v0]'
  for (let k = 1; k < sources.length; k += 1) {
    const offset = Math.max(0, acc - XFADE)
    const out = k === sources.length - 1 ? '[v]' : `[x${k}]`
    parts.push(`${prev}[v${k}]xfade=transition=fade:duration=${XFADE}:offset=${offset.toFixed(3)}${out}`)
    acc = acc - XFADE + sources[k].duration
    prev = out
  }
  join = parts.join(';')
} else if (sources.length > 1) {
  join = `${sources.map((_, i) => `[v${i}]`).join('')}concat=n=${sources.length}:v=1:a=0[v]`
}
const filter = join ? `${chains.join(';')};${join}` : chains[0].replace('[v0]', '[v]')
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...sources.flatMap(s => [...(s.trimmed ? ['-ss', String(s.start), '-t', String(s.duration)] : []), '-i', s.local]), '-filter_complex', filter, '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-an', master], 'master')
const masterInfo = probe(master)
console.log(`encode: master ${masterInfo.width}x${masterInfo.height} ${masterInfo.duration.toFixed(2)}s`)

// 3. Desktop and mobile scrub encodes. Long clips step down one size to hold the byte budget.
const long = masterInfo.duration > 12
const desktopScale = portrait ? `scale=-2:${long ? 1280 : 1440}:flags=lanczos` : `scale=${long ? 1280 : 1920}:-2:flags=lanczos`
const mobileScale = portrait ? 'scale=-2:960:flags=lanczos' : 'crop=ih*9/16:ih,scale=720:-2:flags=lanczos'
const common = ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-sc_threshold', '0', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-an', '-movflags', '+faststart']
const desktop = path.join(OUT, 'hero-desktop.mp4')
const mobile = path.join(OUT, 'hero-mobile.mp4')
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', master, '-vf', `${desktopScale},format=yuv420p`, '-crf', String(CRF), '-g', '8', '-keyint_min', '8', ...common, desktop], 'desktop')
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', master, '-vf', `${mobileScale},format=yuv420p`, '-crf', String(MOBILE_CRF), '-g', '4', '-keyint_min', '4', ...common, mobile], 'mobile')

// 4. Posters from the encoded files, first frame, stepping quality down until under 60 KB.
function poster(video, file) {
  for (const q of [82, 74, 66, 58, 50]) {
    run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(q), file], 'poster')
    if (bytes(file) <= LIMITS.poster) return q
  }
  return 50
}
const posterDesktop = path.join(OUT, 'hero-poster.webp')
const posterMobile = path.join(OUT, 'hero-poster-mobile.webp')
const qDesktop = poster(desktop, posterDesktop)
const qMobile = poster(mobile, posterMobile)

// 5. Contact sheet for cue authoring (one frame per second, six per row).
if (SHEET_OUT) {
  fs.mkdirSync(SHEET_OUT, {recursive: true})
  const rows = Math.max(1, Math.ceil(masterInfo.duration / 6))
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', master, '-vf', `fps=1,scale=${portrait ? '-2:426' : '240:-2'},tile=6x${rows}`, '-frames:v', '1', path.join(SHEET_OUT, 'hero-sheet.png')], 'sheet')
  // Half-second sheet for finer cue placement.
  const rows2 = Math.max(1, Math.ceil(masterInfo.duration * 2 / 8))
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', master, '-vf', `fps=2,scale=${portrait ? '-2:320' : '180:-2'},tile=8x${rows2}`, '-frames:v', '1', path.join(SHEET_OUT, 'hero-sheet-halfsec.png')], 'sheet')
}

// 6. Manifest and size guard.
const d = probe(desktop), m = probe(mobile)
const manifest = {
  generated: new Date().toISOString(),
  sources: sources.map(s => ({file: s.src, width: s.width, height: s.height, fps: Number(s.fps.toFixed(3)), duration: Number(s.duration.toFixed(3)), ...(s.trimmed ? {trim: [s.start, s.end]} : {})})),
  orientation: portrait ? 'portrait' : 'landscape',
  xfade: XFADE,
  beats: XFADE > 0 && sources.length > 1 ? sources.slice(0, -1).map((_, k) => { let acc = 0; for (let j = 0; j <= k; j += 1) acc += sources[j].duration; return Number(((acc - (k + 1) * XFADE + XFADE / 2) / (totalDuration - (sources.length - 1) * XFADE)).toFixed(4)) }) : [],
  duration: Number(masterInfo.duration.toFixed(3)),
  fps: 30,
  desktop: {file: 'hero-desktop.mp4', width: d.width, height: d.height, bytes: bytes(desktop), crf: CRF, gop: 8, sha1: sha1(desktop)},
  mobile: {file: 'hero-mobile.mp4', width: m.width, height: m.height, bytes: bytes(mobile), crf: MOBILE_CRF, gop: 4, sha1: sha1(mobile)},
  posters: {desktop: {file: 'hero-poster.webp', bytes: bytes(posterDesktop), quality: qDesktop}, mobile: {file: 'hero-poster-mobile.webp', bytes: bytes(posterMobile), quality: qMobile}},
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest, null, 2))

const problems = []
if (manifest.desktop.bytes > LIMITS.desktop) problems.push(`desktop ${manifest.desktop.bytes} B over ${LIMITS.desktop} B: raise --crf to ${CRF + 2}`)
if (manifest.mobile.bytes > LIMITS.mobile) problems.push(`mobile ${manifest.mobile.bytes} B over ${LIMITS.mobile} B: raise --mobile-crf to ${MOBILE_CRF + 2}`)
for (const [name, p] of Object.entries(manifest.posters)) if (p.bytes > LIMITS.poster) problems.push(`${name} poster ${p.bytes} B over ${LIMITS.poster} B`)
if (problems.length) { console.error('encode: budget exceeded\n  ' + problems.join('\n  ')); process.exit(1) }
console.log(`encode: ok (${(manifest.desktop.bytes / masterInfo.duration / 1000).toFixed(0)} kB/s desktop, ${(manifest.mobile.bytes / masterInfo.duration / 1000).toFixed(0)} kB/s mobile)`)
