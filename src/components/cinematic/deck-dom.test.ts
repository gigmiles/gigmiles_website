// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {installDeck} from './deck'

// The maths tests next door prove the geometry. This file proves the part that
// actually broke on the live site: the controller shares the cards' inline
// style attribute with React, which writes each card's own colour there once at
// render and never again. A controller that clears by removing the whole
// attribute leaves four transparent cards stacked on one another with their
// texts overlapping, and no unit test of the maths can see it.

const GROUNDS = ['#0f3b30', '#174a3b', '#205a46', '#2a6b52']

function build() {
  document.body.innerHTML = `
    <section class="deck" data-deck="static">
      <div class="deck-stage">
        <div class="deck-cards">
          ${GROUNDS.map((g, i) => `<article class="deck-card" style="--ground: ${g}; --z: ${GROUNDS.length - i}">
            <div class="deck-body"><a class="deck-cta" href="/x">Get</a></div>
          </article>`).join('')}
        </div>
      </div>
    </section>`
  const root = document.querySelector<HTMLElement>('.deck')!
  const stage = document.querySelector<HTMLElement>('.deck-stage')!
  Object.defineProperty(root, 'offsetHeight', {configurable: true, value: 4000})
  Object.defineProperty(stage, 'offsetHeight', {configurable: true, value: 800})
  root.getBoundingClientRect = () => ({top: -1600, height: 4000}) as DOMRect
  return root
}

let queries: Map<string, {matches: boolean; listeners: Set<() => void>}>
function media(q: string) {
  const entry = queries.get(q)!
  return {
    get matches() { return entry.matches },
    addEventListener: (_: string, fn: () => void) => entry.listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => entry.listeners.delete(fn),
  }
}
function setViewport(kind: 'desktop' | 'phone' | 'reduced') {
  queries.get('(min-width: 981px)')!.matches = kind === 'desktop'
  queries.get('(min-height: 560px)')!.matches = kind !== 'reduced'
  queries.get('(prefers-reduced-motion: reduce)')!.matches = kind === 'reduced'
  for (const q of queries.values()) for (const fn of q.listeners) fn()
}

beforeEach(() => {
  queries = new Map([
    ['(min-width: 981px)', {matches: true, listeners: new Set<() => void>()}],
    ['(min-height: 560px)', {matches: true, listeners: new Set<() => void>()}],
    ['(prefers-reduced-motion: reduce)', {matches: false, listeners: new Set<() => void>()}],
  ])
  vi.stubGlobal('matchMedia', vi.fn(media))
  vi.stubGlobal('requestAnimationFrame', vi.fn((fn: FrameRequestCallback) => { fn(16); return 1 }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = '' })

const grounds = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('.deck-card')].map(c => c.style.getPropertyValue('--ground').trim())

describe('the deck shares the style attribute with React', () => {
  it('keeps every card its own colour through the mode it starts in', () => {
    const root = build()
    const stop = installDeck(root)
    expect(root.dataset.deck).toBe('on')
    expect(grounds(root)).toEqual(GROUNDS)
    stop()
  })

  it('keeps them through every change of viewport, in both directions', () => {
    const root = build()
    const stop = installDeck(root)
    for (const kind of ['phone', 'reduced', 'desktop', 'reduced', 'phone', 'desktop'] as const) {
      setViewport(kind)
      expect(grounds(root), `after ${kind}`).toEqual(GROUNDS)
    }
    stop()
  })

  it('keeps them after teardown, so the cards are still painted when the deck lets go', () => {
    const root = build()
    installDeck(root)()
    expect(grounds(root)).toEqual(GROUNDS)
  })

  it('leaves the resting stacking order behind rather than removing it', () => {
    const root = build()
    const stop = installDeck(root)
    setViewport('reduced')
    const z = [...root.querySelectorAll<HTMLElement>('.deck-card')].map(c => c.style.getPropertyValue('--z').trim())
    expect(z).toEqual(['4', '3', '2', '1'])
    stop()
  })

  it('never clears by removing the whole style attribute', () => {
    const root = build()
    const stop = installDeck(root)
    setViewport('reduced')
    for (const card of root.querySelectorAll('.deck-card')) expect(card.getAttribute('style')).toContain('--ground')
    stop()
  })
})
