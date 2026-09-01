'use client'

import { useEffect } from 'react'

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
            <body className="bg-[#0b302b] flex items-center justify-center min-h-screen p-6">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-4xl font-black text-white">Something went wrong</p>
                    <p className="text-sm text-zinc-400">{error.message || 'An unexpected error occurred.'}</p>
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#bff4ce] px-8 py-3 font-bold text-[#0b302b] transition-colors hover:bg-[#c9e8bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bff4ce]"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
