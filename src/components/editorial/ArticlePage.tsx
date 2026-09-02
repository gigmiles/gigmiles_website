import {ArrowUpRight} from './Glyph'
import type {BlogPost} from '@/lib/blog'
import {WebsiteShell} from './WebsiteShell'
import {ArticleCard} from './ArticleCard'
import {DownloadButton} from '@/components/ui/DownloadButton'

export function ArticlePage({post,html,toc,related}:{post:BlogPost;html:string;toc:{id:string;text:string}[];related:BlogPost[]}){
 const jsonLd={'@context':'https://schema.org','@type':'Article',headline:post.title,description:post.description,datePublished:post.date,url:`https://gigmiles.app/blog/${post.slug}`,author:{'@type':'Organization',name:'GigMiles',url:'https://gigmiles.app'},publisher:{'@type':'Organization',name:'GigMiles',url:'https://gigmiles.app'}}
 return <WebsiteShell paper>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
  <header className="wrap article-heading"><a className="back-link" href="/blog">← All guides</a><div className="article-meta"><span>{post.tag}</span><time dateTime={post.date}>{post.date}</time><span>{post.readingMinutes} min read</span></div><h1>{post.title}</h1></header>
  <div className="wrap reading-layout"><aside className="contents"><p>IN THIS GUIDE</p><nav aria-label="Article contents">{toc.map(h=><a key={h.id} href={'#'+h.id}>{h.text}</a>)}</nav><a className="text-link" href="/calculator">Try your own figures <span aria-hidden="true" className="glyph"><ArrowUpRight/></span></a></aside>
   <article className="prose"><div dangerouslySetInnerHTML={{__html:html}}/><div className="article-end"><p>Put the next shift in perspective.</p><p>Keep your earnings, miles and expenses together in GigMiles.</p><DownloadButton className="button conversion-cta on-paper" data-cta-placement="article-end">Get GigMiles — free <span aria-hidden="true">↗</span></DownloadButton><p className="small-note">Free core. Optional Pro upgrades.</p><a className="text-link" href="/calculator">Or explore the web calculator →</a><p className="small-note">Estimates for planning, not tax advice. Your actual tax situation may differ.</p></div></article>
  </div>
  <section className="wrap related"><p className="eyebrow">KEEP EXPLORING</p><div className="article-grid">{related.map(p=><ArticleCard key={p.slug} post={p}/>)}</div></section>
 </WebsiteShell>
}
