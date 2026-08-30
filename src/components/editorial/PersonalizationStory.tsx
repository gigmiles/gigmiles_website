'use client'
import {useEffect, useRef, type ReactNode} from 'react'
import {installStory} from './story-controller'
import {installScrollStory} from './scroll-story-controller'
import './scroll-story.css'

// The approved server-rendered scenes stay visible without JavaScript. This
// isolated enhancement owns only chapter visibility and playback controls.
export function PersonalizationStory({children,mode='timed'}:{children:ReactNode;mode?:'timed'|'scroll'}) {
  const root=useRef<HTMLDivElement>(null)
  useEffect(()=>root.current ? (mode==='scroll' ? installScrollStory(root.current) : installStory(root.current)) : undefined,[mode])
  return <div className="story" id="story" aria-label="How your details shape estimates" ref={root}>{children}</div>
}
