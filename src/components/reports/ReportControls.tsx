'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Download, RefreshCw } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface ReportControlsProps {
    data: any[]
}

export function ReportControls({ data }: ReportControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Default to last 7 days if not set
    const defaultEnd = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
    const defaultStart = searchParams.get('startDate') || format(subDays(new Date(), 6), 'yyyy-MM-dd')

    const [startDate, setStartDate] = useState(defaultStart)
    const [endDate, setEndDate] = useState(defaultEnd)
    const [loading, setLoading] = useState(false)

    const handleFilter = () => {
        setLoading(true)
        router.push(`/dashboard/reports?startDate=${startDate}&endDate=${endDate}`)
        setTimeout(() => setLoading(false), 500) // visual feedback
    }

    const handleExport = () => {
        if (!data || data.length === 0) return

        // Define CSV Headers
        const headers = ['Date', 'Earnings', 'Expenses', 'Net Profit', 'Miles', 'Depreciation Cost']

        // Convert Data to CSV Rows
        const rows = data.map(item => [
            item.date,
            item.earnings.toFixed(2),
            item.expenses.toFixed(2),
            item.netProfit.toFixed(2),
            item.miles.toFixed(2),
            item.depreciationCost.toFixed(2)
        ])

        // Combine
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        // Download
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `gigtracker_report_${startDate}_to_${endDate}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-border/50 shadow-sm">
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9"
                    />
                </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={handleFilter} disabled={loading} size="sm" className="h-9">
                    {loading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Calendar className="mr-2 size-4" />}
                    Filter
                </Button>
                <Button onClick={handleExport} variant="outline" size="sm" className="h-9 border-slate-300">
                    <Download className="mr-2 size-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    )
}
