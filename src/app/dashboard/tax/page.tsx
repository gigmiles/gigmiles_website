import { getTaxOverview, addTaxPayment } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { IRS_STANDARD_MILEAGE_RATE_2025 } from '@/utils/calculations'

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tax Center (2025)</h1>
                <p className="text-slate-500">Track your estimated quarterly taxes and payments.</p>
            </div>

            {/* Yearly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-sm font-medium opacity-70 uppercase">Total Estimated Tax</h3>
                    <p className="text-3xl font-bold mt-2">${totalEstimated.toFixed(2)}</p>
                </div>
                <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-sm font-medium opacity-70 uppercase">Total Paid</h3>
                    <p className="text-3xl font-bold mt-2">${totalPaid.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Remaining Due</h3>
                    <p className={`text-3xl font-bold mt-2 ${totalDue > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ${Math.max(0, totalDue).toFixed(2)}
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800">Quarterly Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quarters.map((q) => (
                    <div
                        key={q.id}
                        className={`p-6 rounded-xl border ${q.isCurrent ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-200 bg-white'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900">{q.name}</h3>
                                <p className="text-xs text-slate-500">Due: {q.due}</p>
                            </div>
                            {q.isCurrent && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">Current</span>}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Estimated:</span>
                                <span className="font-medium">${q.estimatedTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Paid:</span>
                                <span className="font-medium text-emerald-600">-${q.paid.toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t flex justify-between font-bold">
                                <span>Due:</span>
                                <span className={q.remaining > 0 ? 'text-red-600' : 'text-slate-400'}>
                                    ${q.remaining.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <form action={handlePayment} className="space-y-2">
                            <input type="hidden" name="quarter" value={q.id} />
                            <div className="flex gap-2">
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    className="flex-1 h-9 rounded-md border border-slate-300 px-3 text-sm"
                                    min="0.01"
                                    required
                                />
                                <Button type="submit" size="sm" variant="secondary">Pay</Button>
                            </div>
                        </form>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                <strong>Note:</strong> These are estimates based on your logged income and expenses using 2025 Standard Mileage Rates (${IRS_STANDARD_MILEAGE_RATE_2025.toFixed(2)}/mi) and approx. tax rates. Always consult a tax professional.
            </div>
        </div>
    )
}
