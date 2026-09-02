import {progressAtFraction, type CueSpec} from './cinematic-controller'

// Bump when the encoded files change so cached copies are never scrubbed
// against an old cue table.
export const CINEMATIC_VERSION = '2026-09-02a'

/** Page progress at which the film reaches its last frame (the rest is the hold). */
export const END_AT = 0.74

export const CINEMATIC_ASSETS = {
  desktop: `/cinematic/hero-desktop.mp4?v=${CINEMATIC_VERSION}`,
  mobile: `/cinematic/hero-mobile.mp4?v=${CINEMATIC_VERSION}`,
  poster: '/cinematic/hero-poster.webp',
  posterMobile: '/cinematic/hero-poster-mobile.webp',
  /** Encoded from three silent segments of the Marcus film (pump story, 2026-08-01). */
  duration: 15.1,
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

// Copy uses approved brand phrases only, no figures. The film cuts at 1/3 and
// 2/3: s1 tired at the wheel, s2 windscreen in the rain, s3 profile looking out.
// Scenes abut through their ramps (the next one enters while the previous one
// exits) so no scroll position is ever empty; validateCues() and the tests
// guard both the coverage and the never-two-bright rule.
export const CINEMATIC_SCENES: SceneSpec[] = [
  {
    id: 'gross',
    headline: ['The screen', 'shows *gross*.'],
    support: 'It never shows what the drive cost you.',
    filmFrom: 0, filmTo: 0.2,
    rampIn: 0, stagger: 0,
    moment: 's1, eyes rubbed and the hand lowers (0 to 3.0 s); fully visible at load',
  },
  {
    id: 'net',
    headline: ['Gross is', 'not *net*.'],
    support: 'Fuel, wear and an estimated tax set-aside come out first.',
    filmFrom: 0.16, filmTo: 0.4,
    moment: 's1 lowers the hand and looks ahead, cut to the s2 windscreen (2.4 to 6.0 s)',
  },
  {
    id: 'number',
    headline: ['See the', '*real number*.'],
    support: 'Your vehicle, your state, your day job, in the estimate.',
    filmFrom: 0.36, filmTo: 0.66,
    moment: 's2 rain on the glass, hands settle on the wheel (5.4 to 10.0 s); the peak, widest span',
  },
  {
    id: 'inputs',
    headline: ['Built around', 'what you *enter*.'],
    support: 'Miles, hours and earnings. Optional W-2 context.',
    filmFrom: 0.62, filmTo: 0.86,
    moment: 's2 end into the s3 profile, the glance out of the side window (9.4 to 13.0 s)',
  },
  {
    id: 'yours',
    headline: ['What is', 'actually *yours*.'],
    support: 'Free core. No card. No ads. Estimates for planning. Not tax advice.',
    filmFrom: 0.82, filmTo: 1,
    hold: true,
    moment: 's3 exhale, holds through the paper hand-off (12.4 s to the end)',
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
