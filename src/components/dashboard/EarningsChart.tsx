'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { memo } from "react"

interface EarningsChartProps {
    data: {
        label: string;
        gross: number;
        net: number;
    }[]
}

const chartConfig = {
    gross: {
        label: "Gross Revenue",
        color: "#64748b",
    },
    costs: {
        label: "Hidden Costs",
        color: "#f43f5e",
    },
    net: {
        label: "Pure Net Profit",
        color: "#39FF14",
    },
}

export const EarningsChart = memo(function EarningsChart({ data }: EarningsChartProps) {
    const enhancedData = data.map(d => ({
        ...d,
        costs: d.gross - d.net
    }))
    const totalNet = data.reduce((acc, curr) => acc + curr.net, 0)

    return (
        <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="size-3" />
                        </div>
                        Financial Velocity
                    </CardTitle>
                    <CardDescription className="text-[10px] font-medium text-slate-600">
                        Daily performance · Last 7 days
                    </CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Avg. Daily</p>
                    <p className="text-base font-bold text-emerald-500">${(totalNet / (data.length || 1)).toFixed(2)}</p>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-2 sm:px-4 sm:pt-3">
                <ChartContainer config={chartConfig} className="aspect-[4/3] sm:aspect-auto sm:h-[260px] w-full">
                    <AreaChart
                        data={enhancedData}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                        <defs>
                            <linearGradient id="fillGross" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#64748b" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillCosts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#39FF14" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            minTickGap={10}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `$${value}`}
                            width={42}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                                />
                            }
                        />
                        <Area
                            dataKey="gross"
                            type="monotone"
                            fill="url(#fillGross)"
                            stroke="#64748b"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            stackId="a"
                        />
                        <Area
                            dataKey="costs"
                            type="monotone"
                            fill="url(#fillCosts)"
                            stroke="#f43f5e"
                            strokeWidth={1.5}
                            stackId="b"
                        />
                        <Area
                            dataKey="net"
                            type="monotone"
                            fill="url(#fillNet)"
                            stroke="#39FF14"
                            strokeWidth={2}
                            stackId="c"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-slate-500" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Gross</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-rose-500" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Costs</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-[#39FF14]" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Net</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-950 bg-[#39FF14] px-2 py-0.5 rounded-md">
                    <TrendingUp className="size-2.5" />
                    ${totalNet.toFixed(2)} Weekly
                </div>
            </div>
        </Card>
    )
})
