'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

interface EarningsChartProps {
    data: {
        label: string;
        gross: number;
        net: number;
    }[]
}

const chartConfig = {
    gross: {
        label: "Gross Income",
        color: "hsl(var(--emerald-500))",
    },
    net: {
        label: "Net Profit",
        color: "hsl(var(--blue-500))",
    },
}

export function EarningsChart({ data }: EarningsChartProps) {
    // Analytics calculations
    const totalNet = data.reduce((acc, curr) => acc + curr.net, 0)
    const growth = data.length >= 2 ? ((data[data.length - 1].net - data[0].net) / (data[0].net || 1) * 100).toFixed(1) : 0

    return (
        <Card className="glass-card border-white/5 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="size-4" />
                        </div>
                        Financial Velocity
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">
                        Daily performance trend for the last 7 days
                    </CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg. Daily Net</p>
                    <p className="text-xl font-bold text-emerald-500">${(totalNet / (data.length || 1)).toFixed(2)}</p>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-[4/3] sm:aspect-auto sm:h-[300px] w-full">
                    <AreaChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <defs>
                            <linearGradient id="fillGross" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="gross"
                            type="natural"
                            fill="url(#fillGross)"
                            stroke="#10b981"
                            strokeWidth={2}
                            stackId="a"
                        />
                        <Area
                            dataKey="net"
                            type="natural"
                            fill="url(#fillNet)"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            stackId="b"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="size-3" />
                    {growth}% Trend
                </div>
            </div>
        </Card>
    )
}
