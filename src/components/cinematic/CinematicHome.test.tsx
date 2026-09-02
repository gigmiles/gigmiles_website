import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {renderToStaticMarkup} from 'react-dom/server'
import {act, render} from '@testing-library/react'
import {CinematicHome} from './CinematicHome'
import {CinematicHero} from './CinematicHero'
import {CINEMATIC_SCENES} from './cinematic-cues'

const BANNED_PAGE = /\$175|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★/i

class Media extends EventTarget { matches = false; constructor(matches: boolean) { super(); this.matches = matches } }

describe('cinematic route gate', () => {
  it('is local only and hidden from crawlers', async () => {
    const source = fs.readFileSync(path.join(__dirname, '../../app/preview/cinematic/page.tsx'), 'utf8')
    expect(source).toContain('index:false,follow:false')
    expect(source).toContain("dynamic='force-dynamic'")
    expect(source).toMatch(/LOCAL_DESIGN_REVIEW!=='1' \|\| process\.env\.NODE_ENV==='production'\) notFound\(\)/)
  })
})

describe('cinematic home markup', () => {
  const html = renderToStaticMarkup(<CinematicHome/>)

  it('ships the film stage as a static, complete page', () => {
    expect(html).toContain('data-cine-mode="static"')
    expect(html).toMatch(/<video[^>]*playsinline/i)
    expect(html).toMatch(/<video[^>]*preload="none"/i)
    expect(html).toMatch(/<video[^>]*poster="\/cinematic\/hero-poster\.webp"/i)
    expect(html).not.toMatch(/<video[^>]*(autoplay|controls|loop)/i)
    expect(html).not.toContain('<canvas')
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain('id="headline"')
    const text = html.replace(/<[^>]+>/g, '')
    for (const scene of CINEMATIC_SCENES) {
      for (const line of scene.headline) expect(text).toContain(line.replace(/\*/g, ''))
      expect(text).toContain(scene.support)
    }
    expect(html).toContain('class="cine-mark"')
    expect(html).toContain('data-cta-placement="cinematic-stage"')
    expect(html).toContain('data-cta-placement="cinematic-closing"')
    expect(html).not.toMatch(BANNED_PAGE)
    expect(html).not.toContain('[VERIFY]')
  })

  it('keeps one eyebrow on the page and no section counters in the film', () => {
    const eyebrows = html.match(/class="eyebrow"/g) ?? []
    const sections = html.match(/<section/g) ?? []
    expect(eyebrows.length).toBeLessThanOrEqual(Math.ceil(sections.length / 3))
    // Scene copy: no counters, no em dashes. (The CTA label keeps the site-wide
    // approved wording, which carries one.)
    const scenes = html.slice(html.indexOf('cine-scenes'), html.indexOf('cine-cta'))
    expect(scenes).not.toMatch(/0\d \/ 0\d/)
    expect(scenes).not.toContain('—')
  })

  it('reuses the approved sections in order', () => {
    const order = ['cine-hero', 'cine-after', 'estimate-proof', 'feature-tour', 'id="free"', 'id="download"', 'sticky-cta']
    let last = -1
    for (const marker of order) { const at = html.indexOf(marker); expect(at, marker).toBeGreaterThan(last); last = at }
  })
})

describe('cinematic css discipline', () => {
  const css = fs.readFileSync(path.join(__dirname, 'cinematic.css'), 'utf8')
  it('uses svh, sticky, and only transform/opacity/clip-path transitions', () => {
    expect(css).not.toMatch(/100vh/)
    expect(css).toContain('height: 100svh')
    expect(css).toContain('position: sticky')
    expect(css).not.toMatch(/@keyframes|transition:\s*all/)
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) {
      const props = m[1].split(',').map(s => s.trim().split(/\s+/)[0])
      for (const prop of props) expect(['opacity', 'transform', 'clip-path', 'none']).toContain(prop)
    }
  })
})

describe('cinematic controller in the document', () => {
  const frames = new Map<number, FrameRequestCallback>()
  let sequence = 0
  let room: Media, reduced: Media, tall: Media
  const flush = (n = 1) => { for (let i = 0; i < n; i += 1) { const pending = [...frames.entries()]; frames.clear(); for (const [, fn] of pending) fn(performance.now() + 16.7 * (i + 1)) } }
  const fetchImpl = vi.fn(() => Promise.resolve({ok: true, blob: () => Promise.resolve(new Blob(['x']))} as unknown as Response))

  beforeEach(() => {
    room = new Media(true); reduced = new Media(false); tall = new Media(true)
    vi.stubGlobal('matchMedia', vi.fn((q: string) => q.includes('reduced-motion') ? reduced : q.includes('min-height') ? tall : room))
    vi.stubGlobal('requestAnimationFrame', vi.fn((fn: FrameRequestCallback) => { frames.set(++sequence, fn); return sequence }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
    vi.stubGlobal('fetch', fetchImpl)
    vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
    Object.defineProperty(URL, 'createObjectURL', {value: vi.fn(() => 'blob:film'), configurable: true})
    Object.defineProperty(URL, 'revokeObjectURL', {value: vi.fn(), configurable: true})
    Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {value: () => 'probably', configurable: true})
    fetchImpl.mockClear()
  })
  afterEach(() => { vi.unstubAllGlobals(); frames.clear() })

  function mount() {
    const utils = render(<CinematicHero/>)
    const root = document.getElementById('cine-hero') as HTMLElement
    const stage = root.querySelector('.cine-stage') as HTMLElement
    const video = root.querySelector('video') as HTMLVideoElement
    Object.defineProperty(root, 'offsetHeight', {value: 5000, configurable: true})
    Object.defineProperty(stage, 'offsetHeight', {value: 1000, configurable: true})
    Object.defineProperty(video, 'duration', {value: 15.1, configurable: true})
    Object.defineProperty(video, 'seeking', {value: false, writable: true, configurable: true})
    Object.defineProperty(video, 'readyState', {value: 2, configurable: true})
    let current = 0
    Object.defineProperty(video, 'currentTime', {get: () => current, set: (v: number) => { current = v }, configurable: true})
    video.play = vi.fn(() => Promise.resolve())
    video.pause = vi.fn()
    const setProgress = (p: number) => vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({top: -4000 * p, height: 5000} as DOMRect)
    return {...utils, root, video, setProgress, time: () => current}
  }

  it('upgrades to the desktop film, scrubs both ways and keeps one active scene', async () => {
    const {root, video, setProgress, time, unmount} = mount()
    expect(root.dataset.cineMode).toBe('desktop')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() })
    expect(video.src).toBe('blob:film')
    setProgress(0)
    await act(async () => { video.dispatchEvent(new Event('loadedmetadata')); await Promise.resolve(); await Promise.resolve() })
    expect(root.dataset.cineVideo).toBe('primed')
    expect(video.play).toHaveBeenCalled()
    expect(video.pause).toHaveBeenCalled()
    const seen: number[] = []
    for (const p of [0, 0.25, 0.5, 0.75, 1, 0.5, 0.25, 0]) {
      setProgress(p)
      act(() => { window.dispatchEvent(new Event('scroll')); flush(120) })
      seen.push(time())
    }
    expect(seen[0]).toBeLessThan(0.2)
    expect(seen[1]).toBeGreaterThan(seen[0])
    expect(seen[2]).toBeGreaterThan(seen[1])
    expect(seen[3]).toBeCloseTo(15.05, 1)
    expect(seen[4]).toBeCloseTo(15.05, 1)
    expect(seen[5]).toBeLessThan(seen[4])
    expect(seen[6]).toBeLessThan(seen[5])
    expect(seen[7]).toBeLessThan(0.2)
    expect(frames.size).toBe(0)
    const active = [...root.querySelectorAll('.cine-scene')].filter(s => !s.hasAttribute('inert'))
    expect(active).toHaveLength(1)
    expect(active[0].getAttribute('data-cue')).toBe('gross')
    expect(root.style.getPropertyValue('--p')).toBe('0.0000')
    unmount()
    expect(root.dataset.cineMode).toBeUndefined()
    window.dispatchEvent(new Event('scroll'))
    expect(frames.size).toBe(0)
  })

  it('never writes currentTime while the decoder is seeking', async () => {
    const {video, setProgress, time} = mount()
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() })
    setProgress(0)
    await act(async () => { video.dispatchEvent(new Event('loadedmetadata')); await Promise.resolve(); await Promise.resolve() })
    act(() => { window.dispatchEvent(new Event('scroll')); flush(60) })
    const before = time()
    ;(video as unknown as {seeking: boolean}).seeking = true
    setProgress(0.5)
    act(() => { window.dispatchEvent(new Event('scroll')); flush(10) })
    expect(time()).toBe(before)
  })

  it('stays static under reduced motion and fetches nothing', () => {
    reduced.matches = true
    const {root} = mount()
    expect(root.dataset.cineMode).toBe('static')
    expect(fetchImpl).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('scroll'))
    expect(frames.size).toBe(0)
    expect(root.querySelector('.cine-scene[inert]')).toBeNull()
  })

  it('falls back to static when the mp4 cannot load', async () => {
    fetchImpl.mockImplementationOnce(() => Promise.resolve({ok: false, blob: () => Promise.resolve(new Blob())} as unknown as Response))
    const {root} = mount()
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() })
    expect(root.dataset.cineVideo).toBe('failed')
    expect(root.dataset.cineMode).toBe('static')
  })
})
