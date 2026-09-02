import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {renderToStaticMarkup} from 'react-dom/server'
import {act, render} from '@testing-library/react'
import {CinematicHome} from './CinematicHome'
import {PlatesHero} from './PlatesHero'
import {PLATE_SCENES} from './plate-cues'
import type {FilmDriver} from './plate-engine'

const BANNED_PAGE = /\$175|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★/i

class Media extends EventTarget { matches = false; constructor(matches: boolean) { super(); this.matches = matches } }

describe('plates route gate', () => {
  it('is local only and hidden from crawlers', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../app/preview/plates/page.tsx'), 'utf8')
    expect(source).toContain('index:false,follow:false')
    expect(source).toContain("dynamic='force-dynamic'")
    expect(source).toMatch(/LOCAL_DESIGN_REVIEW!=='1' \|\| process\.env\.NODE_ENV==='production'\) notFound\(\)/)
  })
})

describe('plates home markup', () => {
  const html = renderToStaticMarkup(<CinematicHome variant="plates"/>)

  it('ships the plate stage as a static, complete page with the canvas in the markup and no video', () => {
    expect(html).toContain('data-cine-mode="static"')
    expect(html).toContain('data-cine-render="plates"')
    expect(html).toContain('class="cine-canvas"')
    expect(html).toMatch(/<img[^>]*class="cine-poster"[^>]*src="\/cinematic\/plates\/poster\.webp"/)
    expect(html).not.toContain('<video')
    expect(html.match(/<h1/g)).toHaveLength(1)
    const text = html.replace(/<[^>]+>/g, '')
    for (const scene of PLATE_SCENES) {
      for (const line of scene.headline) expect(text).toContain(line.replace(/\*/g, ''))
      expect(text).toContain(scene.support)
    }
    expect(html).toContain('class="cine-underline"')
    expect(html).toContain('data-cta-placement="cinematic-stage"')
    expect(html).not.toMatch(BANNED_PAGE)
    const scenes = html.slice(html.indexOf('cine-scenes'), html.indexOf('cine-cta'))
    expect(scenes).not.toContain('—')
  })

  it('reuses the approved sections in order after the stage', () => {
    const order = ['cine-hero', 'cine-after', 'estimate-proof', 'class="deck"', 'id="free"', 'id="download"', 'sticky-cta']
    let last = -1
    for (const marker of order) { const at = html.indexOf(marker); expect(at, marker).toBeGreaterThan(last); last = at }
  })
})

describe('plate driver in the document', () => {
  const frames = new Map<number, FrameRequestCallback>()
  let sequence = 0
  let room: Media, reduced: Media, tall: Media
  const flush = (n = 1) => { for (let i = 0; i < n; i += 1) { const pending = [...frames.entries()]; frames.clear(); for (const [, fn] of pending) fn(performance.now() + 16.7 * (i + 1)) } }

  beforeEach(() => {
    room = new Media(true); reduced = new Media(false); tall = new Media(true)
    vi.stubGlobal('matchMedia', vi.fn((q: string) => q.includes('reduced-motion') ? reduced : q.includes('min-height') ? tall : room))
    vi.stubGlobal('requestAnimationFrame', vi.fn((fn: FrameRequestCallback) => { frames.set(++sequence, fn); return sequence }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
    vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  })
  afterEach(() => { vi.unstubAllGlobals(); frames.clear() })

  function fakeDriver(fail = false): FilmDriver & {rendered: number[]} {
    const rendered: number[] = []
    return {
      rendered,
      load: vi.fn(() => (fail ? Promise.reject(new Error('no webgl')) : Promise.resolve())),
      render: vi.fn((f: number) => { rendered.push(f) }),
      resize: vi.fn(),
      destroy: vi.fn(),
    }
  }

  function mount(driver: FilmDriver) {
    const utils = render(<PlatesHero driver={driver}/>)
    const root = document.getElementById('cine-hero') as HTMLElement
    const stage = root.querySelector('.cine-stage') as HTMLElement
    Object.defineProperty(root, 'offsetHeight', {value: 5000, configurable: true})
    Object.defineProperty(stage, 'offsetHeight', {value: 1000, configurable: true})
    const setProgress = (p: number) => vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({top: -4000 * p, height: 5000} as DOMRect)
    return {...utils, root, setProgress}
  }

  it('loads the plates, renders a monotonic playhead both ways and tears down', async () => {
    const driver = fakeDriver()
    const {root, setProgress, unmount} = mount(driver)
    expect(root.dataset.cineMode).toBe('desktop')
    expect(driver.load).toHaveBeenCalledWith('desktop')
    setProgress(0)
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(root.dataset.cineVideo).toBe('primed')
    const seen: number[] = []
    for (const p of [0, 0.25, 0.5, 0.75, 1, 0.5, 0.25, 0]) {
      setProgress(p)
      act(() => { window.dispatchEvent(new Event('scroll')); flush(160) })
      seen.push(driver.rendered.at(-1) ?? -1)
    }
    expect(seen[0]).toBeLessThan(0.02)
    expect(seen[1]).toBeGreaterThan(seen[0])
    expect(seen[2]).toBeGreaterThan(seen[1])
    expect(seen[3]).toBeCloseTo(1, 2)
    expect(seen[4]).toBeCloseTo(1, 2)
    expect(seen[5]).toBeLessThan(seen[4])
    expect(seen[6]).toBeLessThan(seen[5])
    expect(seen[7]).toBeLessThan(0.02)
    expect(root.dataset.cinePainted).toBe('true')
    expect(Number(root.dataset.cineTime)).toBeCloseTo(seen[7], 3)
    expect(frames.size).toBe(0)
    const active = [...root.querySelectorAll('.cine-scene')].filter(s => !s.hasAttribute('inert'))
    expect(active).toHaveLength(1)
    expect(active[0].getAttribute('data-cue')).toBe('gross')
    expect(root.style.getPropertyValue('--ground')).toMatch(/^rgb\(/)
    unmount()
    expect(driver.destroy).toHaveBeenCalled()
    expect(root.dataset.cineMode).toBeUndefined()
  })

  it('falls back to the static page when the driver cannot load', async () => {
    const driver = fakeDriver(true)
    const {root} = mount(driver)
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() })
    expect(root.dataset.cineVideo).toBe('failed')
    expect(root.dataset.cineMode).toBe('static')
    expect(driver.render).not.toHaveBeenCalled()
  })

  it('stays static under reduced motion and never loads a plate', () => {
    reduced.matches = true
    const driver = fakeDriver()
    const {root} = mount(driver)
    expect(root.dataset.cineMode).toBe('static')
    expect(driver.load).not.toHaveBeenCalled()
  })
})
