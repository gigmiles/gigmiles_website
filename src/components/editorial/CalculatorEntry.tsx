import {ArrowUpRight} from './Glyph'
// A route into the existing calculator, not another calculation engine or form.
export function CalculatorEntry() {
  return <aside className="calculator-entry" aria-labelledby="calculator-entry-title">
    <h3 id="calculator-entry-title">Try the free calculator.</h3>
    <p className="calculator-entry-copy">Enter earnings, miles and hours to explore modeled vehicle costs and a simplified hourly estimate.</p>
    <div className="calculator-entry-actions">
      <a className="button calculator-entry-link" href="/calculator">
        Open calculator <span aria-hidden="true" className="glyph"><ArrowUpRight/></span>
      </a>
      <span>No sign-up or download.</span>
    </div>
    <p className="calculator-entry-scope">Includes estimated self-employment tax. Federal/state income tax and W-2 context aren’t included in this web tool.</p>
  </aside>
}
