import {notFound} from 'next/navigation'
import {preload} from 'react-dom'
// The shell first: its editorial.css must come before cinematic.css in the
// bundle so the page's own rules win ties.
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {CinematicHome} from '@/components/cinematic/CinematicHome'
import {CINEMATIC_ASSETS} from '@/components/cinematic/cinematic-cues'

export const dynamic='force-dynamic'
export const metadata={title:'Local cinematic preview — GigMiles',robots:{index:false,follow:false}}

// Local-only prototype of the scroll-scrubbed film home. Never reachable in
// production; the live home is untouched until the operator approves it.
export default function CinematicPreview() {
  if(process.env.LOCAL_DESIGN_REVIEW!=='1' || process.env.NODE_ENV==='production') notFound()
  preload(CINEMATIC_ASSETS.poster, {as: 'image', fetchPriority: 'high'})
  return <WebsiteShell><CinematicHome/></WebsiteShell>
}
