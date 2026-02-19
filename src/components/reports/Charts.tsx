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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Weekly Earnings & Net Profit Analysis */}
            <div className="lg:col-span-7 h-[350px] relative">
                <div className="absolute top-0 left-0 flex items-center gap-2 mb-4">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profit Trend</span>
                </div>
                <ChartContainer config={chartConfig} className="w-full h-full mt-6">
                    <AreaChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                            content={<ChartTooltipContent />}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="netProfit"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            name="Net Profit"
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="transparent"
                            name="Gross"
                            strokeDasharray="5 5"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>

            {/* Platform Breakdown Donut Chart */}
            <div className="lg:col-span-5 h-[350px] flex flex-col items-center justify-center border-l border-white/5 pl-10">
                <div className="w-full h-full">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                        <PieChart>
                            <Pie
                                data={platformData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={75}
                                outerRadius={100}
                                strokeWidth={8}
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
                                                        className="fill-slate-900 dark:fill-white text-3xl font-display font-bold tracking-tighter"
                                                    >
                                                        ${totalGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-slate-500 text-[10px] uppercase font-black tracking-widest"
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
        </div>
    )
}
