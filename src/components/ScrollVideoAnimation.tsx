'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface OverlayStage {
  content: ReactNode
  fadeIn: number   // progress at which fade-in starts  (0–1)
  peak: number     // progress at which fully visible   (0–1)
  fadeOut: number  // progress at which fade-out starts (0–1)
  gone: number     // progress at which fully gone      (0–1)
}

interface Props {
  frameDir: string
  frameCount: number
  frameDigits?: number
  frameExt?: string
  scrollDistance?: number
  stages?: OverlayStage[]
  onLoadProgress?: (loaded: number, total: number) => void
}

// Object-fit: cover math for canvas drawImage
function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
) {
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
  const sw = img.naturalWidth * scale
  const sh = img.naturalHeight * scale
  ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh)
}

export function ScrollVideoAnimation({
  frameDir,
  frameCount,
  frameDigits = 4,
  frameExt = 'jpg',
  scrollDistance,
  stages = [],
  onLoadProgress,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const stageRefs    = useRef<(HTMLDivElement | null)[]>([])
  const imagesRef    = useRef<(HTMLImageElement | null)[]>([])
  const frameRef     = useRef(0)

  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current
    const img    = imagesRef.current[index]
    if (!canvas || !img?.complete || !img.naturalWidth) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    coverDraw(ctx, img, canvas.width, canvas.height)
    frameRef.current = index
  }, [])

  // Resize canvas to viewport
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      draw(frameRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  // Preload all frames
  useEffect(() => {
    const images = new Array<HTMLImageElement | null>(frameCount).fill(null)
    imagesRef.current = images
    let loaded = 0

    for (let i = 0; i < frameCount; i++) {
      const padded = String(i + 1).padStart(frameDigits, '0')
      const img = new Image()
      img.onload = () => {
        loaded++
        onLoadProgress?.(loaded, frameCount)
        if (i === 0) draw(0)
      }
      img.onerror = () => {
        loaded++
        onLoadProgress?.(loaded, frameCount)
      }
      img.src = `${frameDir}/${padded}.${frameExt}`
      images[i] = img
    }

    return () => { images.forEach(img => { if (img) img.src = '' }) }
  }, [frameDir, frameCount, frameDigits, frameExt]) // eslint-disable-line react-hooks/exhaustive-deps

  // GSAP ScrollTrigger — frames + stage transitions
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const distance = scrollDistance ?? frameCount * 13

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${distance}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress

        // Draw frame
        const index = Math.min(Math.round(p * (frameCount - 1)), frameCount - 1)
        if (index !== frameRef.current) draw(index)

        // Animate overlay stages
        stages.forEach((stage, i) => {
          const el = stageRefs.current[i]
          if (!el) return

          let opacity = 0
          let y = 16

          if (p >= stage.fadeIn && p < stage.peak) {
            const t = (p - stage.fadeIn) / (stage.peak - stage.fadeIn)
            opacity = t
            y = 16 * (1 - t)
          } else if (p >= stage.peak && p < stage.fadeOut) {
            opacity = 1
            y = 0
          } else if (p >= stage.fadeOut && p < stage.gone) {
            const t = (p - stage.fadeOut) / (stage.gone - stage.fadeOut)
            opacity = 1 - t
            y = -12 * t
          }

          gsap.set(el, { opacity, y, force3D: true })
        })
      },
    })

    return () => st.kill()
  }, [frameCount, scrollDistance, stages, draw]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[100dvh] overflow-hidden bg-[#050B12]"
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Bottom vignette for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Section seam: fade canvas to page bg color so handoff to PlatformWall is invisible */}
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#050B12] via-[#050B12]/60 to-transparent z-[1]" />


      {/* Overlay stages */}
      {stages.map((stage, i) => (
        <div
          key={i}
          ref={el => { stageRefs.current[i] = el }}
          className="absolute inset-x-0 bottom-[15%] flex flex-col items-center text-center pointer-events-none will-change-transform px-6 opacity-0"
        >
          {stage.content}
        </div>
      ))}
    </div>
  )
}
