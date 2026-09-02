'use client'

import {useEffect, useRef, useState} from 'react'

// Counts a number up from zero the first time it scrolls into view, then
// glides between values when the number changes (live inputs). Server markup
// and reduced-motion visitors get the final value straight away; the element
// always ends on the exact formatted value.
export function CountUp({value, format, duration = 900, id, className}: {value: number; format: (n: number) => string; duration?: number; id?: string; className?: string}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)
  const shownRef = useRef(value)
  const revealed = useRef(false)

  useEffect(() => { shownRef.current = shown }, [shown])

  useEffect(() => {
    const el = ref.current
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || reduce || typeof IntersectionObserver !== 'function') { setShown(value); return }
    let raf = 0
    const animate = (from: number, to: number, ms: number) => {
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms)
        const eased = 1 - Math.pow(1 - t, 3)
        setShown(t < 1 ? from + (to - from) * eased : to)
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    if (revealed.current) {
      animate(shownRef.current, value, 420)
      return () => cancelAnimationFrame(raf)
    }
    setShown(value)
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      io.disconnect()
      revealed.current = true
      setShown(0)
      animate(0, value, duration)
    }, {threshold: 0.4})
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value, duration])

  return <span ref={ref} id={id} className={className}>{format(shown)}</span>
}
