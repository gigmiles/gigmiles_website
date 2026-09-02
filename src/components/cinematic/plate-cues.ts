import {progressAtFraction, type CueSpec, type LightSpec, type Rgb} from './cinematic-controller'
import type {SceneSpec} from './cinematic-cues'
import type {PlateSpec, SeamSpec} from './plate-engine'

// Version 3 of the film: five painted plates and four seams ("the bag",
// outputs/2026-09-02/website_cinematic/STORY_V3_FINAL.md). Until the
// operator's paintings land, the plates are placeholders cut from the painted
// clips plus two synthesised paper sheets (scripts/video/plates.mjs
// --placeholders); the seams, cameras and cues are the real ones.

// Bump when the encoded plates change so cached copies never meet an old seam table.
export const PLATES_VERSION = '2026-09-02p1'

/** Page progress at which the film reaches its last frame (the rest is the hold). */
export const PLATES_END_AT = 0.74

const plate = (name: string) => `/cinematic/plates/${name}.webp?v=${PLATES_VERSION}`

export const PLATE_ASSETS = {
  poster: '/cinematic/plates/poster.webp',
  posterMobile: '/cinematic/plates/poster-m.webp',
  /** The real app screen that fills the phone on the last plate: an approved tour capture, canonical figures only. Never painted. */
  screen: '/editorial/tour-home.webp',
}

/** Every plate keeps its key object at the anchor (50 % across, 48 % down); the seams are composed around that point. */
export const PLATES: PlateSpec[] = [
  {id: 'p1', src: {desktop: plate('p1'), mobile: plate('p1-m')}, anchor: [0.5, 0.48], cam: {from: {zoom: 1, x: 0, y: 0}, to: {zoom: 1.1, x: 0.01, y: -0.015}}},
  {id: 'p2', src: {desktop: plate('p2'), mobile: plate('p2-m')}, anchor: [0.5, 0.48], cam: {from: {zoom: 1.08, x: -0.01, y: -0.03}, to: {zoom: 1, x: 0, y: 0.02}}},
  {id: 'p3', src: {desktop: plate('p3'), mobile: plate('p3-m')}, anchor: [0.5, 0.48], cam: {from: {zoom: 1.03, x: 0, y: 0}, to: {zoom: 1, x: 0, y: 0}}},
  {
    id: 'p4', src: {desktop: plate('p4'), mobile: plate('p4-m')}, anchor: [0.5, 0.48],
    layers: [
      {desktop: plate('p4-l1'), mobile: plate('p4-l1-m'), parallax: 1.35},
      {desktop: plate('p4-l2'), mobile: plate('p4-l2-m'), parallax: 1.8},
    ],
    cam: {from: {zoom: 1.14, x: -0.045, y: 0.01}, to: {zoom: 1.04, x: 0.035, y: -0.01}},
  },
  {id: 'p5', src: {desktop: plate('p5'), mobile: plate('p5-m')}, anchor: [0.5, 0.48], screen: [0.33, 0.29, 0.34, 0.3825], cam: {from: {zoom: 1.04, x: 0, y: 0}, to: {zoom: 1, x: 0, y: 0}}},
]

/** Film fractions of the four seams. Burn: into the receipt, then the paper burns from the lower left. */
export const SEAMS: SeamSpec[] = [
  {mode: 'burn', from: 0.18, to: 0.27, origin: [0.2, 0.86], rect: [0.34, 0.3, 0.32, 0.3]},
  {mode: 'paper', from: 0.4, to: 0.47},
  {mode: 'draw', from: 0.58, to: 0.64},
  {mode: 'resolve', from: 0.8, to: 0.9},
]

/** Dwell boundaries: settle inside each plate, move through the seams. */
export const PLATE_BEATS = SEAMS.map(s => (s.from + s.to) / 2)

/** Stage ground per plate: warm night, cold rain, the lamp on paper (twice), first light. Stays in the green family so the desktop copy column keeps its contrast. */
export const PLATE_TINTS: Rgb[] = [
  {r: 26, g: 38, b: 28},
  {r: 9, g: 40, b: 46},
  {r: 40, g: 52, b: 44},
  {r: 40, g: 52, b: 44},
  {r: 42, g: 60, b: 50},
]

/** The light per plate: the phone on the seat, the cold canopy, the lamp from the upper left (twice), first light from the top. */
export const PLATE_LIGHTS: LightSpec[] = [
  {x: 62, y: 58, size: 30, alpha: 0.22},
  {x: 30, y: 22, size: 26, alpha: 0.1},
  {x: 20, y: 14, size: 60, alpha: 0.16},
  {x: 20, y: 14, size: 60, alpha: 0.14},
  {x: 50, y: 6, size: 80, alpha: 0.22},
]

// Same approved statements as the film; timed to the plates so each changes on
// its own clock, slightly before or after the picture, never with it.
export const PLATE_SCENES: SceneSpec[] = [
  {
    id: 'gross',
    headline: ['The screen', 'shows *gross*.'],
    support: 'It never shows what the drive cost you.',
    filmFrom: 0, filmTo: 0.22,
    rampIn: 0, stagger: 0,
    moment: 'P1 night cargo: the seat, the bags, the phone as a false light; fully visible at load',
  },
  {
    id: 'net',
    headline: ['Gross is', 'not *net*.'],
    support: 'Fuel, wear and an estimated tax set-aside come out first.',
    filmFrom: 0.2, filmTo: 0.44,
    moment: 'seam 1 (into the receipt, the paper burns) and P2 the pump',
  },
  {
    id: 'number',
    headline: ['See the', '*real number*.'],
    support: 'Your vehicle, your state, your day job, in the estimate.',
    filmFrom: 0.42, filmTo: 0.6,
    moment: 'seam 2 (the tape falls onto paper) and P3 the ledger; the line draws itself',
  },
  {
    id: 'inputs',
    headline: ['Built around', 'what you *enter*.'],
    support: 'Miles, hours and earnings. Optional W-2 context.',
    filmFrom: 0.58, filmTo: 0.82,
    moment: 'seam 3 (the plan draws itself) and P4 the plan, three layers in parallax',
  },
  {
    id: 'yours',
    headline: ['What is', 'actually *yours*.'],
    support: 'Free core. No card. No ads. Estimates for planning. Not tax advice.',
    filmFrom: 0.8, filmTo: 1,
    hold: true,
    moment: 'seam 4 (pencil resolves into paint, the phone fills with the real screen) and P5 first light; holds through the paper hand-off',
  },
]

/** Tone test: plate 1 (and its poster) swapped for one of the operator's registers, a / b / c. */
export const P1_VARIANTS = ['a', 'b', 'c'] as const
export type P1Variant = typeof P1_VARIANTS[number]
export const isP1Variant = (v: unknown): v is P1Variant => typeof v === 'string' && (P1_VARIANTS as readonly string[]).includes(v)
export function platesFor(variant?: P1Variant): PlateSpec[] {
  if (!variant) return PLATES
  return PLATES.map((p, i) => (i === 0 ? {...p, src: {desktop: plate(`p1-${variant}`), mobile: plate(`p1-${variant}-m`)}} : p))
}
export function postersFor(variant?: P1Variant) {
  if (!variant) return {poster: PLATE_ASSETS.poster, posterMobile: PLATE_ASSETS.posterMobile}
  return {poster: `/cinematic/plates/poster-${variant}.webp`, posterMobile: `/cinematic/plates/poster-${variant}-m.webp`}
}

export const PLATE_CUES: CueSpec[] = PLATE_SCENES.map(scene => ({
  id: scene.id,
  from: progressAtFraction(scene.filmFrom, PLATES_END_AT),
  to: scene.hold ? 1 : progressAtFraction(scene.filmTo, PLATES_END_AT),
  lines: scene.headline.length + 1,
  hold: scene.hold,
  ...(scene.rampIn !== undefined ? {rampIn: scene.rampIn} : {}),
  ...(scene.stagger !== undefined ? {stagger: scene.stagger} : {}),
}))
