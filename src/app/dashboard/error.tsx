'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[DashboardError]', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="text-center space-y-4 max-w-md">
                <div className="flex justify-center">
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="size-8 text-red-400" />
                    </div>
                </div>
                <p className="text-xl font-black text-white">Dashboard Error</p>
                <p className="text-sm text-zinc-400">{error.message || 'Failed to load dashboard data.'}</p>
                <Button
                    onClick={reset}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 rounded-full"
                >
                    Reload Dashboard
                </Button>
            </div>
        </div>
    )
}
