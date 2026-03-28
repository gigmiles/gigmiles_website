import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GigMiles',
  description: 'GigMiles Privacy Policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <a href="/" className="text-emerald-500 text-sm font-medium hover:text-emerald-400 transition-colors">
            ← GigMiles
          </a>
          <h1 className="mt-6 text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: March 28, 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              GigMiles (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a mobile application designed to help gig economy workers —
              including rideshare drivers, delivery couriers, and other independent contractors — track their earnings,
              mileage, vehicle expenses, and estimated tax obligations.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
              By using GigMiles, you agree to the practices described in this policy.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>

            <h3 className="text-sm font-semibold text-slate-200 mt-5 mb-2">2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Email address</li>
              <li>Password (stored as a secure hash — we never store your plain-text password)</li>
            </ul>

            <h3 className="text-sm font-semibold text-slate-200 mt-5 mb-2">2.2 Location Data</h3>
            <p>GigMiles uses your device&apos;s GPS to automatically track mileage during gig shifts. Specifically:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>GPS coordinates are collected <strong className="text-slate-200">only while a trip is actively being tracked</strong></li>
              <li>Location data is processed locally on your device to calculate trip distance</li>
              <li>Trip distance (in miles) is stored; raw GPS coordinate sequences are not permanently stored</li>
              <li>We do <strong className="text-slate-200">not</strong> collect location data in the background when the app is closed or a trip is not active</li>
            </ul>
            <p className="mt-3">
              You can disable location access at any time through your device settings. Without location permission,
              GPS-based mileage tracking will be unavailable, but you can still log mileage manually.
            </p>

            <h3 className="text-sm font-semibold text-slate-200 mt-5 mb-2">2.3 Financial and Earnings Data</h3>
            <p>You may voluntarily enter:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Earnings per gig shift (gross income, platform tips)</li>
              <li>Expense records (fuel, maintenance, insurance, phone, other)</li>
              <li>Vehicle information (make, model, year, fuel type, ownership type)</li>
            </ul>
            <p className="mt-3">
              This data is used solely to provide you with earnings summaries, expense breakdowns, and tax estimates within the app.
            </p>

            <h3 className="text-sm font-semibold text-slate-200 mt-5 mb-2">2.4 Usage Data</h3>
            <p>
              We collect basic, anonymized usage data to improve the app, including app crash reports and general feature
              usage patterns. No personally identifiable information is attached to this data.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and operate the GigMiles service</li>
              <li>Calculate mileage, vehicle costs, and estimated tax obligations</li>
              <li>Display earnings summaries, reports, and insights</li>
              <li>Send optional push notifications (shift reminders, tax deadline alerts) — only if you enable them</li>
              <li>Diagnose and fix technical issues using crash reports</li>
            </ul>
            <p className="mt-3">We do <strong className="text-slate-200">not</strong> use your financial or location data for advertising purposes.</p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using <strong className="text-slate-200">Supabase</strong>, a cloud database platform
              with industry-standard encryption at rest and in transit (TLS/SSL).
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>All data is transmitted over encrypted HTTPS connections</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>Access to your data is restricted to your account only</li>
            </ul>
          </section>

          <hr className="border-slate-800" />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Sharing</h2>
            <p>We do <strong className="text-slate-200">not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
            <p className="mt-3">We may share data only in the following limited circumstances:</p>
            <div className="mt-4 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">Recipient</th>
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 text-slate-200 font-medium">Supabase</td>
                    <td className="px-4 py-3">Secure cloud database hosting</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-200 font-medium">Sentry</td>
                    <td className="px-4 py-3">Anonymized crash reporting and error monitoring</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-200 font-medium">Law enforcement</td>
                    <td className="px-4 py-3">Only if required by a valid legal process</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-800" />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Children&apos;s Privacy</h2>
            <p>
              GigMiles is intended for adults (18+) who are engaged in gig work. We do not knowingly collect personal
              information from children under the age of 13. If you believe a child has provided us with personal information,
              please contact us and we will delete it promptly.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-slate-200">Access</strong> the personal data we hold about you</li>
              <li><strong className="text-slate-200">Correct</strong> inaccurate or incomplete data</li>
              <li><strong className="text-slate-200">Delete</strong> your account and associated data</li>
              <li><strong className="text-slate-200">Export</strong> your data in a portable format</li>
              <li><strong className="text-slate-200">Withdraw consent</strong> to location tracking at any time via device settings</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the email address below. We will respond within 30 days.
            </p>
            <p className="mt-3">
              <strong className="text-slate-200">To delete your account:</strong> Go to Settings → Danger Zone → Delete Account
              within the app. This will permanently delete all your data from our servers.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, all associated data
              (earnings, expenses, mileage, vehicle information) is permanently deleted from our systems within 30 days.
            </p>
            <p className="mt-3">
              Anonymized, aggregated crash reports (which contain no personal information) may be retained for up to 12 months.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Third-Party Services</h2>
            <p>GigMiles integrates with the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong className="text-slate-200">Supabase</strong> —{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                  supabase.com/privacy
                </a>
              </li>
              <li>
                <strong className="text-slate-200">Sentry</strong> —{' '}
                <a href="https://sentry.io/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                  sentry.io/privacy
                </a>
              </li>
            </ul>
          </section>

          <hr className="border-slate-800" />

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date
              at the top of this page. For significant changes, we will notify you through the app or via email.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, or to exercise your data rights, please contact us:
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
              <span className="text-slate-400 text-sm">Email:</span>
              <a href="mailto:support@gigmiles.app" className="text-emerald-500 hover:text-emerald-400 font-medium text-sm">
                support@gigmiles.app
              </a>
            </div>
          </section>

          <hr className="border-slate-800" />

          <p className="text-xs text-slate-600 italic">
            GigMiles is an independent application and is not affiliated with, endorsed by, or connected to any gig economy
            platform (Uber, Lyft, DoorDash, Instacart, etc.).
          </p>

        </div>
      </div>
    </div>
  )
}