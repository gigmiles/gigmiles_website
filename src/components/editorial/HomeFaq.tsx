import {PLATFORMS_FAQ} from '@/lib/platforms'

// The home page's approved questions, lifted out of ApprovedHome so the film
// home can carry them too. Moving to the film hero cost the page its longest
// block of plain text; these ten answers are the part search actually reads,
// and they were approved copy already. The markup is unchanged.
export function HomeFaq({variant = 'live'}: {variant?: 'live' | 'v2'}) {
  const v2 = variant === 'v2'
  return <section className="faq wrap home-faq" id="questions" aria-labelledby="questions-title" data-reveal="">
    <div className="faq-heading">
    <p className="eyebrow">
    {"GOOD TO KNOW"}
    </p>
    <h2 id="questions-title">
    {"A clearer picture."}
    <br  />
    {"Not a final tax answer."}
    </h2>
    </div>
    <div className="faq-list">
    <details>
    <summary>
    {"What can I use for free?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"Manual earnings, mileage and expense records, cost estimates and your today/this-week view are part of the free core. No card is required. Pro adds optional features such as automatic GPS tracking and PDF/CSV export."}
    </p>
    </details>
    <details>
    <summary>
    {"Does it work for cars and e-bikes?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"Yes. GigMiles uses different cost models: fuel or energy and wear for your vehicle, and electricity plus battery and mechanical wear for e-bikes."}
    </p>
    </details>
    <details>
    <summary>
    {"Do I need a W-2 job to use GigMiles?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"No. W-2 income is optional. If you don't provide it, the estimate doesn't include that day-job income."}
    </p>
    </details>
    <details>
    <summary>
    {"Does GigMiles know my exact taxes?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"No. Estimates depend on the information you enter and the model's assumptions. Your actual tax situation may differ. GigMiles is a planning and records tool, not a tax-filing service."}
    </p>
    </details>
    {v2 && <>
    <details>
    <summary>
    {"What does an e-bike shift cost?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"GigMiles models e-bike costs as electricity (about 25 miles per kWh at your electricity price) plus battery and mechanical wear of about 5 cents per mile. E-bikes have no IRS standard mileage rate, so the app uses the actual-expense method."}
    </p>
    </details>
    <details>
    <summary>
    {"What happens to my data?"}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>
    {"Analytics and ad measurement are consent-gated. Receipt scan runs on your phone. You can delete your account in the app, and personal data is permanently deleted within 30 days."}
    </p>
    </details>
    <details>
    <summary>
    {PLATFORMS_FAQ.question}
    <span aria-hidden="true">
    {"+"}
    </span>
    </summary>
    <p>{PLATFORMS_FAQ.answer[0]}</p>
    <p>{PLATFORMS_FAQ.answer[1]}</p>
    </details>
    </>}
    </div>
    </section>
}
