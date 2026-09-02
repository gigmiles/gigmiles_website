'use client'

import {useEffect} from 'react'

// Marks every [data-reveal] element `data-shown` the first time it enters the
// viewport. The CSS only hides elements once `reveal-ready` is on <html>, so a
// page without JavaScript (or before hydration) shows everything.
//
// This is an attribute and not a class on purpose. React owns `className` on
// every element it renders, so a component that recomputes its class on a
// state change (the estimate card does, while it is calculating) would wipe an
// imperatively added class and leave the element stuck at opacity 0 with the
// observer already unhooked. React never touches an attribute it does not
// render, so `data-shown` survives every re-render.
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const root = document.documentElement
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    if (targets.length === 0) return
    root.classList.add('reveal-ready')
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.setAttribute('data-shown', ''); io.unobserve(entry.target) }
      }
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12})
    targets.forEach((el) => io.observe(el))
    return () => { io.disconnect(); root.classList.remove('reveal-ready') }
  }, [])
  return null
}
