'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Label
} from 'recharts'
import {
    ChartContainer,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart"

interface DailyData {
    date: string
    earnings: number
    expenses: number
    netProfit: number
    miles: number
    depreciationCost: number
}

interface PlatformData {
    name: string
    value: number
    gross: number
    tips: number
    hours: number
    miles: number
    hourlyRate: number
    tipPct: number
    earningsPerMile: number
    fill?: string
}

interface ChartsProps {
    dailyData: DailyData[]
    platformData: PlatformData[]
}

export function Charts({ dailyData, platformData }: ChartsProps) {
    const totalGross = platformData.reduce((acc, curr) => acc + curr.gross, 0)

    const chartConfig: ChartConfig = {
        profit: { label: "Net Profit", color: "hsl(var(--emerald-500))" },
        gross: { label: "Gross Revenue", color: "hsl(var(--blue-500))" },
        expenses: { label: "Expenses", color: "hsl(var(--ruby-500))" }
    }

    platformData.forEach((plat) => {
        chartConfig[plat.name.toLowerCase().replace(/\s+/g, '-')] = {
            label: plat.name
        }
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profit Trend */}
            <div className="lg:col-span-7 h-[280px] relative">
                <div className="absolute top-0 left-0 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Profit Trend</span>
                </div>
                <ChartContainer config={chartConfig} className="w-full h-full mt-5">
                    <AreaChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickFormatter={(v) => `$${v}`}
                            width={45}
                        />
                        <Tooltip
                            content={<ChartTooltipContent />}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="netProfit"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            name="Net Profit"
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#3b82f6"
                            strokeWidth={1.5}
                            fill="transparent"
                            name="Gross"
                            strokeDasharray="5 5"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>

            {/* Platform Donut */}
            <div className="lg:col-span-5 h-[280px] flex items-center justify-center lg:border-l lg:border-white/5 lg:pl-6">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px]">
                    <PieChart>
                        <Pie
                            data={platformData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={85}
                            strokeWidth={6}
                            stroke="rgba(15, 23, 42, 0.9)"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-white text-2xl font-display font-bold tracking-tighter"
                                                >
                                                    ${totalGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 20}
                                                    className="fill-slate-500 text-[9px] uppercase font-black tracking-widest"
                                                >
                                                    Revenue
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                </ChartContainer>
            </div>
        </div>
    )
}
