'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Download, RefreshCw } from 'lucide-react'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'
import { DailyData } from '@/app/dashboard/types'
import { toast } from 'sonner'

interface ReportControlsProps {
    data: DailyData[]
}

const PRESETS = [
    { label: 'This Week', getRange: () => ({ start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'Last 7 Days', getRange: () => ({ start: format(subDays(new Date(), 6), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'Last 30 Days', getRange: () => ({ start: format(subDays(new Date(), 29), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'This Month', getRange: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
]

export function ReportControls({ data }: ReportControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const defaultEnd = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
    const defaultStart = searchParams.get('startDate') || format(subDays(new Date(), 6), 'yyyy-MM-dd')

    const [startDate, setStartDate] = useState(defaultStart)
    const [endDate, setEndDate] = useState(defaultEnd)
    const [loading, setLoading] = useState(false)

    const handleFilter = (start?: string, end?: string) => {
        const s = start || startDate
        const e = end || endDate
        if (new Date(s) > new Date(e)) {
            toast.error("Start date cannot be after end date")
            return
        }
        setLoading(true)
        router.push(`/dashboard/reports?startDate=${s}&endDate=${e}`)
        setTimeout(() => setLoading(false), 500)
    }

    const handlePreset = (preset: typeof PRESETS[number]) => {
        const { start, end } = preset.getRange()
        setStartDate(start)
        setEndDate(end)
        handleFilter(start, end)
    }

    const handleExport = () => {
        if (!data || data.length === 0) return

        const headers = ['Date', 'Earnings', 'Expenses', 'Net Profit', 'Miles', 'Depreciation Cost']
        const rows = data.map(item => [
            item.date,
            item.earnings.toFixed(2),
            item.expenses.toFixed(2),
            item.netProfit.toFixed(2),
            item.miles.toFixed(2),
            item.depreciationCost.toFixed(2)
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `gigmiles_report_${startDate}_to_${endDate}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Report exported successfully')
    }

    return (
        <div className="space-y-3">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 px-4 pt-3">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePreset(preset)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Date Inputs + Actions */}
            <div className="flex flex-col md:flex-row gap-6 items-end md:items-center bg-white/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Start Date</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-500 transition-colors">
                                <Calendar className="size-4" />
                            </div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                aria-label="Start date"
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/50 border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">End Date</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-500 transition-colors">
                                <Calendar className="size-4" />
                            </div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                aria-label="End date"
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/50 border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-6">
                    <Button
                        onClick={() => handleFilter()}
                        disabled={loading}
                        className="flex-1 md:flex-none h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                        {loading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Calendar className="mr-2 size-4" />}
                        Update Period
                    </Button>
                    <Button
                        onClick={handleExport}
                        variant="ghost"
                        className="flex-1 md:flex-none h-11 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white font-bold active:scale-95 transition-all"
                    >
                        <Download className="mr-2 size-4" />
                        Export
                    </Button>
                </div>
            </div>
        </div>
    )
}
