import { getTaxOverview, addTaxPayment } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { IRS_STANDARD_MILEAGE_RATE_2025 } from '@/utils/calculations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ShieldCheck,
    Clock,
    AlertCircle,
    Calendar,
    DollarSign
} from 'lucide-react'
import { CustomDateTaxReport } from '@/components/dashboard/CustomDateTaxReport'

export default async function TaxPage() {
    const quarters = await getTaxOverview()
    if (!quarters) redirect('/login')

    const totalEstimated = quarters.reduce((acc, q) => acc + q.estimatedTax, 0)
    const totalPaid = quarters.reduce((acc, q) => acc + q.paid, 0)
    const totalDue = totalEstimated - totalPaid

    async function handlePayment(formData: FormData) {
        'use server'
        const quarter = parseInt(formData.get('quarter') as string)
        const amount = parseFloat(formData.get('amount') as string)

        if (quarter && amount) {
            await addTaxPayment(quarter, amount)
            revalidatePath('/dashboard/tax')
        }
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tax Center (2026)</h1>
                <p className="mt-2 text-muted-foreground">Manage your quarterly estimated taxes and track your payment history.</p>
            </div>

            {/* Yearly Financial Summary */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-premium bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Estimated Tax</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display">${totalEstimated.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-2 italic">Based on log history</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-emerald-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100 uppercase tracking-wider text-opacity-80">Total Paid Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display">${totalPaid.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-white dark:bg-slate-900/50 shadow-premium">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold font-display ${totalDue > 0 ? 'text-ruby-600' : 'text-emerald-600'}`}>
                            ${Math.max(0, totalDue).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Due by year-end</p>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Date Range Report */}
            <CustomDateTaxReport />

            {/* Quarterly Timeline */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-slate-400" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Quarterly Breakdown</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {quarters.map((q) => (
                        <Card
                            key={q.id}
                            className={`group border-border/50 transition-all hover:shadow-lg ${q.isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold">{q.name}</CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <Clock className="size-3" />
                                            Due {q.due}
                                        </CardDescription>
                                    </div>
                                    {q.isCurrent && (
                                        <span className="flex h-6 items-center rounded-full bg-emerald-100 px-2 text-[10px] font-bold text-emerald-700 uppercase tracking-tighter shadow-sm">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Estimated Total</span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">${q.estimatedTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-1 pb-1">
                                        <span>Federal (SE)</span>
                                        <span>${q.estimatedFederalTax?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-1 pb-2">
                                        <span>State</span>
                                        <span>${q.estimatedStateTax?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Paid</span>
                                        <span className="font-semibold text-emerald-600">-${q.paid.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-3 border-t flex justify-between items-baseline">
                                        <span className="text-xs font-bold uppercase text-slate-400">Due</span>
                                        <span className={`text-lg font-bold ${q.remaining > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                            ${q.remaining.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <form action={handlePayment} className="flex gap-2 pt-2">
                                    <input type="hidden" name="quarter" value={q.id} />
                                    <div className="relative flex-1">
                                        <DollarSign className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter Paid Amount"
                                            className="h-9 pl-8 text-xs rounded-lg placeholder:text-[10px]"
                                            min="0.01"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" size="sm" variant="secondary" className="h-9 rounded-lg">
                                        Pay
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Disclaimer & Context */}
            <Card className="bg-slate-50 dark:bg-slate-900/20 border-border/50">
                <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-semibold">Professional Disclaimer</p>
                        <p className="mt-1 opacity-80">
                            Estimates are calculated using the 2025 Standard Mileage Rate of <strong>${IRS_STANDARD_MILEAGE_RATE_2025.toFixed(2)}/mi</strong>.
                            These values are for tracking purposes only and do not constitute professional tax advice. Always verify with a certified public accountant.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
