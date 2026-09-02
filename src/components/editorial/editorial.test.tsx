import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {renderToStaticMarkup} from 'react-dom/server'
import {ApprovedHome} from './ApprovedHome'
import {ApprovedCalculator} from './ApprovedCalculator'
import {ApprovedDownload} from './ApprovedDownload'
import {WebsiteShell} from './WebsiteShell'
import {Journal} from './Journal'
import {BLOG_POSTS} from '@/lib/blog'
import {advance,DURATION} from './story-controller'
import {editorialMarkdown} from '@/lib/editorialMarkdown'
import {calcRealNet,parseCalcParams} from '@/lib/calculatorMath'
import {readFileSync} from 'node:fs'

let visible=()=>{},reduced=false,mobile=false
beforeEach(()=>{
 reduced=false;mobile=false
 history.replaceState(null,'','/')
 vi.stubGlobal('matchMedia',vi.fn((query:string)=>({matches:query.includes('reduced-motion')?reduced:mobile,media:query,addEventListener:vi.fn(),removeEventListener:vi.fn()})))
 vi.stubGlobal('IntersectionObserver',class{constructor(callback:(entries:{isIntersecting:boolean}[])=>void){visible=()=>callback([{isIntersecting:true}])}observe(){}disconnect(){}})
 vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn())
})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})

describe('approved website transplant',()=>{
 it('preserves the operator headline, neutral eyebrow, brand and honest CTAs',()=>{
  const html=renderToStaticMarkup(<WebsiteShell><ApprovedHome/></WebsiteShell>)
  expect(html).toContain('FOR GIG DRIVERS')
  expect(html).not.toMatch(/FOR US GIG|IN THE UNITED STATES|LOCAL SITE|LOCAL REVIEW|127\.0\.0\.1|\$235|\$175/)
  expect((html.match(/class="brand-trademark"/g)||[])).toHaveLength(2)
  expect([...html.matchAll(/data-cta-placement="([^"]+)"/g)].map(m=>m[1]).sort()).toEqual(['closing','free-core','hero','nav','records'])
  expect(html).toContain('Optional Pro upgrades.')
  expect(html).toContain('Estimates for planning. Not tax advice.')
  const {container}=render(<ApprovedHome/>)
  expect(container.querySelector('h1')?.textContent).toBe('Your gig.Your details.Your estimate.')
 })
 it('renders live, centralized store links instead of disabled placeholders',()=>{
  render(<ApprovedDownload/>)
  expect(screen.getByRole('link',{name:'Download on the App Store'})).toHaveAttribute('href','https://apps.apple.com/app/id6777805244')
  expect(screen.getByRole('link',{name:'Get it on Google Play'})).toHaveAttribute('href','https://play.google.com/store/apps/details?id=com.gigmiles.gigmiles_app')
  expect(document.querySelector('button:disabled')).toBeNull()
 })
 it('selects real scene nodes and stops autoplay when a chapter is selected',()=>{
  const {container}=render(<ApprovedHome/>);visible()
  expect(screen.getByRole('button',{name:'Pause story'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Your state'}))
  expect(container.querySelector('#scene-1')).not.toHaveAttribute('hidden')
  expect(container.querySelector('#scene-0')).toHaveAttribute('hidden')
  expect(screen.getByRole('button',{name:'Play story'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Your day job'}))
  expect(container.querySelector('#scene-2')).not.toHaveAttribute('hidden')
 })
 it.each(['reduced','mobile'])('does not autoplay for %s visitors',mode=>{
  reduced=mode==='reduced';mobile=mode==='mobile';render(<ApprovedHome/>);visible()
  expect(requestAnimationFrame).not.toHaveBeenCalled()
  expect(screen.getByRole('button',{name:'Play story'})).toBeInTheDocument()
 })
 it('cleans up animation and preserves the 16-second story sequence',()=>{
  const view=render(<ApprovedHome/>);visible();view.unmount()
  expect(cancelAnimationFrame).toHaveBeenCalled()
  expect([0,4000,8000,13000].map(t=>advance(t,0).scene)).toEqual([0,1,2,3])
  expect(advance(15000,5000)).toEqual({elapsed:DURATION,scene:3,done:true})
 })
 it('starts calculator blank, calculates, invalidates stale values and resets',()=>{
  history.replaceState(null,'','/calculator');const {container}=render(<ApprovedCalculator/>)
  expect(container.querySelector('#net')?.textContent).toBe('—')
  for(const [id,value] of [['gross','180'],['miles','60'],['hours','4']])fireEvent.input(container.querySelector('#'+id)!,{target:{value}})
  fireEvent.submit(container.querySelector('form')!)
  expect(container.querySelector('#net')?.textContent).toBe('$141.21')
  fireEvent.input(container.querySelector('#gross')!,{target:{value:''}})
  expect(container.querySelector('#net')?.textContent).toBe('—')
  expect(container.querySelector('#share')).toBeDisabled()
  fireEvent.click(screen.getByRole('button',{name:'Reset'}))
  expect(container.querySelector('#gross')).toHaveValue(null)
 })
 it('ignores campaign-only query values and restores exact shared results',()=>{
  history.replaceState(null,'','/calculator?utm_source=reddit');let view=render(<ApprovedCalculator/>)
  expect(view.container.querySelector('#net')?.textContent).toBe('—');view.unmount()
  const query='g=150&mi=40&h=8&v=ebike&r=0.057'
  history.replaceState(null,'','/calculator?'+query);view=render(<ApprovedCalculator/>)
  const state=parseCalcParams(new URLSearchParams(query))
  expect(view.container.querySelector('#net')?.textContent).toBe(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(calcRealNet(state).net))
  fireEvent.click(screen.getByRole('button',{name:/Show result link/}))
  expect(view.container.querySelector('#share-link')).toHaveValue(location.origin+'/calculator?'+query)
 })
 it('shows no hourly estimate at zero hours and can load the e-bike example',()=>{
  const {container}=render(<ApprovedCalculator/>);fireEvent.click(screen.getByRole('radio',{name:'E-bike'}));fireEvent.click(screen.getByRole('button',{name:'Load example'}))
  expect(container.querySelector('#miles')).toHaveValue(40)
  fireEvent.input(container.querySelector('#hours')!,{target:{value:'0'}})
  expect(container.querySelector('#hourly')?.textContent).toBe('—')
 })
 it('filters live blog metadata with both tags and search',()=>{
  render(<Journal posts={BLOG_POSTS}/>);expect(screen.getByRole('status')).toHaveTextContent('5 guides')
  fireEvent.click(screen.getByRole('button',{name:'E-Bike'}));expect(screen.getByRole('status')).toHaveTextContent('1 guides')
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'not-a-real-topic'}})
  expect(screen.getByText(/No matching guides/)).toBeInTheDocument()
 })
 it('escapes raw markdown HTML, rejects executable links and generates stable contents',async()=>{
  const result=await editorialMarkdown('## A driver\'s question\n\n<script>alert(1)</script>\n\n[bad](javascript:alert) [good](/calculator)')
  expect(result.html).not.toMatch(/<script>|href="javascript:/)
  expect(result.toc).toEqual([{id:'section-1',text:"A driver's question"}])
  expect(result.html).toContain('href="/calculator"')
 })
 it('ships optimized local media and no preview-only styles or scripts',()=>{
  for(const name of ['driver','state','day-job','w2'])expect(readFileSync('public/editorial/'+name+'.webp').length).toBeLessThan(150000)
  const home=renderToStaticMarkup(<ApprovedHome/>)
  expect(home).not.toMatch(/src="\/assets\/|<script|onerror=/)
  expect(home).toContain('/editorial/day-job.webp')
 })
})
