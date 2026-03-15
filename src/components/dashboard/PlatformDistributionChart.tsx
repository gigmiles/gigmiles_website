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
    'uber': 'text-white',
    'uber eats': 'text-[#06C167]',
    'lyft': 'text-[#FF00BF]',
    'doordash': 'text-[#FF3008]',
    'grubhub': 'text-[#FF8000]',
    'instacart': 'text-[#43B02A]',
    'spark': 'text-[#0071CE]',
    'amazon flex': 'text-[#FF9900]',
    'roadie': 'text-[#10B981]',
    'shipt': 'text-[#6366F1]',
    'gopuff': 'text-[#00A3E0]',
    'favor': 'text-[#F59E0B]',
    'point pickup': 'text-[#8B5CF6]',
    'other': 'text-slate-500'
}

const PLATFORM_BG_COLORS: Record<string, string> = {
    'uber': 'bg-white',
    'uber eats': 'bg-[#06C167]',
    'lyft': 'bg-[#FF00BF]',
    'doordash': 'bg-[#FF3008]',
    'grubhub': 'bg-[#FF8000]',
    'instacart': 'bg-[#43B02A]',
    'spark': 'bg-[#0071CE]',
    'amazon flex': 'bg-[#FF9900]',
    'roadie': 'bg-[#10B981]',
    'shipt': 'bg-[#6366F1]',
    'gopuff': 'bg-[#00A3E0]',
    'favor': 'bg-[#F59E0B]',
    'point pickup': 'bg-[#8B5CF6]',
    'other': 'bg-slate-500'
}

const PLATFORM_RING_SHADOWS: Record<string, string> = {
    'uber': 'ring-white shadow-[0_0_8px_rgba(255,255,255,0.4)]',
    'uber eats': 'ring-[#06C167] shadow-[0_0_8px_rgba(6,193,103,0.4)]',
    'lyft': 'ring-[#FF00BF] shadow-[0_0_8px_rgba(255,0,191,0.4)]',
    'doordash': 'ring-[#FF3008] shadow-[0_0_8px_rgba(255,48,8,0.4)]',
    'grubhub': 'ring-[#FF8000] shadow-[0_0_8px_rgba(255,128,0,0.4)]',
    'instacart': 'ring-[#43B02A] shadow-[0_0_8px_rgba(67,176,42,0.4)]',
    'spark': 'ring-[#0071CE] shadow-[0_0_8px_rgba(0,113,206,0.4)]',
    'amazon flex': 'ring-[#FF9900] shadow-[0_0_8px_rgba(255,153,0,0.4)]',
    'roadie': 'ring-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    'shipt': 'ring-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.4)]',
    'gopuff': 'ring-[#00A3E0] shadow-[0_0_8px_rgba(0,163,224,0.4)]',
    'favor': 'ring-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    'point pickup': 'ring-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    'other': 'ring-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]'
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
            <Card className="glass-card flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <div className="size-16 rounded-[1.5rem] bg-[#10B981]/10 flex items-center justify-center mb-4">
                    <PieIcon className="size-8 text-[#10B981]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]">No Platform Data</p>
                <p className="text-[9px] text-[#A1A1AA]/60 mt-2 font-medium">Log earnings to see your sources</p>
            </Card>
        )
    }

    return (
        <Card className="glass-card flex flex-col overflow-hidden">
            <CardHeader className="p-5 pb-0">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-sm flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                                <PieIcon className="size-4" />
                            </div>
                            Platform Mix
                        </CardTitle>
                        <CardDescription className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]/60 ml-[2.625rem]">
                            Weekly Performance
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0 px-4 pt-2">
                {/* Donut Chart — Premium Vibe */}
                <div className="relative mx-auto w-full max-w-[240px]">
                    {/* Outer ambient glow */}
                    <div className="absolute inset-[-10%] rounded-full bg-gradient-to-br from-[#10B981]/8 via-transparent to-indigo-500/5 blur-[40px] pointer-events-none animate-pulse" />
                    {/* Outer ring decoration */}
                    <div className="absolute inset-[2%] rounded-full border border-white/[0.04] pointer-events-none" />

                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square w-full"
                    >
                        <PieChart>
                            <defs>
                                <filter id="segment-glow">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
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
                                innerRadius="52%"
                                outerRadius="88%"
                                strokeWidth={4}
                                stroke="rgba(13, 15, 20, 0.9)"
                                paddingAngle={3}
                                cornerRadius={6}
                                filter="url(#segment-glow)"
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
                                                        y={(viewBox.cy || 0) - 2}
                                                        className="fill-white text-2xl font-black tracking-tighter"
                                                        style={{ fontStyle: 'italic' }}
                                                    >
                                                        ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 16}
                                                        className="fill-[#10B981] text-[7px] uppercase font-black"
                                                        style={{ letterSpacing: '0.35em' }}
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
            <CardFooter className="flex-col gap-2 text-sm p-4 pt-3 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="grid grid-cols-1 gap-1.5 w-full">
                    {data.map((item, idx) => {
                        const hRate = item.hours > 0 ? item.value / item.hours : 0
                        const tipPct = item.value > 0 ? (item.tips / item.value) * 100 : 0
                        const pct = totalEarnings > 0 ? ((item.value / totalEarnings) * 100).toFixed(0) : '0'

                        return (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "size-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-[#0D0F14]",
                                            PLATFORM_BG_COLORS[item.name.toLowerCase()] || "bg-slate-500",
                                            PLATFORM_RING_SHADOWS[item.name.toLowerCase()] || PLATFORM_RING_SHADOWS.other
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.05em]",
                                            PLATFORM_COLORS[item.name.toLowerCase()] || "text-slate-500"
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                    <span className="text-[8px] font-bold text-[#A1A1AA]/40">{pct}%</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    {hRate > 0 && (
                                        <span className="text-[8px] text-blue-400/80 font-black uppercase">${hRate.toFixed(0)}/h</span>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs font-black text-white italic">${item.value.toFixed(0)}</span>
                                        <span className="text-[6px] text-[#10B981]/60 font-black uppercase tracking-wider">gross</span>
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
