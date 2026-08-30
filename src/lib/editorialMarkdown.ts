import {Marked,Renderer} from 'marked'
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))

// Repository markdown only. Raw HTML is escaped and link protocols are restricted.
export async function editorialMarkdown(markdown:string){
 const renderer=new Renderer(),toc:{id:string;text:string}[]=[];let section=0
 renderer.html=({text})=>escape(text)
 renderer.link=function({href,tokens}){
  const label=this.parser.parseInline(tokens);let url:URL
  try{url=new URL(href,'https://gigmiles.app')}catch{return label}
  if(!['https:','http:','mailto:'].includes(url.protocol))return label
  const internal=url.origin==='https://gigmiles.app'
  return `<a href="${escape(internal?url.pathname+url.search+url.hash:url.href)}"${internal?'':' rel="noopener noreferrer"'}>${label}</a>`
 }
 renderer.heading=function({tokens,depth}){
  const text=this.parser.parseInline(tokens),id='section-'+(++section)
  if(depth===2)toc.push({id,text:text.replace(/<[^>]*>/g,'').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')})
  return `<h${depth} id="${id}">${text}</h${depth}>`
 }
 return {html:await new Marked({renderer}).parse(markdown),toc}
}
