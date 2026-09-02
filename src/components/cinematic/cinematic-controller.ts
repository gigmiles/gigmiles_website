// Scroll-scrubbed film controller for the cinematic hero.
//
// Scroll position is the only clock. One passive scroll listener schedules a
// single requestAnimationFrame; the frame reads the pinned section's progress,
// writes the scene cue variables, walks a smoothed playhead toward the target
// film time and, when the decoder is free, seeks the <video>. Nothing runs
// while the playhead is at rest. No timers, no scroll-jacking, no DOM
// generation: the markup is rendered on the server and this file only writes
// data attributes and CSS custom properties.
//
// The playhead discipline follows the scroll-craft engine (vanilla, zero deps):
// lerp toward the target, deadband before each seek, never seek while the
// decoder is still seeking, nudge a seek that never settles, fetch the file as
// a blob so seeking needs no range requests, and prime iOS with a muted
// play()/pause() once metadata is in.

export interface CueSpec {
  id: string
  /** Page progress (0..1) at which the scene starts entering. */
  from: number
  /** Page progress at which the scene has fully left (ignored when `hold`). */
  to: number
  rampIn?: number
  rampOut?: number
  stagger?: number
  /** Number of masked lines (headline lines + support line). */
  lines: number
  /** The closing scene stays on screen while the next section slides over. */
  hold?: boolean
}

export interface CueState {
  vis: number
  enter: number
  exit: number
  opacity: number
  y: number
  scale: number
  lines: number[]
  active: boolean
}

export type CineMode = 'static' | 'desktop' | 'mobile'
export type VideoState = 'idle' | 'loading' | 'ready' | 'primed' | 'failed'

export const DEFAULTS = {
  lerpDesktop: 0.18,
  lerpMobile: 0.28,
  deadbandDesktop: 0.008,
  deadbandMobile: 0.02,
  /** Page progress at which the film reaches its last frame; the rest is the hold. */
  endAt: 0.74,
  snap: 0.002,
  stuckTicks: 45,
  primeTicks: 120,
  minHeight: 500,
  rampIn: 0.045,
  rampOut: 0.045,
  stagger: 0.015,
  enterY: 28,
  exitY: 18,
}

export type Defaults = typeof DEFAULTS

export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0)

export function smoothstep(edge0: number, edge1: number, x: number) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Film time for a page progress: the film plays out over [0, endAt] and holds after. */
export function timeAtProgress(p: number, duration: number, endAt = DEFAULTS.endAt) {
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0
  return clamp01(clamp01(p) / endAt) * Math.max(0, d - 0.05)
}

/** Page progress for a fraction of the film's duration. */
export function progressAtFraction(fraction: number, endAt = DEFAULTS.endAt) {
  return clamp01(fraction) * endAt
}

/** One smoothing step, normalised to frame time so 120 Hz screens feel like 60 Hz. */
export function lerpStep(current: number, target: number, k: number, dtMs = 16.7, snap = DEFAULTS.snap) {
  const rate = Math.min(1, Math.max(0.02, k))
  const perFrame = 1 - Math.pow(1 - rate, Math.max(0, dtMs) / 16.7)
  const next = current + (target - current) * perFrame
  return Math.abs(target - next) < snap ? target : next
}

export function shouldSeek(playhead: number, current: number, seeking: boolean, deadband: number) {
  return !seeking && Math.abs(playhead - current) > deadband
}

export function cueState(p: number, cue: CueSpec, d: Defaults = DEFAULTS): CueState {
  const rampIn = cue.rampIn ?? d.rampIn
  const rampOut = cue.rampOut ?? d.rampOut
  const stagger = cue.stagger ?? d.stagger
  const enter = smoothstep(cue.from, cue.from + rampIn, p)
  const exit = cue.hold ? 0 : smoothstep(cue.to - rampOut, cue.to, p)
  const vis = enter * (1 - exit)
  const lines: number[] = []
  for (let i = 0; i < cue.lines; i += 1) {
    lines.push(smoothstep(cue.from + i * stagger, cue.from + i * stagger + rampIn, p) * (1 - exit))
  }
  return {vis, enter, exit, opacity: vis, y: (1 - enter) * d.enterY - exit * d.exitY, scale: 0.985 + 0.015 * enter, lines, active: vis > 0.5}
}

/** Index of the most visible cue at p, or -1 when nothing is on screen. */
export function sceneAtProgress(p: number, cues: CueSpec[], d: Defaults = DEFAULTS) {
  let best = -1
  let bestVis = 0.001
  cues.forEach((cue, index) => {
    const {vis} = cueState(p, cue, d)
    if (vis > bestVis) { best = index; bestVis = vis }
  })
  return best
}

/** Authoring guard: ordered, in range, and never two scenes above half opacity at once. */
export function validateCues(cues: CueSpec[], d: Defaults = DEFAULTS) {
  const problems: string[] = []
  cues.forEach((cue, i) => {
    if (!(cue.from >= 0 && cue.from <= 1)) problems.push(`${cue.id}: from out of range`)
    if (!cue.hold && !(cue.to > cue.from && cue.to <= 1)) problems.push(`${cue.id}: to must be after from and within 1`)
    if (i > 0 && cue.from < cues[i - 1].from) problems.push(`${cue.id}: starts before ${cues[i - 1].id}`)
    if (!(cue.lines >= 1)) problems.push(`${cue.id}: needs at least one line`)
  })
  for (let p = 0; p <= 1.0001; p += 0.002) {
    const bright = cues.filter(cue => cueState(p, cue, d).vis > 0.5)
    if (bright.length > 1) { problems.push(`p=${p.toFixed(3)}: ${bright.map(c => c.id).join(' + ')} both above 0.5`); break }
  }
  return problems
}

export interface ModeEnv {
  reduced: boolean
  wide: boolean
  tall: boolean
  saveData: boolean
  slow: boolean
  hasVideo: boolean
}

export function resolveMode(env: ModeEnv): CineMode {
  if (env.reduced || env.saveData || env.slow || !env.tall || !env.hasVideo) return 'static'
  return env.wide ? 'desktop' : 'mobile'
}

export interface InstallOptions {
  cues: CueSpec[]
  src: {desktop: string; mobile: string}
  onState?: (state: VideoState) => void
  fetchImpl?: typeof fetch
  defaults?: Partial<Defaults>
}

const PRIME_EVENTS = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'] as const

export function installCinematic(root: HTMLElement, video: HTMLVideoElement, opts: InstallOptions) {
  const d: Defaults = {...DEFAULTS, ...opts.defaults}
  const cues = opts.cues
  const controller = new AbortController()
  const {signal} = controller
  const stage = root.querySelector<HTMLElement>('.cine-stage') ?? root
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('.cine-scene'))
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)')
  const wideMQ = matchMedia('(min-width: 981px)')
  const tallMQ = matchMedia(`(min-height: ${d.minHeight}px)`)
  const connection = (navigator as Navigator & {connection?: {saveData?: boolean; effectiveType?: string}}).connection

  let mode: CineMode = 'static'
  let frame = 0
  let lastTick = 0
  let lastP = -1
  let playhead = 0
  let target = 0
  let stuck = 0
  let videoState: VideoState = 'idle'
  let objectUrl: string | null = null
  let loaded = false
  let priming = false
  let primed = false
  let primeTicksLeft = 0
  let gestureArmed = false

  const setState = (state: VideoState) => {
    videoState = state
    root.dataset.cineVideo = state
    opts.onState?.(state)
  }

  const canPlay = () => typeof video.canPlayType === 'function' && video.canPlayType('video/mp4; codecs="avc1.640028"') !== ''

  const env = (): ModeEnv => ({
    reduced: reducedMQ.matches,
    wide: wideMQ.matches,
    tall: tallMQ.matches,
    saveData: connection?.saveData === true,
    slow: /^(slow-2g|2g)$/.test(connection?.effectiveType ?? ''),
    hasVideo: videoState !== 'failed' && canPlay(),
  })

  const progress = () => {
    const rect = root.getBoundingClientRect()
    const travel = Math.max(1, root.offsetHeight - stage.offsetHeight)
    return clamp01(-rect.top / travel)
  }

  const writeCues = (p: number) => {
    root.style.setProperty('--p', p.toFixed(4))
    const activeIndex = sceneAtProgress(p, cues, d)
    scenes.forEach((scene, index) => {
      const cue = cues[index]
      if (!cue) return
      const state = cueState(p, cue, d)
      scene.style.setProperty('--o', state.opacity.toFixed(3))
      scene.style.setProperty('--y', `${state.y.toFixed(2)}px`)
      scene.style.setProperty('--s', state.scale.toFixed(4))
      state.lines.forEach((line, li) => scene.style.setProperty(`--l${li}`, line.toFixed(3)))
      const active = index === activeIndex
      if (active) scene.setAttribute('data-scene-active', 'true')
      else scene.removeAttribute('data-scene-active')
      scene.toggleAttribute('inert', !active)
    })
  }

  const clearCues = () => {
    root.style.removeProperty('--p')
    scenes.forEach(scene => {
      scene.removeAttribute('style')
      scene.removeAttribute('data-scene-active')
      scene.removeAttribute('inert')
    })
  }

  const schedule = () => {
    if (frame || document.hidden || mode === 'static') return
    frame = requestAnimationFrame(tick)
  }

  const releasePrime = () => {
    priming = false
    armGesture()
  }

  const finishPrime = () => {
    if (!priming) return
    priming = false
    primed = true
    try { video.pause() } catch { /* jsdom */ }
    const duration = video.duration || 0
    playhead = target
    // Nudge past the deadband so the next tick paints the real frame.
    try { video.currentTime = Math.min(Math.max(0.001, target + 0.05), Math.max(0.001, duration * 0.999)) } catch { /* not seekable yet */ }
    setState('primed')
    schedule()
  }

  const startPrime = () => {
    if (primed || priming || !video.src || videoState === 'failed') return
    priming = true
    primeTicksLeft = d.primeTicks
    video.muted = true
    let promise: Promise<void> | undefined
    try { promise = video.play() } catch { releasePrime(); return }
    if (promise && typeof promise.then === 'function') promise.then(() => finishPrime(), () => releasePrime())
    else finishPrime()
    schedule()
  }

  function armGesture() {
    if (gestureArmed) return
    gestureArmed = true
    for (const type of PRIME_EVENTS) window.addEventListener(type, startPrime, {passive: true, signal})
  }

  const load = () => {
    if (loaded || mode === 'static') return
    loaded = true
    setState('loading')
    const url = mode === 'mobile' ? opts.src.mobile : opts.src.desktop
    const fetchImpl = opts.fetchImpl ?? fetch
    fetchImpl(url, {signal})
      .then(response => {
        if (!response.ok) throw new Error(String(response.status))
        return response.blob()
      })
      .then(blob => {
        if (signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.src = objectUrl
      })
      .catch(() => {
        if (signal.aborted) return
        setState('failed')
        configure()
      })
  }

  function tick(now: number) {
    frame = 0
    const dt = lastTick ? Math.min(64, now - lastTick) : 16.7
    lastTick = now
    const p = progress()
    if (Math.abs(p - lastP) > 0.0005) { lastP = p; writeCues(p) }
    if (mode === 'static') return
    target = timeAtProgress(p, video.duration || 0, d.endAt)
    playhead = lerpStep(playhead, target, mode === 'mobile' ? d.lerpMobile : d.lerpDesktop, dt, d.snap)
    if (videoState === 'primed' || videoState === 'ready') {
      if (video.seeking) {
        stuck += 1
        if (stuck >= d.stuckTicks) {
          stuck = 0
          try { video.currentTime = video.currentTime + 0.001 } catch { /* ignore */ }
        }
      } else {
        stuck = 0
        const deadband = mode === 'mobile' ? d.deadbandMobile : d.deadbandDesktop
        if (shouldSeek(playhead, video.currentTime, false, deadband)) {
          try { video.currentTime = playhead } catch { /* ignore */ }
        }
      }
    }
    if (priming) {
      primeTicksLeft -= 1
      if (primeTicksLeft <= 0) releasePrime()
    }
    if (Math.abs(target - playhead) > d.snap || video.seeking || priming) schedule()
  }

  function configure() {
    const next = resolveMode(env())
    mode = next
    root.dataset.cineMode = next
    lastP = -1
    if (frame) { cancelAnimationFrame(frame); frame = 0 }
    if (next === 'static') { clearCues(); return }
    load()
    schedule()
  }

  video.addEventListener('loadedmetadata', () => {
    setState('ready')
    const p = progress()
    target = timeAtProgress(p, video.duration || 0, d.endAt)
    playhead = target
    // Force one seek even at p=0 so the poster hand-off has a painted frame to wait for.
    try { video.currentTime = Math.max(target, 0.001) } catch { /* ignore */ }
    startPrime()
  }, {signal})
  video.addEventListener('seeked', () => {
    root.dataset.cinePainted = 'true'
    root.dataset.cineTime = (video.currentTime || 0).toFixed(3)
  }, {signal})
  video.addEventListener('error', () => { setState('failed'); configure() }, {signal})

  window.addEventListener('scroll', schedule, {passive: true, signal})
  window.addEventListener('resize', configure, {signal})
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0 } else schedule() }, {signal})
  reducedMQ.addEventListener('change', configure, {signal})
  wideMQ.addEventListener('change', configure, {signal})
  tallMQ.addEventListener('change', configure, {signal})

  setState('idle')
  configure()

  return () => {
    controller.abort()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    try { video.pause() } catch { /* ignore */ }
    video.removeAttribute('src')
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null
    clearCues()
    delete root.dataset.cineMode
    delete root.dataset.cineVideo
    delete root.dataset.cinePainted
    delete root.dataset.cineTime
  }
}
