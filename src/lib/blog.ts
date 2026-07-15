import fs from 'fs'
import path from 'path'

// Post metadata lives here (single registry, newest first); bodies live as
// markdown in src/content/blog/<slug>.md — same single-source pattern as the
// legal pages. Add a new post by dropping the .md file and one entry here.
export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string // ISO, publication date
  readingMinutes: number
  tag: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'irs-mileage-rate-2026-76-cents-july',
    title:
      'The IRS Raised the 2026 Mileage Rate to 76¢ (Effective July 1): What Gig Drivers Need to Know',
    description:
      'The IRS raised the business standard mileage rate to 76 cents per mile on July 1, 2026 (up from 72.5 cents). Here’s what the rare mid-year change means for gig drivers — and why 2026 has two mileage rates you have to track separately.',
    date: '2026-07-15',
    readingMinutes: 5,
    tag: 'Taxes',
  },
  {
    slug: 'e-bike-delivery-profit-tax',
    title: 'E-Bike Delivery Profit: What Couriers Actually Keep After Costs & Taxes',
    description:
      'Is e-bike delivery profitable? How e-bike couriers calculate true net profit, track unique costs like electricity and battery wear, and correctly handle tax deductions — there’s no IRS standard mileage rate for bikes.',
    date: '2026-07-15',
    readingMinutes: 6,
    tag: 'E-Bike',
  },
  {
    slug: 'how-to-choose-gig-driver-tracker',
    title: 'How to Choose a Gig-Driver Income & Tax Tracker (and What Most Get Wrong)',
    description:
      'Most "gig apps" just log miles and add up your gross. Eight questions that separate a real net-profit tracker from a glorified odometer — including the e-bike trap most of them miss.',
    date: '2026-07-14',
    readingMinutes: 6,
    tag: 'Tools',
  },
  {
    slug: 'real-hourly-wage-gig-driver',
    title: 'Your Real Hourly Wage as a Gig Driver (the App Number Isn’t It)',
    description:
      'The app shows $29 an hour; your take-home is closer to $22. How to find your real hourly wage and cost per mile — and use them to decide which orders are actually worth taking.',
    date: '2026-07-14',
    readingMinutes: 5,
    tag: 'Driver Math',
  },
  {
    slug: 'gross-pay-vs-real-profit',
    title: 'Gross Pay vs Real Profit: What Gig Drivers Actually Keep',
    description:
      'Your app says you made $235. The real number is smaller. A five-minute walkthrough of the real-profit formula, the expenses drivers forget, and the recordkeeping checklist that makes tax season a handoff.',
    date: '2026-07-08',
    readingMinutes: 4,
    tag: 'Driver Math',
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getPostMarkdown(slug: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), 'src/content/blog', `${slug}.md`),
    'utf8',
  )
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
