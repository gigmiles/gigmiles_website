import { getWeeklyStats } from './actions'
import { Charts } from '@/components/reports/Charts'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function ReportsPage() {
    const data = await getWeeklyStats()

    if (!data) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reports & Insights</h1>
                    <p className="text-slate-500">Analyze your earnings performance.</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            {/* Key Metrics Cards (Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Total Weekly Earnings</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        ${data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Top Platform</h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                        {data.platformData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Avg. Daily</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        ${(data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0) / 7).toFixed(2)}
                    </p>
                </div>
            </div>

            <Charts dailyData={data.dailyData} platformData={data.platformData} />
        </div>
    )
}
