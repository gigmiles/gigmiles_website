'use client'

import { useState, useEffect } from 'react'

export function useShiftTimer(startTime: string | null) {
    const [elapsed, setElapsed] = useState(startTime ? '...' : '00:00:00')

    useEffect(() => {
        if (!startTime) return

        const start = new Date(startTime).getTime()

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const diff = now - start

            if (diff < 0) {
                setElapsed('00:00:00')
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    return elapsed
}
