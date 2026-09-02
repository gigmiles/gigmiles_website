import {describe,expect,it} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {StructuredData,homeStructuredData} from './StructuredData'
import LandingPage from '@/app/page'
import {ANDROID_PLAY_STORE_URL,IOS_APP_STORE_URL} from '@/config/app'

describe('home structured data',()=>{
  it('describes the app with config store links and PRODUCT_FACTS prices only',()=>{
    const data=homeStructuredData() as {'@graph':Array<Record<string,unknown>>}
    const types=data['@graph'].map(n=>n['@type'])
    expect(types).toEqual(['Organization','WebSite','SoftwareApplication'])
    const app=data['@graph'][2] as {installUrl:string[];offers:Array<{price:string}>;isAccessibleForFree:boolean;description:string}
    expect(app.installUrl).toEqual([IOS_APP_STORE_URL,ANDROID_PLAY_STORE_URL])
    expect(app.offers.map(o=>o.price)).toEqual(['0','9.99','99.99'])
    expect(app.isAccessibleForFree).toBe(true)
    expect(app.description).toContain('not tax advice')
    const text=JSON.stringify(data)
    expect(text).not.toMatch(/aggregateRating|ratingValue|reviewCount|downloadCount|\$235|\$175|owe|guaranteed|file your/i)
  })
  it('renders one JSON-LD script on the live home page that parses back to the same graph',()=>{
    const html=renderToStaticMarkup(<LandingPage/>)
    const scripts=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)||[]
    expect(scripts).toHaveLength(1)
    const inner=scripts[0]!.replace(/^<script[^>]*>|<\/script>$/g,'')
    expect(JSON.parse(inner)).toEqual(homeStructuredData())
    expect(renderToStaticMarkup(<StructuredData/>)).not.toContain('<script type="application/ld+json"></script>')
  })
})
