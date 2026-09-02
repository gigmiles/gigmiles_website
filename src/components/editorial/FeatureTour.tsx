'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'
import {CountUp} from './CountUp'
import {DeviceFrame} from './DeviceFrame'

export interface TourFigure {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  caption: string
}

export interface TourScreen {
  id: string
  title: string
  body: string
  tag: string
  /** Headline figure taken from the approved capture (WEB-TOUR-1). */
  figure?: TourFigure
  /** Approved capture under /editorial (780×1560 WebP). Absent until the
   *  operator approves the fixture screens; a placeholder renders instead. */
  image?: string
  alt?: string
}

const TOUR_MEDIA = '(min-width: 981px) and (prefers-reduced-motion: no-preference)'
const POINTER_MEDIA = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

function formatFigure(f: TourFigure) {
  return (n: number) => `${f.prefix ?? ''}${n.toLocaleString('en-US', {minimumFractionDigits: f.decimals ?? 0, maximumFractionDigits: f.decimals ?? 0})}${f.suffix ?? ''}`
}

// Sticky phone + scrolling captions on wide viewports; a plain stacked list
// (image under each caption) on narrow viewports and under reduced motion.
// One IntersectionObserver picks the active step; no scroll math, no rAF loop.
// The phone's captures are stacked and cross-fade (device-frame.css); the
// frame tilts a few degrees toward the pointer on hover-capable desktops.
export function FeatureTour({screens, eyebrow = 'IN THE APP', heading}: {screens: TourScreen[]; eyebrow?: string; heading: ReactNode}) {
  const [active, setActive] = useState(0)
  const stepsRef = useRef<HTMLOListElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function' || typeof IntersectionObserver !== 'function') return
    const query = window.matchMedia(TOUR_MEDIA)
    let observer: IntersectionObserver | null = null
    const connect = () => {
      observer?.disconnect(); observer = null
      if (!query.matches || !stepsRef.current) return
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      }, {rootMargin: '-45% 0px -45% 0px'})
      stepsRef.current.querySelectorAll<HTMLElement>('.tour-step').forEach(step => io.observe(step))
      observer = io
    }
    connect()
    query.addEventListener('change', connect)
    return () => { query.removeEventListener('change', connect); observer?.disconnect() }
  }, [screens.length])

  // Pointer parallax: a few degrees of tilt, only with a real mouse and motion allowed.
  useEffect(() => {
    const layout = layoutRef.current, phone = phoneRef.current
    if (!layout || !phone || typeof window.matchMedia !== 'function' || !window.matchMedia(POINTER_MEDIA).matches) return
    let raf = 0
    const onMove = (event: PointerEvent) => {
      const rect = layout.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        phone.style.setProperty('--ry', String(Math.max(-1, Math.min(1, x * 2))))
        phone.style.setProperty('--rx', String(Math.max(-1, Math.min(1, y * 2))))
      })
    }
    const onLeave = () => { cancelAnimationFrame(raf); phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx') }
    layout.addEventListener('pointermove', onMove)
    layout.addEventListener('pointerleave', onLeave)
    return () => { cancelAnimationFrame(raf); layout.removeEventListener('pointermove', onMove); layout.removeEventListener('pointerleave', onLeave) }
  }, [])

  const placeholder = (screen: TourScreen, extra: string, activeState: boolean) =>
    <div key={screen.id} className={`tour-placeholder ${extra}`.trim()} data-active={activeState ? 'true' : 'false'} role={extra ? 'img' : undefined} aria-label={extra ? `${screen.title}: screen capture pending approval` : undefined}>
      <span>{screen.title}</span><small>Screen capture pending approval</small>
    </div>

  return <section className="feature-tour" id="tour" aria-labelledby="tour-title">
    <div className="wrap tour-layout" ref={layoutRef}>
      <div className="tour-heading" data-reveal="">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="tour-title">{heading}</h2>
      </div>
      <figure className="tour-phone" aria-hidden="true" ref={phoneRef}>
        <DeviceFrame>
          {screens.map((screen, index) => screen.image
            ? <img key={screen.id} className="product-screen-image" src={`/editorial/${screen.image}`}
                srcSet={`/editorial/${screen.image.replace(/\.webp$/, '-390.webp')} 390w, /editorial/${screen.image} 780w`}
                sizes="348px" width={780} height={1560} loading="eager" fetchPriority="low" decoding="async" alt="" data-active={index === active ? 'true' : 'false'}/>
            : placeholder(screen, '', index === active))}
        </DeviceFrame>
      </figure>
      <ol className="tour-steps" ref={stepsRef}>
        {screens.map((screen, index) => <li key={screen.id} className="tour-step" data-index={index} data-reveal="" aria-current={index === active ? 'step' : undefined}>
          <span className="tour-meta"><span className="tour-index">{String(index + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}</span><span className="tour-tag">{screen.tag}</span></span>
          {screen.figure && <p className="tour-figure">
            <CountUp value={screen.figure.value} format={formatFigure(screen.figure)} duration={1100}/>
            <small>{screen.figure.caption}</small>
          </p>}
          <h3>{screen.title}</h3>
          <p>{screen.body}</p>
          <div className="tour-step-device">
            <DeviceFrame>
              {screen.image
                ? <img className="product-screen-image" src={`/editorial/${screen.image}`} srcSet={`/editorial/${screen.image.replace(/\.webp$/, '-390.webp')} 390w, /editorial/${screen.image} 780w`} sizes="300px" alt={screen.alt ?? screen.title} width={780} height={1560} loading="lazy" decoding="async"/>
                : placeholder(screen, 'tour-step-placeholder', true)}
            </DeviceFrame>
          </div>
        </li>)}
      </ol>
    </div>
  </section>
}
