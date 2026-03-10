import { getReportsData } from './actions'
import { ReportControls } from '@/components/reports/ReportControls'
import { Charts } from '@/components/reports/Charts'
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown'
import { ActivityCalendar } from '@/components/reports/ActivityCalendar'
import Link from 'next/link'
import { TrendingUp, ChevronLeft, MapPin, Lightbulb } from 'lucide-react'
import { ExportButton } from '@/components/reports/ExportButton'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ startDate?: string, endDate?: string }> }) {
    const { startDate, endDate } = await searchParams
    const data = await getReportsData(startDate, endDate)

    if (!data) return <div className="p-8 text-center text-muted-foreground">Generating reports...</div>

    const totalGross = data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0)
    const totalNetProfit = data.dailyData.reduce((acc, curr) => acc + curr.netProfit, 0)
    const totalMiles = data.dailyData.reduce((acc, curr) => acc + curr.miles, 0)
    const totalHours = data.platformData.reduce((acc, curr) => acc + curr.hours, 0)
    const margin = totalGross > 0 ? ((totalNetProfit / totalGross) * 100) : 0
    const avgHourly = totalHours > 0 ? totalNetProfit / totalHours : 0
    const topPlatform = data.platformData.sort((a, b) => b.value - a.value)[0]
    const topPlatformName = topPlatform?.name || 'N/A'
    const topPlatformRate = topPlatform?.hourlyRate || 0

    // Dynamic Insights
    const insights: { text: string; highlight?: string }[] = []
    if (topPlatform && topPlatformRate > 0) {
        insights.push({
            text: `${topPlatformName} leads with`,
            highlight: `$${topPlatformRate.toFixed(0)}/hr`
        })
    }
    if (totalGross > 0) {
        const totalExpenses = totalGross - totalNetProfit
        const costRatio = ((totalExpenses / totalGross) * 100).toFixed(0)
        insights.push({
            text: `Total costs are ${costRatio}% of your gross — `,
            highlight: Number(costRatio) < 40 ? 'efficient!' : 'room to optimize'
        })
    }
    if (data.dailyData.filter(d => d.earnings > 0).length >= 3) {
        const activeDays = data.dailyData.filter(d => d.earnings > 0)
        const avgPerDay = activeDays.reduce((a, d) => a + d.netProfit, 0) / activeDays.length
        insights.push({
            text: `Averaging`,
            highlight: `$${avgPerDay.toFixed(0)}/active day`
        })
    }

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                        <ChevronLeft className="size-4 text-slate-400 group-hover:text-emerald-500" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Reports
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Performance analytics for the selected period.</p>
                    </div>
                    <ExportButton dailyData={data.dailyData} platformData={data.platformData} />
                </div>

                {/* Controls */}
                <div className="glass-card p-1.5 border-white/5 shadow-lg">
                    <ReportControls data={data.dailyData} />
                </div>
            </div>

            {/* KPI Strip — 4 compact cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="glass-card p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Net Profit</p>
                    <h3 className="animate-number-pop text-2xl font-display font-bold text-emerald-500 tracking-tighter">
                        ${totalNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h3>
                    <p className="text-[9px] font-bold text-emerald-500/50 mt-0.5">{margin.toFixed(1)}% margin</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Gross Revenue</p>
                    <h3 className="animate-number-pop text-2xl font-display font-bold text-white tracking-tighter">
                        ${totalGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h3>
                    {totalHours > 0 && <p className="text-[9px] font-bold text-blue-400/50 mt-0.5">${avgHourly.toFixed(0)}/hr net</p>}
                </div>
                <div className="glass-card p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="size-2.5 text-slate-600" />
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">Total Miles</p>
                    </div>
                    <h3 className="animate-number-pop text-2xl font-display font-bold text-white tracking-tighter">
                        {totalMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h3>
                    {totalMiles > 0 && <p className="text-[9px] font-bold text-slate-500 mt-0.5">${(totalMiles * 0.67).toFixed(0)} IRS deduction</p>}
                </div>
                <div className="glass-card p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 mb-1">Top Platform</p>
                    <h3 className="animate-number-pop text-2xl font-display font-bold text-white tracking-tighter truncate">
                        {topPlatformName}
                    </h3>
                    {topPlatformRate > 0 && <p className="text-[9px] font-bold text-blue-400/50 mt-0.5">${topPlatformRate.toFixed(0)}/hr</p>}
                </div>
            </div>

            {/* Activity Calendar */}
            <ActivityCalendar data={data.dailyData} />

            {/* Charts */}
            <div className="glass-card p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-display font-bold text-white">Performance Visualizer</h2>
                        <p className="text-[10px] text-slate-600 font-medium">Trend analysis and platform distribution</p>
                    </div>
                </div>
                <Charts dailyData={data.dailyData} platformData={data.platformData} />
            </div>

            {/* Platform Efficiency */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Platform Efficiency</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.platformData.map((plat, idx: number) => {
                        const platColor = plat.fill || '#64748B'
                        const barWidth = Math.min(100, (plat.hourlyRate / 50) * 100)
                        return (
                            <div key={idx} className="glass-card glass-card-hover p-4 transition-all hover-spring">
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className="text-xs font-extrabold tracking-tight"
                                        {...({ style: { color: platColor } } as Record<string, unknown>)}
                                    >
                                        {plat.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 font-bold">
                                        {totalGross > 0 ? ((plat.gross / totalGross) * 100).toFixed(0) : 0}%
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">$/hr</span>
                                    <span className="text-sm font-bold text-blue-400">${plat.hourlyRate.toFixed(2)}</span>
                                </div>
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">$/mile</span>
                                    <span className="text-xs font-bold text-slate-300">${plat.earningsPerMile.toFixed(2)}</span>
                                </div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Tips</span>
                                    <span className="text-xs font-bold text-amber-500">{plat.tipPct.toFixed(1)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        {...({ style: { width: `${barWidth}%`, backgroundColor: `${platColor}66` } } as Record<string, unknown>)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Cost Distribution */}
            <ExpenseBreakdown data={data.expenseBreakdown} />

            {/* Dynamic Insights */}
            {insights.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/5 rounded-xl p-5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <Lightbulb className="size-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Insights</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {insights.map((insight, i) => (
                            <div key={i} className="text-xs text-slate-400 font-medium">
                                {insight.text} <span className="text-emerald-400 font-bold">{insight.highlight}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
