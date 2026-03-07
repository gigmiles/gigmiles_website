'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { memo } from "react"
import { cn } from "@/lib/utils"

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
        color: "#10b981",
    },
}

export const EarningsChart = memo(function EarningsChart({ data }: EarningsChartProps) {
    const enhancedData = data.map(d => ({
        ...d,
        costs: d.gross - d.net
    }))
    const totalNet = data.reduce((acc, curr) => acc + curr.net, 0)
    const avgDaily = totalNet / (data.length || 1)

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-sm flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                            <TrendingUp className="size-4" />
                        </div>
                        Financial Velocity
                    </CardTitle>
                    <CardDescription className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60 ml-[2.625rem]">
                        Daily performance · Last 7 days
                    </CardDescription>
                </div>
                <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60">Avg. Daily</p>
                    <p className="text-2xl font-black text-[#10B981] italic tracking-tighter">${avgDaily.toFixed(2)}</p>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-2 sm:px-4 sm:pt-3">
                <ChartContainer config={chartConfig} className="aspect-[4/3] sm:aspect-auto sm:h-[280px] w-full">
                    <AreaChart
                        data={enhancedData}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                        <defs>
                            <linearGradient id="fillGross" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#64748b" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillCosts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            {/* Glow filter for the net line */}
                            <filter id="netGlow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid 
                            vertical={false} 
                            strokeDasharray="3 3" 
                            stroke="#ffffff" 
                            strokeOpacity={0.06} 
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={10}
                            tick={{ fill: '#A1A1AA', fontSize: 10, fontWeight: 900 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            tick={{ fill: '#A1A1AA', fontSize: 10, fontWeight: 900 }}
                            tickFormatter={(value) => `$${value}`}
                            width={48}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgba(16,185,129,0.15)', strokeWidth: 1 }}
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
                            stroke="#10b981"
                            strokeWidth={2.5}
                            stackId="c"
                            filter="url(#netGlow)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            {/* Legend Footer — Vibe Style */}
            <div className="px-5 py-4 bg-white/[0.01] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {[
                        { color: 'bg-slate-500', label: 'Gross', dash: true },
                        { color: 'bg-rose-500', label: 'Costs' },
                        { color: 'bg-[#10B981]', label: 'Net' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className={cn(
                                "size-2 rounded-full",
                                item.color,
                                item.label === 'Net' && "shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                            )} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A1A1AA]/60">{item.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-black bg-[#10B981] px-4 py-2 rounded-2xl uppercase tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <TrendingUp className="size-3" />
                    ${totalNet.toFixed(2)} Weekly
                </div>
            </div>
        </Card>
    )
})
