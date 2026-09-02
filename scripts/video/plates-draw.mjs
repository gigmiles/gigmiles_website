#!/usr/bin/env node
// Code-drawn plates for the cinematic hero, film v3 ("the bag").
//
//   node scripts/video/plates-draw.mjs [--out <dir>] [--sheet]
//
// Draws the five plates as SVG compositions (flat shapes with gradients,
// one key light from the upper left, long soft shadows, grain) and renders
// them with the installed Google Chrome at 1080×1920 @2x = 2160×3840 PNG,
// the size the operator's paintings would arrive at. P4 is written as a base
// plus two alpha layers for the parallax. The output folder feeds
// `node scripts/video/plates.mjs --plates <dir>` unchanged.
//
// No text, no numbers, no logos, no faces, no money symbols anywhere; every
// plate keeps its key object at the anchor (50 % across, 48 % down) and the
// lower third quiet.

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
const OUT = path.resolve(String(args.get('out') || 'C:/Users/LENOVO/OneDrive/Masaüstü/ajans/outputs/2026-09-02/website_cinematic/painted_production/plates-code'))
fs.mkdirSync(OUT, {recursive: true})

const W = 1080, H = 1920
const AX = 540, AY = 922

// ---- helpers ------------------------------------------------------------------
const rr = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`
const lin = (id, c1, c2, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`
const rad = (id, c1, c2, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`
const shadow = (id, dx, dy, blur, color, op) => `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="${color}" flood-opacity="${op}"/></filter>`
const blurF = (id, s) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`
const rnd = (seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 })(7)

function grain(opacity = 0.16) {
  return `<svg class="grain" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="opacity:${opacity}"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="${W}" height="${H}" filter="url(#g)"/></svg>`
}
function vignette(color = '0,0,0', strength = 0.5) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="position:absolute;inset:0"><defs><radialGradient id="vg" cx="0.5" cy="0.45" r="0.75"><stop offset="0.45" stop-color="rgba(${color},0)"/><stop offset="1" stop-color="rgba(${color},${strength})"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vg)"/></svg>`
}
function page({background, base, glow = '', defs = '', vignetteColor = '0,0,0', vignetteStrength = 0.5, grainOpacity = 0.16, transparent = false}) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${transparent ? 'transparent' : background}}
  .layer{position:absolute;inset:0;width:${W}px;height:${H}px}
  .glow{mix-blend-mode:screen}
  .grain{position:absolute;inset:0;mix-blend-mode:overlay}
  </style></head><body>
  <svg class="layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${base}</svg>
  ${glow ? `<svg class="layer glow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${glow}</svg>` : ''}
  ${transparent ? '' : vignette(vignetteColor, vignetteStrength)}
  ${transparent ? '' : grain(grainOpacity)}
  </body></html>`
}

// ---- shared parts -------------------------------------------------------------------
const SEAT_DEFS = `
${lin('seatNight', '#27342f', '#131c19')}
${lin('seatDawn', '#3f4f48', '#2a3833')}
${lin('sill', '#7a8084', '#3b4043', 0, 0, 0, 1)}
${lin('sillDawn', '#a3aaad', '#5d6467', 0, 0, 0, 1)}
${lin('tan', '#d3b287', '#a8895f')}
${lin('tanDark', '#b5946a', '#8c7050')}
${lin('canvas', '#d9ceb6', '#b3a78c')}
${lin('box', '#9d7852', '#6c5036')}
${lin('lining', '#22302b', '#141d1a', 0, 0, 0, 1)}
${lin('phoneScreen', '#e7f1ff', '#9dbbe0')}
${lin('shell', '#1b1f22', '#0e1113')}
${shadow('sh', 12, 22, 16, '#000', 0.5)}
${shadow('shSoft', 8, 26, 24, '#000', 0.28)}
${shadow('shPaper', 10, 18, 14, '#1c3a30', 0.32)}
${blurF('bl40', 40)}
${blurF('bl18', 18)}
${blurF('bl8', 8)}
`

function seat(grad, y0 = 400, h = 1140) {
  return `
  ${rr(70, y0, 940, h, 46, `url(#${grad})`)}
  ${rr(70, y0, 96, h, 40, 'rgba(0,0,0,0.25)')}
  ${rr(914, y0, 96, h, 40, 'rgba(0,0,0,0.25)')}
  <line x1="540" y1="${y0 + 60}" x2="540" y2="${y0 + h - 60}" stroke="rgba(0,0,0,0.35)" stroke-width="3" stroke-dasharray="16 12"/>
  ${rr(166, y0 + 24, 748, h - 48, 30, 'none', 'stroke="rgba(255,255,255,0.05)" stroke-width="2"')}
  `
}

function paperBag(x, y, w, h, grad, top = '#9c7d55') {
  return `<g filter="url(#sh)">
    ${rr(x, y, w, h, 18, `url(#${grad})`)}
    ${rr(x, y, w, 68, 18, top)}
    <line x1="${x + 18}" y1="${y + 68}" x2="${x + w - 18}" y2="${y + 68}" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
    <line x1="${x + w * 0.5}" y1="${y + 90}" x2="${x + w * 0.5}" y2="${y + h - 30}" stroke="rgba(0,0,0,0.12)" stroke-width="3"/>
    <line x1="${x + 30}" y1="${y + 34}" x2="${x + w - 30}" y2="${y + 34}" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
  </g>`
}

function courierBag(x, y, w, h, open = true) {
  return `<g filter="url(#sh)">
    ${rr(x, y, w, h, 40, '#111514', 'stroke="#2a3230" stroke-width="3"')}
    ${open ? rr(x + 40, y + 40, w - 80, h - 80, 28, 'url(#lining)') : ''}
    ${open ? rr(x + 40, y + 40, w - 80, 120, 28, 'rgba(0,0,0,0.5)') : ''}
    ${rr(x, y - 42, w, 92, 30, '#0d1110')}
    <line x1="${x + 60}" y1="${y + 6}" x2="${x + w - 60}" y2="${y + 6}" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
    ${rr(x - 84, y + h * 0.42, 100, 44, 22, '#0d1110')}
  </g>`
}

function wheel(cx, cy, r) {
  const spokes = []
  for (let i = 0; i < 18; i += 1) { const a = (i / 18) * Math.PI * 2; spokes.push(`<line x1="${cx + Math.cos(a) * 22}" y1="${cy + Math.sin(a) * 22}" x2="${cx + Math.cos(a) * (r - 34)}" y2="${cy + Math.sin(a) * (r - 34)}" stroke="#5a6165" stroke-width="3"/>`) }
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0c0c"/><circle cx="${cx}" cy="${cy}" r="${r - 30}" fill="none" stroke="#3c4144" stroke-width="10"/>${spokes.join('')}<circle cx="${cx}" cy="${cy}" r="18" fill="#2a2f32"/></g>`
}

function rain(count, opacity = 0.14, y0 = 0, y1 = H) {
  const lines = []
  for (let i = 0; i < count; i += 1) {
    const x = rnd() * W, y = y0 + rnd() * (y1 - y0), len = 50 + rnd() * 90
    lines.push(`<line x1="${x}" y1="${y}" x2="${x - len * 0.12}" y2="${y + len}" stroke="rgba(255,255,255,${(opacity * (0.5 + rnd())).toFixed(3)})" stroke-width="2"/>`)
  }
  return lines.join('')
}

// ---- P1 — night cargo (top-down seat through the open door) -----------------------
function p1() {
  const base = `
  ${rr(0, 0, W, 320, 0, 'url(#asphalt)')}
  ${rr(0, 150, W, 54, 0, '#5c6468')}
  <line x1="0" y1="150" x2="${W}" y2="150" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
  ${rr(0, 204, W, 116, 0, '#151d21')}
  ${rr(60, 210, 30, 110, 12, 'rgba(255,255,255,0.05)', 'filter="url(#bl8)"')}
  ${rr(220, 210, 22, 110, 10, 'rgba(255,255,255,0.05)', 'filter="url(#bl8)"')}
  ${wheel(870, 176, 120)}
  ${rr(918, -60, 240, 190, 22, '#0f1212')}
  <line x1="918" y1="40" x2="1158" y2="40" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
  ${rr(0, 300, W, 74, 0, 'url(#sill)')}
  <line x1="0" y1="302" x2="${W}" y2="302" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
  ${rr(0, 374, W, 26, 0, '#0b0f0e')}
  ${seat('seatNight')}
  ${rr(0, 1540, W, 400, 0, '#0a100e')}
  <g opacity="0.85">${rr(280, 1620, 520, 460, 38, 'url(#shell)')}${[0, 1, 2, 3, 4, 5].map(i => `<line x1="300" y1="${1700 + i * 52}" x2="780" y2="${1700 + i * 52}" stroke="rgba(255,255,255,0.05)" stroke-width="6"/>`).join('')}${rr(470, 1584, 140, 44, 16, '#0c0f10')}</g>
  <g filter="url(#sh)">${rr(40, 720, 250, 470, 30, 'url(#canvas)')}<path d="M85 722 C 95 640, 165 640, 175 722" fill="none" stroke="#a99c80" stroke-width="14"/><path d="M155 722 C 165 640, 235 640, 245 722" fill="none" stroke="#a99c80" stroke-width="14"/><line x1="165" y1="760" x2="165" y2="1150" stroke="rgba(0,0,0,0.12)" stroke-width="3"/></g>
  <g filter="url(#sh)">${rr(800, 700, 232, 322, 14, 'url(#box)')}<line x1="916" y1="700" x2="916" y2="1022" stroke="#5a4330" stroke-width="4"/><line x1="800" y1="860" x2="1032" y2="860" stroke="rgba(0,0,0,0.18)" stroke-width="3"/></g>
  ${courierBag(240, 560, 600, 620)}
  ${paperBag(660, 690, 150, 420, 'tanDark', '#8c7050')}
  ${paperBag(380, 640, 320, 480, 'tan')}
  <g transform="rotate(-6 ${AX} ${AY})" filter="url(#sh)">${rr(AX - 40, AY - 30, 80, 60, 4, '#f6f7f2')}<line x1="${AX - 26}" y1="${AY - 14}" x2="${AX + 26}" y2="${AY - 14}" stroke="rgba(0,0,0,0.08)" stroke-width="2"/><line x1="${AX - 26}" y1="${AY}" x2="${AX + 14}" y2="${AY}" stroke="rgba(0,0,0,0.08)" stroke-width="2"/><line x1="${AX - 26}" y1="${AY + 14}" x2="${AX + 20}" y2="${AY + 14}" stroke="rgba(0,0,0,0.08)" stroke-width="2"/></g>
  <line x1="${AX - 10}" y1="${AY - 40}" x2="${AX + 10}" y2="${AY - 40}" stroke="#2a2a2a" stroke-width="3"/>
  <g filter="url(#sh)">${rr(618, 1006, 104, 214, 20, '#0b0d0e', 'stroke="#2b3234" stroke-width="3"')}${rr(626, 1014, 88, 198, 14, 'url(#phoneScreen)')}</g>
  `
  const glow = `
  <circle cx="140" cy="30" r="420" fill="url(#amberGlow)" opacity="0.7"/>
  <ellipse cx="330" cy="86" rx="90" ry="40" fill="#e0483a" opacity="0.4" filter="url(#bl40)"/>
  <ellipse cx="470" cy="66" rx="70" ry="34" fill="#f0b25a" opacity="0.35" filter="url(#bl40)"/>
  <circle cx="200" cy="520" r="520" fill="url(#amberGlow)" opacity="0.22"/>
  <circle cx="670" cy="1113" r="430" fill="url(#coolGlow)" opacity="0.55"/>
  `
  const defs = SEAT_DEFS + lin('asphalt', '#1c2b34', '#0d161b', 0, 0, 0, 1) + rad('amberGlow', '#f0b45a', 'rgba(240,180,90,0)') + rad('coolGlow', '#bcd4ff', 'rgba(188,212,255,0)')
  return page({background: '#0b100f', base, glow, defs, vignetteStrength: 0.55})
}

// ---- P2 — the pump (side view at night) -----------------------------------------------
function p2() {
  const base = `
  ${rr(0, 0, W, H, 0, 'url(#nightCold)')}
  ${rr(0, 0, W, 260, 0, 'url(#canopy)')}
  ${rr(0, 250, W, 40, 0, '#252d31')}
  ${rr(120, 90, 340, 26, 13, '#f5fbff')}
  ${rr(620, 90, 340, 26, 13, '#f5fbff')}
  ${rr(0, 1600, W, 320, 0, '#0a1013')}
  <ellipse cx="760" cy="1720" rx="330" ry="70" fill="#0e1a22"/>
  <g filter="url(#sh)">${rr(560, 330, 760, 1250, 90, 'url(#car)')}<path d="M600 520 C 760 480, 900 500, 1080 470" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="10"/>${rr(640, 380, 440, 300, 60, '#0e161b')}${rain(24, 0.2, 380, 680)}${rr(700, 720, 140, 140, 22, '#2c343a')}<circle cx="770" cy="790" r="36" fill="#0a0d0f"/><path d="M590 1300 A 210 210 0 0 1 930 1300" fill="none" stroke="#0b0d0e" stroke-width="46"/><circle cx="760" cy="1500" r="172" fill="#0b0d0e"/><circle cx="760" cy="1500" r="102" fill="#2f3538"/>${[0, 1, 2, 3, 4].map(i => { const a = (i / 5) * Math.PI * 2; return `<line x1="${760 + Math.cos(a) * 30}" y1="${1500 + Math.sin(a) * 30}" x2="${760 + Math.cos(a) * 92}" y2="${1500 + Math.sin(a) * 92}" stroke="#171b1d" stroke-width="16"/>` }).join('')}<circle cx="760" cy="1500" r="28" fill="#1a1e21"/></g>
  <g filter="url(#sh)">${rr(60, 300, 320, 60, 24, '#4a5156')}${rr(60, 330, 320, 1180, 34, 'url(#pump)')}${rr(110, 420, 220, 150, 12, '#0a0c0d')}${rr(122, 432, 196, 126, 8, 'none', 'stroke="rgba(255,255,255,0.05)" stroke-width="2"')}${rr(150, 645, 160, 18, 6, '#07090a')}${rr(300, 900, 100, 220, 18, '#1a1e21')}</g>
  <path d="M380 1000 C 480 1000, 560 860, 700 800" fill="none" stroke="#111415" stroke-width="28" stroke-linecap="round"/>
  <path d="M380 1000 C 480 1000, 560 860, 700 800" fill="none" stroke="#3a4246" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
  <g filter="url(#sh)">${rr(690, 762, 120, 58, 14, '#2a2f33')}${rr(702, 800, 40, 90, 12, '#1d2124')}</g>
  <path d="M230 656 C 330 780, 430 850, ${AX} ${AY} C 640 990, 700 1110, 640 1220 C 610 1280, 560 1290, 545 1250" fill="none" stroke="#f3f5f0" stroke-width="62" stroke-linecap="round" filter="url(#sh)"/>
  <path d="M230 656 C 330 780, 430 850, ${AX} ${AY} C 640 990, 700 1110, 640 1220" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="2"/>
  ${rain(70, 0.12)}
  `
  const glow = `
  ${rr(120, 90, 340, 26, 13, '#ffffff', 'opacity="0.55" filter="url(#bl40)"')}
  ${rr(620, 90, 340, 26, 13, '#ffffff', 'opacity="0.55" filter="url(#bl40)"')}
  <circle cx="985" cy="420" r="60" fill="#f0b45a" opacity="0.55" filter="url(#bl40)"/>
  ${rr(700, 1690, 130, 44, 22, '#e0392b', 'opacity="0.85" filter="url(#bl18)"')}
  <circle cx="760" cy="1700" r="160" fill="#c0392b" opacity="0.18" filter="url(#bl40)"/>
  `
  const defs = SEAT_DEFS + lin('nightCold', '#101d23', '#05090b', 0, 0, 0, 1) + lin('canopy', '#dfe9ec', '#7b8c93', 0, 0, 0, 1) + lin('car', '#3b444b', '#1a2024') + lin('pump', '#3b4146', '#22272b')
  return page({background: '#05090b', base, glow, defs, vignetteStrength: 0.5})
}

// ---- P3 — the ledger (paper, the tape flat, the sealed envelope) ---------------------------
function paperBase() {
  return `${rr(0, 0, W, H, 0, 'url(#paper)')}${rr(0, 0, W, H, 0, 'url(#lamp)')}`
}
const PAPER_DEFS = lin('paper', '#e9efe3', '#d8e1d5', 0, 0, 0, 1) + rad('lamp', 'rgba(255,250,235,0.55)', 'rgba(255,250,235,0)', 0.12, 0.08, 0.9) + rad('lampGlow', '#fff6dc', 'rgba(255,246,220,0)')

function p3() {
  const base = `
  ${paperBase()}
  <g filter="url(#shPaper)">${rr(160, 777, 760, 145, 6, '#f7f8f3')}<line x1="560" y1="779" x2="560" y2="920" stroke="rgba(0,0,0,0.05)" stroke-width="2"/></g>
  <g transform="translate(594 576) rotate(-8)" filter="url(#shPaper)">${rr(-150, -95, 300, 190, 8, '#efe8d6')}<path d="M-150 -95 L0 12 L150 -95" fill="#e6dfcc" stroke="#d6cdb6" stroke-width="2"/><circle cx="0" cy="12" r="12" fill="#c9b99a"/></g>
  `
  const glow = `<circle cx="120" cy="120" r="900" fill="url(#lampGlow)" opacity="0.35"/>`
  return page({background: '#e5eddf', base, glow, defs: SEAT_DEFS + PAPER_DEFS, vignetteColor: '40,60,50', vignetteStrength: 0.22, grainOpacity: 0.2})
}

// ---- P4 — the plan (base, routes layer, objects layer) ---------------------------------
function planGrid() {
  const lines = []
  for (let x = 90; x <= 990; x += 130) lines.push(`<line x1="${x}" y1="240" x2="${x}" y2="1720" stroke="#6a726b" stroke-width="2" opacity="0.45"/>`)
  for (let y = 240; y <= 1720; y += 146) lines.push(`<line x1="90" y1="${y}" x2="990" y2="${y}" stroke="#6a726b" stroke-width="2" opacity="0.45"/>`)
  return lines.join('')
}
function p4a() {
  const base = `
  ${paperBase()}
  ${planGrid()}
  <path d="M220 160 Q 540 60 860 160" fill="none" stroke="#4a4f49" stroke-width="4" opacity="0.7"/>
  <line x1="220" y1="160" x2="860" y2="160" stroke="#4a4f49" stroke-width="3" opacity="0.5"/>
  ${[0.3, 0.4, 0.5, 0.6, 0.7].map(t => { const x = 220 + 640 * t; const y = 160 - (1 - Math.pow((t - 0.5) * 2, 2)) * 50; return `<line x1="${x}" y1="${y}" x2="${x}" y2="160" stroke="#4a4f49" stroke-width="2" opacity="0.5"/>` }).join('')}
  `
  const glow = `<circle cx="120" cy="120" r="900" fill="url(#lampGlow)" opacity="0.3"/>`
  return page({background: '#e5eddf', base, glow, defs: SEAT_DEFS + PAPER_DEFS, vignetteColor: '40,60,50', vignetteStrength: 0.22, grainOpacity: 0.2})
}
function p4b() {
  const base = `
  <path d="M40 ${AY} L345 ${AY} L345 776 L605 776 L605 ${AY} L1040 ${AY}" fill="none" stroke="#2f5a48" stroke-width="8" stroke-linejoin="round" opacity="0.92"/>
  <path d="M345 ${AY} L345 1214 L735 1214" fill="none" stroke="#2f5a48" stroke-width="4" stroke-dasharray="16 12" opacity="0.8"/>
  <path d="M735 776 L735 484 L865 484" fill="none" stroke="#2f5a48" stroke-width="4" stroke-dasharray="16 12" opacity="0.8"/>
  <g transform="translate(238 576)" fill="none" stroke="#4a4f49" stroke-width="4"><circle r="62"/><line x1="0" y1="0" x2="0" y2="-40"/><line x1="0" y1="0" x2="28" y2="16"/><circle r="4" fill="#4a4f49"/></g>
  <path transform="translate(216 1382) scale(2.3)" d="M-40 -18 L-4 -24 L18 -20 L34 -8 L36 6 L20 4 L10 14 L26 26 L8 30 L-10 20 L-26 24 L-42 8 Z" fill="none" stroke="#4a4f49" stroke-width="1.7" opacity="0.8"/>
  `
  return page({background: 'transparent', base, defs: '', transparent: true})
}
function p4c() {
  const base = `
  <g transform="translate(389 ${AY})" fill="#dfe6d8" stroke="#4a4f49" stroke-width="4"><rect x="-64" y="-30" width="128" height="60" rx="16"/><rect x="-36" y="-20" width="72" height="40" rx="8" fill="none"/><line x1="-64" y1="0" x2="-48" y2="0"/><line x1="48" y1="0" x2="64" y2="0"/></g>
  <g transform="translate(691 845)" fill="none" stroke="#4a4f49" stroke-width="4"><circle cx="-34" cy="0" r="16"/><circle cx="34" cy="0" r="16"/><path d="M-34 0 L-6 -26 L26 -26 L34 0"/><rect x="-12" y="-46" width="30" height="24" fill="#dfe6d8"/></g>
  <g transform="translate(540 768)" fill="#dfe6d8" stroke="#4a4f49" stroke-width="4"><path d="M-30 -36 L30 -36 L36 36 L-36 36 Z"/><path d="M-14 -36 L-10 -52 L10 -52 L14 -36" fill="none"/></g>
  <g transform="translate(842 422)" fill="#e6ecdf" stroke="#4a4f49" stroke-width="4"><path d="M-46 80 L-46 -60 L10 -90 L10 50 Z"/><path d="M10 -90 L60 -64 L60 76 L10 50" fill="#cfd8c9"/><path d="M-46 80 L10 50 L60 76" fill="none"/>${[-40, -20, 0, 20, 40].map(y => `<line x1="-38" y1="${y + 6}" x2="2" y2="${y - 14}" stroke="#4a4f49" stroke-width="1.5" opacity="0.6"/>`).join('')}</g>
  `
  return page({background: 'transparent', base, defs: '', transparent: true})
}

// ---- P5 — first light (top-down seat, the phone at the anchor, screen off) -------------
function p5() {
  const base = `
  ${rr(0, 0, W, 320, 0, 'url(#morning)')}
  ${rr(0, 300, W, 74, 0, 'url(#sillDawn)')}
  <line x1="0" y1="302" x2="${W}" y2="302" stroke="rgba(255,255,255,0.45)" stroke-width="3"/>
  ${rr(0, 374, W, 26, 0, '#1d2624')}
  ${seat('seatDawn')}
  ${rr(0, 1540, W, 400, 0, '#1d2724')}
  <g filter="url(#shSoft)">${rr(130, 350, 340, 300, 30, '#151918')}<line x1="160" y1="500" x2="440" y2="500" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>${rr(210, 318, 180, 44, 22, '#0f1312')}</g>
  <g filter="url(#shSoft)">${rr(640, 330, 280, 330, 18, 'url(#tan)')}${rr(640, 330, 280, 62, 18, '#9c7d55')}<line x1="660" y1="392" x2="900" y2="392" stroke="rgba(0,0,0,0.22)" stroke-width="3"/><line x1="780" y1="420" x2="780" y2="640" stroke="rgba(0,0,0,0.12)" stroke-width="3"/></g>
  <g filter="url(#shSoft)">${rr(120, 900, 280, 200, 26, 'url(#battery)')}${rr(200, 878, 120, 40, 14, '#0f1214')}${rr(372, 950, 18, 30, 4, '#3a4145')}${rr(372, 1000, 18, 30, 4, '#3a4145')}<line x1="150" y1="1000" x2="360" y2="1000" stroke="rgba(255,255,255,0.06)" stroke-width="3"/></g>
  <g transform="translate(820 1036)" filter="url(#shSoft)">${rr(-45, -75, 90, 150, 22, '#0f1214')}<circle cx="0" cy="-104" r="26" fill="none" stroke="#7b8388" stroke-width="8"/>${rr(-22, -40, 44, 30, 8, '#1c2124')}${rr(-22, 0, 44, 30, 8, '#1c2124')}</g>
  <g filter="url(#shSoft)">${rr(350, 551, 380, 746, 54, '#1c2124')}${rr(356, 557, 368, 734, 48, '#05080a')}<path d="M380 580 Q 540 560 700 580" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2"/></g>
  <path d="M420 1290 C 470 1320, 520 1300, 560 1340 C 590 1370, 570 1400, 540 1392" fill="none" stroke="#f5f7f2" stroke-width="46" stroke-linecap="round" filter="url(#shSoft)"/>
  <g filter="url(#shSoft)"><circle cx="800" cy="1382" r="80" fill="#c9bfa8"/><circle cx="800" cy="1382" r="70" fill="#f0ede3"/><circle cx="800" cy="1382" r="56" fill="#e6e2d6"/>${rr(786, 1330, 28, 14, 7, '#d8d3c6')}</g>
  `
  const glow = `<circle cx="540" cy="200" r="900" fill="url(#morningGlow)" opacity="0.35"/><rect x="0" y="0" width="${W}" height="1200" fill="url(#morningFall)" opacity="0.5"/>`
  const defs = SEAT_DEFS + lin('morning', '#e2eae0', '#b5c2ba', 0, 0, 0, 1) + lin('battery', '#2f363a', '#15191b') + rad('morningGlow', '#ffffff', 'rgba(255,255,255,0)') + lin('morningFall', 'rgba(230,238,230,0.5)', 'rgba(230,238,230,0)', 0, 0, 0, 1)
  return page({background: '#1d2724', base, glow, defs, vignetteStrength: 0.35, grainOpacity: 0.14})
}

// ---- render -------------------------------------------------------------------------------------
const plates = [
  ['p1-night-cargo', p1()],
  ['p2-pump', p2()],
  ['p3-ledger', p3()],
  ['p4-plan', p4a()],
  ['p4a-plan-base', p4a()],
  ['p4b-plan-routes', p4b(), true],
  ['p4c-plan-objects', p4c(), true],
  ['p5-first-light', p5()],
]
const browser = await puppeteer.launch({headless: true, channel: 'chrome', args: ['--no-sandbox']})
const page_ = await browser.newPage()
await page_.setViewport({width: W, height: H, deviceScaleFactor: 2})
for (const [name, html, transparent] of plates) {
  await page_.setContent(html, {waitUntil: 'load'})
  const file = path.join(OUT, `${name}.png`)
  await page_.screenshot({path: file, omitBackground: Boolean(transparent), captureBeyondViewport: false})
  console.log(`[draw] ${name}.png ${fs.statSync(file).size} B`)
}
await browser.close()

if (args.get('sheet')) {
  const ids = ['p1-night-cargo', 'p2-pump', 'p3-ledger', 'p4-plan', 'p5-first-light']
  const cw = 270, ch = 480
  const tiles = []
  for (let i = 0; i < ids.length; i += 1) {
    let img = sharp(path.join(OUT, `${ids[i]}.png`))
    if (ids[i] === 'p4-plan') img = img.composite([{input: path.join(OUT, 'p4b-plan-routes.png')}, {input: path.join(OUT, 'p4c-plan-objects.png')}])
    tiles.push({input: await img.png().toBuffer().then(b => sharp(b).resize(cw, ch).png().toBuffer()), left: i * (cw + 8), top: 0})
  }
  await sharp({create: {width: ids.length * (cw + 8), height: ch, channels: 3, background: '#ff00aa'}}).composite(tiles).png().toFile(path.join(OUT, 'plates-code-sheet.png'))
  console.log('[draw] sheet written')
}
