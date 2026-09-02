import {describe, expect, it} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULTS, cameraAt, clamp01, cueState, dwellEase, filmFractionAtProgress, groundAt, lerpStep, lightAt, progressAtFraction, resolveMode, sceneAtProgress, shouldSeek, smoothstep, timeAtProgress, validateCues,
  type CueSpec,
} from './cinematic-controller'
import {BEAT_LIGHTS, BEAT_TINTS, CINEMATIC_BEATS, CINEMATIC_CUES, CINEMATIC_SCENES, END_AT} from './cinematic-cues'

const cue: CueSpec = {id: 'a', from: 0.2, to: 0.5, lines: 3}

describe('cinematic controller math', () => {
  it('maps page progress onto the film and holds after endAt', () => {
    const d = 15.1
    expect(timeAtProgress(-1, d)).toBe(0)
    expect(timeAtProgress(0, d)).toBe(0)
    expect(timeAtProgress(0.37, d)).toBeCloseTo((d - 0.05) / 2, 5)
    expect(timeAtProgress(0.74, d)).toBeCloseTo(d - 0.05, 5)
    expect(timeAtProgress(1, d)).toBeCloseTo(d - 0.05, 5)
    expect(timeAtProgress(NaN, d)).toBe(0)
    expect(timeAtProgress(0.5, NaN)).toBe(0)
    expect(progressAtFraction(0.5)).toBeCloseTo(0.37, 5)
    expect(progressAtFraction(1)).toBe(END_AT)
    expect(clamp01(2)).toBe(1)
  })

  it('dwell settles mid-beat, keeps the boundaries and stays monotonic', () => {
    expect(dwellEase(0, 0.35)).toBe(0)
    expect(dwellEase(1, 0.35)).toBe(1)
    expect(dwellEase(0.5, 0.35)).toBeCloseTo(0.5, 6)
    expect(dwellEase(0.25, 0.35)).toBeGreaterThan(0.25)
    let last = -1
    for (let p = 0; p <= 1; p += 0.002) { const f = filmFractionAtProgress(p, END_AT, CINEMATIC_BEATS, DEFAULTS.dwell); expect(f).toBeGreaterThanOrEqual(last - 1e-9); last = f }
    for (const b of CINEMATIC_BEATS) expect(filmFractionAtProgress(b * END_AT, END_AT, CINEMATIC_BEATS, DEFAULTS.dwell)).toBeCloseTo(b, 6)
    expect(filmFractionAtProgress(0.5, END_AT)).toBeCloseTo(0.5 / END_AT, 6)
  })

  it('camera, ground and light are continuous across beats and never leave their ranges', () => {
    let prev = cameraAt(0, CINEMATIC_BEATS)
    for (let f = 0.001; f <= 1; f += 0.001) {
      const cam = cameraAt(f, CINEMATIC_BEATS)
      expect(Math.abs(cam.scale - prev.scale)).toBeLessThan(0.01)
      expect(Math.abs(cam.x - prev.x)).toBeLessThan(1.5)
      expect(cam.scale).toBeGreaterThanOrEqual(1)
      expect(cam.scale).toBeLessThanOrEqual(1 + DEFAULTS.camScale + 1e-9)
      prev = cam
    }
    for (const b of CINEMATIC_BEATS) expect(cameraAt(b, CINEMATIC_BEATS).scale).toBeCloseTo(1, 3)
    expect(groundAt(0, CINEMATIC_BEATS, BEAT_TINTS)).toEqual(BEAT_TINTS[0])
    expect(groundAt(1, CINEMATIC_BEATS, BEAT_TINTS)).toEqual(BEAT_TINTS[BEAT_TINTS.length - 1])
    const mid = groundAt(0.24, CINEMATIC_BEATS, BEAT_TINTS)
    expect(mid.b).toBeGreaterThan(BEAT_TINTS[0].b)
    expect(lightAt(0.5, CINEMATIC_BEATS, BEAT_LIGHTS).alpha).toBeGreaterThan(0)
  })

  it('smoothstep is clamped and monotonic', () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
    expect(smoothstep(0, 1, 0.5)).toBe(0.5)
    let last = -1
    for (let x = 0; x <= 1; x += 0.05) { const v = smoothstep(0.2, 0.8, x); expect(v).toBeGreaterThanOrEqual(last); last = v }
  })

  it('lerpStep converges, snaps and is frame-time normalised', () => {
    let value = 0
    for (let i = 0; i < 200; i += 1) value = lerpStep(value, 10, 0.18)
    expect(value).toBe(10)
    const oneFrame = lerpStep(0, 10, 0.18, 16.7)
    const twoHalfFrames = lerpStep(lerpStep(0, 10, 0.18, 8.35), 10, 0.18, 8.35)
    expect(Math.abs(oneFrame - twoHalfFrames)).toBeLessThan(1e-3)
    expect(lerpStep(9.999, 10, 0.18)).toBe(10)
  })

  it('shouldSeek respects the deadband and a busy decoder', () => {
    expect(shouldSeek(5, 5.005, false, 0.008)).toBe(false)
    expect(shouldSeek(5, 5.02, false, 0.008)).toBe(true)
    expect(shouldSeek(5, 6, true, 0.008)).toBe(false)
  })

  it('cueState ramps in from below, plateaus at 1 and exits upward', () => {
    expect(cueState(0.1, cue).vis).toBe(0)
    expect(cueState(0.35, cue).vis).toBe(1)
    expect(cueState(0.6, cue).vis).toBe(0)
    expect(cueState(0.2, cue).y).toBe(DEFAULTS.enterY)
    expect(cueState(0.35, cue).y).toBeCloseTo(-DEFAULTS.driftY * 0.5, 5)
    expect(cueState(0.5, cue).y).toBeCloseTo(-DEFAULTS.exitY - DEFAULTS.driftY, 5)
    const mid = cueState(0.235, cue)
    expect(mid.lines[0]).toBeGreaterThan(mid.lines[1])
    expect(mid.lines[1]).toBeGreaterThan(mid.lines[2])
    const hold = cueState(0.99, {...cue, hold: true})
    expect(hold.vis).toBe(1)
    expect(cueState(0.34, cue).underline).toBeCloseTo(1, 3)
    expect(cueState(0.2, cue).underline).toBe(0)
    expect(cueState(0.45, cue).y).toBeLessThan(cueState(0.3, cue).y)
  })

  it('sceneAtProgress picks the brightest scene and -1 for none', () => {
    const cues: CueSpec[] = [{id: 'x', from: 0.1, to: 0.3, lines: 1}, {id: 'y', from: 0.4, to: 0.6, lines: 1}]
    expect(sceneAtProgress(0.2, cues)).toBe(0)
    expect(sceneAtProgress(0.5, cues)).toBe(1)
    expect(sceneAtProgress(0.9, cues)).toBe(-1)
  })

  it('validateCues flags overlap and ordering', () => {
    expect(validateCues([{id: 'x', from: 0.1, to: 0.5, lines: 1}, {id: 'y', from: 0.2, to: 0.6, lines: 1}])[0]).toMatch(/both above 0.5/)
    expect(validateCues([{id: 'x', from: 0.5, to: 0.6, lines: 1}, {id: 'y', from: 0.1, to: 0.2, lines: 1}])).toContain('y: starts before x')
  })

  it('the shipped cue table is valid, ordered and copy-safe', () => {
    expect(validateCues(CINEMATIC_CUES)).toEqual([])
    expect(CINEMATIC_CUES.at(-1)?.hold).toBe(true)
    expect(CINEMATIC_CUES.at(-1)?.to).toBe(1)
    for (const scene of CINEMATIC_SCENES) {
      expect(scene.headline.join(' ').split(/\s+/).length).toBeLessThanOrEqual(9)
      expect(`${scene.headline.join(' ')} ${scene.support}`).not.toMatch(/—|\$\d|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★/i)
    }
    expect(sceneAtProgress(0.999, CINEMATIC_CUES)).toBe(CINEMATIC_CUES.length - 1)
    for (let p = 0; p <= 1; p += 0.005) expect(sceneAtProgress(p, CINEMATIC_CUES), `no scene at p=${p.toFixed(3)}`).toBeGreaterThanOrEqual(0)
  })

  it('resolveMode falls back to static for reduced motion, data saver, slow networks and short viewports', () => {
    const ok = {reduced: false, wide: true, tall: true, saveData: false, slow: false, hasVideo: true}
    expect(resolveMode(ok)).toBe('desktop')
    expect(resolveMode({...ok, wide: false})).toBe('mobile')
    expect(resolveMode({...ok, reduced: true})).toBe('static')
    expect(resolveMode({...ok, saveData: true})).toBe('static')
    expect(resolveMode({...ok, slow: true})).toBe('static')
    expect(resolveMode({...ok, tall: false})).toBe('static')
    expect(resolveMode({...ok, hasVideo: false})).toBe('static')
  })

  it('keeps the controller free of timers, scroll-jacking and playback attributes', () => {
    const source = fs.readFileSync(path.join(__dirname, 'cinematic-controller.ts'), 'utf8')
    expect(source).not.toMatch(/preventDefault|setInterval|setTimeout|scrollTo\(|autoplay|\bloop\b/)
  })
})
