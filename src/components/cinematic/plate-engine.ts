// Plate engine for the cinematic hero, version 3 ("the bag").
//
// The film is not a clip. It is a handful of painted stills (plates) that a
// fragment shader composites: scroll moves a camera inside each plate and, at
// the seams between plates, runs one material transition (a burn, a fall onto
// paper, a drawing that draws itself, a resolve from pencil to paint). The
// last plate carries the real app screen (a real screenshot placed by code;
// nothing painted is ever a screen). This is the pear.no grammar on GigMiles
// objects, with no library: one program, one quad, seven texture units.
//
// Discipline, shared with cinematic-controller.ts: scroll is the only clock
// (render(f) is called by the controller's frame; nothing here schedules
// anything), no timers, no DOM generation, and the pure parts are exported so
// the tests can walk the whole film without a GPU.

export interface Cam {
  /** 1 = the plate covers the frame exactly; larger pushes in. */
  zoom: number
  /** Pan as a fraction of the plate: positive x looks right, positive y looks down. */
  x: number
  y: number
}

export interface PlateLayer {
  desktop: string
  mobile: string
  /** 1 = moves with the base; larger moves more with the camera pan (closer to the eye). */
  parallax: number
}

export interface PlateSpec {
  id: string
  src: {desktop: string; mobile: string}
  /** Optional overlays with alpha, drawn over the base with their own parallax. */
  layers?: PlateLayer[]
  cam: {from: Cam; to: Cam}
  /** Key object, fractions from the top-left; the seams are composed around it. */
  anchor?: [number, number]
  /** Rectangle (x, y, w, h, fractions from the top-left) that the real app screen fills. */
  screen?: [number, number, number, number]
}

export type SeamMode = 'cross' | 'burn' | 'paper' | 'draw' | 'resolve'

export interface SeamSpec {
  mode: SeamMode
  /** Film fractions: the seam runs from `from` (plate a alone) to `to` (plate b alone). */
  from: number
  to: number
  /** Burn: where the fire starts, fractions from the top-left. */
  origin?: [number, number]
  /** Burn: the rectangle of plate a the camera pushes into first. */
  rect?: [number, number, number, number]
}

export interface PlateState {
  f: number
  a: number
  /** -1 outside a seam. */
  b: number
  t: number
  mode: SeamMode
  camA: Cam
  camB: Cam
  /** 0..1 strength of the real screen. */
  screen: number
  /** Which side owns the screen rectangle. */
  screenSide: 0 | 1
}

export type PlateMode = 'desktop' | 'mobile'

export interface FilmDriver {
  load(mode: PlateMode): Promise<void>
  render(f: number): void
  resize(): void
  destroy(): void
}

export const SEAM_MODES: SeamMode[] = ['cross', 'burn', 'paper', 'draw', 'resolve']
const MODE_INDEX: Record<SeamMode, number> = {cross: 0, burn: 1, paper: 2, draw: 3, resolve: 4}

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0)
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t) }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({zoom: lerp(a.zoom, b.zoom, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)})

/** [start, end] of each plate's solo span; seams own the gaps between them. */
export function plateSpans(plates: PlateSpec[], seams: SeamSpec[]): Array<[number, number]> {
  return plates.map((_, i) => [i === 0 ? 0 : seams[i - 1]?.to ?? 0, i === plates.length - 1 ? 1 : seams[i]?.from ?? 1])
}

/** Authoring guard: one seam fewer than plates, ordered, inside (0, 1), never overlapping, every plate with a positive solo span. */
export function validatePlates(plates: PlateSpec[], seams: SeamSpec[]) {
  const problems: string[] = []
  if (plates.length < 2) problems.push('at least two plates')
  if (seams.length !== plates.length - 1) problems.push(`expected ${plates.length - 1} seams, got ${seams.length}`)
  seams.forEach((seam, i) => {
    if (!SEAM_MODES.includes(seam.mode)) problems.push(`seam ${i}: unknown mode ${seam.mode}`)
    if (!(seam.from > 0 && seam.to < 1 && seam.to > seam.from)) problems.push(`seam ${i}: needs 0 < from < to < 1`)
    if (i > 0 && seam.from <= seams[i - 1].to) problems.push(`seam ${i}: overlaps seam ${i - 1}`)
    if (seam.mode === 'burn' && !seam.rect) problems.push(`seam ${i}: burn needs a rect`)
    if (seam.rect && !(seam.rect[2] > 0 && seam.rect[3] > 0 && seam.rect[0] + seam.rect[2] <= 1 && seam.rect[1] + seam.rect[3] <= 1)) problems.push(`seam ${i}: rect outside the plate`)
  })
  plateSpans(plates, seams).forEach(([s, e], i) => { if (!(e > s)) problems.push(`plate ${plates[i]?.id ?? i}: no solo span`) })
  plates.forEach(p => {
    if (!(p.cam.from.zoom >= 1 && p.cam.to.zoom >= 1)) problems.push(`plate ${p.id}: zoom below 1 shows the edge`)
    if (p.screen && !(p.screen[2] > 0 && p.screen[3] > 0 && p.screen[0] + p.screen[2] <= 1 && p.screen[1] + p.screen[3] <= 1)) problems.push(`plate ${p.id}: screen rect outside the plate`)
  })
  return problems
}

/** The camera inside one plate at its local progress u (0..1), eased so it settles at both ends. */
export function camAt(plate: PlateSpec, u: number): Cam {
  return lerpCam(plate.cam.from, plate.cam.to, smooth(u))
}

/** Camera the burn pushes into: the rect fills the frame. */
export function rectCam(rect: [number, number, number, number], maxZoom = 2.8): Cam {
  const [x, y, w, h] = rect
  return {zoom: Math.min(maxZoom, 1 / Math.max(w, h * (9 / 16))), x: x + w / 2 - 0.5, y: y + h / 2 - 0.5}
}

/** Where the film is at fraction f: which plates, how far into the seam, and both cameras. */
export function plateStateAt(f: number, plates: PlateSpec[], seams: SeamSpec[]): PlateState {
  const ff = clamp01(f)
  const spans = plateSpans(plates, seams)
  for (let k = 0; k < seams.length; k += 1) {
    const seam = seams[k]
    if (ff < seam.from || ff > seam.to) continue
    const t = clamp01((ff - seam.from) / (seam.to - seam.from))
    const endA = camAt(plates[k], 1)
    const startB = camAt(plates[k + 1], 0)
    let camA = endA
    let camB = startB
    if (seam.mode === 'burn' && seam.rect) {
      camA = lerpCam(endA, rectCam(seam.rect), smooth(t / 0.75))
      camB = lerpCam({...startB, zoom: startB.zoom * 1.18}, startB, smooth((t - 0.2) / 0.8))
    } else if (seam.mode === 'paper') {
      camA = {zoom: endA.zoom * (1 - 0.06 * smooth(t)), x: endA.x, y: endA.y + 0.55 * smooth(t)}
    } else if (seam.mode === 'resolve') {
      camB = lerpCam({...startB, zoom: startB.zoom * 1.06}, startB, smooth(t))
    } else if (seam.mode === 'cross') {
      camA = lerpCam(endA, {...endA, zoom: endA.zoom * 1.03}, smooth(t))
    }
    const bHasScreen = Boolean(plates[k + 1].screen)
    const aHasScreen = Boolean(plates[k].screen)
    const screen = bHasScreen ? smooth((t - 0.55) / 0.45) : aHasScreen ? 1 - smooth(t / 0.5) : 0
    return {f: ff, a: k, b: k + 1, t, mode: seam.mode, camA, camB, screen, screenSide: bHasScreen ? 1 : 0}
  }
  let i = spans.findIndex(([s, e]) => ff >= s && ff <= e)
  if (i < 0) i = ff < spans[0][0] ? 0 : plates.length - 1
  const [s, e] = spans[i]
  const u = e > s ? clamp01((ff - s) / (e - s)) : 0
  const camA = camAt(plates[i], u)
  return {f: ff, a: i, b: -1, t: 0, mode: 'cross', camA, camB: camA, screen: plates[i].screen ? 1 : 0, screenSide: 0}
}

/** Top-left fractions to GL (v up): cameras, rects and points. */
export const glCam = (c: Cam): [number, number, number] => [c.zoom, c.x, -c.y]
export const glRect = (r: [number, number, number, number]): [number, number, number, number] => [r[0], 1 - r[1] - r[3], r[2], r[3]]
export const glPoint = (p: [number, number]): [number, number] => [p[0], 1 - p[1]]

export const VERTEX_SHADER = `attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

// One fragment program for every seam. Modes: 0 cross, 1 burn, 2 paper, 3 draw, 4 resolve.
export const FRAGMENT_SHADER = `precision highp float;
varying vec2 vUv;
uniform sampler2D uA; uniform sampler2D uB; uniform sampler2D uLA1; uniform sampler2D uLA2; uniform sampler2D uLB1; uniform sampler2D uLB2; uniform sampler2D uS;
uniform vec2 uRes; uniform vec2 uTexA; uniform vec2 uTexB;
uniform vec3 uCamA; uniform vec3 uCamB;
uniform vec2 uParA1; uniform vec2 uParA2; uniform vec2 uParB1; uniform vec2 uParB2;
uniform int uLayersA; uniform int uLayersB; uniform int uMode; uniform int uScreenSide;
uniform float uT; uniform float uSeed; uniform float uGrain; uniform float uScreenT;
uniform vec2 uOrigin; uniform vec4 uScreenRect; uniform vec2 uScreenTex;
uniform vec3 uGlow;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 coverUv(vec2 uv, vec2 tex) { float s = max(uRes.x / tex.x, uRes.y / tex.y); vec2 size = tex * s; return (uv * uRes - uRes * 0.5) / size + 0.5; }
vec2 camUv(vec2 uv, vec3 c) { return (uv - 0.5) / c.x + 0.5 + c.yz; }
float inside(vec2 uv) { return step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0); }
vec3 sideA(vec2 uv) {
  vec3 c = texture2D(uA, uv).rgb;
  if (uLayersA > 0) { vec4 l = texture2D(uLA1, uv + uParA1); c = mix(c, l.rgb, l.a * inside(uv + uParA1)); }
  if (uLayersA > 1) { vec4 l = texture2D(uLA2, uv + uParA2); c = mix(c, l.rgb, l.a * inside(uv + uParA2)); }
  return c * inside(uv);
}
vec3 sideB(vec2 uv) {
  vec3 c = texture2D(uB, uv).rgb;
  if (uLayersB > 0) { vec4 l = texture2D(uLB1, uv + uParB1); c = mix(c, l.rgb, l.a * inside(uv + uParB1)); }
  if (uLayersB > 1) { vec4 l = texture2D(uLB2, uv + uParB2); c = mix(c, l.rgb, l.a * inside(uv + uParB2)); }
  return c * inside(uv);
}
void main() {
  vec2 uvA = camUv(coverUv(vUv, uTexA), uCamA);
  vec2 uvB = camUv(coverUv(vUv, uTexB), uCamB);
  vec3 a = sideA(uvA);
  vec3 b = sideB(uvB);
  float aspect = uRes.x / uRes.y;
  vec2 q = vec2(vUv.x * aspect, vUv.y);
  float n = hash(floor(gl_FragCoord.xy / 2.0) + uSeed);
  vec3 col = a;
  if (uMode == 1) {
    vec2 o = vec2(uOrigin.x * aspect, uOrigin.y);
    float d = distance(q, o) / (aspect + 1.0);
    float edge = d + (n - 0.5) * 0.10;
    float tb = smoothstep(0.25, 1.0, uT);
    float k = tb * 1.25 - edge;
    float m = smoothstep(0.0, 0.04, k);
    float band = smoothstep(-0.10, 0.0, k) * (1.0 - smoothstep(0.0, 0.08, k));
    col = mix(a, b, m);
    col = mix(col, uGlow, band * 0.65);
    col *= 1.0 - band * 0.35;
  } else if (uMode == 2) {
    float k = uT * 1.3 - (1.0 - vUv.y) * 0.9 - n * 0.35;
    col = mix(a, b, smoothstep(0.0, 0.25, k));
  } else if (uMode == 3) {
    float d = (vUv.x + (1.0 - vUv.y)) * 0.5;
    float k = uT * 1.35 - d - (n - 0.5) * 0.18;
    col = mix(a, b, smoothstep(0.0, 0.12, k));
  } else if (uMode == 4) {
    float d = 1.0 - vUv.y;
    float k = uT * 1.3 - d - (n - 0.5) * 0.12;
    float band = smoothstep(-0.06, 0.0, k) * (1.0 - smoothstep(0.0, 0.06, k));
    col = mix(a, b, smoothstep(0.0, 0.10, k)) + uGlow * band * 0.18;
  } else if (uT > 0.0) {
    col = mix(a, b, smoothstep(0.0, 1.0, uT));
  }
  if (uScreenT > 0.0) {
    vec2 uvO = uScreenSide == 0 ? uvA : uvB;
    vec2 r = (uvO - uScreenRect.xy) / uScreenRect.zw;
    vec2 px = (r - 0.5) * uScreenRect.zw * uScreenTex;
    vec2 hs = 0.5 * uScreenRect.zw * uScreenTex;
    float rad = 0.07 * uScreenRect.z * uScreenTex.x;
    vec2 dd = abs(px) - (hs - rad);
    float dist = length(max(dd, 0.0)) - rad;
    float mask = (1.0 - smoothstep(-1.0, 1.0, dist)) * uScreenT;
    float ring = (1.0 - smoothstep(0.0, 10.0, dist)) * smoothstep(-1.0, 1.0, dist) * uScreenT;
    vec3 s = texture2D(uS, clamp(r, 0.0, 1.0)).rgb;
    col = mix(col, vec3(0.02, 0.06, 0.05), ring * 0.9);
    col = mix(col, s, mask);
  }
  col += (hash(gl_FragCoord.xy * 0.71 + uSeed * 13.0) - 0.5) * uGrain;
  gl_FragColor = vec4(col, 1.0);
}`

export const UNIFORMS = ['uA', 'uB', 'uLA1', 'uLA2', 'uLB1', 'uLB2', 'uS', 'uRes', 'uTexA', 'uTexB', 'uCamA', 'uCamB', 'uParA1', 'uParA2', 'uParB1', 'uParB2', 'uLayersA', 'uLayersB', 'uMode', 'uScreenSide', 'uT', 'uSeed', 'uGrain', 'uScreenT', 'uOrigin', 'uScreenRect', 'uScreenTex', 'uGlow'] as const

export interface PlateDriverOptions {
  plates: PlateSpec[]
  seams: SeamSpec[]
  /** The real app screen (a real screenshot) for the plate that has a `screen` rect. */
  screenSrc?: string
  /** Edge colour of the burn and the resolve band, 0..1 rgb. */
  glow?: [number, number, number]
  grain?: number
  dprCap?: number
  /** Test seam: image loading and context creation can be replaced. */
  loadImage?: (url: string) => Promise<TexImageSource & {width: number; height: number}>
}

interface Tex { tex: WebGLTexture; w: number; h: number }

function decodeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`plate failed: ${url}`))
    img.src = url
  })
}

/**
 * Builds the WebGL driver for a canvas. Nothing touches the GPU until
 * `load()`; a missing WebGL context or a failed plate rejects the load and
 * the controller falls back to the static page.
 */
export function createPlateDriver(canvas: HTMLCanvasElement, opts: PlateDriverOptions): FilmDriver {
  const {plates, seams} = opts
  const glow = opts.glow ?? [0.75, 0.96, 0.81]
  const grain = opts.grain ?? 0.035
  const dprCap = opts.dprCap ?? 1.5
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  const loc = new Map<string, WebGLUniformLocation | null>()
  const textures: Tex[] = []
  const layerTextures: Tex[][] = []
  let screenTex: Tex | null = null
  let blank: WebGLTexture | null = null
  let ready = false
  let lastF = -1
  let destroyed = false

  const load = async (mode: PlateMode) => {
    const ctx = canvas.getContext('webgl', {alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance'}) as WebGLRenderingContext | null
    if (!ctx) throw new Error('webgl unavailable')
    gl = ctx
    const compile = (type: number, src: string) => {
      const shader = gl!.createShader(type)
      if (!shader) throw new Error('shader')
      gl!.shaderSource(shader, src)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(`shader: ${gl!.getShaderInfoLog(shader) ?? ''}`)
      return shader
    }
    const prog = gl.createProgram()
    if (!prog) throw new Error('program')
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(prog) ?? ''}`)
    gl.useProgram(prog)
    program = prog
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    for (const name of UNIFORMS) loc.set(name, gl.getUniformLocation(prog, name))
    blank = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, blank)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))

    const upload = async (url: string): Promise<Tex> => {
      const image = opts.loadImage ? await opts.loadImage(url) : await decodeImage(url)
      if (destroyed || !gl) throw new Error('destroyed')
      const tex = gl.createTexture()
      if (!tex) throw new Error('texture')
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      return {tex, w: image.width, h: image.height}
    }
    const plateTex = await Promise.all(plates.map(p => upload(p.src[mode])))
    const layers = await Promise.all(plates.map(p => Promise.all((p.layers ?? []).slice(0, 2).map(l => upload(l[mode])))))
    if (opts.screenSrc && plates.some(p => p.screen)) screenTex = await upload(opts.screenSrc)
    textures.push(...plateTex)
    layerTextures.push(...layers)
    ready = true
    resize()
  }

  const bind = (unit: number, tex: WebGLTexture | null, name: string) => {
    gl!.activeTexture(gl!.TEXTURE0 + unit)
    gl!.bindTexture(gl!.TEXTURE_2D, tex ?? blank)
    gl!.uniform1i(loc.get(name) ?? null, unit)
  }

  const render = (f: number) => {
    if (!ready || !gl || !program || destroyed) return
    lastF = f
    const st = plateStateAt(f, plates, seams)
    const A = textures[st.a]
    const B = st.b >= 0 ? textures[st.b] : A
    const la = layerTextures[st.a] ?? []
    const lb = st.b >= 0 ? layerTextures[st.b] ?? [] : []
    const pa = plates[st.a]
    const pb = st.b >= 0 ? plates[st.b] : pa
    gl.viewport(0, 0, canvas.width, canvas.height)
    bind(0, A.tex, 'uA')
    bind(1, B.tex, 'uB')
    bind(2, la[0]?.tex ?? null, 'uLA1')
    bind(3, la[1]?.tex ?? null, 'uLA2')
    bind(4, lb[0]?.tex ?? null, 'uLB1')
    bind(5, lb[1]?.tex ?? null, 'uLB2')
    bind(6, screenTex?.tex ?? null, 'uS')
    gl.uniform2f(loc.get('uRes')!, canvas.width, canvas.height)
    gl.uniform2f(loc.get('uTexA')!, A.w, A.h)
    gl.uniform2f(loc.get('uTexB')!, B.w, B.h)
    gl.uniform3fv(loc.get('uCamA')!, glCam(st.camA))
    gl.uniform3fv(loc.get('uCamB')!, glCam(st.camB))
    const par = (plate: PlateSpec, cam: Cam, i: number): [number, number] => {
      const layer = plate.layers?.[i]
      if (!layer) return [0, 0]
      const k = layer.parallax - 1
      return [cam.x * k, -cam.y * k]
    }
    gl.uniform2fv(loc.get('uParA1')!, par(pa, st.camA, 0))
    gl.uniform2fv(loc.get('uParA2')!, par(pa, st.camA, 1))
    gl.uniform2fv(loc.get('uParB1')!, par(pb, st.camB, 0))
    gl.uniform2fv(loc.get('uParB2')!, par(pb, st.camB, 1))
    gl.uniform1i(loc.get('uLayersA')!, la.length)
    gl.uniform1i(loc.get('uLayersB')!, st.b >= 0 ? lb.length : 0)
    gl.uniform1i(loc.get('uMode')!, MODE_INDEX[st.mode])
    gl.uniform1f(loc.get('uT')!, st.b >= 0 ? st.t : 0)
    gl.uniform1f(loc.get('uSeed')!, Math.floor(f * 400) * 0.37)
    gl.uniform1f(loc.get('uGrain')!, grain)
    const seam = st.b >= 0 ? seams[st.a] : null
    gl.uniform2fv(loc.get('uOrigin')!, glPoint(seam?.origin ?? [0.5, 0.5]))
    const owner = st.screenSide === 1 ? pb : pa
    const ownerTex = st.screenSide === 1 ? B : A
    const rect = owner.screen
    gl.uniform1f(loc.get('uScreenT')!, rect && screenTex ? st.screen : 0)
    gl.uniform1i(loc.get('uScreenSide')!, st.screenSide)
    gl.uniform4fv(loc.get('uScreenRect')!, glRect(rect ?? [0, 0, 1, 1]))
    gl.uniform2f(loc.get('uScreenTex')!, ownerTex.w, ownerTex.h)
    gl.uniform3fv(loc.get('uGlow')!, glow)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function resize() {
    if (destroyed) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, dprCap)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
    if (ready && lastF >= 0) render(lastF)
  }

  const destroy = () => {
    destroyed = true
    ready = false
    if (gl) {
      for (const t of textures) gl.deleteTexture(t.tex)
      for (const group of layerTextures) for (const t of group) gl.deleteTexture(t.tex)
      if (screenTex) gl.deleteTexture(screenTex.tex)
      if (blank) gl.deleteTexture(blank)
      if (program) gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    textures.length = 0
    layerTextures.length = 0
    screenTex = null
    gl = null
    program = null
  }

  return {load, render, resize, destroy}
}
