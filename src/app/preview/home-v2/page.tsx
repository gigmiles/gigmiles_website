import {notFound} from 'next/navigation'
import {ApprovedHome} from '@/components/editorial/ApprovedHome'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'

// Tier 2 home preview. Only renders in explicit local design review; 404 in
// production and whenever LOCAL_DESIGN_REVIEW is not set.
export const dynamic='force-dynamic'
export const metadata={title:'Local home v2 preview — GigMiles',robots:{index:false,follow:false}}

export default function HomeV2Preview() {
  if(process.env.LOCAL_DESIGN_REVIEW!=='1' || process.env.NODE_ENV==='production') notFound()
  return <WebsiteShell><ApprovedHome heroMode="scroll" variant="v2"/></WebsiteShell>
}
