import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | GigMiles',
  description: 'GigMiles Terms of Service — your rights and responsibilities when using our app.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <a href="/" className="text-emerald-500 text-sm font-medium hover:text-emerald-400 transition-colors">
            ← GigMiles
          </a>
          <h1 className="mt-6 text-3xl font-bold text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: March 28, 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using the GigMiles mobile application (&ldquo;App&rdquo;), you agree to be
              bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the App.
            </p>
            <p className="mt-3">
              GigMiles is an independent application and is not affiliated with, endorsed by, or connected to any gig
              economy platform (Uber, Lyft, DoorDash, Instacart, Amazon Flex, etc.).
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              GigMiles provides tools to help gig economy workers track earnings, mileage, vehicle expenses, and
              estimate tax obligations. The App is intended for personal financial tracking purposes only.
            </p>
            <p className="mt-3">
              GigMiles does <strong className="text-slate-200">not</strong> provide tax advice, legal advice, or
              financial advisory services. All tax estimates and calculations are approximations for informational
              purposes only. Consult a qualified tax professional for official tax guidance.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years old to use GigMiles. By using the App, you represent and warrant that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>Your use of the App complies with all applicable laws and regulations</li>
            </ul>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Account Registration</h2>
            <p>
              To use GigMiles, you must create an account with a valid email address and password. You are responsible for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="mt-3">
              We reserve the right to terminate accounts that violate these Terms or are used fraudulently.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Subscription and Payments</h2>
            <p>GigMiles offers a free trial period followed by paid subscription options:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Free trial: 14 days, no credit card required</li>
              <li>Monthly plan: billed monthly through the App Store</li>
              <li>Annual plan: billed annually through the App Store</li>
            </ul>
            <p className="mt-3">
              All payments are processed through Apple App Store or Google Play Store. Subscriptions automatically
              renew unless cancelled at least 24 hours before the end of the current period. Refunds are subject
              to the respective platform&apos;s refund policy.
            </p>
            <p className="mt-3">
              We reserve the right to modify pricing with reasonable notice. Existing subscribers will be notified
              before any price changes take effect.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the App for any unlawful purpose</li>
              <li>Attempt to reverse engineer, decompile, or disassemble the App</li>
              <li>Share your account credentials with others</li>
              <li>Use the App to store false, misleading, or fraudulent financial data</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; data</li>
              <li>Use automated tools to scrape, crawl, or extract data from the App</li>
            </ul>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Data and Privacy</h2>
            <p>
              Your use of the App is also governed by our{' '}
              <a href="/privacy" className="text-emerald-500 hover:text-emerald-400">Privacy Policy</a>,
              which is incorporated into these Terms by reference. By using GigMiles, you consent to the
              data practices described in our Privacy Policy.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The App will be uninterrupted or error-free</li>
              <li>Tax estimates or calculations will be accurate or complete</li>
              <li>The App will meet your specific requirements</li>
              <li>Any data stored in the App will not be lost</li>
            </ul>
            <p className="mt-3">
              <strong className="text-slate-200">Tax calculations are estimates only.</strong> GigMiles is not a
              substitute for professional tax advice. We strongly recommend consulting a qualified tax professional
              before filing your taxes.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GIGMILES SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
              PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE APP.
            </p>
            <p className="mt-3">
              Our total liability to you for any claim arising from these Terms or your use of the App shall not
              exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Intellectual Property</h2>
            <p>
              GigMiles and all associated content, features, and functionality are owned by us and are protected
              by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute,
              modify, or create derivative works without our express written permission.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for violation of these Terms. You may delete
              your account at any time via Settings → Danger Zone → Delete Account. Upon termination, your right
              to use the App ceases immediately and your data will be deleted per our Privacy Policy.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes through the
              App or via email. Continued use of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the United States.
              Any disputes arising from these Terms shall be resolved through binding arbitration, except where
              prohibited by applicable law.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">14. Contact</h2>
            <p>For questions about these Terms, contact us:</p>
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
