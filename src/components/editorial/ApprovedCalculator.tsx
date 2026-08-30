import {DownloadButton} from '@/components/ui/DownloadButton'
import {CalculatorSurface} from './CalculatorSurface'
// Approved 2026-08-30 preview, transcribed into native React markup.
export function ApprovedCalculator(){return <>
<section className="wrap tool-heading">
<p className="eyebrow">
{"THE GIGMILES CALCULATOR"}
</p>
<h1>
{"Put your shift"}
<br  />
<em>
{"in perspective."}
</em>
</h1>
<p>
{"Start with your own numbers. Explore a simplified estimate—not your full tax picture."}
</p>
</section>
<CalculatorSurface>
<form id="calc-form" className="input-panel">
<div className="panel-title">
<span>
{"YOUR INPUTS"}
</span>
<button className="quiet-button" type="button" id="example">
{"Load example"}
</button>
</div>
<fieldset className="vehicle-choice">
<legend>
{"What do you use?"}
</legend>
<label>
<input type="radio" name="vehicle" value="car" defaultChecked={true} />
{"Car"}
</label>
<label>
<input type="radio" name="vehicle" value="ebike" />
{"E-bike"}
</label>
</fieldset>
<div className="field-grid">
<label htmlFor="gross">
{"Gross earnings "}
<span>
{"USD"}
</span>
<input id="gross" type="number" min="0" max="100000" step="any" inputMode="decimal" required={true} placeholder="Enter earnings" />
</label>
<label htmlFor="miles">
{"Distance "}
<span>
{"miles"}
</span>
<input id="miles" type="number" min="0" max="10000" step="any" inputMode="decimal" required={true} placeholder="Enter miles" />
</label>
<label htmlFor="hours">
{"Time worked "}
<span>
{"hours"}
</span>
<input id="hours" type="number" min="0" max="200" step="any" inputMode="decimal" required={true} placeholder="Enter hours" />
</label>
<label htmlFor="rate">
{"Vehicle cost "}
<span>
{"USD / mile"}
</span>
<input id="rate" type="number" min="0" max="10" step="any" inputMode="decimal" required={true} aria-describedby="rate-help" />
</label>
</div>
<p id="rate-help" className="small-note">
{"Editable modeled operating cost—not the mileage deduction rate."}
</p>
<div className="actions">
<button className="button" type="submit">
{"Calculate estimate "}
<span aria-hidden="true">
{"↗"}
</span>
</button>
<button type="button" className="quiet-button" id="reset">
{"Reset"}
</button>
</div>
<p id="calc-status" role="status" className="small-note">
{"Enter your figures or load an optional example."}
</p>
</form>
<section className="result-panel" aria-label="Calculator result">
<p className="eyebrow">
{"SIMPLIFIED ESTIMATE"}
</p>
<h2>
{"After the modeled costs."}
</h2>
<output id="net" className="net-value">
{"—"}
</output>
<p className="result-sub">
{"Not your final take-home or tax bill."}
</p>
<dl>
<div>
<dt>
{"Modeled vehicle cost"}
</dt>
<dd id="vehicle-cost">
{"—"}
</dd>
</div>
<div>
<dt>
{"Estimated self-employment tax"}
</dt>
<dd id="se-tax">
{"—"}
</dd>
</div>
<div>
<dt>
{"Estimate per hour"}
</dt>
<dd id="hourly">
{"—"}
</dd>
</div>
</dl>
<button className="quiet-button" type="button" id="share" disabled={true}>
{"Show result link ↗"}
</button>
<div id="share-area" hidden={true}>
<label htmlFor="share-link">
{"Shareable link · contains the entered figures"}
</label>
<input id="share-link" readOnly={true} />
<p className="small-note">
{"Only share this link if you are comfortable sharing the figures it contains."}
</p>
</div>
</section>
</CalculatorSurface>
<section className="wrap scope-note">
<strong>
{"What this web calculator does—and doesn't do."}
</strong>
<p>
{"It uses an editable per-mile vehicle cost and the existing simplified self-employment tax model. It does "}
<b>
{"not"}
</b>
{" include federal income tax, state income tax, W-2 income, filing status, annual wage-cap checks or your complete financial situation."}
</p>
<p>
{"Car mileage deduction assumption: July–December 2026. This simplified tool does not support first-half or mixed-period calculations. "}
<a href="https://www.irs.gov/tax-professionals/standard-mileage-rates?nav=2" target="_blank" rel="noopener noreferrer">
{"IRS mileage-rate source ↗"}
</a>
</p>
<p>
{"Estimates for planning only. Not tax advice."}
</p>
</section>
<section className="wrap onward">
<div>
<p className="eyebrow">
{"GO BEYOND THE QUICK ESTIMATE"}
</p>
<h2>
{"Your details matter."}
</h2>
<p>
{"The app's personalization story includes your vehicle, state and optional W-2 context."}
</p>
<DownloadButton className="button conversion-cta" data-cta-placement="calculator-next">
{"Get GigMiles — free "}
<span aria-hidden="true">
{"↗"}
</span>
</DownloadButton>
<p className="small-note">
{"Free core. Optional Pro upgrades."}
</p>
<a className="text-link" href="/#details">
{"Explore how GigMiles works →"}
</a>
</div>
<div>
<p className="eyebrow">
{"READ BEFORE YOU COMPARE"}
</p>
<h2>
{"More than a mileage count."}
</h2>
<p>
{"Explore the questions behind choosing a tracker."}
</p>
<a className="text-link" href="/blog/how-to-choose-gig-driver-tracker">
{"Read the guide →"}
</a>
</div>
</section>
</>}
