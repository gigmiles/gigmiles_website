import {progressAtFraction, type CueSpec, type LightSpec, type Rgb} from './cinematic-controller'

// Bump when the encoded files change so cached copies are never scrubbed
// against an old cue table.
export const CINEMATIC_VERSION = '2026-09-02c'

/** Page progress at which the film reaches its last frame (the rest is the hold). */
export const END_AT = 0.74

export const CINEMATIC_ASSETS = {
  desktop: `/cinematic/hero-desktop.mp4?v=${CINEMATIC_VERSION}`,
  mobile: `/cinematic/hero-mobile.mp4?v=${CINEMATIC_VERSION}`,
  poster: '/cinematic/hero-poster.webp',
  posterMobile: '/cinematic/hero-poster-mobile.webp',
  /** Painted edition: six operator-made clips joined with 0.6 s dissolves (beat 4 trimmed to 4.0 s). */
  duration: 23.21,
}

/** Dissolve centres between the six clips, as fractions of the film (clip lengths 4.04 / 4.04 / 6.04 / 4.0 / 4.04 / 4.04, minus five 0.6 s overlaps). */
export const CINEMATIC_BEATS = [0.161, 0.310, 0.544, 0.690, 0.839]

/** Ground behind the film per clip: warm night, cold rain, the lamp, pre-dawn slate, first light. All stay inside the brand's green family. */
export const BEAT_TINTS: Rgb[] = [
  {r: 26, g: 38, b: 28},
  {r: 9, g: 40, b: 46},
  {r: 40, g: 36, b: 22},
  {r: 18, g: 36, b: 52},
  {r: 42, g: 60, b: 50},
  {r: 42, g: 60, b: 50},
]

/** The film's light per clip: the phone glow low and warm, none in the rain, the lamp on the face, a cold streetlight high, first light broad and pale. */
export const BEAT_LIGHTS: LightSpec[] = [
  {x: 42, y: 60, size: 30, alpha: 0.22},
  {x: 30, y: 25, size: 26, alpha: 0.08},
  {x: 50, y: 48, size: 46, alpha: 0.34},
  {x: 62, y: 18, size: 30, alpha: 0.14},
  {x: 50, y: 12, size: 70, alpha: 0.18},
  {x: 50, y: 0, size: 90, alpha: 0.26},
]

export interface SceneSpec {
  id: string
  /** One entry per masked line; nine words at most across the headline. `*word*` marks the driver's word (set in 800 weight, Mint). */
  headline: string[]
  support: string
  /** Fractions of the film's duration this message belongs to (authored from the contact sheet). */
  filmFrom: number
  filmTo: number
  /** Override the default entry ramp / line stagger (the first scene is on screen at load, no entrance). */
  rampIn?: number
  stagger?: number
  hold?: boolean
  /** Which film moment the message sits on, for the receipt. */
  moment: string
}

// Copy uses approved brand phrases only, no figures. Scenes sit on the six
// painted clips (beat 5 in two) and abut through their ramps so no scroll
// position is ever empty; validateCues() and the tests guard both the
// coverage and the never-two-bright rule.
export const CINEMATIC_SCENES: SceneSpec[] = [
  {
    id: 'gross',
    headline: ['The screen', 'shows *gross*.'],
    support: 'It never shows what the drive cost you.',
    filmFrom: 0, filmTo: 0.18,
    rampIn: 0, stagger: 0,
    moment: 'clip 1: night, the phone glow, the hand rubbing an eye (0 to 3.7 s); fully visible at load',
  },
  {
    id: 'net',
    headline: ['Gross is', 'not *net*.'],
    support: 'Fuel, wear and an estimated tax set-aside come out first.',
    filmFrom: 0.15, filmTo: 0.34,
    moment: 'clip 2: pump nozzle, the open trunk with bags and boxes, red light in the wet (3.7 to 7.2 s)',
  },
  {
    id: 'number',
    headline: ['See the', '*real number*.'],
    support: 'Your vehicle, your state, your day job, in the estimate.',
    filmFrom: 0.31, filmTo: 0.57,
    moment: 'clip 3: the close portrait, the glow warms, the face opens (7.2 to 12.6 s); the peak, widest span',
  },
  {
    id: 'inputs',
    headline: ['Built around', 'what you *enter*.'],
    support: 'Miles, hours and earnings. Optional W-2 context.',
    filmFrom: 0.54, filmTo: 0.72,
    moment: 'clip 4: the e-bike courier clicks the battery in and pushes off (12.6 to 16.0 s)',
  },
  {
    id: 'yours',
    headline: ['What is', 'actually *yours*.'],
    support: 'Free core. No card. No ads. Estimates for planning. Not tax advice.',
    filmFrom: 0.69, filmTo: 1,
    hold: true,
    moment: 'clips 5a and 5b: the bookend at first light, then the car pulling away; holds through the paper hand-off (16.0 s to the end)',
  },
]

export const CINEMATIC_CUES: CueSpec[] = CINEMATIC_SCENES.map(scene => ({
  id: scene.id,
  from: progressAtFraction(scene.filmFrom, END_AT),
  to: scene.hold ? 1 : progressAtFraction(scene.filmTo, END_AT),
  lines: scene.headline.length + 1,
  hold: scene.hold,
  ...(scene.rampIn !== undefined ? {rampIn: scene.rampIn} : {}),
  ...(scene.stagger !== undefined ? {stagger: scene.stagger} : {}),
}))
