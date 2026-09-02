import type {CSSProperties} from 'react'
import type {SceneSpec} from './cinematic-cues'

// One scene's statement: masked lines, the driver's word in Mint with the
// self-drawing underline (an SVG path revealed by `--u`). Shared by the film
// stage and the plate stage; server-rendered, no client logic.

export function renderLine(text: string) {
  const parts = text.split(/\*(.+?)\*/)
  return parts.map((part, i) => (i % 2 === 1
    ? <em key={i} className="cine-mark">{part}<svg className="cine-underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 5.5 C 22 2.5, 48 7.5, 74 4 S 94 3.5, 99 5" pathLength={1}/></svg></em>
    : part))
}

export function Statement({scene, index}: {scene: SceneSpec; index: number}) {
  const Tag = index === 0 ? 'h1' : 'h2'
  return <Tag id={index === 0 ? 'headline' : undefined} className="cine-statement">
    {scene.headline.map((line, li) => <span key={li} className="cine-line" style={{'--l': `var(--l${li}, 1)`} as CSSProperties}>
      <span className="cine-line-inner">{renderLine(line)}</span>
    </span>)}
  </Tag>
}
