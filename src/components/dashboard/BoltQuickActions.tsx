"use client"

import { Plus, Camera, Fuel, Play, RefreshCw, Square, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { scanReceiptAction } from '@/app/dashboard/actions/scan'
import { getActiveShift, startShift, endShift } from '@/app/dashboard/actions/shift'
import { useShiftTimer } from '@/hooks/useShiftTimer'

export function BoltQuickActions() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [scanning, setScanning] = useState(false)
    const [activeShift, setActiveShift] = useState<any>(null)
    const [isShiftPending, setIsShiftPending] = useState(false)
    const router = useRouter()

    const elapsed = useShiftTimer(activeShift?.start_time)

    useEffect(() => {
        const fetchShift = async () => {
            const shift = await getActiveShift()
            if (shift) setActiveShift(shift)
        }
        fetchShift()
    }, [])

    const handleStartShift = async () => {
        setIsShiftPending(true)
        try {
            const result = await startShift()
            if (result.success) {
                setActiveShift(result.shift)
                toast.success("Shift Started", { description: "Drive safe!" })
            }
        } catch (error) {
            toast.error("Failed to start shift")
        } finally {
            setIsShiftPending(false)
        }
    }

    const handleEndShift = async () => {
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
        } catch (error) {
            toast.error("Failed to end shift")
        } finally {
            setIsShiftPending(false)
        }
    }

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
        } catch (error) {
            console.error(error)
            toast.error("Error scanning receipt", { id: toastId })
        } finally {
            setScanning(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden group mb-8">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Rapid Workflow</h3>
                    <p className="text-xs text-slate-500 font-medium font-sans">Quick access tools</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/entry/new" className="w-full">
                    <Button
                        size="lg"
                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <div className="p-1.5 rounded-lg bg-white/20 transition-transform group-hover/btn:rotate-90">
                            <Plus className="size-5" />
                        </div>
                        Add Shift
                    </Button>
                </Link>

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

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-100 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                    onClick={() => toast.info("Fuel Log", { description: "Use the 'New Entry' button to log fuel expenses manually." })}
                >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover/btn:scale-110 transition-transform">
                        <Fuel className="size-5" />
                    </div>
                    Fuel Log
                </Button>

                {activeShift ? (
                    <Button
                        variant="outline"
                        size="lg"
                        disabled={isShiftPending}
                        className="w-full h-14 rounded-2xl bg-ruby-500/10 border border-ruby-500/20 hover:bg-ruby-500/20 hover:border-ruby-500/30 text-ruby-500 font-black active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 group/btn backdrop-blur-md relative overflow-hidden"
                        onClick={handleEndShift}
                    >
                        <div className="absolute inset-0 bg-ruby-500/5 animate-pulse pointer-events-none" />
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-ruby-500/20 text-ruby-500 group-hover/btn:scale-110 transition-transform">
                                <Square className="size-4 fill-current" />
                            </div>
                            <span className="text-sm">End Shift</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono opacity-80">
                            <Clock className="size-3" />
                            {elapsed}
                        </div>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="lg"
                        disabled={isShiftPending}
                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-100 font-bold active:scale-95 transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-md"
                        onClick={handleStartShift}
                    >
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover/btn:scale-110 transition-transform">
                            <Play className="size-5" />
                        </div>
                        Start Shift
                    </Button>
                )}
            </div>
        </div>
    )
}
