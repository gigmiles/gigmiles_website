// Stacked-card deck: the four approved app captures as a pinned deck that
// deals itself as the page scrolls. The front card lifts and hinges forward
// over its own top edge until it leaves, the one behind slides up, grows and
// centres, and so on through the four.
//
// The grammar and its numbers come from the operator's reference spec, which
// drives it with GSAP ScrollTrigger and Lenis. We reproduce the values exactly
// and the engine not at all: Lenis takes the wheel away from the visitor, and
// this house has never shipped scroll-jacking or a timer-driven stage. The
// maths below is the whole of it, so the deck rides the same passive scroll
// listener and rAF as the film and costs no new bytes of library.
//
// The controller writes CSS custom properties only.

export const DECK = {
  /** Percent of a card's own height each card sits below the one in front. */
  yOffset: 9,
  /** How much smaller each card behind is drawn. */
  scaleStep: 0.06,
  /** Where the leaving card ends up, in percent of its own height. */
  exitY: -215,
  /** Degrees of forward hinge as it leaves. */
  exitRot: -26,
  exitScale: 1.03,
  /** Where cards that have already left are parked. */
  parkY: -260,
  parkRot: -26,
  /** Viewport heights of scroll the pinned deck consumes. */
  runway: 6.5,
  /** On a phone the cards lie in a row the vertical scroll drives. Each card
      owns an equal share of this runway (in viewport heights, beyond the
      stage's own screen): first the words under its screen scroll up into
      view, then the row slides to the next screen. */
  rowRunway: 3,
  /** Share of a card's segment spent bringing its words up. */
  rowRead: 0.5,
  /** Where in the segment the slide to the next card is complete; the rest is a hold. */
  rowSlideEnd: 0.85,
}

export type DeckDefaults = typeof DECK

export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0)

/** power2.inOut, the reference spec's easing, so the phase is slow at both ends. */
export function easeInOut(x: number) {
  const t = clamp01(x)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export interface CardState {
  /** translateY in percent of the card's own height, including the -50 that centres it. */
  y: number
  /** rotateX in degrees, hinging on the card's top edge. */
  rot: number
  scale: number
  /** Stacking order: the front card is highest. */
  z: number
  /** 1 while this card is the one being dealt, 0 otherwise. Drives the CTA. */
  front: number
}

/** Which card is being dealt at this progress, and how far through its phase. */
export function phaseAt(progress: number, count: number) {
  const p = clamp01(progress)
  const seg = 1 / count
  const index = Math.min(Math.floor(p / seg), count - 1)
  return {index, t: (p - index * seg) / seg}
}

/** The state of card `i` at a deck progress of 0..1. */
export function cardState(progress: number, count: number, i: number, d: DeckDefaults = DECK): CardState {
  const {index, t} = phaseAt(progress, count)
  const e = easeInOut(t)
  const z = count - i
  if (i < index) return {y: d.parkY, rot: d.parkRot, scale: 1, z, front: 0}
  if (i === index) {
    return {y: lerp(-50, d.exitY, e), rot: lerp(0, d.exitRot, e), scale: lerp(1, d.exitScale, e), z, front: 1 - e}
  }
  const behind = i - index
  return {y: -50 + (behind - e) * d.yOffset, rot: 0, scale: 1 - (behind - e) * d.scaleStep, z, front: behind === 1 ? e : 0}
}

export interface RowState {
  /** The card whose segment this is: being read, or leaving. */
  seg: number
  /** How far its words have come up, 0..1. Cards before `seg` are fully read, cards after are not yet. */
  reveal: number
  /** How many cards the row has moved left, continuous: 0 is the first card, 3 the fourth. */
  x: number
  /** The card that is nearest the reader, for `inert` on the others. */
  index: number
}

/**
 * The phone's row at a deck progress of 0..1: screen, its words, slide,
 * screen, its words, slide. The last card reads and then holds; the section
 * lets go after it.
 */
export function rowState(progress: number, count: number, d: DeckDefaults = DECK): RowState {
  if (count < 1) return {seg: 0, reveal: 0, x: 0, index: 0}
  const p = clamp01(progress)
  const segLen = 1 / count
  const seg = Math.min(Math.floor(p / segLen), count - 1)
  const t = (p - seg * segLen) / segLen
  const last = seg === count - 1
  const readEnd = last ? Math.min(1, d.rowRead + 0.15) : d.rowRead
  const reveal = easeInOut(t / readEnd)
  const slide = last ? 0 : easeInOut((t - readEnd) / (d.rowSlideEnd - readEnd))
  const x = seg + slide
  return {seg, reveal, x, index: Math.round(x)}
}

export type DeckMode = 'on' | 'row' | 'static'

/** Which grammar fits the viewport: the deck wide, the row on a phone, a list otherwise. */
export function modeFor(q: {reduced: boolean; wide: boolean; tall: boolean}): DeckMode {
  if (q.reduced) return 'static'
  if (q.wide) return 'on'
  return q.tall ? 'row' : 'static'
}

/**
 * Wires a deck: `root` is the tall section, `.deck-stage` the sticky child and
 * `.deck-card` the cards in front-to-back order. Returns the teardown.
 */
export function installDeck(root: HTMLElement, d: DeckDefaults = DECK) {
  const controller = new AbortController()
  const {signal} = controller
  const stage = root.querySelector<HTMLElement>('.deck-stage') ?? root
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.deck-card'))
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const wide = matchMedia('(min-width: 981px)')
  // Below this the pinned row cannot show a screen at a readable size, so the
  // phone keeps the swipeable list instead.
  const tall = matchMedia('(min-height: 560px)')
  let frame = 0
  let lastP = -1
  let mode: DeckMode = 'static'
  // How far each card's column overflows its box on this viewport: the
  // distance its words travel up. Measured, not guessed, because it depends
  // on the copy, the capture's aspect and the screen.
  let over: number[] = []

  const measure = () => {
    over = cards.map(card => Math.max(0, card.scrollHeight - card.clientHeight))
  }

  const progress = () => {
    const rect = root.getBoundingClientRect()
    const travel = Math.max(1, root.offsetHeight - stage.offsetHeight)
    return clamp01(-rect.top / travel)
  }

  const write = (p: number) => {
    if (mode === 'row') {
      const r = rowState(p, cards.length, d)
      root.style.setProperty('--row-i', r.x.toFixed(4))
      cards.forEach((card, i) => {
        const y = i < r.seg ? 1 : i === r.seg ? r.reveal : 0
        card.style.setProperty('--card-y', `${(-(over[i] ?? 0) * y).toFixed(1)}px`)
        card.toggleAttribute('inert', i !== r.index)
      })
      root.style.setProperty('--deck-p', p.toFixed(4))
      return
    }
    cards.forEach((card, i) => {
      const s = cardState(p, cards.length, i, d)
      card.style.setProperty('--y', `${s.y.toFixed(2)}%`)
      card.style.setProperty('--rot', `${s.rot.toFixed(2)}deg`)
      card.style.setProperty('--s', s.scale.toFixed(4))
      card.style.setProperty('--z', String(s.z))
      card.style.setProperty('--front', s.front.toFixed(3))
      card.toggleAttribute('inert', s.front < 0.5)
    })
    root.style.setProperty('--deck-p', p.toFixed(4))
  }

  const clear = () => {
    for (const card of cards) {
      card.removeAttribute('style')
      card.removeAttribute('inert')
    }
    root.style.removeProperty('--deck-p')
    root.style.removeProperty('--row-i')
  }

  const tick = () => {
    frame = 0
    const p = progress()
    if (Math.abs(p - lastP) < 0.0004) return
    lastP = p
    write(p)
  }

  const schedule = () => {
    if (frame || mode === 'static' || document.hidden) return
    frame = requestAnimationFrame(tick)
  }

  const configure = () => {
    const next = modeFor({reduced: reduced.matches, wide: wide.matches, tall: tall.matches})
    if (next === mode) { if (mode !== 'static') { if (mode === 'row') measure(); lastP = -1; schedule() } return }
    mode = next
    if (frame) { cancelAnimationFrame(frame); frame = 0 }
    clear()
    root.dataset.deck = mode
    if (mode === 'static') return
    if (mode === 'row') measure()
    lastP = -1
    schedule()
  }

  window.addEventListener('scroll', schedule, {passive: true, signal})
  window.addEventListener('resize', configure, {signal})
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0 } else schedule() }, {signal})
  reduced.addEventListener('change', configure, {signal})
  wide.addEventListener('change', configure, {signal})
  tall.addEventListener('change', configure, {signal})
  configure()

  return () => {
    controller.abort()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    clear()
    delete root.dataset.deck
  }
}
