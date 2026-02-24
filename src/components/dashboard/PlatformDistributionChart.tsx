'use client'

import { Pie, PieChart, Label, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { PieChart as PieIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface PlatformDistributionProps {
    data: {
        name: string;
        value: number;
        tips: number;
        hours: number;
        miles: number;
        fill: string;
    }[]
}

const PLATFORM_COLORS: Record<string, string> = {
    'uber': 'text-black dark:text-white',
    'uber eats': 'text-[#06C167]',
    'lyft': 'text-[#FF00BF]',
    'doordash': 'text-[#FF3008]',
    'grubhub': 'text-[#F6343F]',
    'instacart': 'text-[#43B02A]',
    'spark': 'text-[#0071CE]',
    'amazon flex': 'text-[#FF9900]',
    'other': 'text-slate-500'
}

const PLATFORM_BG_COLORS: Record<string, string> = {
    'uber': 'bg-black dark:bg-white',
    'uber eats': 'bg-[#06C167]',
    'lyft': 'bg-[#FF00BF]',
    'doordash': 'bg-[#FF3008]',
    'grubhub': 'bg-[#F6343F]',
    'instacart': 'bg-[#43B02A]',
    'spark': 'bg-[#0071CE]',
    'amazon flex': 'bg-[#FF9900]',
    'other': 'bg-slate-500'
}

const PLATFORM_RING_SHADOWS: Record<string, string> = {
    'uber': 'ring-white shadow-[0_0_6px_rgba(255,255,255,0.4)]',
    'uber eats': 'ring-[#06C167] shadow-[0_0_6px_rgba(6,193,103,0.4)]',
    'lyft': 'ring-[#FF00BF] shadow-[0_0_6px_rgba(255,0,191,0.4)]',
    'doordash': 'ring-[#FF3008] shadow-[0_0_6px_rgba(255,48,8,0.4)]',
    'grubhub': 'ring-[#F6343F] shadow-[0_0_6px_rgba(246,52,63,0.4)]',
    'instacart': 'ring-[#43B02A] shadow-[0_0_6px_rgba(67,176,42,0.4)]',
    'spark': 'ring-[#0071CE] shadow-[0_0_6px_rgba(0,113,206,0.4)]',
    'amazon flex': 'ring-[#FF9900] shadow-[0_0_6px_rgba(255,153,0,0.4)]',
    'other': 'ring-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.4)]'
}

export const PlatformDistributionChart = React.memo(function PlatformDistributionChart({ data }: PlatformDistributionProps) {
    const totalEarnings = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0)
    }, [data])

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {}
        data.forEach(item => {
            const platformName = item.name || 'Other'
            config[platformName.toLowerCase().replace(/\s+/g, '-')] = {
                label: platformName
            }
        })
        return config
    }, [data])

    if (data.length === 0) {
        return (
            <Card className="bg-white/[0.03] border-white/5 flex flex-col items-center justify-center p-6 text-center">
                <PieIcon className="size-8 text-slate-700 mb-3" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Platform Data</p>
                <p className="text-[9px] text-slate-600 mt-1 italic">Log earnings to see your sources</p>
            </Card>
        )
    }

    return (
        <Card className="bg-white/[0.03] border-white/5 flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
                                <PieIcon className="size-3" />
                            </div>
                            Platform Efficiency
                        </CardTitle>
                        <CardDescription className="text-[9px] font-medium text-slate-600 uppercase tracking-wider">
                            Weekly Mix & Performance
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0 px-4 pt-2">
                {/* Donut Chart — larger with glow */}
                <div className="relative mx-auto w-full max-w-[220px]">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-indigo-500/5 blur-xl pointer-events-none" />

                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square w-full"
                    >
                        <PieChart>
                            <defs>
                                {/* Glow filter for the chart */}
                                <filter id="chart-glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="55%"
                                outerRadius="85%"
                                strokeWidth={3}
                                stroke="rgba(15, 23, 42, 0.8)"
                                paddingAngle={2}
                                cornerRadius={4}
                                filter="url(#chart-glow)"
                            >
                                {data.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.fill} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) - 4}
                                                        className="fill-white text-3xl font-extrabold font-display tracking-tighter"
                                                    >
                                                        ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 18}
                                                        className="fill-emerald-400 text-[9px] uppercase font-black tracking-[0.2em]"
                                                    >
                                                        Gross
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                    position="center"
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-1.5 text-sm p-4 pt-3 border-t border-white/5 bg-white/[0.02]">
                <div className="grid grid-cols-1 gap-1.5 w-full">
                    {data.map((item, idx) => {
                        const hRate = item.hours > 0 ? item.value / item.hours : 0
                        const tipPct = item.value > 0 ? (item.tips / item.value) * 100 : 0

                        return (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "size-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-slate-950",
                                            PLATFORM_BG_COLORS[item.name.toLowerCase()] || "bg-slate-500",
                                            PLATFORM_RING_SHADOWS[item.name.toLowerCase()] || PLATFORM_RING_SHADOWS.other
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "text-xs font-bold",
                                            PLATFORM_COLORS[item.name.toLowerCase()] || "text-slate-500"
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    {hRate > 0 && (
                                        <span className="text-[9px] text-blue-400 font-bold">${hRate.toFixed(0)}/h</span>
                                    )}
                                    {tipPct > 0 && (
                                        <span className="text-[9px] text-amber-400 font-bold">{tipPct.toFixed(0)}% tip</span>
                                    )}
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-sm font-extrabold text-white">${item.value.toFixed(0)}</span>
                                        <span className="text-[7px] text-emerald-500/60 font-black uppercase tracking-wider">gross</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardFooter>
        </Card>
    )
})
