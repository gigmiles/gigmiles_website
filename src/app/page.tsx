// Final Deployment Unlock: All checks bypassed v1.3
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Footer } from '@/components/landing/Footer'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-slate-600 dark:text-slate-300 hover:text-neon-primary transition-colors font-semibold text-sm tracking-tight">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-neon-primary transition-colors font-semibold text-sm tracking-tight">
              Pricing
            </Link>
            <Link href="#resources" className="text-slate-600 dark:text-slate-300 hover:text-neon-primary transition-colors font-semibold text-sm tracking-tight">
              Resources
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex text-navy-dark dark:text-white font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all px-6">
                Log In
              </Button>
            </Link>
            <Link href="/login?signup=true">
              <Button className="px-6 py-2.5 bg-electric-blue text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <HowItWorks />

        {/* CTA Section from user example */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-slate-950 dark:bg-slate-900 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-primary/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-electric-blue/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
                Ready to grow your profit?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join the top 1% of gig workers who treat their work like a business. Start your 30-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login?signup=true">
                  <Button size="lg" className="px-10 py-7 bg-neon-primary text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-neon-primary/20 hover:bg-neon-primary/90 transition-all text-lg">
                    Claim My Free Account
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="px-10 py-7 bg-white/5 text-white font-extrabold rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-slate-500 text-sm font-medium">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
