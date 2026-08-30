'use client'

import {useState} from 'react'
import {DownloadButton} from '@/components/ui/DownloadButton'
import './product-showcase.css'

const SCREENS = [
  {
    id: 'earnings', label: 'Log earnings', title: 'The work. On record.',
    description: 'Earnings, time and miles. Bring the details of your shift together.',
    alt: 'GigMiles Add Earnings screen with empty earnings and mileage fields, plus vehicle and state context.',
  },
  {
    id: 'expenses', label: 'Log expenses', title: 'The little costs count.',
    description: 'Choose a category and record an expense. Keep the details with the work.',
    alt: 'GigMiles Add Expense screen with expense categories and an empty amount field.',
  },
] as const

// One visible screen, manual controls only. These are captures of the actual
// Flutter screens, not a recreated app UI or a working web entry form.
export function ProductShowcase() {
  const [selected, setSelected] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)
  const current = SCREENS[selected]

  return <section className="records product-showcase" id="in-the-app" aria-labelledby="product-title">
    <div className="wrap product-layout">
      <div className="product-intro">
        <p className="eyebrow">YOUR WORK, IN ONE PLACE</p>
        <h2 id="product-title">Less scattered.<br/><span>More in view.</span></h2>
        <p className="product-lead">Your miles. Your earnings. Your expenses.<br/>Not another spreadsheet.</p>
      </div>

      <div className="product-controls">
        <div className="product-switch" role="group" aria-label="Choose an app screen">
          {SCREENS.map((item, index) => <button key={item.id} type="button"
            aria-pressed={selected === index} aria-controls="product-screen"
            onClick={() => setSelected(index)}>{item.label}</button>)}
        </div>
        <div className="product-caption" aria-live="polite" aria-atomic="true">
          <h3>{current.title}</h3>
          <p>{current.description}</p>
        </div>
      </div>

      <figure className="product-visual" id="product-screen" aria-label={current.label}>
        <div className="product-device">
          {failed === current.id
            ? <p className="product-image-error" role="status">This app preview couldn’t load. Choose another screen or try again later.</p>
            : <img key={current.id} className="product-screen-image"
                src={`/editorial/product-${current.id}.webp`} alt={current.alt}
                width={780} height={1560} loading="lazy" decoding="async"
                onError={() => setFailed(current.id)}/>}
        </div>
      </figure>

      <div className="product-next">
        <DownloadButton className="button conversion-cta on-paper" data-cta-placement="records">
          Get GigMiles — free <span aria-hidden="true">↗</span>
        </DownloadButton>
        <p>Manual tracking is part of the free core.</p>
      </div>
    </div>
  </section>
}
