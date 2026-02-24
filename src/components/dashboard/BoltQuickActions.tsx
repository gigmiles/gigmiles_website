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
import { PlatformEarning, Vehicle } from '@/app/dashboard/types'
import { useShiftTimer } from '@/hooks/useShiftTimer'

interface Shift {
    id: string
    start_time: string
    end_time?: string
    user_id?: string
}

interface BoltQuickActionsProps {
    vehicles?: Vehicle[]
    activeVehicleId?: string | null
    stateCode?: string
}

export function BoltQuickActions({
    vehicles = [],
    activeVehicleId: propActiveVehicleId,
    stateCode
}: BoltQuickActionsProps) {
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
        <>
            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Upload receipt"
                />

                <Link href="/dashboard/entry/earnings">
                    <Button
                        size="sm"
                        className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/15 font-bold active:scale-95 transition-all text-xs gap-1.5 px-4"
                    >
                        <Plus className="size-3.5" />
                        Add Earnings
                    </Button>
                </Link>

                {activeShift ? (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isShiftPending}
                        onClick={handleEndShift}
                        className="h-9 rounded-xl bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-500 font-bold active:scale-95 transition-all text-xs gap-1.5 px-4"
                    >
                        {isShiftPending ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                            <Pause className="size-3.5 fill-current" />
                        )}
                        End Shift
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isShiftPending}
                        onClick={() => setIsStartModalOpen(true)}
                        className="h-9 rounded-xl bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-500 font-bold active:scale-95 transition-all text-xs gap-1.5 px-4"
                    >
                        {isShiftPending ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                            <Play className="size-3.5 fill-current" />
                        )}
                        Start Shift
                    </Button>
                )}

                <Link href="/dashboard/entry/expense">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold active:scale-95 transition-all text-xs gap-1.5 px-4"
                    >
                        <Plus className="size-3.5" />
                        Expense
                    </Button>
                </Link>

                <Link href="/dashboard/reports">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold active:scale-95 transition-all text-xs gap-1.5 px-4"
                    >
                        <RefreshCw className="size-3.5" />
                        Reports
                    </Button>
                </Link>
            </div>

            <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start New Shift?</DialogTitle>
                        <DialogDescription className="space-y-4">
                            <p>
                                This will track your overall time for the current driving session. You can later log your individual platform earnings and match them to this shift.
                            </p>

                            <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Shift Configuration</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">Active Vehicle</span>
                                    <span className="text-slate-900 dark:text-white font-extrabold">
                                        {vehicles.find(v => v.id === propActiveVehicleId)?.make} {vehicles.find(v => v.id === propActiveVehicleId)?.model || 'Primary Vehicle'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">Operating State</span>
                                    <span className="text-slate-900 dark:text-white font-extrabold">{stateCode || 'Default'}</span>
                                </div>
                            </div>
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
        </>
    )
}
