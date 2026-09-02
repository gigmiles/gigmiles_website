'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'

export interface TourScreen {
  id: string
  title: string
  body: string
  tag: string
  /** Approved capture under /editorial (780×1560 WebP). Absent until the
   *  operator approves the fixture screens; a placeholder renders instead. */
  image?: string
  alt?: string
}

const TOUR_MEDIA = '(min-width: 981px) and (prefers-reduced-motion: no-preference)'

// Sticky phone + scrolling captions on wide viewports; a plain stacked list
// (image under each caption) on narrow viewports and under reduced motion.
// One IntersectionObserver picks the active step; no scroll math, no rAF loop.
// The phone's images are hidden until their step is active, and a hidden lazy
// image never fetches, so they load eagerly at low priority (4 × ~15 KB).
export function FeatureTour({screens, eyebrow = 'IN THE APP', heading}: {screens: TourScreen[]; eyebrow?: string; heading: ReactNode}) {
  const [active, setActive] = useState(0)
  const stepsRef = useRef<HTMLOListElement>(null)

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

  const placeholder = (screen: TourScreen, extra: string, hidden: boolean) =>
    <div key={screen.id} className={`tour-placeholder ${extra}`.trim()} hidden={hidden} role={extra ? 'img' : undefined} aria-label={extra ? `${screen.title}: screen capture pending approval` : undefined}>
      <span>{screen.title}</span><small>Screen capture pending approval</small>
    </div>

  return <section className="feature-tour" id="tour" aria-labelledby="tour-title">
    <div className="wrap tour-layout">
      <div className="tour-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="tour-title">{heading}</h2>
      </div>
      <figure className="tour-phone" aria-hidden="true">
        <div className="product-device">
          {screens.map((screen, index) => screen.image
            ? <img key={screen.id} className="product-screen-image" src={`/editorial/${screen.image}`}
                srcSet={`/editorial/${screen.image.replace(/\.webp$/, '-390.webp')} 390w, /editorial/${screen.image} 780w`}
                sizes="348px" width={780} height={1560} loading="eager" fetchPriority="low" decoding="async" alt="" hidden={index !== active}/>
            : placeholder(screen, '', index !== active))}
        </div>
      </figure>
      <ol className="tour-steps" ref={stepsRef}>
        {screens.map((screen, index) => <li key={screen.id} className="tour-step" data-index={index} aria-current={index === active ? 'step' : undefined}>
          <span className="tour-tag">{screen.tag}</span>
          <h3>{screen.title}</h3>
          <p>{screen.body}</p>
          {screen.image
            ? <img className="tour-step-image" src={`/editorial/${screen.image}`} alt={screen.alt ?? screen.title} width={780} height={1560} loading="lazy" decoding="async"/>
            : placeholder(screen, 'tour-step-image', false)}
        </li>)}
      </ol>
    </div>
  </section>
}
