import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calculator, ShieldCheck, Zap, Car, TrendingUp } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-emerald-500/30 selection:text-emerald-900">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Calculator className="size-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">GigTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log In
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full bg-slate-900 px-6 font-semibold shadow-lg hover:bg-slate-800">
                Join Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest animate-fade-in">
          <Zap className="size-3" />
          Powered by Smart Analytics
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8 max-w-4xl animate-slide-up">
          Maximize Your <span className="relative inline-block">
            <span className="relative z-10 text-emerald-600 italic">Net Profit</span>
            <span className="absolute bottom-2 left-0 h-4 w-full bg-emerald-500/10 -rotate-1" />
          </span> in the Gig Economy
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mb-12 animate-slide-up [animation-delay:200ms]">
          A professional-grade earnings tracker built for DoorDashers, Uber drivers, and gig workers who want to automate their tax projections and mileage tracking.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up [animation-delay:400ms]">
          <Link href="/login">
            <Button size="lg" className="rounded-full bg-emerald-600 px-8 text-lg font-bold shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 group">
              Start Scaling Free
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="rounded-full px-8 text-lg font-semibold border-slate-200 hover:bg-white/50 transition-colors">
            Explore Demo
          </Button>
        </div>

        {/* Social Proof / Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl animate-fade-in [animation-delay:600ms]">
          <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
            <ShieldCheck className="size-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Automated Tax Reserve</h3>
            <p className="text-sm text-slate-600">Know exactly how much to set aside for federal SE and state taxes after every shift.</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
            <Car className="size-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Smart Mileage Tracking</h3>
            <p className="text-sm text-slate-600">Full integration with 2025 IRS standard mileage rates to maximize your legal deductions.</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
            <TrendingUp className="size-8 text-amber-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Efficiency Scoring</h3>
            <p className="text-sm text-slate-600">See which platforms are paying you the most per hour and per mile in real-time.</p>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border/40 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-emerald-600" />
            <span className="font-display font-bold">GigTracker</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 GigTracker Inc. Built for professional precision.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-slate-900">Privacy</Link>
            <Link href="#" className="hover:text-slate-900">Terms</Link>
            <Link href="#" className="hover:text-slate-900">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
