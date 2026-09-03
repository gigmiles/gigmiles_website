import {preload} from 'react-dom'
import {CinematicHome} from '@/components/cinematic/CinematicHome'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {StructuredData} from '@/components/editorial/StructuredData'
import {CINEMATIC_ASSETS} from '@/components/cinematic/cinematic-cues'

export default function LandingPage() {
  // The film's poster is the LCP element and the only image above the fold;
  // announce it before the CSS and client bundles finish so the browser
  // fetches it immediately. The film itself is never requested until the
  // controller has checked the viewport, the connection and the visitor's
  // motion preference.
  preload(CINEMATIC_ASSETS.poster, {as: 'image', fetchPriority: 'high'})
  return <><StructuredData /><WebsiteShell><CinematicHome /></WebsiteShell></>
}
