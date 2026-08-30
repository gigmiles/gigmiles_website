'use client'
import {useState} from 'react'
import type {BlogPost} from '@/lib/blog'
import {ArticleCard} from './ArticleCard'

export function Journal({posts}:{posts:BlogPost[]}){
 const [active,setActive]=useState('All'),[search,setSearch]=useState('')
 const tags=['All',...new Set(posts.map(p=>p.tag))]
 const filtered=posts.filter(p=>(active==='All'||p.tag===active)&&(p.title+' '+p.description).toLowerCase().includes(search.trim().toLowerCase()))
 return <section className="wrap journal">
  <div className="journal-controls"><div className="filters" role="group" aria-label="Article categories">{tags.map(tag=><button key={tag} type="button" aria-pressed={active===tag} onClick={()=>setActive(tag)}>{tag}</button>)}</div>
  <label className="search-label" htmlFor="search">Find a guide<input type="search" id="search" placeholder="Search articles" value={search} onChange={e=>setSearch(e.target.value)} /></label></div>
  <p id="filter-status" role="status">{filtered.length} guides</p>
  <div className="article-grid">{filtered.map((post,i)=><ArticleCard key={post.slug} post={post} featured={i===0}/>)}</div>
  {filtered.length===0&&<p>No matching guides. Try another topic or clear your search.</p>}
 </section>
}
