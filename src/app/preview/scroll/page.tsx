import {notFound} from 'next/navigation'
import {ApprovedHome} from '@/components/editorial/ApprovedHome'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'

export const dynamic='force-dynamic'
export const metadata={title:'Local scroll comparison — GigMiles',robots:{index:false,follow:false}}

export default function ScrollComparison() {
  if(process.env.LOCAL_DESIGN_REVIEW!=='1' || process.env.NODE_ENV==='production') notFound()
  return <WebsiteShell><ApprovedHome heroMode="scroll"/></WebsiteShell>
}
