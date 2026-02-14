import { getWeeklyStats } from './actions'
import { Charts } from '@/components/reports/Charts'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    BarChart3,
    TrendingUp,
    PieChart,
    ChevronLeft,
    Calendar,
    LayoutGrid,
    Info,
    DollarSign,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function ReportsPage() {
    const data = await getWeeklyStats()

    if (!data) return <div className="p-8 text-center text-muted-foreground">Generating reports...</div>

    const totalWeekly = data.dailyData.reduce((acc, curr) => acc + curr.earnings, 0)
    const avgDaily = totalWeekly / 7
    const topPlatform = data.platformData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-slate-900 flex items-center gap-1 text-sm transition-colors">
                            <ChevronLeft className="size-4" />
                            Back to Overview
                        </Link>
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports & Insights</h1>
                    <p className="mt-2 text-muted-foreground">Deep dive into your performance metrics and trends.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full flex items-center gap-2">
                        <Calendar className="size-4" />
                        Last 7 Days
                    </Button>
                    <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Insights Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-premium border-border/50 overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            Weekly Total
                            <TrendingUp className="size-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display text-slate-900 dark:text-slate-50">
                            ${totalWeekly.toFixed(2)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Cumulative for this week</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="size-16" />
                    </div>
                </Card>

                <Card className="shadow-premium border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            Efficiency Leader
                            <LayoutGrid className="size-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display text-emerald-600">
                            {topPlatform}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Best performing platform</p>
                    </CardContent>
                </Card>

                <Card className="shadow-premium border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            Average Stride
                            <Clock className="size-4 text-amber-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display text-slate-900 dark:text-slate-50">
                            ${avgDaily.toFixed(2)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Daily average performance</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-1">
                <Card className="shadow-premium border-border/50 bg-white dark:bg-slate-900/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold font-display">Performance Visualizer</CardTitle>
                            <CardDescription>Visualizing earnings distribution and trends</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Info className="size-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Charts dailyData={data.dailyData} platformData={data.platformData} />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Context Tip */}
            <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl flex items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="rounded-xl bg-slate-800 p-3 text-emerald-400">
                    <TrendingUp className="size-6" />
                </div>
                <div>
                    <h4 className="text-white font-bold">Insight: Optimize for {topPlatform}</h4>
                    <p className="text-sm opacity-80 max-w-lg mt-1">
                        Based on your recent data, {topPlatform} is yielding 15% higher returns per hour. Consider shifting more active hours during peak times for this platform.
                    </p>
                </div>
                <div className="absolute top-0 right-0 h-full w-32 bg-emerald-500/5 -skew-x-12 translate-x-12" />
            </div>
        </div>
    )
}
