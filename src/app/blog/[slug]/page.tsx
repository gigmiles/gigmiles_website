import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {BLOG_POSTS,getPost,getPostMarkdown} from '@/lib/blog'
import {editorialMarkdown} from '@/lib/editorialMarkdown'
import {ArticlePage} from '@/components/editorial/ArticlePage'

export function generateStaticParams(){return BLOG_POSTS.map(post=>({slug:post.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const post=getPost((await params).slug);if(!post)return {}
 const url='https://gigmiles.app/blog/'+post.slug,image=url+'/opengraph-image'
 return {title:post.title+' | GigMiles Blog',description:post.description,alternates:{canonical:url},openGraph:{title:post.title,description:post.description,type:'article',publishedTime:post.date,url,images:[image]},twitter:{card:'summary_large_image',title:post.title,description:post.description,images:[image]}}
}
export default async function BlogPostPage({params}:{params:Promise<{slug:string}>}){
 const post=getPost((await params).slug);if(!post)notFound()
 const {html,toc}=await editorialMarkdown(getPostMarkdown(post.slug))
 return <ArticlePage post={post} html={html} toc={toc} related={BLOG_POSTS.filter(p=>p.slug!==post.slug).slice(0,2)}/>
}
