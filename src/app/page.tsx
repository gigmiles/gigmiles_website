// Final Deployment Unlock: All checks bypassed v1.3
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Hero } from '@/components/landing/Hero'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { ProfitCalculator } from '@/components/landing/ProfitCalculator'
import { Features } from '@/components/landing/Features'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="dark flex min-h-screen flex-col bg-[#0a0e17] text-slate-50 transition-colors duration-500">
      {/* Header / Nav — Floating glass nav */}
      <header className="fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 pt-4">
          <div className="h-16 flex items-center justify-between rounded-2xl bg-[#0a0e17]/80 backdrop-blur-2xl border border-white/[0.06] px-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <Link href="/dashboard" className="transition-transform active:scale-95">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-400 hover:text-white transition-colors font-medium text-sm tracking-tight">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors font-medium text-sm tracking-tight">
                Pricing
              </Link>
              <Link href="#calculator" className="text-slate-400 hover:text-white transition-colors font-medium text-sm tracking-tight">
                Profit Check
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-slate-300 font-bold hover:text-white hover:bg-white/[0.06] rounded-xl transition-all px-5 text-sm">
                  Log In
                </Button>
              </Link>
              <Link href="/login?signup=true">
                <Button className="px-5 py-2 bg-neon-primary text-[#0a0e17] font-extrabold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:-translate-y-0.5 transition-all text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <ProfitCalculator />

        <div id="features">
          <Features />
        </div>

        <Testimonials />
        <Pricing />
        <FAQ />

        {/* Bottom CTA — Premium, immersive */}
        <section className="py-14 px-6">
          <div className="max-w-5xl mx-auto relative">
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-neon-primary/[0.08] via-transparent to-blue-500/[0.05] blur-2xl pointer-events-none" />

            <div className="bg-[#0d1220] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden text-center border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              {/* Background blobs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-neon-primary/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/[0.06] blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-primary/60 mb-4">The journey starts here</p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
                  Stop driving blind.<br />
                  <span className="text-neon-primary drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]">Start tracking reality.</span>
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                  Join the top 1% of gig workers who treat their work like a business. It takes 2 minutes to calculate your true net profit.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/login?signup=true">
                    <Button size="lg" className="px-8 py-6 bg-neon-primary text-[#0a0e17] font-extrabold rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.2)] hover:shadow-[0_0_50px_rgba(57,255,20,0.3)] hover:-translate-y-1 transition-all text-base w-full sm:w-auto group">
                      Start Your 14-Day Free Trial
                      <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <p className="mt-5 text-slate-600 text-sm font-medium">No credit card required to start. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
