import {afterEach, describe, expect, it, vi} from 'vitest'
import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {renderToStaticMarkup} from 'react-dom/server'
import {readFileSync} from 'node:fs'
import {ProductShowcase} from './ProductShowcase'
import {LocalDesignReview} from './LocalDesignReview'
import {StoreRedirect} from './StoreRedirect'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('one-phone product proof', () => {
  it('renders one meaningful screenshot on the server, without changing the hero', () => {
    const html = renderToStaticMarkup(<ProductShowcase/>)
    expect((html.match(/<img /g) || [])).toHaveLength(1)
    expect(html).toContain('product-earnings.webp')
    expect(html).toContain('loading="lazy"')
    expect(html).not.toMatch(/\$235|\$175|<video|<canvas|autoplay|Home dashboard|Shift history/)
    expect(html).toContain('Manual tracking is part of the free core.')
    expect(html).toContain('data-cta-placement="records"')
  })
  it('only changes screen after an explicit selection and keeps exactly one phone', () => {
    vi.useFakeTimers()
    const {container} = render(<ProductShowcase/>)
    vi.advanceTimersByTime(90000)
    expect(screen.getByRole('button', {name:'Log earnings'})).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', {name:'Log expenses'}))
    expect(screen.getByRole('button', {name:'Log expenses'})).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', {name:'Log earnings'})).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('img')).toHaveAttribute('src', '/editorial/product-expenses.webp')
    expect(screen.getByRole('heading', {name:'The little costs count.'})).toBeInTheDocument()
    expect(container.querySelectorAll('.product-device')).toHaveLength(1)
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.click(screen.getByRole('button', {name:'Log earnings'}))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/editorial/product-earnings.webp')
  })
  it('provides native keyboard-focusable controls and live text outside the screenshot', () => {
    const {container} = render(<ProductShowcase/>)
    for(const button of screen.getAllByRole('button', {name:/Log /})) {
      button.focus()
      expect(button).toHaveFocus()
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-controls', 'product-screen')
      expect(button.tabIndex).toBe(0)
    }
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('The work. On record.')
    expect(container.querySelectorAll('input,form')).toHaveLength(0)
  })
  it('recovers from a missing image by allowing the other screen to open', () => {
    render(<ProductShowcase/>)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('status')).toHaveTextContent('couldn’t load')
    fireEvent.click(screen.getByRole('button', {name:'Log expenses'}))
    expect(screen.getByRole('img')).toHaveAttribute('src','/editorial/product-expenses.webp')
  })
  it('ships small real capture assets with reserved 1:2 dimensions', () => {
    for(const name of ['earnings','expenses']) {
      const buffer = readFileSync(`public/editorial/product-${name}.webp`)
      expect(buffer.length).toBeLessThan(60000)
      expect(buffer.subarray(8,12).toString()).toBe('WEBP')
    }
    const css = readFileSync('src/components/editorial/product-showcase.css','utf8')
    expect(css).toContain('aspect-ratio: 1 / 2')
    expect(css).toContain('@media(max-width: 720px)')
    expect(css).not.toMatch(/@keyframes|animation:/)
  })
})

describe('explicit local review safety', () => {
  it('only blocks store-link navigation when local review is enabled', () => {
    const click = vi.fn()
    const view = render(<LocalDesignReview enabled><a href="https://apps.apple.com/app/id6777805244" onClick={click}>Store</a></LocalDesignReview>)
    expect(fireEvent.click(screen.getByRole('link'))).toBe(false)
    expect(click).not.toHaveBeenCalled()
    expect(screen.getByRole('complementary')).toHaveTextContent('Analytics and store redirects are off')
    view.rerender(<LocalDesignReview enabled={false}><a href="https://apps.apple.com/app/id6777805244" onClick={e=>{click();e.preventDefault()}}>Store</a></LocalDesignReview>)
    fireEvent.click(screen.getByRole('link'))
    expect(click).toHaveBeenCalledOnce()
    expect(screen.queryByRole('complementary')).toBeNull()
  })
  it('prevents automatic mobile store handoff and tracking in local review', () => {
    const beacon = vi.fn()
    vi.stubGlobal('navigator', {userAgent:'Mozilla/5.0 (iPhone)', sendBeacon:beacon})
    render(<LocalDesignReview enabled><StoreRedirect iosUrl="https://apps.apple.com/app/id6777805244" androidUrl="https://play.google.com/store/apps/details?id=com.gigmiles.gigmiles_app"/></LocalDesignReview>)
    expect(beacon).not.toHaveBeenCalled()
  })
  it('excludes both analytics mounts for the opt-in local server flag', () => {
    const layout = readFileSync('src/app/layout.tsx','utf8')
    expect(layout).toContain("process.env.LOCAL_DESIGN_REVIEW === '1'")
    expect(layout).toContain('{!localReview && <SiteBeacon />}')
    expect(layout).toContain('{!localReview && <RedditPixel />}')
  })
})
