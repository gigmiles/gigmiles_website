import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {NextRequest} from 'next/server'

// The route builds an explicit row; PostgREST rejects unknown keys with 400
// and the route swallows errors, so every column here must exist in
// campaign_events (see supabase_campaign_events_placement.sql).
let fetchMock:ReturnType<typeof vi.fn>
async function post(body:unknown){
  vi.resetModules()
  const {POST}=await import('./route')
  const req=new NextRequest('http://localhost/api/track',{method:'POST',body:JSON.stringify(body)})
  return POST(req)
}
function sentRow(){
  expect(fetchMock).toHaveBeenCalledOnce()
  const [url,init]=fetchMock.mock.calls[0] as [string,RequestInit]
  expect(url).toBe('https://example.supabase.co/rest/v1/campaign_events')
  return JSON.parse(String(init.body))
}
beforeEach(()=>{
  fetchMock=vi.fn(async()=>new Response(null,{status:201}))
  vi.stubGlobal('fetch',fetchMock)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','anon-test')
})
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()})

describe('/api/track',()=>{
  it('forwards placement with the known columns and clamps it to 40 chars',async()=>{
    const res=await post({event:'download_click',platform:'desktop',page:'/',cid:'c1',placement:'hero'})
    expect(res.status).toBe(204)
    expect(sentRow()).toMatchObject({event:'download_click',platform:'desktop',page:'/',cid:'c1',placement:'hero'})
    fetchMock.mockClear()
    await post({event:'store_click',store:'ios',placement:'p'.repeat(70)})
    expect(sentRow().placement).toHaveLength(40)
  })
  it('sends null placement when absent and ignores unknown events',async()=>{
    await post({event:'pageview',page:'/blog'})
    expect(sentRow()).toMatchObject({event:'pageview',placement:null})
    fetchMock.mockClear()
    const res=await post({event:'made_up',placement:'hero'})
    expect(res.status).toBe(204)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
