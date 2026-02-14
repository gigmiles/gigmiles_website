import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
        <div className="text-xl font-bold text-emerald-600">GigTracker</div>
        <Link href="/login">
          <Button variant="outline" size="sm">Log In</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Keep More of What <br /> <span className="text-emerald-600">You Earn</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10">
          The ultimate earnings tracker for gig workers. optimize your miles, track expenses, and maximize your net profit.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Button variant="outline" size="lg">View Demo</Button>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm">
        © 2026 GigTracker Inc.
      </footer>
    </div>
  )
}
