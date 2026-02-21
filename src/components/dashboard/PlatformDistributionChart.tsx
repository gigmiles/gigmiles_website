'use client'

import { Pie, PieChart, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { PieChart as PieIcon, Info } from "lucide-react"
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
    'uber': 'text-black dark:text-white', // Uber is black/white
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

export const PlatformDistributionChart = React.memo(function PlatformDistributionChart({ data }: PlatformDistributionProps) {
    const totalEarnings = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0)
    }, [data])

    const bestPlatform = React.useMemo(() => {
        if (data.length === 0) return null
        const sorted = [...data].sort((a, b) => b.value - a.value)
        const best = sorted[0]
        if (best.name === 'Other' || best.name === 'other') return null
        return best
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
            <Card className="glass-card border-slate-200 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center">
                <PieIcon className="size-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Platform Data</p>
                <p className="text-[10px] text-slate-600 mt-1 italic">Log earnings to see your sources</p>
            </Card>
        )
    }

    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 flex flex-col group overflow-hidden">
            <CardHeader className="items-start pb-0">
                <div className="flex w-full items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <PieIcon className="size-4" />
                            </div>
                            Platform Efficiency
                        </CardTitle>
                        <CardDescription className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Weekly Mix & Performance
                        </CardDescription>
                    </div>
                    {bestPlatform && (
                        <div className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-tight">
                            MVP Platform: {bestPlatform.name}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[220px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            strokeWidth={8}
                            stroke="rgba(15, 23, 42, 0.9)"
                        >
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
                                                    y={viewBox.cy}
                                                    className="fill-slate-900 dark:fill-white text-3xl font-bold font-display tracking-tighter"
                                                >
                                                    ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]"
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
            </CardContent>
            <CardFooter className="flex-col gap-4 text-sm pt-4 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
                <div className="grid grid-cols-1 gap-3 w-full">
                    {data.map((item, idx) => {
                        const hRate = item.hours > 0 ? item.value / item.hours : 0
                        const tipPct = item.value > 0 ? (item.tips / item.value) * 100 : 0

                        return (
                            <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "size-2.5 rounded-full shrink-0 shadow-sm",
                                                item.name.toLowerCase().includes('uber') && "uber-halo-dot",
                                                PLATFORM_BG_COLORS[item.name.toLowerCase()] || "bg-slate-500"
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "text-sm font-bold antialiased",
                                                item.name.toLowerCase().includes('uber') && "uber-halo-text",
                                                PLATFORM_COLORS[item.name.toLowerCase()] || "text-slate-500"
                                            )}
                                        >
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">${item.value.toFixed(0)} ({((item.value / totalEarnings) * 100).toFixed(0)}%)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                                            <Info className="size-2.5" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Hourly</p>
                                            <p className="text-[11px] font-bold text-blue-400">${hRate.toFixed(2)}/h</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                                            <Info className="size-2.5" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Tip Rate</p>
                                            <p className="text-[11px] font-bold text-amber-400">{tipPct.toFixed(1)}%</p>
                                        </div>
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
