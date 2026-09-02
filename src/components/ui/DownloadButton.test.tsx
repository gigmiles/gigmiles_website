import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {DownloadButton} from './DownloadButton'

// The beacon must say which CTA fired so conversions can be attributed to a
// position on the page. Navigation itself is not under test (jsdom cannot
// navigate); only the payload is.
const DESKTOP_UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
const IPHONE_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
let beacon:ReturnType<typeof vi.fn>
function stub(userAgent:string){
  beacon=vi.fn(()=>true)
  vi.stubGlobal('navigator',{userAgent,sendBeacon:beacon})
}
function payload(){
  expect(beacon).toHaveBeenCalledOnce()
  const [url,body]=beacon.mock.calls[0] as [string,string]
  expect(url).toBe('/api/track')
  return JSON.parse(body)
}
beforeEach(()=>{sessionStorage.clear();sessionStorage.setItem('gm_cid','cid-test')})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})

describe('DownloadButton beacon placement',()=>{
  it('desktop: download_click carries the placement, page and cid',()=>{
    stub(DESKTOP_UA)
    render(<DownloadButton data-cta-placement="hero">Get GigMiles</DownloadButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(payload()).toMatchObject({event:'download_click',platform:'desktop',placement:'hero',page:'/',cid:'cid-test'})
  })
  it('iPhone: store_click names the store and the placement',()=>{
    stub(IPHONE_UA)
    render(<DownloadButton data-cta-placement="sticky-bar">Get GigMiles</DownloadButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(payload()).toMatchObject({event:'store_click',store:'ios',placement:'sticky-bar'})
  })
  it('omits placement when the button has none and clamps long values',()=>{
    stub(DESKTOP_UA)
    const view=render(<DownloadButton>Get GigMiles</DownloadButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(payload()).not.toHaveProperty('placement')
    view.unmount();beacon.mockClear()
    render(<DownloadButton data-cta-placement={'x'.repeat(60)}>Get GigMiles</DownloadButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(payload().placement).toHaveLength(40)
  })
})
