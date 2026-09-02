'use client'

import {useEffect, useMemo, useRef, type CSSProperties} from 'react'
import {DownloadButton} from '@/components/ui/DownloadButton'
import {ArrowUpRight} from '@/components/editorial/Glyph'
import {installCinematic} from './cinematic-controller'
import {createPlateDriver, type FilmDriver} from './plate-engine'
import {PLATE_ASSETS, PLATE_BEATS, PLATE_CUES, PLATE_LIGHTS, PLATE_SCENES, PLATE_TINTS, PLATES_END_AT, SEAMS, platesFor, postersFor, type P1Variant} from './plate-cues'
import {Statement} from './Statement'

// The plate stage (film v3). Same server-rendered contract as the film stage:
// the poster is the image, every statement is in the document in reading
// order, `data-cine-mode="static"` lays them out as a plain page. The
// controller drives the plate engine from scroll when the viewport, the
// connection and the motion preference allow; the engine paints into the one
// canvas below, which exists in the markup and is only sized on the client.

const ANCHORS = ['lead', 'middle', 'middle', 'trail', 'lead'] as const

export function PlatesHero({driver, variant}: {driver?: FilmDriver; variant?: P1Variant}) {
  const plates = useMemo(() => platesFor(variant), [variant])
  const posters = postersFor(variant)
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const film = driver ?? createPlateDriver(canvas, {plates, seams: SEAMS, screenSrc: PLATE_ASSETS.screen})
    return installCinematic(root, null, {
      cues: PLATE_CUES,
      driver: film,
      beats: PLATE_BEATS,
      tints: PLATE_TINTS,
      lights: PLATE_LIGHTS,
      defaults: {endAt: PLATES_END_AT, snap: 0.0004, dwell: 0.3},
    })
  }, [driver, plates])

  return <section id="cine-hero" className="cine-hero" data-cine-mode="static" data-layout="portrait" data-cine-render="plates" data-plate-variant={variant} ref={rootRef} aria-labelledby="headline">
    <div className="cine-stage">
      <div className="wrap cine-frame">
        <div className="cine-copy">
          <div className="cine-scenes">
            {PLATE_SCENES.map((scene, index) => <article key={scene.id} className="cine-scene" data-cue={scene.id} data-anchor={ANCHORS[index] ?? 'middle'}>
              <Statement scene={scene} index={index}/>
              <p className="cine-support">
                <span className="cine-line" style={{'--l': `var(--l${scene.headline.length}, 1)`} as CSSProperties}>
                  <span className="cine-line-inner">{scene.support}</span>
                </span>
              </p>
            </article>)}
          </div>
          <div className="cine-cta">
            <DownloadButton className="button conversion-cta" data-cta-placement="cinematic-stage">
              Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
            </DownloadButton>
            <p className="cine-cta-note">Free core. No card. No ads.</p>
          </div>
        </div>
        <div className="cine-media" aria-hidden="true">
          <picture>
            <source media="(max-width: 980px)" srcSet={posters.posterMobile}/>
            <img className="cine-poster" src={posters.poster} alt="" width={720} height={1280} loading="eager" fetchPriority="high" decoding="async"/>
          </picture>
          <canvas className="cine-canvas" ref={canvasRef} width={9} height={16} aria-hidden="true"/>
          <div className="cine-light" aria-hidden="true"/>
        </div>
      </div>
    </div>
  </section>
}
