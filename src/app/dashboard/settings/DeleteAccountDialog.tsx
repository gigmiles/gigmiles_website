'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { deleteAccountAction } from './actions'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteAccountDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1) // 1: Confirm, 2: Reason
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason')
            return
        }

        setLoading(true)
        try {
            const res = await deleteAccountAction(reason)
            if (res.success) {
                toast.success('Your data has been deleted')
                router.push('/login')
            } else {
                toast.error(res.error || 'Failed to delete data')
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <Button
                variant="destructive"
                className="rounded-full px-6 font-bold active:scale-95 transition-all"
                onClick={() => setIsOpen(true)}
            >
                Delete Account Data
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-2xl bg-ruby-500/10 text-ruby-600 dark:text-ruby-400">
                            <AlertTriangle className="size-6" />
                        </div>
                        <button
                            onClick={() => { setIsOpen(false); setStep(1); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            aria-label="Close dialog"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Are you absolutely sure?</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This action will permanently delete all your earnings history, vehicle data, and profile information. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 rounded-xl font-bold"
                                    onClick={() => setStep(2)}
                                >
                                    Yes, I'm Sure
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why are you leaving?</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    We're sorry to see you go. Please let us know why you're deleting your data to help us improve.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Tell us more (optional, but helpful)..."
                                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ruby-500/20 transition-all resize-none"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 rounded-xl font-bold"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                        Delete Forever
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
