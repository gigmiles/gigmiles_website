import { TrendingUp, TrendingDown } from 'lucide-react';
import { calculateHourlyRate } from '@/utils/calculations';

interface WeeklySummaryProps {
    entries: any[]; // Typing generalized for now, strictly it would be DailyEntryWithDetails[]
    totalNetProfit: number;
    totalGross: number;
    totalMiles: number;
    totalHours: number;
}

export function BoltWeeklySummary({
    entries,
    totalNetProfit,
    totalGross,
    totalMiles,
    totalHours
}: WeeklySummaryProps) {
    const avgDailyProfit = entries.length > 0 ? totalNetProfit / entries.length : 0;
    const hourlyRate = calculateHourlyRate(totalNetProfit, totalHours);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-premium p-6 border-none h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">This Week</h2>
                <span className="text-sm text-slate-500 font-medium">{entries.length} days tracked</span>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-600 dark:bg-blue-900/50 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-sm opacity-90 mb-1 font-medium">Total Net Profit</p>
                    <p className="text-4xl font-extrabold tracking-tight">${totalNetProfit.toFixed(2)}</p>
                    <p className="text-sm opacity-90 mt-2 font-medium">
                        Avg ${avgDailyProfit.toFixed(2)}/day
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <p className="text-sm text-slate-500 mb-1 font-medium">Gross Income</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">${totalGross.toFixed(2)}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <p className="text-sm text-slate-500 mb-1 font-medium">Total Miles</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{totalMiles.toFixed(1)}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <p className="text-sm text-slate-500 mb-1 font-medium">Total Hours</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {totalHours > 0 ? totalHours.toFixed(1) : '—'}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <p className="text-sm text-slate-500 mb-1 font-medium">Avg Hourly</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {hourlyRate > 0 ? `$${hourlyRate.toFixed(2)}` : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
