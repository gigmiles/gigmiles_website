'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const DESKTOP = '(min-width: 721px)'

// Mobile header menu. On wide viewports the toggle is hidden by CSS and the
// links render inline exactly as before; below 721px the links live in a
// dropdown so the header stays one row (64px) instead of two (102px).
// Closes on link click, Escape, outside click and when the viewport grows.
export function NavMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close()
    }
    const query = window.matchMedia(DESKTOP)
    const onChange = () => { if (query.matches) close() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    query.addEventListener('change', onChange)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
      query.removeEventListener('change', onChange)
    }
  }, [open])

  return (
    <div className="nav-menu" data-menu-open={open ? 'true' : 'false'} ref={ref}>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav
        id="site-nav"
        aria-label="Main navigation"
        onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setOpen(false) }}
      >
        {children}
      </nav>
    </div>
  )
}
