'use client'

import { useState, useEffect } from 'react'
import { Timer, StopCircle, Loader2 } from 'lucide-react'
import { endShift } from '@/app/dashboard/actions/shift'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ActiveShiftBannerProps {
    shiftId: string
    startTime: string
    platform?: string | null
}

function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function ActiveShiftBanner({ shiftId, startTime, platform }: ActiveShiftBannerProps) {
    const [elapsed, setElapsed] = useState(0)
    const [stopping, setStopping] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const start = new Date(startTime).getTime()
        const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [startTime])

    const handleStop = async () => {
        setStopping(true)
        try {
            await endShift(shiftId)
            toast.success('Shift ended. Don\'t forget to log your earnings!')
            router.push('/dashboard/entry/new')
        } catch {
            toast.error('Failed to end shift. Please try again.')
            setStopping(false)
        }
    }

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/8 px-5 py-4">
            {/* Pulse dot */}
            <div className="relative shrink-0">
                <div className="size-3 rounded-full bg-[#10B981]" />
                <div className="absolute inset-0 size-3 rounded-full bg-[#10B981] animate-ping opacity-60" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">
                        Shift Active
                    </span>
                    {platform && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                            · {platform}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Timer className="size-3.5 text-[#A1A1AA]" />
                    <span className="text-white font-black text-lg font-mono tracking-tighter leading-none">
                        {formatElapsed(elapsed)}
                    </span>
                </div>
            </div>

            {/* Stop button */}
            <button
                onClick={handleStop}
                disabled={stopping}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
                {stopping
                    ? <Loader2 className="size-4 animate-spin" />
                    : <StopCircle className="size-4" />
                }
                {stopping ? 'Stopping...' : 'End Shift'}
            </button>
        </div>
    )
}
