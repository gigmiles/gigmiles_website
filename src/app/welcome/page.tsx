import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Star } from 'lucide-react'
import { VibeLogo } from '@/components/brand/VibeLogo'
import { MagneticCTA } from '@/components/ui/MagneticCTA'
import { createClient } from '@/utils/supabase/server'

export default async function WelcomeScreen() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let memberNumber: number | null = null
    let isFoundingMember = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('member_number')
            .eq('id', user.id)
            .single()

        memberNumber = profile?.member_number ?? null
        isFoundingMember = memberNumber !== null && memberNumber <= 500
    }

    return (
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* NOISE & BLOBS */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-fade-in-up space-y-10">
                <VibeLogo />

                {/* Member Number Badge */}
                {memberNumber && (
                    <div className="flex flex-col items-center gap-3">
                        <div className={`px-8 py-4 rounded-2xl border font-black text-3xl tracking-tighter ${
                            isFoundingMember
                                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                                : 'bg-white/5 border-white/10 text-white'
                        }`}>
                            Member #{memberNumber.toString().padStart(4, '0')}
                        </div>
                        {isFoundingMember && (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                <Star className="size-3 fill-amber-500" />
                                Founding Member · 1 Year Free
                            </div>
                        )}
                    </div>
                )}

                <div className="size-24 bg-[#10B981]/10 rounded-[2rem] flex items-center justify-center border border-[#10B981]/20 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="size-12 text-[#10B981]" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic text-white leading-[0.9]">
                        {isFoundingMember ? (
                            <>YOU&apos;RE <br /> IN.</>
                        ) : (
                            <>ACCOUNT <br /> VERIFIED.</>
                        )}
                    </h1>
                    <p className="text-lg text-[#A1A1AA] leading-relaxed font-medium max-w-sm mx-auto">
                        {isFoundingMember
                            ? `Welcome to GigMiles, Founding Member #${memberNumber}. Your 1 year of free access starts now. Thank you for being here early.`
                            : "Welcome to GigMiles. Your email has been successfully verified. You're ready to start maximizing your gig economy earnings."
                        }
                    </p>
                </div>

                <Link href="/dashboard" className="w-full">
                    <MagneticCTA>
                        <Button className="w-full h-20 bg-[#10B981] text-black text-xl font-black rounded-[2rem] uppercase tracking-tighter hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 group">
                            Continue to App
                            <ArrowRight className="ml-3 size-6 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </MagneticCTA>
                </Link>
            </div>
        </div>
    )
}
