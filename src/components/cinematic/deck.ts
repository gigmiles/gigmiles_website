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
  let frame = 0
  let lastP = -1
  let live = false

  const progress = () => {
    const rect = root.getBoundingClientRect()
    const travel = Math.max(1, root.offsetHeight - stage.offsetHeight)
    return clamp01(-rect.top / travel)
  }

  const write = (p: number) => {
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
  }

  const tick = () => {
    frame = 0
    const p = progress()
    if (Math.abs(p - lastP) < 0.0004) return
    lastP = p
    write(p)
  }

  const schedule = () => {
    if (frame || !live || document.hidden) return
    frame = requestAnimationFrame(tick)
  }

  const configure = () => {
    const next = !reduced.matches && wide.matches
    if (next === live) { if (live) { lastP = -1; schedule() } return }
    live = next
    root.dataset.deck = live ? 'on' : 'static'
    if (frame) { cancelAnimationFrame(frame); frame = 0 }
    if (!live) { clear(); return }
    lastP = -1
    schedule()
  }

  window.addEventListener('scroll', schedule, {passive: true, signal})
  window.addEventListener('resize', configure, {signal})
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0 } else schedule() }, {signal})
  reduced.addEventListener('change', configure, {signal})
  wide.addEventListener('change', configure, {signal})
  configure()

  return () => {
    controller.abort()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    clear()
    delete root.dataset.deck
  }
}
