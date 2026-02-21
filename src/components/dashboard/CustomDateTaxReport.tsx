'use client'

import { useState, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { DateRangePicker } from './DateRangePicker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTaxForDateRange } from '@/app/dashboard/tax/actions'
import { Loader2, Calculator } from 'lucide-react'

interface TaxData {
    gross: number;
    expenses: number;
    miles: number;
    estimatedTax: number;
    netProfit: number;
}

export function CustomDateTaxReport() {
    const [date, setDate] = useState<DateRange | undefined>()
    const [loading, setLoading] = useState(false)
    const [taxData, setTaxData] = useState<TaxData | null>(null)

    useEffect(() => {
        async function loadData() {
            if (date?.from && date?.to) {
                setLoading(true)
                try {
                    const data = await getTaxForDateRange(
                        format(date.from, 'yyyy-MM-dd'),
                        format(date.to, 'yyyy-MM-dd')
                    )
                    setTaxData(data)
                } catch (error) {
                    console.error("Failed to load tax data", error)
                } finally {
                    setLoading(false)
                }
            } else {
                setTaxData(null)
            }
        }
        loadData()
    }, [date])

    return (
        <Card className="border-border/50 shadow-premium">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Calculator className="size-5 text-blue-500" />
                        Custom Date Range Report
                    </CardTitle>
                    <CardDescription>
                        Calculate estimated taxes and profit for a specific period.
                    </CardDescription>
                </div>
                <DateRangePicker date={date} setDate={setDate} />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="size-8 animate-spin text-slate-400" />
                    </div>
                ) : taxData ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4">
                        <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Earnings</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${taxData.gross.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Expenses</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${taxData.expenses.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Profit</p>
                            <p className="text-2xl font-bold text-emerald-600">${taxData.netProfit.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Est. Tax Liability</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">${taxData.estimatedTax.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center py-12 text-center text-muted-foreground bg-slate-50 dark:bg-slate-900/20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Calculator className="size-12 mb-4 text-slate-300" />
                        <p className="font-medium text-slate-600">No date range selected</p>
                        <p className="text-sm">Select a start and end date to generate a report.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
