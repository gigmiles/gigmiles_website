import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete Your Account | GigMiles',
  description:
    'How to delete your GigMiles account and associated data — in-app steps or by request — including what is deleted, what is retained, and the timeline.',
}

// Public account-deletion instructions page, used as the Google Play Data Safety
// "Delete account URL" and as a general user reference. Must clearly state the
// steps, what is deleted vs retained, and the retention/grace period.
export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#0E4F4F] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#5EEAD4] transition-colors"
        >
          ← GigMiles
        </a>

        <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-white">
          Delete Your GigMiles Account
        </h1>
        <p className="mt-4 text-slate-300 leading-relaxed">
          You can permanently delete your GigMiles account and all associated
          data at any time. There are two ways to do it.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-[#5EEAD4] uppercase">
          Option 1 — In the app
        </h2>
        <ol className="mt-4 space-y-3 text-slate-300 list-decimal list-inside leading-relaxed">
          <li>Open GigMiles and sign in.</li>
          <li>Go to the <strong>Profile</strong> tab.</li>
          <li>Open <strong>Settings</strong>.</li>
          <li>
            Scroll to <strong>Delete Account</strong> and confirm.
          </li>
        </ol>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Your account is then scheduled for permanent deletion after a{' '}
          <strong>14-day grace period</strong>. If you change your mind, simply
          log back in within those 14 days to cancel the deletion.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-[#5EEAD4] uppercase">
          Option 2 — By request
        </h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          If you can&apos;t access the app, email{' '}
          <a
            href="mailto:legal@gigmiles.app?subject=Account%20Deletion%20Request"
            className="text-[#5EEAD4] hover:text-[#5EEAD4]"
          >
            legal@gigmiles.app
          </a>{' '}
          from the email address on your account, with the subject &quot;Account
          Deletion Request.&quot; We will verify and process your request, and
          confirm by email when it&apos;s complete.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-[#5EEAD4] uppercase">
          What is deleted
        </h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          All personal data tied to your account is permanently deleted,
          including your profile, earnings and expense entries, shifts, mileage
          and trip records, vehicles, tax inputs, and any uploaded content.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-[#5EEAD4] uppercase">
          What is retained
        </h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          We keep only fully anonymized, non-identifiable analytics (with no
          name, email, or user identifier) and any records we are legally
          required to retain (for example, tax, accounting, or fraud-prevention
          obligations). None of this can be linked back to you.
        </p>

        <h2 className="mt-12 text-xs font-bold tracking-[0.15em] text-[#5EEAD4] uppercase">
          Timeline
        </h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Deletion is reversible during the 14-day grace period (log back in to
          cancel). After 14 days, your data is permanently and irreversibly
          purged from our systems.
        </p>

        <p className="mt-10 text-xs leading-relaxed text-slate-300">
          GigMiles is operated by GigMiles, Inc. For privacy questions, see our{' '}
          <a href="/privacy" className="text-[#5EEAD4] hover:text-[#5EEAD4]">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
