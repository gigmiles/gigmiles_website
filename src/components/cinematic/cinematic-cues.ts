import {progressAtFraction, type CueSpec, type LightSpec, type Rgb} from './cinematic-controller'

// Bump when the encoded files change so cached copies are never scrubbed
// against an old cue table.
export const CINEMATIC_VERSION = '2026-09-03f5'

/** Page progress at which the film reaches its last frame (the rest is the hold). */
export const END_AT = 0.74

export const CINEMATIC_ASSETS = {
  desktop: `/cinematic/hero-desktop.mp4?v=${CINEMATIC_VERSION}`,
  mobile: `/cinematic/hero-mobile.mp4?v=${CINEMATIC_VERSION}`,
  poster: '/cinematic/hero-poster.webp',
  posterMobile: '/cinematic/hero-poster-mobile.webp',
  /** The film's last frame, for the page's closing section: it ends where the film ended. */
  last: '/cinematic/hero-last.webp',
  /** Continuous paper film v5: one native 30 s generation, no cuts, no stitch. */
  duration: 30.0417,
}

// The film is one unbroken camera move, so these are not cut points: they are
// the six moments the journey passes through, and they only tell the stage
// where to breathe, repaint the ground and move the light. Boundaries come
// from the film's own production timeline (manifest.json beside the source):
// 4.5 / 8.5 / 13.5 / 16.5 / 25.5 s of 30.0417 s.
export const CINEMATIC_BEATS = [0.1498, 0.2829, 0.4494, 0.5493, 0.8488]

/** Ground behind the film per moment: the car at night, the wet road, the pump's cold canopy, the lamp on paper, the paper city, first light. */
export const BEAT_TINTS: Rgb[] = [
  {r: 20, g: 34, b: 34},
  {r: 14, g: 30, b: 40},
  {r: 16, g: 36, b: 44},
  {r: 44, g: 44, b: 34},
  {r: 38, g: 42, b: 36},
  {r: 34, g: 48, b: 44},
]

/** The film's own light per moment: the phone on the seat, a streetlight, the canopy, the desk lamp, the city's lamps, the dawn window. */
export const BEAT_LIGHTS: LightSpec[] = [
  {x: 35, y: 62, size: 30, alpha: 0.18},
  {x: 60, y: 20, size: 34, alpha: 0.10},
  {x: 50, y: 16, size: 40, alpha: 0.20},
  {x: 28, y: 12, size: 60, alpha: 0.22},
  {x: 50, y: 45, size: 55, alpha: 0.16},
  {x: 50, y: 8, size: 80, alpha: 0.20},
]

// The film hands us blank paper on purpose: the receipt that slides out of the
// pump and the ruled ledger under the lamp both arrive empty. That is where
// the shift is written, in code, never by the model. The figures mirror the
// home screen the deck shows further down the page, so the page never
// contradicts itself: WEB-TOUR-1 (approved 2026-09-02) gives $235 gross,
// $43 expenses and $192 net income on 8 h and 105.0 miles at $24/hr, and the
// $17 fuel / $26 wear split is the canonical breakdown of that same $43. The
// quarterly tax estimate is a different screen and stays on the deck's tax
// card rather than being folded into a per-shift total. The rows land one at a
// time, so the words and the picture describe the same thing.
export interface ProofRow { id: string; label: string; amount: string; at: number }
export const PROOF = {
  /** Film fractions. It used to open at 0.435, while the pump was still on
      screen: dark ink on a dark frame, unreadable on a phone. The paper only
      fills the frame at about 0.466, so nothing is written before then, and
      the city starts rising at 0.60. */
  from: 0.468,
  to: 0.60,
  fade: 0.022,
  /** How long a row takes to arrive, in film fractions. */
  step: 0.014,
  rows: [
    {id: 'gross', label: 'Gross', amount: '$235', at: 0.484},
    {id: 'fuel', label: 'Fuel', amount: '−$17', at: 0.506},
    {id: 'wear', label: 'Wear and tear', amount: '−$26', at: 0.528},
  ] as ProofRow[],
  /** The kept figure and the shift line under it. */
  netAt: 0.552,
  net: {label: 'Net income', amount: '$192', foot: '8 hours · 105.0 miles · $24/hr'},
  eyebrow: 'Example shift',
}

// There is no sign-off on the phone in the held last frame, and the reason is
// worth keeping so it is not tried a fourth time. The phone's glass renders
// 52x88 px at 1440, 62x105 at 1920 and 44x85 on a phone. An app icon laid on it
// read as a sticker; a lit screen clipped to the glass either overhung its edge
// or failed to fill it, because corners read off a 1078x1920 frame cannot be
// placed that precisely at this size. Every pass fixed one artefact and
// introduced another. The film now ends on a dark phone, which is what the last
// frame actually shows, and the brand is set by the CTA below it at a size that
// can be read.

export interface SceneSpec {
  id: string
  /** One entry per masked line; nine words at most across the headline. `*word*` marks the driver's word (set in 800 weight, Mint). */
  headline: string[]
  support: string
  /** Fractions of the film's duration this message belongs to (authored from the film's own timeline). */
  filmFrom: number
  filmTo: number
  /** Override the default entry ramp / line stagger (the first scene is on screen at load, no entrance). */
  rampIn?: number
  stagger?: number
  hold?: boolean
  /** Which film moment the message sits on, for the receipt. */
  moment: string
}

// Each scene starts exactly one ramp-width before the previous one ends
// (0.045 of page progress is 0.061 of the film), so the outgoing and incoming
// opacities sum to one: the column crossfades instead of going dim between
// statements, and no two are ever both bright.
// Copy uses approved brand phrases only, no figures. Each line is on screen
// while its own subject is: the words never describe something the film is not
// showing. validateCues() and the tests guard the coverage and the
// never-two-bright rule.
export const CINEMATIC_SCENES: SceneSpec[] = [
  {
    id: 'gross',
    headline: ['The screen', 'shows *gross*.'],
    support: 'It never shows what the drive cost you.',
    filmFrom: 0, filmTo: 0.17,
    rampIn: 0, stagger: 0,
    moment: 'the passenger seat at night: the phone glowing, the insulated bag, the meal bag and the drink (0 to 5.1 s); fully visible at load',
  },
  {
    id: 'net',
    headline: ['Gross is', 'not *net*.'],
    support: 'Fuel, wear and an estimated tax set-aside come out first.',
    filmFrom: 0.109, filmTo: 0.46,
    moment: 'the camera leaves the car, passes the wet tyre and reaches the pump; the blank receipt slides out and fills the frame (4.2 to 13.8 s)',
  },
  {
    id: 'number',
    headline: ['See the', '*real number*.'],
    support: 'Your vehicle, your state, your day job, in the estimate.',
    filmFrom: 0.399, filmTo: 0.57,
    moment: 'the receipt becomes a ruled ledger under the lamp and the green route draws itself down it (12.9 to 17.1 s)',
  },
  {
    id: 'inputs',
    headline: ['Built around', 'what you *enter*.'],
    support: 'Miles, hours and earnings. Optional W-2 context.',
    filmFrom: 0.509, filmTo: 0.87,
    moment: 'the ledger grid rises into a paper city and the camera travels the route through it (16.5 to 26.1 s); the longest moment, the peak',
  },
  {
    id: 'yours',
    headline: ['What is', 'actually *yours*.'],
    support: 'Free core. No card. No ads. Estimates for planning. Not tax advice.',
    filmFrom: 0.809, filmTo: 1,
    hold: true,
    moment: 'the route reaches the same car at first light and becomes the seat seam: the dawn bookend (25.5 s to the end); holds through the paper hand-off',
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
