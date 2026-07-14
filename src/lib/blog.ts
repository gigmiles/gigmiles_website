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
