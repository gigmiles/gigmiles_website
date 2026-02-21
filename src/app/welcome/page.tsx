import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

export default function WelcomeScreen() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-fade-in-up">
                <Logo className="mb-12 scale-125" />

                <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="size-10 text-emerald-400" />
                </div>

                <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-4">
                    Account Verified
                </h1>

                <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                    Welcome to GigMiles. Your email has been successfully verified.
                    You're ready to start maximizing your gig economy earnings.
                </p>

                <div className="space-y-4 w-full">
                    <Link href="/dashboard" className="w-full block">
                        <Button className="w-full h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all group">
                            Continue to App
                            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
