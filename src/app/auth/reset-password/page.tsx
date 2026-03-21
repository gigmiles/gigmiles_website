'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, ArrowRight, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Password updated successfully!')
            router.push('/login')
            router.refresh()
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 animate-fade-in-up">
                    <div className="p-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/30 mb-4">
                        <Car className="size-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter text-white mb-2 italic">
                        GigMiles
                    </h1>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up [animation-delay:200ms]">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                        <p className="text-slate-400 text-sm">Please enter a secure password for your account.</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">New Password</label>
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

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95 group"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 size-5 animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center">
                                    Update Password
                                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
