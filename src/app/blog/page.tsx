import type {Metadata} from 'next'
import {BLOG_POSTS} from '@/lib/blog'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {Journal} from '@/components/editorial/Journal'

export const metadata:Metadata={title:'Driver Journal | GigMiles',description:'Driver math, everyday records and the questions worth asking. Practical guides for gig drivers.',alternates:{canonical:'https://gigmiles.app/blog'},openGraph:{title:'Driver Journal | GigMiles',description:'Driver math, everyday records and the questions worth asking.',url:'https://gigmiles.app/blog'},twitter:{card:'summary_large_image',title:'Driver Journal | GigMiles',description:'Driver math, everyday records and the questions worth asking.'}}
export default function BlogIndexPage(){return <WebsiteShell paper><section className="wrap journal-heading"><p className="eyebrow">THE GIGMILES JOURNAL</p><h1>A little more clarity.<br/><em>For the road ahead.</em></h1><p>Driver math, everyday records and the questions worth asking.</p></section><Journal posts={BLOG_POSTS}/><section className="journal-bottom wrap"><p>Want to explore your own figures?</p><a className="button" href="/calculator">Open the calculator ↗</a></section></WebsiteShell>}
