import {preload} from 'react-dom'
import {ApprovedHome} from '@/components/editorial/ApprovedHome'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'

export default function LandingPage() {
  // The first hero scene photo is the LCP element; announce it before the CSS
  // and client bundles finish so the browser fetches it immediately.
  preload('/editorial/driver.webp', {as: 'image', fetchPriority: 'high'})
  return <WebsiteShell><ApprovedHome heroMode="scroll" /></WebsiteShell>
}
