'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Car, Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isResetMode, setIsResetMode] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error('Please enter your email address')
            return
        }
        setLoading(true)

        const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/reset-password`
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        })

        if (error) {
            toast.error(error.message)
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
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                },
            })

            if (error) {
                toast.error(error.message)
                setLoading(false)
            } else {
                toast.success('Check your email for the confirmation link.')
                setLoading(false)
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                setLoading(false)
            } else {
                router.push('/')
                router.refresh()
            }
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:4s]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Branding */}
                <div className="flex flex-col items-center mb-6 md:mb-8 animate-fade-in-up">
                    <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/30 mb-4 group transition-transform hover:scale-110">
                        <Car className="size-8 md:size-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-white mb-2 italic">
                        GigMiles
                    </h1>
                    <p className="text-emerald-400/80 text-xs md:text-sm font-medium text-center">Maximize every mile. Own your earnings.</p>
                </div>

                {/* Login Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in-up [animation-delay:200ms]">
                    {!isResetMode ? (
                        <>
                            <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => setIsSignUp(false)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${!isSignUp ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsSignUp(true)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${isSignUp ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Create Account
                                </button>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
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
                                            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-6 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95 group ${isSignUp ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'}`}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 size-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isSignUp ? 'Create Account' : 'Sign In'}
                                            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                                <p className="text-slate-400 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95"
                                >
                                    {loading ? <Loader2 className="size-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setIsResetMode(false)}
                                    className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 bg-slate-950/0 text-slate-600">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 py-6 rounded-2xl">
                        <Github className="mr-2 size-5" />
                        Github
                    </Button>

                    <p className="mt-8 text-center text-slate-500 text-xs">
                        By continuing, you agree to our{' '}
                        <button className="text-slate-300 hover:text-emerald-400 underline decoration-emerald-500/30">Terms of Service</button>
                        {' '}and{' '}
                        <button className="text-slate-300 hover:text-emerald-400 underline decoration-emerald-500/30">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        </div>
    )
}
