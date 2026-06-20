'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[GlobalError]', error)
    }, [error])

    return (
        <html lang="en">
            <body className="bg-[#0E4F4F] flex items-center justify-center min-h-screen p-6">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-4xl font-black text-white">Something went wrong</p>
                    <p className="text-sm text-zinc-400">{error.message || 'An unexpected error occurred.'}</p>
                    <Button
                        onClick={reset}
                        className="bg-[#5EEAD4] hover:bg-[#5EEAD4] text-white font-bold px-8 rounded-full"
                    >
                        Try Again
                    </Button>
                </div>
            </body>
        </html>
    )
}
