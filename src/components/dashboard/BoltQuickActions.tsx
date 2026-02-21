"use client"

import { Plus, RefreshCw, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { scanReceiptAction } from '@/app/dashboard/actions/scan'
import { getActiveShift, startShift, endShift } from '@/app/dashboard/actions/shift'
import { useShiftTimer } from '@/hooks/useShiftTimer'

interface Shift {
    id: string
    start_time: string
    end_time?: string
    user_id?: string
}

export function BoltQuickActions() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [scanning, setScanning] = useState(false)
    const [activeShift, setActiveShift] = useState<Shift | null>(null)
    const [isShiftPending, setIsShiftPending] = useState(false)
    const [isStartModalOpen, setIsStartModalOpen] = useState(false)
    const router = useRouter()

    const elapsed = useShiftTimer(activeShift?.start_time || null)


    useEffect(() => {
        const fetchShift = async () => {
            const shift = await getActiveShift()
            if (shift) setActiveShift(shift)
        }
        fetchShift()
    }, [])

    const handleStartShift = useCallback(async () => {
        setIsShiftPending(true)
        try {
            const result = await startShift()
            if (result.success) {
                setActiveShift(result.shift)
                setIsStartModalOpen(false)
                toast.success("Shift Started", { description: "Drive safe!" })
            }
        } catch {
            toast.error("Failed to start shift")
        } finally {
            setIsShiftPending(false)
        }
    }, [])

    const handleEndShift = useCallback(async () => {
        if (!activeShift) return
        setIsShiftPending(true)
        try {
            const result = await endShift(activeShift.id)
            if (result.success) {
                const startTime = new Date(activeShift.start_time)
                const endTime = new Date()
                const hours = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)

                setActiveShift(null)
                toast.success("Shift Ended", { description: `You worked ${hours} hours.` })

                // Redirect to new entry with pre-filled hours
                router.push(`/dashboard/entry/new?hours=${hours}`)
            }
        } catch {
            toast.error("Failed to end shift")
        } finally {
            setIsShiftPending(false)
        }
    }, [activeShift, router])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setScanning(true)
        const toastId = toast.loading("Processing receipt with Gemini AI...")

        const formData = new FormData()
        formData.append('file', file)

        try {
            const result = await scanReceiptAction(formData)

            if (result.success && result.data) {
                toast.success("Receipt scanned!", { id: toastId })

                // Store data in sessionStorage to pass to the New Entry page
                sessionStorage.setItem('scannedReceipt', JSON.stringify(result.data))

                router.push('/dashboard/entry/new')
            } else {
                toast.error("Could not read receipt.", { id: toastId })
            }
        } catch {
            toast.error("Error scanning receipt", { id: toastId })
        } finally {
            setScanning(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Suppress unused warnings for variables kept for future implementation/disabled features
    // Suppress unused warnings for variables kept for future implementation/disabled features
    useEffect(() => {
        (void scanning);
        (void elapsed);
        (void setScanning);
    }, [scanning, elapsed, setScanning]);

    return (
        <div className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden group mb-8">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Upload receipt"
            />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Rapid Workflow</h3>
                    <p className="text-xs text-slate-500 font-medium font-sans">Quick access tools</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/dashboard/entry/earnings" className="w-full">
                    <Button
                        size="lg"
                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <div className="p-1.5 rounded-lg bg-white/20 transition-transform group-hover/btn:rotate-90">
                            <Plus className="size-5" />
                        </div>
                        Add Earnings
                    </Button>
                </Link>

                {activeShift ? (
                    <Button
                        variant="outline"
                        size="lg"
                        disabled={isShiftPending}
                        onClick={handleEndShift}
                        className="w-full h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 text-amber-600 dark:text-amber-500 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    >
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-500 group-hover/btn:scale-110 transition-transform">
                            {isShiftPending ? (
                                <RefreshCw className="size-5 animate-spin" />
                            ) : (
                                <Pause className="size-5 fill-current" />
                            )}
                        </div>
                        End Shift
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="lg"
                        disabled={isShiftPending}
                        onClick={() => setIsStartModalOpen(true)}
                        className="w-full h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 text-blue-600 dark:text-blue-500 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    >
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-500 group-hover/btn:scale-110 transition-transform">
                            {isShiftPending ? (
                                <RefreshCw className="size-5 animate-spin" />
                            ) : (
                                <Play className="size-5 fill-current" />
                            )}
                        </div>
                        Start Shift
                    </Button>
                )}

                {/* TEMPORARILY DISABLED: Receipt scanning feature
                <Button
                    variant="outline"
                    size="lg"
                    disabled={scanning}
                    className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-100 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {scanning ? (
                        <span className="flex items-center gap-2">
                            <RefreshCw className="size-4 animate-spin" />
                            Scanning...
                        </span>
                    ) : (
                        <>
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover/btn:scale-110 transition-transform">
                                <Camera className="size-5" />
                            </div>
                            Scan Receipt
                        </>
                    )}
                </Button>
                */}

                <Link href="/dashboard/entry/expense" className="w-full">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-500 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    >
                        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-500 group-hover/btn:scale-110 transition-transform">
                            <Plus className="size-5" />
                        </div>
                        Add Expense
                    </Button>
                </Link>

                <Link href="/dashboard/reports" className="w-full">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    >
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover/btn:scale-110 transition-transform">
                            <RefreshCw className="size-5" />
                        </div>
                        Reports
                    </Button>
                </Link>
            </div>

            <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start New Shift?</DialogTitle>
                        <DialogDescription>
                            This will track your overall time for the current driving session. You can later log your individual platform earnings and match them to this shift.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsStartModalOpen(false)}
                            disabled={isShiftPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleStartShift}
                            disabled={isShiftPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isShiftPending ? "Starting..." : "Yes, Start Shift"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
