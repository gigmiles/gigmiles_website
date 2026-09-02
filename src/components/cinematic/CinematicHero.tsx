'use client'

import {useEffect, useRef, type CSSProperties} from 'react'
import {DownloadButton} from '@/components/ui/DownloadButton'
import {ArrowUpRight} from '@/components/editorial/Glyph'
import {installCinematic} from './cinematic-controller'
import {BEAT_LIGHTS, BEAT_TINTS, CINEMATIC_ASSETS, CINEMATIC_BEATS, CINEMATIC_CUES, CINEMATIC_SCENES, type SceneSpec} from './cinematic-cues'

// Server-rendered film stage. The markup is complete without JavaScript: the
// poster is the image, every scene's words are in the document in reading
// order, and `data-cine-mode="static"` lays them out as a plain page. The
// controller (installCinematic) upgrades the stage to a scroll-scrubbed film
// when the viewport, the connection and the visitor's motion preference allow.
// It only writes data attributes and CSS custom properties; nothing here is
// generated on the client.

const ANCHORS = ['lead', 'middle', 'middle', 'trail', 'lead'] as const

function renderLine(text: string) {
  const parts = text.split(/\*(.+?)\*/)
  return parts.map((part, i) => (i % 2 === 1
    ? <em key={i} className="cine-mark">{part}<svg className="cine-underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 5.5 C 22 2.5, 48 7.5, 74 4 S 94 3.5, 99 5" pathLength={1}/></svg></em>
    : part))
}

function Statement({scene, index}: {scene: SceneSpec; index: number}) {
  const Tag = index === 0 ? 'h1' : 'h2'
  return <Tag id={index === 0 ? 'headline' : undefined} className="cine-statement">
    {scene.headline.map((line, li) => <span key={li} className="cine-line" style={{'--l': `var(--l${li}, 1)`} as CSSProperties}>
      <span className="cine-line-inner">{renderLine(line)}</span>
    </span>)}
  </Tag>
}

export function CinematicHero({layout = 'portrait'}: {layout?: 'portrait' | 'landscape'}) {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return
    return installCinematic(root, video, {cues: CINEMATIC_CUES, src: {desktop: CINEMATIC_ASSETS.desktop, mobile: CINEMATIC_ASSETS.mobile}, beats: CINEMATIC_BEATS, tints: BEAT_TINTS, lights: BEAT_LIGHTS})
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
            <DownloadButton className="button conversion-cta" data-cta-placement="cinematic-stage">
              Get GigMiles — free <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
            </DownloadButton>
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
        </div>
      </div>
    </div>
  </section>
}
