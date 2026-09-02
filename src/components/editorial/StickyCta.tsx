'use client'

import {ArrowUpRight} from './Glyph'
import {useEffect, useState} from 'react'
import {DownloadButton} from '@/components/ui/DownloadButton'

// Mobile-only bar (CSS hides it from 721px up). Visible once the hero headline
// has scrolled out of view and hidden again while the closing download section
// is on screen, so the page never shows two primary CTAs at once.
export function StickyCta({heroSelector = '#headline', endSelector = '#download'}: {heroSelector?: string; endSelector?: string}) {
  const [heroGone, setHeroGone] = useState(false)
  const [endVisible, setEndVisible] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const hero = document.querySelector(heroSelector)
    const end = document.querySelector(endSelector)
    const observers: IntersectionObserver[] = []
    if (hero) {
      const o = new IntersectionObserver(([entry]) => setHeroGone(!entry.isIntersecting && entry.boundingClientRect.top < 0))
      o.observe(hero); observers.push(o)
    }
    if (end) {
      const o = new IntersectionObserver(([entry]) => setEndVisible(entry.isIntersecting))
      o.observe(end); observers.push(o)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [heroSelector, endSelector])

  const visible = heroGone && !endVisible
  return <div className="sticky-cta" data-visible={visible ? 'true' : 'false'} role="region" aria-label="Get the app" aria-hidden={!visible}>
    <p>Free core · No card · No ads</p>
    <DownloadButton className="button conversion-cta" data-cta-placement="sticky-bar">
      Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
    </DownloadButton>
  </div>
}
