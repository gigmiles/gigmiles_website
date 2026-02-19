import { TrendingUp } from 'lucide-react';
import { calculateHourlyRate } from '@/utils/calculations';
import { DailyEntry } from '@/app/dashboard/types';

interface WeeklySummaryProps {
    entries: DailyEntry[];
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
        <div className="glass-card p-5 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 blur-[100px] rounded-full transition-all group-hover:bg-blue-500/10 pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">Weekly Performance</h2>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Aggregated insights</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {entries.length}d
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 active:scale-[0.99] transition-transform cursor-default">
                    <div className="absolute top-0 right-0 p-2 opacity-10 transform translate-x-2 -translate-y-2">
                        <TrendingUp className="size-16" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Net Profit</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold opacity-50">$</span>
                        <p className="text-3xl font-extrabold tracking-tighter">{totalNetProfit.toFixed(2)}</p>
                    </div>
                    <div className="mt-3 inline-block px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold">
                        Avg ${avgDailyProfit.toFixed(2)}/day
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-3 transition-all hover:bg-white/10 cursor-default border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${totalGross.toFixed(2)}</p>
                    </div>

                    <div className="glass-card p-3 transition-all hover:bg-white/10 cursor-default border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Miles</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{totalMiles.toFixed(1)}</p>
                    </div>

                    <div className="glass-card p-3 transition-all hover:bg-white/10 cursor-default border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hours</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            {totalHours > 0 ? totalHours.toFixed(1) : '—'}
                        </p>
                    </div>

                    <div className="glass-card p-3 transition-all hover:bg-white/10 cursor-default border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hourly</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            {hourlyRate > 0 ? `$${hourlyRate.toFixed(2)}` : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
