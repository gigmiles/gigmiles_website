import { getReportsData } from './actions'
import { ReportControls } from '@/components/reports/ReportControls'
import { Charts } from '@/components/reports/Charts'
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown'
import { ActivityCalendar } from '@/components/reports/ActivityCalendar'
import Link from 'next/link'
import { TrendingUp, ChevronLeft, DollarSign, LayoutGrid } from 'lucide-react'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ startDate?: string, endDate?: string }> }) {
    const { startDate, endDate } = await searchParams
    const data = await getReportsData(startDate, endDate)

    if (!data) return <div className="p-8 text-center text-muted-foreground">Generating reports...</div>

    const totalWeekly = data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0)
    const totalNetProfit = data.dailyData.reduce((acc, curr) => acc + curr.netProfit, 0)
    const avgDaily = totalWeekly / (data.dailyData.length || 1)
    void avgDaily
    const topPlatform = data.platformData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                        <ChevronLeft className="size-4 text-slate-400 group-hover:text-emerald-500" />
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Reports
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Performance analytics for the selected period.</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-card p-1.5 border-white/5 shadow-lg">
                    <ReportControls data={data.dailyData} />
                </div>
            </div>

            {/* KPI Strip — 3 compact inline cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Net Profit</p>
                    <h3 className="text-2xl font-display font-bold text-emerald-500 tracking-tighter">
                        ${totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Gross Revenue</p>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tighter">
                        ${totalWeekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Top Platform</p>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tighter truncate">
                        {topPlatform}
                    </h3>
                </div>
            </div>

            {/* Activity Calendar */}
            <ActivityCalendar data={data.dailyData} />

            {/* Charts — tighter card */}
            <div className="bg-white/[0.02] rounded-2xl p-5 md:p-6 border border-white/5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-display font-bold text-white">Performance Visualizer</h2>
                        <p className="text-[10px] text-slate-600 font-medium">Trend analysis and platform distribution</p>
                    </div>
                </div>
                <Charts dailyData={data.dailyData} platformData={data.platformData} />
            </div>

            {/* Platform Efficiency — compact horizontal cards */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Platform Efficiency</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.platformData.map((plat, idx: number) => {
                        const platStyle = { color: plat.fill || 'var(--foreground)' };
                        const barWidth = Math.min(100, (plat.hourlyRate / 50) * 100);
                        return (
                            <div key={idx} className="bg-white/[0.03] rounded-xl p-4 border border-white/5 hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className={`text-xs font-extrabold tracking-tight ${plat.name.toLowerCase().includes('uber') ? 'uber-halo-text' : ''}`}
                                        {...({ style: platStyle } as Record<string, unknown>)}
                                    >
                                        {plat.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 font-bold">
                                        {((plat.gross / totalWeekly) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">$/hr</span>
                                    <span className="text-sm font-bold text-blue-400">${plat.hourlyRate.toFixed(2)}</span>
                                </div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Tips</span>
                                    <span className="text-xs font-bold text-amber-500">{plat.tipPct.toFixed(1)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500/40 rounded-full"
                                        {...({ style: { width: `${barWidth}%` } } as Record<string, unknown>)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost Distribution */}
            <ExpenseBreakdown data={data.expenseBreakdown} />

            {/* Insight Banner — slim */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/5 rounded-xl p-5 border border-emerald-500/10 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                    <TrendingUp className="size-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white mb-0.5">Boost your hourly output</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-emerald-400 font-bold">{topPlatform}</span> remains your strongest hourly driver.
                        {data.dailyData.length > 3 ? (
                            <> Maximize active sessions on <span className="text-white font-bold">weekends</span> to increase net profit.</>
                        ) : (
                            <> Consistently logging shifts will help us identify more precise patterns.</>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
