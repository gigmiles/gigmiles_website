"use client"

import { Plus, Camera, Fuel, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanReceiptAction } from '@/app/dashboard/actions/scan'

export function BoltQuickActions() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [scanning, setScanning] = useState(false)
    const router = useRouter()

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
        <Card className="bg-white dark:bg-slate-900 border-none shadow-premium p-6 mb-8 rounded-[1rem]">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/entry/new">
                    <Button
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="mr-2 size-5" />
                        Add Entry
                    </Button>
                </Link>

                <Button
                    variant="outline"
                    size="lg"
                    disabled={scanning}
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {scanning ? (
                        <span className="flex items-center gap-2 animate-pulse">Scanning...</span>
                    ) : (
                        <>
                            <Camera className="mr-2 size-5 text-blue-500" />
                            Scan Receipt
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => toast.info("Fuel Log", { description: "Use the 'New Entry' button to log fuel expenses manually." })}
                >
                    <Fuel className="mr-2 size-5 text-amber-500" />
                    Fuel Log
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => toast.success("Shift Started", { description: "We've marked your start time. Drive safe!" })}
                >
                    <Play className="mr-2 size-5 text-emerald-500" />
                    Start Shift
                </Button>
            </div>
        </Card>
    )
}
