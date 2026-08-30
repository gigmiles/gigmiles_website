import {DownloadButton} from '@/components/ui/DownloadButton'
import {StoreBadges} from '@/components/ui/StoreBadges'
// Approved 2026-08-30 preview, transcribed into native React markup.
export function ApprovedDownload(){return <>
<section className="wrap download-decision">
<p className="eyebrow">
{"MAKE THE NEXT SHIFT YOUR STARTING POINT"}
</p>
<h1>
{"A clearer picture."}
<br  />
<em>
{"Starts with your details."}
</em>
</h1>
<p className="download-intro">
{"Get GigMiles for iPhone or Android. Start with the free core; choose Pro if you want more automation."}
</p>
<div className="store-choices" aria-label="Download GigMiles"><StoreBadges /></div>
<p className="confidence">
{"Free core. No card. No ads."}
</p>

<div className="download-expectation">
<span>
{"IN THE APP"}
</span>
<p>
{"Add your details → Log a shift → Review your estimates."}
</p>
<small>
{"Pro features include automatic GPS tracking and PDF/CSV export."}
</small>
</div>
<a className="text-link" href="/calculator">
{"Want to explore first? Try the web calculator →"}
</a>
<p className="legal">
{"Estimates for planning. Not tax advice."}
</p>
</section>
</>}
