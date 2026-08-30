'use client'

import {createContext, useContext, type ReactNode, type MouseEvent} from 'react'

const ReviewContext = createContext(false)
export function useLocalDesignReview() { return useContext(ReviewContext) }

// Opt-in server flag for local visual review. Production never sets this flag.
// Keep ordinary internal navigation, but prevent external store navigation.
export function LocalDesignReview({enabled, children}: {enabled: boolean; children: ReactNode}) {
  function keepStoresLocal(event: MouseEvent<HTMLDivElement>) {
    if (!enabled) return
    const anchor = (event.target as Element)?.closest?.('a[href]')
    const href = anchor?.getAttribute('href') || ''
    if (/^https?:\/\/(apps\.apple\.com|play\.google\.com)(\/|$)/i.test(href)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  return <ReviewContext.Provider value={enabled}>
    <div onClickCapture={keepStoresLocal}>
      {children}
      {enabled && <aside aria-label="Local preview notice" style={{position:'fixed',bottom:10,left:10,zIndex:10000,background:'#11392d',color:'#e8f0df',padding:'8px 12px',border:'1px solid #708572',borderRadius:8,fontSize:11,maxWidth:'calc(100vw - 20px)'}}>
        Local preview · Analytics and store redirects are off
      </aside>}
    </div>
  </ReviewContext.Provider>
}
