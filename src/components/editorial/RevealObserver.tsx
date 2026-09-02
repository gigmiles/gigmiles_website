'use client'

import {useEffect} from 'react'

// Adds `is-visible` to every [data-reveal] element the first time it enters
// the viewport. The CSS only hides elements once `reveal-ready` is on <html>,
// so a page without JavaScript (or before hydration) shows everything.
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const root = document.documentElement
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    if (targets.length === 0) return
    root.classList.add('reveal-ready')
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target) }
      }
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12})
    targets.forEach((el) => io.observe(el))
    return () => { io.disconnect(); root.classList.remove('reveal-ready') }
  }, [])
  return null
}
