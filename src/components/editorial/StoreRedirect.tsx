'use client'
import {useEffect} from 'react'
import {attributedStoreUrl} from '@/lib/storeAttribution'
import {visitorDevice} from '@/lib/visitorDevice'
import {useLocalDesignReview} from './LocalDesignReview'

// Preserve the existing smart-download behavior. Store anchors are rendered
// separately on the server, so desktop and no-JavaScript visitors can use them.
export function StoreRedirect({iosUrl,androidUrl}:{iosUrl:string;androidUrl:string}){
 const localReview=useLocalDesignReview()
 useEffect(()=>{
  if(localReview)return
  const device=visitorDevice()
  if(device==='desktop')return
  const url=device==='ios'?iosUrl:androidUrl
  if(url==='#')return
  try{
   let utm:Record<string,string>={}
   const stored=sessionStorage.getItem('gm_attribution');if(stored)utm=JSON.parse(stored)
   const cid=sessionStorage.getItem('gm_cid')
   const body=JSON.stringify({event:'store_click',ts:Date.now(),store:device,platform:device,page:window.location.pathname,...(cid?{cid}:{}),...utm})
   navigator.sendBeacon?.('/api/track',body)
  }catch{/* Analytics must never block a store handoff. */}
  window.location.href=attributedStoreUrl(device,url)
 },[iosUrl,androidUrl,localReview])
 return null
}
