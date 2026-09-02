import {describe, expect, it} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {FRAGMENT_SHADER, UNIFORMS, VERTEX_SHADER, camAt, glCam, glPoint, glRect, plateSpans, plateStateAt, rectCam, validatePlates, type PlateSpec, type SeamSpec} from './plate-engine'
import {PLATES, PLATE_BEATS, PLATE_CUES, PLATE_SCENES, SEAMS} from './plate-cues'
import {sceneAtProgress, validateCues} from './cinematic-controller'

const plate = (id: string, extra: Partial<PlateSpec> = {}): PlateSpec => ({id, src: {desktop: `${id}.webp`, mobile: `${id}-m.webp`}, cam: {from: {zoom: 1, x: 0, y: 0}, to: {zoom: 1.05, x: 0.01, y: 0}}, ...extra})

describe('plate engine math', () => {
  it('the shipped plates, seams and beats are valid', () => {
    expect(validatePlates(PLATES, SEAMS)).toEqual([])
    expect(PLATE_BEATS).toHaveLength(SEAMS.length)
    expect(plateSpans(PLATES, SEAMS)[0][0]).toBe(0)
    expect(plateSpans(PLATES, SEAMS).at(-1)?.[1]).toBe(1)
  })

  it('walks the whole film without a jump: the plate index never goes back, t stays in range, cameras move continuously', () => {
    let prev = plateStateAt(0, PLATES, SEAMS)
    for (let f = 0.001; f <= 1.0001; f += 0.001) {
      const st = plateStateAt(f, PLATES, SEAMS)
      expect(st.a).toBeGreaterThanOrEqual(prev.a)
      expect(st.t).toBeGreaterThanOrEqual(0)
      expect(st.t).toBeLessThanOrEqual(1)
      if (st.a === prev.a) {
        expect(Math.abs(st.camA.zoom - prev.camA.zoom)).toBeLessThan(0.06)
        expect(Math.abs(st.camA.x - prev.camA.x)).toBeLessThan(0.03)
        expect(Math.abs(st.camA.y - prev.camA.y)).toBeLessThan(0.03)
      }
      prev = st
    }
  })

  it('every seam starts on plate a alone, ends on plate b alone and carries its own mode', () => {
    SEAMS.forEach((seam, k) => {
      const start = plateStateAt(seam.from, PLATES, SEAMS)
      expect(start.a).toBe(k)
      expect(start.b).toBe(k + 1)
      expect(start.t).toBe(0)
      const end = plateStateAt(seam.to, PLATES, SEAMS)
      expect(end.b).toBe(k + 1)
      expect(end.t).toBe(1)
      expect(plateStateAt((seam.from + seam.to) / 2, PLATES, SEAMS).mode).toBe(seam.mode)
    })
    expect(plateStateAt(0, PLATES, SEAMS).b).toBe(-1)
    expect(plateStateAt(1, PLATES, SEAMS).a).toBe(PLATES.length - 1)
    expect(plateStateAt(NaN, PLATES, SEAMS).a).toBe(0)
  })

  it('the burn pushes into its rect, and the real screen only fills at the end of the last seam', () => {
    const burn = SEAMS[0]
    const pushed = plateStateAt(burn.from + (burn.to - burn.from) * 0.8, PLATES, SEAMS)
    expect(pushed.camA.zoom).toBeCloseTo(rectCam(burn.rect!).zoom, 2)
    expect(rectCam([0.25, 0.25, 0.5, 0.5]).x).toBeCloseTo(0, 6)
    const last = SEAMS[SEAMS.length - 1]
    expect(plateStateAt(last.from + (last.to - last.from) * 0.3, PLATES, SEAMS).screen).toBe(0)
    expect(plateStateAt(last.to, PLATES, SEAMS).screen).toBe(1)
    expect(plateStateAt(1, PLATES, SEAMS).screen).toBe(1)
    expect(plateStateAt(0.5, PLATES, SEAMS).screen).toBe(0)
    expect(plateStateAt(last.to, PLATES, SEAMS).screenSide).toBe(1)
  })

  it('converts top-left fractions to GL coordinates (v up)', () => {
    expect(glCam({zoom: 1.2, x: 0.1, y: 0.2})).toEqual([1.2, 0.1, -0.2])
    expect(glRect([0.1, 0.2, 0.3, 0.4])).toEqual([0.1, 1 - 0.2 - 0.4, 0.3, 0.4])
    expect(glPoint([0.2, 0.86])).toEqual([0.2, 1 - 0.86])
  })

  it('camAt settles at both ends', () => {
    const p = PLATES[0]
    expect(camAt(p, 0)).toEqual(p.cam.from)
    expect(camAt(p, 1)).toEqual(p.cam.to)
    expect(camAt(p, 0.5).zoom).toBeCloseTo((p.cam.from.zoom + p.cam.to.zoom) / 2, 6)
  })

  it('validatePlates flags the authoring mistakes', () => {
    const plates = [plate('a'), plate('b'), plate('c')]
    const good: SeamSpec[] = [{mode: 'cross', from: 0.3, to: 0.4}, {mode: 'cross', from: 0.6, to: 0.7}]
    expect(validatePlates(plates, good)).toEqual([])
    expect(validatePlates(plates, [{mode: 'cross', from: 0.3, to: 0.5}, {mode: 'cross', from: 0.4, to: 0.7}])[0]).toMatch(/overlaps/)
    expect(validatePlates(plates, [{mode: 'burn', from: 0.3, to: 0.4}, {mode: 'cross', from: 0.6, to: 0.7}])[0]).toMatch(/burn needs a rect/)
    expect(validatePlates([plate('a', {cam: {from: {zoom: 0.9, x: 0, y: 0}, to: {zoom: 1, x: 0, y: 0}}}), plate('b')], [{mode: 'cross', from: 0.4, to: 0.5}])[0]).toMatch(/zoom below 1/)
    expect(validatePlates(plates, [good[0]])[0]).toMatch(/expected 2 seams/)
  })

  it('every uniform the driver sets exists in the shader, and the engine stays library-free and timer-free', () => {
    for (const u of UNIFORMS) expect(FRAGMENT_SHADER).toContain(u)
    expect(VERTEX_SHADER).toContain('gl_Position')
    expect(FRAGMENT_SHADER).toContain('precision highp float')
    const source = fs.readFileSync(path.join(__dirname, 'plate-engine.ts'), 'utf8')
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|preventDefault|scrollTo\(|from 'three'|createElement\(|innerHTML/)
  })

  it('the plate cue table is valid, covers the runway and keeps the copy rules', () => {
    expect(validateCues(PLATE_CUES)).toEqual([])
    expect(PLATE_CUES.at(-1)?.hold).toBe(true)
    for (let p = 0; p <= 1; p += 0.005) expect(sceneAtProgress(p, PLATE_CUES), `no scene at p=${p.toFixed(3)}`).toBeGreaterThanOrEqual(0)
    for (const scene of PLATE_SCENES) {
      expect(scene.headline.join(' ').split(/\s+/).length).toBeLessThanOrEqual(9)
      expect(`${scene.headline.join(' ')} ${scene.support}`).not.toMatch(/—|\$\d|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★/i)
    }
  })
})
