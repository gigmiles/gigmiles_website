import { getReportsData } from './actions'
import { ReportControls } from '@/components/reports/ReportControls'
import { Charts } from '@/components/reports/Charts'
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown'
import { ActivityCalendar } from '@/components/reports/ActivityCalendar'
import Link from 'next/link'
import { TrendingUp, LayoutGrid, ChevronLeft, DollarSign } from 'lucide-react'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ startDate?: string, endDate?: string }> }) {
    const { startDate, endDate } = await searchParams
    const data = await getReportsData(startDate, endDate)

    if (!data) return <div className="p-8 text-center text-muted-foreground">Generating reports...</div>

    const totalWeekly = data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0)
    const totalNetProfit = data.dailyData.reduce((acc, curr) => acc + curr.netProfit, 0)
    const avgDaily = totalWeekly / (data.dailyData.length || 1)
    void avgDaily // Suppress unused warning if it's meant to be used later
    const topPlatform = data.platformData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                        <ChevronLeft className="size-5 text-slate-400 group-hover:text-emerald-500" />
                    </Link>
                    <div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Reports & Insights
                        </h1>
                        <p className="text-slate-500 font-medium">Performance analytics for the selected period.</p>
                    </div>
                </div>

                {/* Controls Toolbar - Premium Glass Style */}
                <div className="glass-card p-2 border-white/5 shadow-xl">
                    <ReportControls data={data.dailyData} />
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="size-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Net Profit</p>
                    <h3 className="text-4xl font-display font-bold text-emerald-500 tracking-tighter">
                        ${totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">After all expenses & estimates</p>
                </div>

                <div className="glass-card p-6 border-white/5 relative overflow-hidden group border-l-blue-500/20">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="size-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Gross Revenue</p>
                    <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
                        ${totalWeekly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Total platform earnings</p>
                </div>

                <div className="glass-card p-6 border-white/5 relative overflow-hidden group border-l-amber-500/20">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LayoutGrid className="size-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Top Performer</p>
                    <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tighter truncate">
                        {topPlatform}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Highest grossing source</p>
                </div>
            </div>

            {/* Activity Calendar */}
            <div className="animate-fade-in delay-100">
                <ActivityCalendar data={data.dailyData} />
            </div>

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="glass-card p-8 border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Performance Visualizer</h2>
                            <p className="text-xs text-slate-500 font-medium">Trend analysis and platform distribution</p>
                        </div>
                    </div>
                    <Charts dailyData={data.dailyData} platformData={data.platformData} />
                </div>
            </div>

            {/* Efficiency Leaderboard */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <TrendingUp className="size-4 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Platform Efficiency</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.platformData.map((plat, idx: number) => {
                        const platStyle = { color: plat.fill || 'var(--foreground)' };
                        const barStyle = { width: `${Math.min(100, (plat.hourlyRate / 50) * 100)}%` };
                        return (
                            <div key={idx} className="glass-card p-5 border-white/5 hover:bg-white/5 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`text-sm font-extrabold tracking-tight antialiased ${plat.name.toLowerCase().includes('uber') ? 'uber-halo-text' : ''}`}
                                        {...({ style: platStyle } as Record<string, unknown>)}
                                    >
                                        {plat.name}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold uppercase tracking-tight">
                                        {((plat.gross / totalWeekly) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Hourly Rate</span>
                                        <span className="text-lg font-display font-bold text-blue-400">${plat.hourlyRate.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Tip %</span>
                                        <span className="text-sm font-bold text-amber-500">{plat.tipPct.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-emerald-500/50"
                                            {...({ style: barStyle } as Record<string, unknown>)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Expense Breakdown Section */}
            <ExpenseBreakdown data={data.expenseBreakdown} />

            {/* Smart Insights Footer */}
            <div className="premium-gradient p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 transition-transform group-hover:scale-[1.6] pointer-events-none">
                    <TrendingUp className="size-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 size-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl">
                        <TrendingUp className="size-10 text-emerald-300" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-display font-bold mb-2">Insight: Boost your hourly output</h4>
                        <p className="text-emerald-100/80 max-w-2xl leading-relaxed">
                            Based on your {startDate && endDate ? 'selected' : 'recent'} performance,
                            <span className="text-white font-bold mx-1"> {topPlatform} </span>
                            remains your strongest hourly driver. {data.dailyData.length > 3 ? (
                                <>Historical data suggests maximizing active sessions on <span className="text-white font-bold ml-1">weekends</span> can increase your net profit significantly.</>
                            ) : (
                                <>Consistently logging your shifts will help us identify more precise patterns to boost your earnings.</>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
