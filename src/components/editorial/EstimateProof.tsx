'use client'

import {useState} from 'react'
import {CALC_DEFAULTS, IRS_MILEAGE_RATE_2026, SE_EARNINGS_FACTOR, SE_TAX_RATE, buildCalcParams, calcDefaults, calcRealNet, type CalcInput, type VehicleType} from '@/lib/calculatorMath'

// "How the estimate is built": the four formula lines of the free calculator,
// rendered from calculatorMath so the numbers can never drift from /calculator
// or the OG share card. Read-only by default (the approved home entry is a
// route into the calculator, not a second form); `interactive` adds sliders
// for a later, separately approved iteration.
// Inputs are the calculator's placeholder shift (CALC_DEFAULTS), never the
// canonical creative example. Copy status: draft for operator approval (gate B).

const money = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
const pct = (n: number) => `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`

export function EstimateProof({initial = CALC_DEFAULTS, interactive = false}: {initial?: CalcInput; interactive?: boolean}) {
  const [state, setState] = useState<CalcInput>(initial)
  const r = calcRealNet(state)
  const car = state.vehicle === 'car'
  const link = `/calculator?${buildCalcParams(state)}`
  const set = (patch: Partial<CalcInput>) => setState(s => ({...s, ...patch}))
  const setVehicle = (vehicle: VehicleType) => setState({...calcDefaults(vehicle)})

  return <section className="wrap estimate-proof" id="estimate" aria-labelledby="estimate-title">
    <div className="estimate-intro">
      <p className="eyebrow">HOW THE ESTIMATE IS BUILT</p>
      <h2 id="estimate-title">Four lines.<br/><span>Nothing hidden.</span></h2>
      <p className="estimate-lead">A worked example with the same math as the free calculator. Your own miles, hours and vehicle change every line.</p>
      <p className="estimate-dayjob">Have a day job? Your W-2 changes the marginal rate on gig income. The app computes that with what you enter.</p>
      <div className="estimate-actions">
        <a className="button estimate-link" href={link}>Try your own figures <span aria-hidden="true">↗</span></a>
        <span>No sign-up or download.</span>
      </div>
      <p className="estimate-scope">Simplified web model with estimated self-employment tax. Federal and state income tax and W-2 context are not included here; the app models those with the details you enter.</p>
    </div>

    <div className="estimate-card" aria-live={interactive ? 'polite' : undefined}>
      {interactive && <fieldset className="estimate-controls">
        <legend>Example inputs</legend>
        <div className="estimate-vehicle" role="radiogroup" aria-label="Vehicle">
          <label><input type="radio" name="estimate-vehicle" checked={car} onChange={() => setVehicle('car')}/> Car</label>
          <label><input type="radio" name="estimate-vehicle" checked={!car} onChange={() => setVehicle('ebike')}/> E-bike</label>
        </div>
        <label>Gross <input type="range" min={0} max={1000} step={5} value={state.gross} onChange={e => set({gross: Number(e.target.value)})}/> <output>{money.format(state.gross)}</output></label>
        <label>Miles <input type="range" min={0} max={300} step={1} value={state.miles} onChange={e => set({miles: Number(e.target.value)})}/> <output>{state.miles} mi</output></label>
        <label>Hours <input type="range" min={0} max={16} step={0.5} value={state.hours} onChange={e => set({hours: Number(e.target.value)})}/> <output>{state.hours} h</output></label>
      </fieldset>}
      <p className="estimate-inputs">Example shift: {money.format(state.gross)} gross · {state.miles} mi · {state.hours} h · {car ? 'car' : 'e-bike'} at {money.format(state.costPerMile)}/mi real cost</p>
      <dl className="estimate-lines">
        <div><dt>Vehicle cost<small>{state.miles} mi × {money.format(state.costPerMile)} real cost per mile. What driving cost you.</small></dt><dd id="estimate-vehicle-cost">−{money.format(r.vehicleCost)}</dd></div>
        <div><dt>Mileage deduction<small>{car ? `${state.miles} mi × ${money.format(IRS_MILEAGE_RATE_2026)} IRS rate. Lowers taxable income, not take-home.` : 'E-bikes have no standard mileage rate, so the actual cost is the deduction.'}</small></dt><dd id="estimate-deduction">{money.format(r.mileageDeduction)}</dd></div>
        <div><dt>Self-employment tax estimate<small>(gross − deduction) × {pct(SE_EARNINGS_FACTOR)} × {pct(SE_TAX_RATE)}</small></dt><dd id="estimate-se-tax">−{money.format(r.seTax)}</dd></div>
        <div className="estimate-total"><dt>Estimate after costs<small>Gross − vehicle cost − self-employment tax estimate</small></dt><dd id="estimate-net">{money.format(r.net)}</dd></div>
      </dl>
      <p className="estimate-hourly">{state.hours > 0 ? <>About <b id="estimate-hourly">{money.format(r.hourly)}</b> per hour over {state.hours} hours.</> : 'Add hours to see an hourly figure.'}</p>
      <p className="estimate-note">Example inputs, not a customer&apos;s shift. Estimates for planning, not tax advice.</p>
    </div>
  </section>
}
