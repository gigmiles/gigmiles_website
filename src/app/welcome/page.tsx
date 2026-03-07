import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { VibeLogo } from '@/components/brand/VibeLogo'

export default function WelcomeScreen() {
    return (
        <div className="min-h-screen bg-[#0D0F14] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Vibe Ambient Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-fade-in-up space-y-10">
                <VibeLogo />

                <div className="size-24 bg-[#10B981]/10 rounded-[2rem] flex items-center justify-center border border-[#10B981]/20 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="size-12 text-[#10B981]" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic text-white leading-[0.9]">
                        ACCOUNT <br /> VERIFIED.
                    </h1>
                    <p className="text-lg text-[#A1A1AA] leading-relaxed font-medium max-w-sm mx-auto">
                        Welcome to GigMiles. Your email has been successfully verified.
                        You&apos;re ready to start maximizing your gig economy earnings.
                    </p>
                </div>

                <Link href="/dashboard" className="w-full">
                    <Button className="w-full h-20 bg-[#10B981] text-black text-xl font-black rounded-[2rem] uppercase tracking-tighter hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 group">
                        Continue to App
                        <ArrowRight className="ml-3 size-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
