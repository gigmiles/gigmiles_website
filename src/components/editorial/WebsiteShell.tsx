import {DownloadButton} from '@/components/ui/DownloadButton'
import type {ReactNode} from 'react'
import {NavMenu} from './NavMenu'
import {ArrowUpRight} from './Glyph'
import './editorial.css'
import './responsive.css'
export function WebsiteShell({children,paper=false}:{children:ReactNode;paper?:boolean}){return <div className={'editorial-site'+(paper?' paper-page':'')}>
<header className="nav wrap">
<a className="brand" href="/" aria-label="GigMiles home">
<span className="brand-lockup" aria-hidden="true">
<img className="brand-icon" src="/brand/icons/icon-180.png" width="32" height="32" alt="" />
<span className="brand-name">
<span className="brand-wordmark">
{"gigmiles"}
</span>
<sup className="brand-trademark">
{"™"}
</sup>
</span>
</span>
</a>
<NavMenu>
<a href="/#details">
{"How it works"}
</a>
<a href="/calculator">
{"Calculator"}
</a>
<a href="/#free">
{"Free / Pro"}
</a>
<a href="/blog">
{"Blog"}
</a>
</NavMenu>
<DownloadButton className="nav-cta" data-cta-placement="nav">
{"Get the app "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</DownloadButton>
</header><main id="main-content">{children}</main><footer className="wrap site-footer">
<a href="/" aria-label="GigMiles home">
<span className="brand-lockup" aria-hidden="true">
<img className="brand-icon" src="/brand/icons/icon-180.png" width="32" height="32" alt="" />
<span className="brand-name">
<span className="brand-wordmark">
{"gigmiles"}
</span>
<sup className="brand-trademark">
{"™"}
</sup>
</span>
</span>
</a>
<p>
{"Your work, in perspective. Estimates for planning, not tax advice."}
</p>
<nav aria-label="Footer navigation">
<a href="/calculator">
{"Calculator"}
</a>
<a href="/blog">
{"Blog"}
</a>
<a href="/contact">
{"Contact"}
</a>
<a href="/privacy">
{"Privacy"}
</a>
<a href="/terms">
{"Terms"}
</a>
</nav>
</footer></div>}
