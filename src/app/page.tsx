import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Footer } from '@/components/landing/Footer'
import { Wallet } from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log("[LandingPage] Auth user id:", user?.id)
  if (user) {
    console.log("[LandingPage] User is authenticated, redirecting to /dashboard")
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tighter text-slate-900 dark:text-white italic">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg shadow-emerald-500/10 shadow-sm">
              <Wallet className="size-6 text-emerald-500" />
            </div>
            GigMiles
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/login?signup=true" className="text-sm font-medium bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  )
}
