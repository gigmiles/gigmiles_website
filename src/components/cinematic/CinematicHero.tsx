'use client'

import {useEffect, useRef, type CSSProperties} from 'react'
import {DownloadButton} from '@/components/ui/DownloadButton'
import {CtaLabel} from '@/components/ui/CtaLabel'
import {installCinematic} from './cinematic-controller'
import {BEAT_LIGHTS, BEAT_TINTS, CINEMATIC_ASSETS, CINEMATIC_BEATS, CINEMATIC_CUES, CINEMATIC_SCENES, PROOF} from './cinematic-cues'
import {Statement} from './Statement'

// Server-rendered film stage. The markup is complete without JavaScript: the
// poster is the image, every scene's words are in the document in reading
// order, and `data-cine-mode="static"` lays them out as a plain page. The
// controller (installCinematic) upgrades the stage to a scroll-scrubbed film
// when the viewport, the connection and the visitor's motion preference allow.
// It only writes data attributes and CSS custom properties; nothing here is
// generated on the client.

const ANCHORS = ['lead', 'middle', 'middle', 'trail', 'lead'] as const

export function CinematicHero({layout = 'portrait'}: {layout?: 'portrait' | 'landscape'}) {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return
    return installCinematic(root, video, {cues: CINEMATIC_CUES, src: {desktop: CINEMATIC_ASSETS.desktop, mobile: CINEMATIC_ASSETS.mobile}, beats: CINEMATIC_BEATS, tints: BEAT_TINTS, lights: BEAT_LIGHTS, proof: PROOF})
  }, [])

  return <section id="cine-hero" className="cine-hero" data-cine-mode="static" data-layout={layout} ref={rootRef} aria-labelledby="headline">
    <div className="cine-stage">
      <div className="wrap cine-frame">
        <div className="cine-copy">
          <div className="cine-scenes">
            {CINEMATIC_SCENES.map((scene, index) => <article key={scene.id} className="cine-scene" data-cue={scene.id} data-anchor={ANCHORS[index] ?? 'middle'}>
              <Statement scene={scene} index={index}/>
              <p className="cine-support">
                <span className="cine-line" style={{'--l': `var(--l${scene.headline.length}, 1)`} as CSSProperties}>
                  <span className="cine-line-inner">{scene.support}</span>
                </span>
              </p>
            </article>)}
          </div>
          <div className="cine-cta">
            <DownloadButton className="button conversion-cta" data-cta-placement="cinematic-stage"><CtaLabel/></DownloadButton>
            <p className="cine-cta-note">Free core. No card. No ads.</p>
          </div>
        </div>
        <div className="cine-media" aria-hidden="true">
          <picture>
            <source media="(max-width: 980px)" srcSet={CINEMATIC_ASSETS.posterMobile}/>
            <img className="cine-poster" src={CINEMATIC_ASSETS.poster} alt="" width={720} height={1280} loading="eager" fetchPriority="high" decoding="async"/>
          </picture>
          <video className="cine-video" ref={videoRef} muted playsInline preload="none" poster={CINEMATIC_ASSETS.poster} disablePictureInPicture disableRemotePlayback tabIndex={-1}/>
          <div className="cine-light" aria-hidden="true"/>

          {/* The film's blank receipt and ledger, filled in code. Canonical
              figures only; the model never draws a number. In static mode this
              is a plain block under the scenes. */}
          <div className="cine-proof">
            <p className="cine-proof-eyebrow">{PROOF.eyebrow}</p>
            <ul className="cine-proof-rows">
              {PROOF.rows.map((row, i) => <li key={row.id} className="cine-proof-row" style={{'--r': `var(--pr${i}, 1)`} as CSSProperties}>
                <span>{row.label}</span><b>{row.amount}</b>
              </li>)}
            </ul>
            <p className="cine-proof-net">
              <span>{PROOF.net.label}</span><b>{PROOF.net.amount}</b>
            </p>
            <p className="cine-proof-foot">{PROOF.net.foot}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
}
