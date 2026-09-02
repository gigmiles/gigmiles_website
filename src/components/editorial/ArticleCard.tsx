import {ArrowUpRight} from './Glyph'
import type {BlogPost} from '@/lib/blog'

export function ArticleCard({post,featured=false}:{post:BlogPost;featured?:boolean}){
 return <a className={'article-card'+(featured?' featured':'')} href={'/blog/'+post.slug}>
  <div className="article-meta"><span>{post.tag}</span><time dateTime={post.date}>{post.date}</time><span>{post.readingMinutes} min read</span></div>
  <h2>{post.title}</h2><p>{post.description}</p><span className="read-link">Read the guide <b aria-hidden="true" className="glyph"><ArrowUpRight/></b></span>
 </a>
}
