import {notFound} from 'next/navigation'
import {preload} from 'react-dom'
// The shell first: its editorial.css must come before cinematic.css in the
// bundle so the page's own rules win ties.
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {CinematicHome} from '@/components/cinematic/CinematicHome'
import {isP1Variant, postersFor} from '@/components/cinematic/plate-cues'

export const dynamic='force-dynamic'
export const metadata={title:'Local plates preview — GigMiles',robots:{index:false,follow:false}}

// Local-only prototype of the film v3 home (painted plates, shader seams).
// Never reachable in production; the live home is untouched until the
// operator approves it.
// ?p1=a|b|c swaps plate 1 for one of the operator's tone-test stills (encoded by plates.mjs --tone-test).
export default async function PlatesPreview({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  if(process.env.LOCAL_DESIGN_REVIEW!=='1' || process.env.NODE_ENV==='production') notFound()
  const raw = (await searchParams).p1
  const variant = isP1Variant(raw) ? raw : undefined
  preload(postersFor(variant).poster, {as: 'image', fetchPriority: 'high'})
  return <WebsiteShell><CinematicHome variant="plates" plateVariant={variant}/></WebsiteShell>
}
