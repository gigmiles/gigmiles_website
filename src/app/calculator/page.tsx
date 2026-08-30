import type {Metadata} from 'next'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {ApprovedCalculator} from '@/components/editorial/ApprovedCalculator'

const TITLE='Gig Driver Net Income Calculator | GigMiles'
const DESC='Enter earnings, miles and hours for a simplified estimate after modeled vehicle costs and self-employment tax. Car and e-bike models. Not your full tax picture.'
// Preserve per-result social cards and the shared engine's query protocol.
export async function generateMetadata({searchParams}:{searchParams:Promise<{[key:string]:string|string[]|undefined}>}):Promise<Metadata>{
 const sp=await searchParams,q=new URLSearchParams()
 for(const key of ['g','mi','h','v','r']){const value=sp[key];if(typeof value==='string'&&value.length>0&&value.length<16)q.set(key,value)}
 const query=q.toString(),image='https://gigmiles.app/api/og/result'+(query?'?'+query:'')
 return {title:TITLE,description:DESC,alternates:{canonical:'https://gigmiles.app/calculator'},openGraph:{type:'website',url:'https://gigmiles.app/calculator',title:TITLE,description:DESC,siteName:'GigMiles',images:[{url:image,width:1200,height:630,alt:TITLE}]},twitter:{card:'summary_large_image',title:TITLE,description:DESC,images:[image]}}
}
export default function CalculatorPage(){return <WebsiteShell><ApprovedCalculator/><section className="wrap scope-note"><a className="text-link" href="/ebike">Deliver on an e-bike? Explore the electricity and wear breakdown →</a></section></WebsiteShell>}
