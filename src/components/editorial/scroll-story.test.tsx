import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {renderToStaticMarkup} from 'react-dom/server'
import {readFileSync} from 'node:fs'
import {ApprovedHome} from './ApprovedHome'
import {sceneAtProgress} from './scroll-story-controller'
import ScrollComparison from '@/app/preview/scroll/page'
import LandingPage from '@/app/page'

vi.mock('next/navigation',()=>({notFound:()=>{throw new Error('NOT_FOUND')}}))

class Media extends EventTarget { matches=false; constructor(matches:boolean){super();this.matches=matches} }
let room:Media,reduced:Media,frames:Map<number,FrameRequestCallback>,sequence:number
function flush(){const pending=[...frames.entries()];frames.clear();pending.forEach(([,fn])=>fn(16))}
function geometry(container:HTMLElement,progress:number) {
  const hero=container.querySelector<HTMLElement>('.hero-scroll')!
  const story=container.querySelector<HTMLElement>('#story')!
  Object.defineProperty(story,'offsetHeight',{configurable:true,value:600})
  vi.spyOn(hero,'getBoundingClientRect').mockReturnValue({top:-652*progress,height:1300} as DOMRect)
  vi.stubGlobal('scrollY',652*progress)
}
beforeEach(()=>{
  room=new Media(true);reduced=new Media(false);frames=new Map();sequence=0
  vi.stubGlobal('matchMedia',vi.fn((q:string)=>q.includes('reduced-motion')?reduced:room))
  vi.stubGlobal('requestAnimationFrame',vi.fn((fn:FrameRequestCallback)=>{frames.set(++sequence,fn);return sequence}))
  vi.stubGlobal('cancelAnimationFrame',vi.fn((id:number)=>frames.delete(id)))
  vi.stubGlobal('scrollY',0)
})
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.unstubAllEnvs()})

describe('approved bounded scroll story',()=>{
  it('maps finite progress to four readable chapters and clamps endpoints',()=>{
    expect([-.2,0,.249,.25,.499,.5,.799,.8,1,2,NaN].map(sceneAtProgress)).toEqual([0,0,0,1,1,2,2,3,3,3,0])
  })
  it('publishes the scroll story at root while retaining the optional timed component',()=>{
    expect(renderToStaticMarkup(<ApprovedHome/>)).toContain('id="play"')
    const html=renderToStaticMarkup(<LandingPage/>)
    expect(html).not.toContain('id="play"')
    expect(html).toContain('data-scene="3"')
    expect(html).toContain('/editorial/day-job.webp')
    expect(html).toContain('hero-scroll')
    expect(html).toContain('product-earnings-complete.webp')
    expect(html).not.toContain('Local preview ·')
  })
  it('advances and reverses with native scroll without scheduling an idle animation loop',()=>{
    const {container}=render(<ApprovedHome heroMode="scroll"/>)
    for(const p of [0,.3,.6,.9,.3,0]) {
      geometry(container,p);fireEvent.scroll(window);flush()
      expect(container.querySelector(`#scene-${sceneAtProgress(p)}`)).not.toHaveAttribute('hidden')
      expect(frames.size).toBe(0)
    }
    expect(container.querySelector('.hero-scroll')).toHaveAttribute('data-scroll-enabled','true')
  })
  it('honors chapter selection until a meaningful subsequent scroll and cleans up',()=>{
    const view=render(<ApprovedHome heroMode="scroll"/>);geometry(view.container,0);flush()
    fireEvent.click(screen.getByRole('button',{name:'Your day job'}))
    fireEvent.scroll(window);flush()
    expect(view.container.querySelector('#scene-2')).not.toHaveAttribute('hidden')
    geometry(view.container,.3);fireEvent.scroll(window);flush()
    expect(view.container.querySelector('#scene-1')).not.toHaveAttribute('hidden')
    view.unmount();vi.mocked(requestAnimationFrame).mockClear();fireEvent.scroll(window)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(frames.size).toBe(0)
  })
  it.each(['narrow','reduced'])('uses no sticky runway or autoplay for %s viewports',mode=>{
    room.matches=mode!=='narrow';reduced.matches=mode==='reduced'
    const {container}=render(<ApprovedHome heroMode="scroll"/>)
    expect(container.querySelector('.hero-scroll')).toHaveAttribute('data-scroll-enabled','false')
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    const together=screen.getByRole('button',{name:'Together'});together.focus()
    expect(together).toHaveFocus();fireEvent.click(together)
    expect(container.querySelector('#scene-3')).not.toHaveAttribute('hidden')
    expect(together).toHaveAttribute('aria-pressed','true')
  })
  it('removes sticky mode and cancels pending work when reduced motion is enabled',()=>{
    const {container}=render(<ApprovedHome heroMode="scroll"/>)
    expect(frames.size).toBe(1)
    reduced.matches=true;reduced.dispatchEvent(new Event('change'))
    expect(frames.size).toBe(0)
    expect(container.querySelector('.hero-scroll')).toHaveAttribute('data-scroll-enabled','false')
    expect(container.querySelector('#story-status')).toHaveTextContent('No playback to wait for.')
  })
  it('cannot render its comparison route outside explicit local review',()=>{
    vi.stubEnv('LOCAL_DESIGN_REVIEW','');expect(()=>ScrollComparison()).toThrow('NOT_FOUND')
    vi.stubEnv('LOCAL_DESIGN_REVIEW','1');expect(ScrollComparison()).toBeTruthy()
    vi.stubEnv('NODE_ENV','production');expect(()=>ScrollComparison()).toThrow('NOT_FOUND')
    const route=readFileSync('src/app/preview/scroll/page.tsx','utf8')
    expect(route).toContain('index:false,follow:false')
    const controller=readFileSync('src/components/editorial/scroll-story-controller.ts','utf8')
    expect(controller).not.toMatch(/preventDefault|setInterval|setTimeout|scrollTo\(/)
  })
})
