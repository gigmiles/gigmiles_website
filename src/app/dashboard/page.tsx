import { Button } from '@/components/ui/Button'
import { getDashboardStats } from './actions'
import Link from 'next/link'

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    if (!stats) return <div>Loading...</div>

    const { today } = stats

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Welcome back, here's your daily summary.</p>
                </div>
                <Link href="/dashboard/entry/new">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        + New Entry
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Net Profit Card */}
                <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Net Profit (After Tax)</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${today.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${today.netProfit.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Take-home after all costs & taxes</p>
                </div>

                {/* Gross Earnings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Gross Earnings</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">${today.gross.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Total platform income + tips</p>
                </div>

                {/* Estimated Tax */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Estimated Tax</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-amber-600">${today.estimatedTax.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Federal SE + State estimate</p>
                </div>

                {/* Expenses */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cash Expenses</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-red-500">${today.expenses.toFixed(2)}</span>
                    </div>
                </div>

                {/* Mileage */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Mileage</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">{today.miles.toFixed(1)}</span>
                        <span className="text-sm text-slate-500">mi</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Deduction: ${(today.miles * 0.70).toFixed(2)}</p>
                </div>
            </div>

            {!today.hasEntry && (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🚗</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No activity recorded today</h3>
                    <p className="text-slate-500 mt-2 mb-6">Start your shift by adding your first entry.</p>
                    <Link href="/dashboard/entry/new">
                        <Button variant="outline">Log Today's Earnings</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
