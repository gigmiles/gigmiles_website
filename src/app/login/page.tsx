'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { VibeLogo } from '@/components/brand/VibeLogo'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MagneticCTA } from '@/components/ui/MagneticCTA'
import { signIn as signInAction, signUp as signUpAction } from '@/app/auth/actions'

function LoginContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isResetMode, setIsResetMode] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const error = searchParams.get('error')
        const signup = searchParams.get('signup')

        if (error === 'auth-callback-error') {
            toast.error('Authentication failed. Please try signing in again.')
        }

        if (signup === 'true') {
            setIsSignUp(true)
        }
    }, [searchParams])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error('Please enter your email address')
            return
        }
        setLoading(true)

        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        })

        if (error) {
            if (error.message.includes('rate limit') || error.code === 'rate_limit') {
                toast.error('Too many requests. Please wait a few minutes before trying again.')
            } else {
                toast.error(error.message)
            }
        } else {
            toast.success('Password reset link sent to your email.')
            setIsResetMode(false)
        }
        setLoading(false)
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (isSignUp) {
            const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
            const result = await signUpAction({ email, password, redirectTo })

            if (result.error) {
                if (result.error.includes('rate limit')) {
                    toast.error('Email limit exceeded. Please try again later or contact support.')
                } else {
                    toast.error(result.error)
                }
                setLoading(false)
            } else {
                toast.success('Check your email for the confirmation link.')
                setLoading(false)
            }
        } else {
            const result = await signInAction({ email, password })

            if (result.error) {
                if (result.error.includes('rate limit')) {
                    toast.error('Too many sign-in attempts. Please wait a moment.')
                } else {
                    toast.error(result.error)
                }
                setLoading(false)
            } else {
                toast.success('Sign in successful!')
                window.location.href = '/dashboard'
            }
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0B1120]">
            {/* Vibe Ambient Blobs & Cinematic Noise */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[5%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[5%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Branding — Vibe Style */}
                <div className="flex flex-col items-center mb-10 animate-fade-in-up">
                    <Link href="/" className="transition-transform active:scale-95">
                        <VibeLogo className="mb-4" />
                    </Link>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA] opacity-60">
                        Earnings Performance Platform
                    </p>
                </div>

                {/* Auth Card — Glassmorphic Vibe */}
                <div className="backdrop-blur-3xl bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] animate-fade-in-up [animation-delay:200ms]">
                    {!isResetMode ? (
                        <>
                            {/* Tab Switcher — Vibe Style */}
                            <div className="flex gap-2 mb-8 p-1.5 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                                <button
                                    onClick={() => setIsSignUp(false)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-[#10B981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-[#A1A1AA] hover:text-white'}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsSignUp(true)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 ${isSignUp ? 'bg-[#10B981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-[#A1A1AA] hover:text-white'}`}
                                >
                                    Create Account
                                </button>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA] ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA]/40 group-focus-within:text-[#10B981] transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 focus:border-[#10B981]/30 transition-all text-sm font-medium"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA]/40 group-focus-within:text-[#10B981] transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 focus:border-[#10B981]/30 transition-all text-sm font-medium"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {!isSignUp && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#10B981] transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <MagneticCTA>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 rounded-2xl bg-[#10B981] text-black text-lg font-black uppercase tracking-tighter shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 group"
                                    >
                                        {loading ? (
                                            <Loader2 className="size-6 animate-spin" />
                                        ) : (
                                            <>
                                                {isSignUp ? 'Create Account' : 'Sign In'}
                                                <ArrowRight className="ml-3 size-5 group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </MagneticCTA>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Reset Password</h2>
                                <p className="text-[#A1A1AA] text-sm font-medium">Enter your email and we&apos;ll send you a reset link.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA] ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA]/40 group-focus-within:text-[#10B981] transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 focus:border-[#10B981]/30 transition-all text-sm font-medium"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <MagneticCTA>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 rounded-2xl bg-[#10B981] text-black text-lg font-black uppercase tracking-tighter shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                    >
                                        {loading ? <Loader2 className="size-6 animate-spin" /> : 'Send Reset Link'}
                                    </Button>
                                </MagneticCTA>

                                <button
                                    type="button"
                                    onClick={() => setIsResetMode(false)}
                                    className="w-full text-[#A1A1AA] hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors py-2"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-[#0B1120]/0 text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/40">Or</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-14 border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/[0.12] rounded-2xl font-black uppercase tracking-tighter text-sm transition-all">
                        <svg className="mr-3 size-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        Github
                    </Button>

                    <p className="mt-8 text-center text-[#A1A1AA]/40 text-[9px] font-bold uppercase tracking-widest">
                        By continuing, you agree to our{' '}
                        <button className="text-[#A1A1AA]/60 hover:text-[#10B981] transition-colors">Terms</button>
                        {' '}&{' '}
                        <button className="text-[#A1A1AA]/60 hover:text-[#10B981] transition-colors">Privacy</button>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <Loader2 className="size-10 text-[#10B981] animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
