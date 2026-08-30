import {describe,expect,it} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {JSDOM} from 'jsdom'
import {ApprovedHome} from './ApprovedHome'
import {readFileSync} from 'node:fs'

describe('clearer home-to-calculator flow',()=>{
  it('puts a direct explanatory calculator entry before product proof and FAQs',()=>{
    const html=renderToStaticMarkup(<ApprovedHome/>),dom=new JSDOM(html).window.document
    const entry=dom.querySelector('.calculator-entry')!
    expect(entry.closest('#details')).not.toBeNull()
    expect(entry.closest('details')).toBeNull()
    expect(entry.querySelector('a')?.getAttribute('href')).toBe('/calculator')
    expect(entry.textContent).toContain('earnings, miles and hours')
    expect(entry.textContent).toContain('No sign-up or download.')
    expect(entry.textContent).toContain('W-2 context aren’t included')
    expect(entry.querySelector('form')).toBeNull()
    expect(html.indexOf('calculator-entry-title')).toBeLessThan(html.indexOf('id="in-the-app"'))
    expect(html.indexOf('calculator-entry-title')).toBeLessThan(html.indexOf('id="questions"'))
  })
  it('removes the duplicate calculator FAQ and resource block but keeps journal discovery',()=>{
    const dom=new JSDOM(renderToStaticMarkup(<ApprovedHome/>)).window.document
    expect(dom.querySelectorAll('#questions details')).toHaveLength(4)
    expect(dom.querySelector('.home-resources')).toBeNull()
    expect(dom.querySelector('.home-journal a')?.getAttribute('href')).toBe('/blog')
    expect(dom.querySelector('h1')?.textContent).toBe('Your gig.Your details.Your estimate.')
  })
  it('scopes density changes to home and keeps mobile single-column',()=>{
    const css=readFileSync('src/components/editorial/home-flow.css','utf8')
    expect(css).toContain('.home-details.details')
    expect(css).toContain('padding-top: 58px')
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(css).toContain('@media(max-width: 720px)')
    expect(css).toContain('grid-template-columns: minmax(0, 1fr)')
  })
})
