'use client'
import {useEffect, useRef, type ReactNode} from 'react'
import {installStory} from './story-controller'

// The approved server-rendered scenes stay visible without JavaScript. This
// isolated enhancement owns only chapter visibility and playback controls.
export function PersonalizationStory({children}:{children:ReactNode}) {
  const root=useRef<HTMLDivElement>(null)
  useEffect(()=>root.current ? installStory(root.current) : undefined,[])
  return <div className="story" id="story" aria-label="How your details shape estimates" ref={root}>{children}</div>
}
