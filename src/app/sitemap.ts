import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'

const ORIGIN = 'https://gigmiles.app'

// Static, indexable routes only. Campaign short-links (proxy.ts), the QR
// bridge (/getgigmiles), auth/tiktok callbacks and the local design preview
// are deliberately left out.
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/download', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/ebike', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/cheatsheet', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/delete-account', priority: 0.2, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${ORIGIN}${path}`,
    priority,
    changeFrequency,
  }))
  const posts = BLOG_POSTS.map((post) => ({
    url: `${ORIGIN}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }))
  return [...pages, ...posts]
}
