import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react'
import {renderToStaticMarkup} from 'react-dom/server'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {ApprovedHome} from './ApprovedHome'
import {TrustStrip,TRUST_FACTS} from './TrustStrip'
import {EstimateProof} from './EstimateProof'
import {PlanTable,FREE_FEATURES,PRO_FEATURES} from './PlanTable'
import {FeatureTour,type TourScreen} from './FeatureTour'
import {StickyCta} from './StickyCta'
import LandingPage from '@/app/page'
import HomeV2Preview from '@/app/preview/home-v2/page'
import {CALC_DEFAULTS,calcRealNet,parseCalcParams} from '@/lib/calculatorMath'
import {ANDROID_PLAY_STORE_URL,IOS_APP_STORE_URL} from '@/config/app'

vi.mock('next/navigation',()=>({notFound:()=>{throw new Error('NOT_FOUND')}}))

const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'})
// Guardrails every Tier 2 string must pass: no canonical creative figures, no
// tax-outcome language, no invented social proof.
const BANNED=/\$235|\$175|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★|testimonial/i
// Whole-page variant: the approved hero alt text says "not a customer testimonial", and
// WEB-TOUR-1 (2026-09-02) approved "$235 gross" inside the feature-tour alt texts.
const BANNED_PAGE=/\$175|what you owe|file your taxes|guaranteed|audit-proof|maximize your refund|\d+\s*(drivers|users|downloads)|★/i
const SECTIONS=/trust-strip|estimate-proof|feature-tour|plan-table|sticky-cta/

type IOCallback=(entries:Partial<IntersectionObserverEntry>[])=>void
let observers:{callback:IOCallback;targets:Element[];disconnect:ReturnType<typeof vi.fn>}[]
let wide=true
beforeEach(()=>{
  observers=[]
  wide=true
  vi.stubGlobal('matchMedia',vi.fn((query:string)=>({matches:query.includes('min-width')?wide:false,media:query,addEventListener:vi.fn(),removeEventListener:vi.fn()})))
  vi.stubGlobal('IntersectionObserver',class{
    callback:IOCallback;targets:Element[]=[];disconnect=vi.fn()
    constructor(callback:IOCallback){this.callback=callback;observers.push(this)}
    observe(el:Element){this.targets.push(el)}
    unobserve(){}
  })
})
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.unstubAllEnvs()})

const SCREENS:TourScreen[]=[
  {id:'a',tag:'FREE',title:'Stop one',body:'Body one.'},
  {id:'b',tag:'FREE',title:'Stop two',body:'Body two.'},
  {id:'c',tag:'PRO',title:'Stop three',body:'Body three.',image:'product-earnings-complete.webp',alt:'Example entry'},
]

describe('home v2 (local preview only)',()=>{
  it('ships the approved Tier 2 sections on the live home page with real captures only',()=>{
    const html=renderToStaticMarkup(<LandingPage/>)
    for(const cls of ['trust-strip','estimate-proof','feature-tour','plan-table','sticky-cta'])expect(html).toContain(cls)
    expect(html).toContain('NET PROFIT TRACKER FOR GIG DRIVERS')
    expect(html).not.toMatch(/pending approval|\[VERIFY\]|tour-placeholder/)
    expect(html).not.toMatch(BANNED_PAGE)
    expect(renderToStaticMarkup(<ApprovedHome heroMode="scroll"/>)).not.toMatch(SECTIONS)
    const tour=[...html.matchAll(/src="\/editorial\/(tour-[a-z]+)\.webp"/g)].map(m=>m[1])
    expect(new Set(tour)).toEqual(new Set(['tour-home','tour-shifts','tour-tax','tour-insights']))
    const hashes=new Set<string>()
    for(const name of ['tour-home','tour-shifts','tour-tax','tour-insights']){
      for(const variant of [name,name+'-390']){
        const buffer=readFileSync(`public/editorial/${variant}.webp`)
        expect(buffer.length).toBeLessThan(60000)
        expect(buffer.subarray(0,4).toString()).toBe('RIFF');expect(buffer.subarray(8,12).toString()).toBe('WEBP')
        hashes.add(createHash('md5').update(buffer).digest('hex'))
      }
    }
    expect(hashes.size).toBe(8)
    expect(html).toMatch(/alt="Example GigMiles home screen: Net Income \$192/)
    expect(html).toContain('type="range"')
    expect(html).toContain('tour-figure')
  })
  it('renders the v2 sections only behind the local review flag and never in production',()=>{
    vi.stubEnv('LOCAL_DESIGN_REVIEW','');expect(()=>HomeV2Preview()).toThrow('NOT_FOUND')
    vi.stubEnv('LOCAL_DESIGN_REVIEW','1')
    const html=renderToStaticMarkup(HomeV2Preview())
    for(const cls of ['trust-strip','estimate-proof','feature-tour','plan-table','sticky-cta'])expect(html).toContain(cls)
    expect(html).not.toMatch(BANNED_PAGE)
    expect(html).toContain('FOR GIG DRIVERS')
    vi.stubEnv('NODE_ENV','production');expect(()=>HomeV2Preview()).toThrow('NOT_FOUND')
    const route=readFileSync('src/app/preview/home-v2/page.tsx','utf8')
    expect(route).toContain('index:false,follow:false')
  })
  it('trust strip states verifiable facts and routes store links through config',()=>{
    render(<TrustStrip/>)
    for(const fact of TRUST_FACTS)expect(screen.getByText(fact)).toBeInTheDocument()
    expect(screen.getByRole('link',{name:'Download on the App Store'})).toHaveAttribute('href',IOS_APP_STORE_URL)
    expect(screen.getByRole('link',{name:'Get it on Google Play'})).toHaveAttribute('href',ANDROID_PLAY_STORE_URL)
    const source=readFileSync('src/components/editorial/TrustStrip.tsx','utf8')
    expect(source).not.toMatch(/apps\.apple\.com|play\.google\.com/)
    expect(renderToStaticMarkup(<TrustStrip/>)).not.toMatch(BANNED)
  })
  it('estimate proof shows exactly the calculator engine result and links to it',()=>{
    const {container}=render(<EstimateProof/>)
    const r=calcRealNet(CALC_DEFAULTS)
    expect(container.querySelector('#estimate-net')?.textContent).toBe(money.format(r.net))
    expect(container.querySelector('#estimate-vehicle-cost')?.textContent).toBe('−'+money.format(r.vehicleCost))
    expect(container.querySelector('#estimate-deduction')?.textContent).toBe(money.format(r.mileageDeduction))
    expect(container.querySelector('#estimate-se-tax')?.textContent).toBe('−'+money.format(r.seTax))
    expect(container.querySelector('#estimate-hourly')?.textContent).toBe(money.format(r.hourly))
    const href=screen.getByRole('link',{name:/Try your own figures/}).getAttribute('href')!
    expect(href.startsWith('/calculator?')).toBe(true)
    expect(parseCalcParams(new URLSearchParams(href.split('?')[1]))).toEqual(CALC_DEFAULTS)
    expect(container.textContent).toContain('not tax advice')
    expect(container.querySelector('input[type="range"]')).toBeNull()
    expect(renderToStaticMarkup(<EstimateProof/>)).not.toMatch(BANNED)
  })
  it('estimate proof recomputes live when the optional controls are enabled',()=>{
    const {container}=render(<EstimateProof interactive/>)
    const miles=screen.getByLabelText(/^Miles/) as HTMLInputElement
    fireEvent.change(miles,{target:{value:'60'}})
    const r=calcRealNet({...CALC_DEFAULTS,miles:60})
    expect(container.querySelector('#estimate-deduction')?.textContent).toBe(money.format(r.mileageDeduction))
    expect(screen.getByRole('link',{name:/Try your own figures/}).getAttribute('href')).toContain('mi=60')
    fireEvent.click(screen.getByLabelText('E-bike'))
    const e=calcRealNet(parseCalcParams(new URLSearchParams('v=ebike')))
    expect(container.querySelector('#estimate-deduction')?.textContent).toBe(money.format(e.mileageDeduction))
    expect(container.querySelector('#estimate-vehicle-cost')?.textContent).toBe('−'+money.format(e.vehicleCost))
  })
  it('plan table keeps Pro features out of the free column and names the trial as Pro\'s',()=>{
    const {container}=render(<PlanTable/>)
    const free=container.querySelector('.plan-column:not(.plan-pro)')!.textContent!
    const pro=container.querySelector('.plan-pro')!.textContent!
    for(const f of FREE_FEATURES)expect(free).toContain(f)
    for(const f of PRO_FEATURES){expect(pro).toContain(f);expect(free).not.toContain(f)}
    expect(free).not.toMatch(/GPS|export|AI/i)
    expect(pro).toMatch(/Pro has a 10-day free trial/)
    expect(container.textContent).toContain('$9.99/mo or $99.99/yr')
    expect(renderToStaticMarkup(<PlanTable/>)).not.toMatch(BANNED)
  })
  it('feature tour follows the observed step on wide viewports and stacks otherwise',()=>{
    const view=render(<FeatureTour screens={SCREENS} heading="Tour"/>)
    expect(observers).toHaveLength(1)
    expect(observers[0].targets).toHaveLength(3)
    expect(view.container.querySelectorAll('.tour-step')).toHaveLength(3)
    expect(view.container.querySelector('.tour-step[aria-current="step"]')?.textContent).toContain('Stop one')
    act(()=>observers[0].callback([{isIntersecting:true,target:observers[0].targets[2]} as Partial<IntersectionObserverEntry>]))
    expect(view.container.querySelector('.tour-step[aria-current="step"]')?.textContent).toContain('Stop three')
    const phone=view.container.querySelectorAll('.tour-phone .device-screen > *')
    expect(phone).toHaveLength(3)
    expect(phone[2]).toHaveAttribute('data-active','true');expect(phone[0]).toHaveAttribute('data-active','false')
    expect((phone[2] as HTMLImageElement).getAttribute('srcset')).toContain('product-earnings-complete-390.webp 390w')
    expect(view.container.querySelectorAll('.tour-step .tour-placeholder')).toHaveLength(2)
    view.unmount();expect(observers[0].disconnect).toHaveBeenCalled()
    wide=false;observers=[]
    const narrow=render(<FeatureTour screens={SCREENS} heading="Tour"/>)
    expect(observers).toHaveLength(0)
    expect(narrow.container.querySelectorAll('.tour-step')).toHaveLength(3)
    const html=renderToStaticMarkup(<FeatureTour screens={SCREENS} heading="Tour"/>)
    expect(html).not.toMatch(/<video|autoplay|<canvas/)
    expect(html).toContain('loading="lazy"')
  })
  it('sticky bar appears after the headline leaves and hides over the closing section',()=>{
    const {container}=render(<div><h1 id="headline">Head</h1><section id="download">End</section><StickyCta/></div>)
    const bar=container.querySelector('.sticky-cta')!
    expect(bar).toHaveAttribute('data-visible','false')
    expect(bar.querySelector('[data-cta-placement="sticky-bar"]')).not.toBeNull()
    expect(observers).toHaveLength(2)
    act(()=>observers[0].callback([{isIntersecting:false,boundingClientRect:{top:-40} as DOMRectReadOnly}]))
    expect(bar).toHaveAttribute('data-visible','true')
    act(()=>observers[1].callback([{isIntersecting:true,boundingClientRect:{top:10} as DOMRectReadOnly}]))
    expect(bar).toHaveAttribute('data-visible','false')
    expect(bar.textContent).toContain('Free core · No card · No ads')
  })
})

describe('the reveal flag survives a re-render', () => {
  it('keeps a revealed estimate card visible after the vehicle changes', () => {
    // Regression: the observer used to add a class, and React rewrote
    // className on the same element while the card was calculating, so the
    // card dropped to opacity 0 and the observer had already unhooked it.
    const {container} = render(<EstimateProof interactive/>)
    const card = container.querySelector('.estimate-card') as HTMLElement
    expect(card).toBeTruthy()
    card.setAttribute('data-shown', '')
    const ebike = container.querySelectorAll('.estimate-vehicle input')[1] as HTMLInputElement
    fireEvent.click(ebike)
    expect(card.className).toContain('estimate-card')
    expect(card.hasAttribute('data-shown'), 'the reveal flag was wiped by a re-render').toBe(true)
  })

  it('marks the reveal with an attribute React does not own, never a class', () => {
    const observer = readFileSync('src/components/editorial/RevealObserver.tsx', 'utf8')
    expect(observer).toContain("setAttribute('data-shown'")
    // The <html> flag may stay a class; what must never be a class is the
    // per-element mark, because React owns className on the elements it renders.
    expect(observer).not.toMatch(/entry\.target\.classList/)
    const css = readFileSync('src/components/editorial/home-v2.css', 'utf8')
    expect(css).toContain('[data-reveal][data-shown]')
    expect(css).not.toContain('[data-reveal].is-visible')
  })
})
