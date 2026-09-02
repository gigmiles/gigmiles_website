import {describe, expect, it} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {DECK, cardState, easeInOut, phaseAt} from './deck'

const COUNT = 4

describe('stacked-card deck maths', () => {
  it('reproduces the reference spec constants', () => {
    expect(DECK).toEqual({yOffset: 9, scaleStep: 0.06, exitY: -215, exitRot: -26, exitScale: 1.03, parkY: -260, parkRot: -26, runway: 6.5})
  })

  it('easeInOut is power2.inOut: clamped, symmetric and monotonic', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 6)
    expect(easeInOut(0.25)).toBeCloseTo(1 - easeInOut(0.75), 6)
    expect(easeInOut(-1)).toBe(0)
    expect(easeInOut(2)).toBe(1)
    let last = -1
    for (let t = 0; t <= 1; t += 0.02) { const v = easeInOut(t); expect(v).toBeGreaterThanOrEqual(last); last = v }
  })

  it('deals one card per quarter of the runway', () => {
    expect(phaseAt(0, COUNT)).toEqual({index: 0, t: 0})
    expect(phaseAt(0.125, COUNT).index).toBe(0)
    expect(phaseAt(0.25, COUNT)).toEqual({index: 1, t: 0})
    expect(phaseAt(1, COUNT).index).toBe(COUNT - 1)
    expect(phaseAt(2, COUNT).index).toBe(COUNT - 1)
  })

  it('starts as a neat deck: front card centred and full size, each one behind lower and smaller', () => {
    const start = Array.from({length: COUNT}, (_, i) => cardState(0, COUNT, i))
    expect(start[0].y).toBe(-50)
    expect(start[0].scale).toBe(1)
    expect(start[0].rot).toBe(0)
    for (let i = 1; i < COUNT; i += 1) {
      expect(start[i].y).toBeCloseTo(-50 + i * DECK.yOffset, 6)
      expect(start[i].scale).toBeCloseTo(1 - i * DECK.scaleStep, 6)
      expect(start[i].y).toBeGreaterThan(start[i - 1].y)
      expect(start[i].scale).toBeLessThan(start[i - 1].scale)
    }
  })

  it('stacks the front card highest so the deck reads front to back', () => {
    for (let i = 0; i < COUNT; i += 1) expect(cardState(0.4, COUNT, i).z).toBe(COUNT - i)
  })

  it('lifts and hinges the active card forward, then parks it above the frame', () => {
    const mid = cardState(0.125, COUNT, 0)
    expect(mid.y).toBeLessThan(-50)
    expect(mid.y).toBeGreaterThan(DECK.exitY)
    expect(mid.rot).toBeLessThan(0)
    expect(mid.scale).toBeGreaterThan(1)
    const parked = cardState(0.6, COUNT, 0)
    expect(parked.y).toBe(DECK.parkY)
    expect(parked.rot).toBe(DECK.parkRot)
    expect(parked.scale).toBe(1)
  })

  it('advances the next card into the front position exactly as its turn starts', () => {
    const justBefore = cardState(0.2499, COUNT, 1)
    expect(justBefore.y).toBeCloseTo(-50, 1)
    expect(justBefore.scale).toBeCloseTo(1, 2)
    const itsTurn = cardState(0.25, COUNT, 1)
    expect(itsTurn.y).toBe(-50)
    expect(itsTurn.scale).toBe(1)
    expect(itsTurn.rot).toBe(0)
  })

  it('every card moves continuously while it is anywhere near the frame', () => {
    // A card that has finished leaving snaps from exitY to the deeper parkY.
    // Both are far above the stage, so the step is invisible; continuity only
    // has to hold while the card can still be seen.
    const visible = (y: number) => y > -160
    for (let i = 0; i < COUNT; i += 1) {
      let prev = cardState(0, COUNT, i)
      for (let p = 0.001; p <= 1; p += 0.001) {
        const s = cardState(p, COUNT, i)
        if (visible(s.y) && visible(prev.y)) {
          expect(Math.abs(s.y - prev.y), `card ${i} jumped at ${p.toFixed(3)}`).toBeLessThan(4)
          expect(Math.abs(s.scale - prev.scale)).toBeLessThan(0.02)
        }
        prev = s
      }
    }
  })

  it('exactly one card is the front card outside the hand-over', () => {
    // Past the last card's own phase the deck is empty by design, so the
    // sample points sit inside each card's turn.
    for (const p of [0.05, 0.3, 0.55, 0.8]) {
      const fronts = Array.from({length: COUNT}, (_, i) => cardState(p, COUNT, i)).filter(s => s.front >= 0.5)
      expect(fronts, `p=${p}`).toHaveLength(1)
    }
  })

  it('keeps the deck free of timers, scroll-jacking and libraries', () => {
    const source = fs.readFileSync(path.join(__dirname, 'deck.ts'), 'utf8')
    expect(source).not.toMatch(/setTimeout|setInterval|preventDefault\(|scrollTo\(|'wheel'|from 'gsap'|from 'lenis'/)
  })

  it('the deck stylesheet keeps the house rules', () => {
    const css = fs.readFileSync(path.join(__dirname, 'deck.css'), 'utf8')
    expect(css).not.toMatch(/100vh|@keyframes|transition:\s*all/)
    expect(css).toContain('height: 100svh')
    expect(css).toContain('position: sticky')
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) {
      for (const prop of m[1].split(',').map(s => s.trim().split(/\s+/)[0])) {
        expect(['opacity', 'transform', 'clip-path', 'none']).toContain(prop)
      }
    }
  })
})
