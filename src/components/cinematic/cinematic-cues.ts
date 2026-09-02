import {progressAtFraction, type CueSpec} from './cinematic-controller'

// Bump when the encoded files change so cached copies are never scrubbed
// against an old cue table.
export const CINEMATIC_VERSION = '2026-09-02b'

/** Page progress at which the film reaches its last frame (the rest is the hold). */
export const END_AT = 0.74

export const CINEMATIC_ASSETS = {
  desktop: `/cinematic/hero-desktop.mp4?v=${CINEMATIC_VERSION}`,
  mobile: `/cinematic/hero-mobile.mp4?v=${CINEMATIC_VERSION}`,
  poster: '/cinematic/hero-poster.webp',
  posterMobile: '/cinematic/hero-poster-mobile.webp',
  /** Painted edition: six operator-made clips (painted_production/clips), beat 4 trimmed to 4.0 s. */
  duration: 26.21,
}

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

// Copy uses approved brand phrases only, no figures. The painted film has six
// clips, one per beat (beat 5 in two): boundaries at 0.154 / 0.308 / 0.539 /
// 0.691 / 0.846 of the film.
// Scenes abut through their ramps (the next one enters while the previous one
// exits) so no scroll position is ever empty; validateCues() and the tests
// guard both the coverage and the never-two-bright rule.
export const CINEMATIC_SCENES: SceneSpec[] = [
  {
    id: 'gross',
    headline: ['The screen', 'shows *gross*.'],
    support: 'It never shows what the drive cost you.',
    filmFrom: 0, filmTo: 0.17,
    rampIn: 0, stagger: 0,
    moment: 'beat 1: night, the phone glow, the hand rubbing an eye (0 to 4.0 s); fully visible at load',
  },
  {
    id: 'net',
    headline: ['Gross is', 'not *net*.'],
    support: 'Fuel, wear and an estimated tax set-aside come out first.',
    filmFrom: 0.14, filmTo: 0.33,
    moment: 'beat 2: pump nozzle, the open trunk with bags and boxes, red light in the wet (4.0 to 8.1 s)',
  },
  {
    id: 'number',
    headline: ['See the', '*real number*.'],
    support: 'Your vehicle, your state, your day job, in the estimate.',
    filmFrom: 0.30, filmTo: 0.56,
    moment: 'beat 3: the close portrait, the glow warms, the face opens (8.1 to 14.1 s); the peak, widest span',
  },
  {
    id: 'inputs',
    headline: ['Built around', 'what you *enter*.'],
    support: 'Miles, hours and earnings. Optional W-2 context.',
    filmFrom: 0.53, filmTo: 0.72,
    moment: 'beat 4: the e-bike courier clicks the battery in and pushes off (14.1 to 18.1 s)',
  },
  {
    id: 'yours',
    headline: ['What is', 'actually *yours*.'],
    support: 'Free core. No card. No ads. Estimates for planning. Not tax advice.',
    filmFrom: 0.69, filmTo: 1,
    hold: true,
    moment: 'beat 5: the bookend at first light, then the car pulling away; holds through the paper hand-off (18.1 s to the end)',
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
