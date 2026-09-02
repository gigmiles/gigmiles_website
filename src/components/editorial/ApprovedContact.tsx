import {ArrowUpRight} from './Glyph'
import {DownloadButton} from '@/components/ui/DownloadButton'

// Approved 2026-08-30 preview, transcribed into native React markup.
export function ApprovedContact(){return <>
<section className="wrap tool-heading">
<p className="eyebrow">
{"GET IN TOUCH"}
</p>
<h1>
{"A question?"}
<br  />
<em>
{"Let's help."}
</em>
</h1>
<p>
{"Questions about the app or your account? We’re here to help."}
</p>
<div className="contact-options">
<div>
<h2>
{"Product support"}
</h2>
<a href="mailto:support@gigmiles.app">
{"support@gigmiles.app "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</a>
</div>
<div>
<h2>
{"Legal & privacy"}
</h2>
<a href="mailto:legal@gigmiles.app">
{"legal@gigmiles.app "}
<span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
</a>
</div>
</div>
<a className="text-link" href="/#questions">
{"Read the product questions →"}
</a>
</section>
</>}
