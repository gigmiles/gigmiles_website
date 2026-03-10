'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ExportButtonProps {
    dailyData: {
        date: string
        earnings: number
        netProfit: number
        miles: number
        expenses?: number
    }[]
    platformData: {
        name: string
        value: number
        hours: number
        gross: number
        hourlyRate: number
        earningsPerMile: number
        tipPct: number
    }[]
}

function generateCSV(dailyData: ExportButtonProps['dailyData'], platformData: ExportButtonProps['platformData']): string {
    const lines: string[] = []

    // --- Daily Performance Section ---
    lines.push('=== DAILY PERFORMANCE ===')
    lines.push('Date,Gross Earnings ($),Net Profit ($),Miles,Expenses ($)')

    for (const day of dailyData) {
        const expenses = day.expenses ?? (day.earnings - day.netProfit)
        lines.push(
            `${day.date},${day.earnings.toFixed(2)},${day.netProfit.toFixed(2)},${day.miles.toFixed(1)},${expenses.toFixed(2)}`
        )
    }

    // Totals
    const totalGross = dailyData.reduce((a, d) => a + d.earnings, 0)
    const totalNet = dailyData.reduce((a, d) => a + d.netProfit, 0)
    const totalMiles = dailyData.reduce((a, d) => a + d.miles, 0)
    const totalExpenses = totalGross - totalNet
    lines.push(`TOTAL,${totalGross.toFixed(2)},${totalNet.toFixed(2)},${totalMiles.toFixed(1)},${totalExpenses.toFixed(2)}`)
    lines.push('')

    // --- Platform Breakdown Section ---
    lines.push('=== PLATFORM BREAKDOWN ===')
    lines.push('Platform,Gross ($),Hours,$/hr,$/mile,Tip %')

    for (const plat of platformData) {
        lines.push(
            `${plat.name},${plat.gross.toFixed(2)},${plat.hours.toFixed(1)},${plat.hourlyRate.toFixed(2)},${plat.earningsPerMile.toFixed(2)},${plat.tipPct.toFixed(1)}`
        )
    }

    lines.push('')

    // --- Tax Deduction Summary ---
    const irsDeduction = totalMiles * 0.67
    lines.push('=== TAX DEDUCTION SUMMARY ===')
    lines.push(`Total Miles,${totalMiles.toFixed(1)}`)
    lines.push(`IRS Standard Rate,0.67`)
    lines.push(`Estimated Mileage Deduction ($),${irsDeduction.toFixed(2)}`)

    return lines.join('\n')
}

export function ExportButton({ dailyData, platformData }: ExportButtonProps) {
    const handleExport = () => {
        try {
            const csv = generateCSV(dailyData, platformData)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)

            const today = new Date().toISOString().split('T')[0]
            const link = document.createElement('a')
            link.href = url
            link.download = `gigmiles_report_${today}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success('Report exported successfully!')
        } catch {
            toast.error('Failed to export report.')
        }
    }

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            className="h-9 px-4 gap-2 text-xs font-bold bg-white/[0.03] border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all active:scale-95"
        >
            <Download className="size-3.5" />
            Export CSV
        </Button>
    )
}
