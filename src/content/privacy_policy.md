# Privacy Policy

**GigMiles**
**Last updated: 2026-06-14**

This Privacy Policy describes how **GigMiles, Inc.**, a Delaware corporation ("GigMiles," "we," "our," or "us"), collects, uses, shares, and protects personal information when you use the GigMiles mobile application and related services (collectively, the "Service").

This Privacy Policy is incorporated by reference into our [Terms and Conditions](https://gigmiles.app/terms). By using the Service, you agree to the practices described in this policy.

---

## 1. Introduction

GigMiles is a financial tracking application designed for independent contractors and gig workers in the United States — including rideshare drivers, delivery couriers, and other self-employed individuals. The Service helps you log earnings, track mileage, calculate estimated taxes, and prepare records for handoff to a licensed tax professional.

This Privacy Policy applies to information we collect through the mobile application, our website, and related communications.

---

## 2. Information We Collect

### 2.1 Account Information

When you create an account, we collect:

- Email address (used for login and communication)
- Password (stored as a secure hash — we never store your plain-text password)
- Full name (optional, used in CPA worksheet output)
- Referral code (if you signed up via an invitation)

### 2.2 Profile and Tax Settings

You may voluntarily provide:

- US state of residence
- Filing status (single, married filing jointly, etc.)
- Tax deduction method preference (standard mileage or actual expenses)
- Optional: street address, business name, EIN, principal activity, Schedule C activity code (used in Schedule C Worksheet output for your CPA)

### 2.3 Vehicle Information

For each vehicle you add:

- Make, model, year, license plate (optional)
- Fuel type (petrol, diesel, electric, hybrid, LPG) or e-bike type
- MPG / efficiency
- Ownership type (owned, leased, financed)
- Monthly payment / insurance amounts and cycles

### 2.4 Earnings, Expense, and Trip Data

When you log gig work activity:

- Gross earnings, tips, and platform per shift
- Expense entries (fuel, maintenance, insurance, phone, supplies, tools, equipment, parts inventory, commercial insurance, DOT fees, cargo insurance, other)
- Shift start/end timestamps, total hours, total miles
- Trip records (start/end location, distance, business purpose)

### 2.5 Location Data — Precise Geolocation

**Important — Sensitive Personal Information (SPI):** Under California Privacy Rights Act (CPRA), precise geolocation is classified as Sensitive Personal Information.

GigMiles uses your device's GPS to automatically track mileage during gig shifts. Specifically:

- GPS coordinates are collected **only while a trip is actively being tracked** (Start Shift active)
- Location data is processed primarily on your device to calculate trip distance
- Trip distance (in miles), start/end city, and state code are stored; raw GPS coordinate sequences are not permanently stored
- We do **not** collect location data in the background when the app is closed or a trip is not active

You can disable location access at any time through your device settings. Without location permission, GPS-based mileage tracking will be unavailable, but you can still log mileage manually.

We do not use precise geolocation for cross-context behavioral advertising or any purpose other than providing the shift-mileage tracking feature.

### 2.6 Device, Analytics, and Advertising Data

GigMiles uses third-party SDKs for product analytics, performance monitoring, usability insights, and advertising measurement. **All advertising-related and session-replay data collection is consent-gated** — on iOS via the App Tracking Transparency (ATT) prompt, and on all platforms via the "Share Analytics Data" toggle in Settings (Profile → Privacy & Security). If you decline, we do not collect or share this data.

**Product analytics — Google Firebase Analytics & Google Analytics 4:**

- Device identifiers (Apple IDFA, Google Advertising ID)
- App event data (screen views, feature interactions, conversion events)
- Device model, OS version, language, app version, crash counts
- Approximate (IP-based) geographic region — not precise location

**Usability insights — Microsoft Clarity:**

- Session replays and interaction heatmaps (taps, scrolls, screen navigation)
- Text inputs are masked by default; used to diagnose usability issues
- Associated with a Clarity-assigned identifier and your account user ID

**Advertising measurement — Meta (Facebook) App Events:**

- If you consent (ATT / Settings), we share your device advertising identifier (IDFA/GAID), app event data, and subscription purchase events with **Meta Platforms, Inc.**
- Meta uses this to measure our advertising performance, attribute installs, and build advertising audiences — this constitutes **"sharing" for cross-context behavioral advertising** under CCPA/CPRA
- We do **not** share your precise location, earnings, expense details, or income with Meta
- You can decline at the ATT prompt, turn off "Share Analytics Data" in Settings, or use the opt-out in §7 — and we stop immediately

Under CCPA/CPRA, the Firebase/GA4 transfer may be considered "sharing" for analytics, and the Meta transfer is "sharing" for cross-context behavioral advertising. See §7 for your opt-out rights.

### 2.7 Usage and Crash Data

- App crash reports and error stack traces (via Sentry)
- General feature usage patterns and performance metrics
- No personally identifiable financial data is attached to crash reports

---

## 3. How We Use Your Information

We use your information to:

- **Provide and operate the Service** (account creation, authentication, data sync)
- **Calculate mileage, vehicle costs, tax estimates, and net profit** (the core engine)
- **Display earnings summaries, reports, and insights**
- **Send notifications** (shift reminders, tax deadline alerts, daily wrap, premium status updates) — only the categories you enable in app settings
- **Diagnose and fix technical issues** using crash reports and error logs
- **Improve the Service** using product analytics (Firebase Analytics + GA4)
- **Diagnose usability** via Microsoft Clarity session insights (with your consent)
- **Measure and optimize our advertising** via Meta (Facebook) App Events (with your consent)
- **Process subscription billing** via Apple App Store and Google Play
- **Generate Schedule C Worksheets and CSV exports** at your request, for use with your licensed tax professional
- **Power AI features** (Today's Brief, Burnout Meter) by sending non-identifying aggregated context to Groq AI inference

We do **not** use your financial data, precise location, earnings, or income information for advertising. With your consent (the iOS App Tracking Transparency prompt or the "Share Analytics Data" Settings toggle), we share your device advertising identifier, app-event data, and subscription purchase events with Meta for advertising measurement and audience building. You can decline or withdraw this consent at any time (see §7), and we stop immediately.

---

## 4. Data Storage and Security

Your data is stored using **Supabase**, a cloud database platform with industry-standard encryption at rest and in transit (TLS/SSL).

- All data is transmitted over encrypted HTTPS connections
- Passwords are hashed using industry-standard one-way algorithms and never stored in plain text
- Database access is restricted by Row Level Security (RLS) policies — your data is accessible only to your account
- Subscription billing is processed by Apple and Google, not us — we do not store your payment card information

While we take reasonable precautions, no system is completely secure. We encourage you to use a strong, unique password and enable device-level security (PIN, FaceID, fingerprint).

---

## 5. Data Sharing — Sub-Processor List

We do **not** sell your personal data for monetary consideration. With your consent (see §2.6), we share advertising identifiers and app-event data with Meta for cross-context behavioral advertising; you can opt out at any time (see §7).

We share limited data with the following service providers and partners to operate the Service:

| Sub-Processor | Purpose | Data Categories | Privacy Policy |
|---|---|---|---|
| **Supabase** | Cloud database hosting, authentication | All app data (encrypted) | [supabase.com/privacy](https://supabase.com/privacy) |
| **Sentry** | Crash and error reporting | Stack traces, device model, anonymized session info | [sentry.io/privacy](https://sentry.io/privacy) |
| **Google Firebase + Google Analytics 4** | Product analytics, performance monitoring | Device identifiers (IDFA/AAID), event data, approximate region | [policies.google.com/privacy](https://policies.google.com/privacy) |
| **Microsoft Clarity** | Usability session replay + heatmaps (consent-gated; text masked) | Interaction events, device info, user ID | [privacy.microsoft.com](https://privacy.microsoft.com) |
| **Meta Platforms (Facebook) App Events** | Advertising measurement, install attribution, audience building (consent-gated) | Advertising ID (IDFA/GAID), app event data, purchase events | [facebook.com/privacy/policy](https://www.facebook.com/privacy/policy) |
| **Resend** | Transactional email (Contact Us, password reset, legal acceptance confirmations) | Email address, message content | [resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy) |
| **Groq** | AI inference for Today's Brief and Burnout Meter | Aggregated activity context (hours, miles, earnings ranges) — no PII | [groq.com/privacy-policy](https://groq.com/privacy-policy) |
| **Apple App Store / Google Play** | Subscription billing | Payment processing — handled by platform | Apple / Google |
| **U.S. Energy Information Administration (EIA)** | Regional fuel price lookup | State code only — no PII transmitted | Public government API |
| **Law enforcement** | Compliance with valid legal process | As legally required | — |

With your consent, we use Meta (Facebook) App Events — a social-media advertising SDK — for advertising measurement and audience building, as described in §2.6. We do not sell your personal information for monetary consideration and do not work with data brokers.

---

## 6. Children's Privacy

GigMiles is intended for adults (18 or older) engaged in gig work. We do not knowingly collect personal information from children under the age of 13. Children between 13 and 17 are also outside the intended user base and should not use the Service.

If you believe a child has provided us with personal information, please contact us at **legal@gigmiles.app** and we will delete it promptly.

---

## 7. Your Rights

### 7.1 Universal Rights

Regardless of your location, you may:

- **Access** the personal data we hold about you
- **Correct** inaccurate or incomplete data
- **Delete** your account and associated data
- **Export** your data in a portable format (Schedule C worksheets and tax summaries are available from the Tax Center; for a complete account export in JSON or CSV format, contact **legal@gigmiles.app**)
- **Withdraw consent** to location tracking at any time via device settings

To exercise these rights, contact us at **legal@gigmiles.app** or use the in-app self-service option (Profile → Account Actions → Delete Account). Full-account exports are handled via the email path above; we respond within 30 days under our CCPA/CPRA procedure.

### 7.2 California Residents (CCPA / CPRA)

Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents have the following rights regarding their personal information:

#### Rights

- **Right to Know** — Request disclosure of what personal information GigMiles collects, uses, discloses, and shares
- **Right to Delete** — Request deletion of personal information GigMiles has collected about you, subject to certain exceptions
- **Right to Correct** — Request correction of inaccurate personal information GigMiles maintains about you
- **Right to Opt-Out of Sale/Sharing** — GigMiles does not "sell" personal information for monetary consideration. However: (a) our use of Google Firebase Analytics / Google Analytics 4 (see §2.6, §5) may be considered "sharing" for analytics; and (b) with your consent, we share your advertising identifier and app-event data with Meta (Facebook) App Events for **cross-context behavioral advertising** (see §2.6, §5). To opt out: decline the iOS App Tracking Transparency prompt, turn OFF "Share Analytics Data" in Settings (Profile → Privacy & Security) — which stops all analytics and advertising sharing immediately — or email legal@gigmiles.app with the subject line "CCPA — Do Not Sell or Share."
- **Right to Limit Use of Sensitive Personal Information** — Direct GigMiles to limit use of sensitive personal information (including precise geolocation captured during GPS shift tracking) for purposes beyond what is necessary to provide the Service. Email legal@gigmiles.app with the subject line "CCPA — Limit SPI Use."
- **Right to Non-Discrimination** — Receive equal service and pricing from GigMiles even when exercising your privacy rights

#### How to Submit a Verifiable Consumer Request

To exercise any of the above rights, email **legal@gigmiles.app** with:

- Subject line: "CCPA Request — [Type]" (e.g., "CCPA Request — Know," "CCPA Request — Delete")
- Your full name and account email address
- A clear description of the right you are exercising

#### Verification Process

To protect your data, we verify your identity before fulfilling requests. Verification may require:

- Confirmation of your registered email address
- Confirmation of recent account activity (e.g., most recent entry date)
- For high-risk requests (deletion of all data), additional verification may be required

#### Response Timeline

We will acknowledge your request within **10 business days** and respond substantively within **45 calendar days** of receipt. We may extend this period by an additional 45 days if reasonably necessary, with notice to you.

#### Right of Appeal

If we deny your request in whole or in part, you may appeal by replying to our response email with the subject line "CCPA Appeal." We will respond to appeals within 45 days.

#### Authorized Agent

You may use an authorized agent to submit a request on your behalf. The agent must provide written, signed authorization from you, and we may verify the agent's identity and your authorization directly with you.

### 7.3 Sensitive Personal Information (SPI) Handling

GigMiles collects the following SPI categories as defined by CPRA:

- **Precise geolocation** — captured during GPS shift tracking (§2.5)

We use SPI **only for the purpose of providing the Service** (mileage calculation, trip records, regional fuel price lookup). We do not:

- Use SPI for cross-context behavioral advertising
- Sell SPI
- Share SPI with third parties for non-Service-related purposes
- Profile users based on SPI for legal or significant decisions

Per CPRA §1798.121, you have the right to limit our use of your SPI to what is necessary to provide the Service. To exercise this right, email legal@gigmiles.app with the subject line "CCPA — Limit SPI Use." Note that limiting SPI use will disable GPS-based mileage tracking; you can still log mileage manually.

---

## 8. Data Retention

We retain your data for as long as your account is active. If you delete your account:

- **Primary databases:** All personal data is permanently deleted within **30 days**
- **Automated backups:** Personal data is purged from backup systems within **90 days**
- **Legal acceptance audit log:** Entries are retained per applicable legal requirements (typically up to 7 years for tax-related consent records)
- **Anonymized analytics data:** Aggregated, non-identifying analytics data may be retained indefinitely for product improvement

If you have an active paid subscription at the time of deletion, you may request a final data export before deletion takes effect.

---

## 9. International Users

GigMiles is designed for and offered to **United States residents only**. If you access the Service from outside the United States:

- Your information will be transferred to and processed in the United States
- US privacy laws (which may differ from those in your jurisdiction) will apply
- You acknowledge and consent to this transfer by using the Service

We do not currently offer GDPR-specific opt-in flows, data portability tools, or EU representative services. EU residents should not use the Service. If you are an EU resident who has accidentally accessed the Service, contact legal@gigmiles.app to request account closure.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. When we do:

- **Material changes** will be communicated via in-app notification or email at least **30 days** before taking effect. Material changes include modifications to data categories collected, sub-processor list, retention periods, or user rights.
- **Non-material changes** (typo corrections, formatting, clarifications that do not affect user rights) may take effect immediately upon posting, with notice in the Service.

Your continued use of the Service after changes take effect constitutes your acceptance of the revised policy. If you do not agree to the revised policy, you must stop using the Service before the changes take effect.

---

## 11. Contact Us

If you have questions, complaints, or wish to exercise your privacy rights:

- **General Privacy Inquiries:** legal@gigmiles.app
- **CCPA / CPRA Requests:** legal@gigmiles.app (with subject line "CCPA Request — [Type]")
- **DMCA Notices:** dmca@gigmiles.app
- **General Support:** support@gigmiles.app
- **Mailing Address:**
  GigMiles, Inc.
  2810 N Church St STE 88228
  Wilmington, DE 19802
  United States

We aim to respond to all privacy-related inquiries within **10 business days**.

---

*GigMiles is an independent application and is not affiliated with, endorsed by, or connected to any gig economy platform (Uber, Lyft, DoorDash, Instacart, etc.).*
