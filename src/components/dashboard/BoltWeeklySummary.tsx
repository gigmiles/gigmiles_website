'use client';

import { TrendingUp, Calendar, ArrowRight, Edit, Trash2, Loader2 } from 'lucide-react';
import { useState, memo } from 'react';
import Link from 'next/link';
import { GlassTooltip } from '@/components/ui/GlassTooltip';
import { calculateHourlyRate } from '@/utils/calculations';
import { DailyEntry } from '@/app/dashboard/types';
import { deleteDailyEntry } from '@/app/dashboard/actions';
import { toast } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';

interface WeeklySummaryProps {
    entries: DailyEntry[];
    totalNetProfit: number;
    totalGross: number;
    totalMiles: number;
    totalHours: number;
    dailyStats: {
        id?: string | null;
        date: string;
        label: string;
        gross: number;
        net: number;
        miles: number;
        hours: number;
        expenses: number;
    }[];
}

export const BoltWeeklySummary = memo(function BoltWeeklySummary({
    entries,
    totalNetProfit,
    totalGross,
    totalMiles,
    totalHours,
    dailyStats
}: WeeklySummaryProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const avgDailyProfit = entries.length > 0 ? totalNetProfit / entries.length : 0;
    const hourlyRate = calculateHourlyRate(totalNetProfit, totalHours);

    const handleDelete = async (id: string, date: string) => {
        if (!confirm(`Are you sure you want to delete the entry for ${date}?`)) return;

        setDeletingId(id);
        const toastId = toast.loading(`Deleting entry for ${date}...`);
        try {
            const result = await deleteDailyEntry(id);
            if (result.success) {
                toast.success("Entry deleted successfully", { id: toastId });
            } else {
                toast.error("Failed to delete entry", { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred during deletion", { id: toastId });
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const reverseStats = [...dailyStats].reverse();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="glass-card glass-card-hover p-4 cursor-pointer flex flex-col flex-1 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div>
                                <h2 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">Weekly Performance</h2>
                                <p className="text-[9px] text-slate-600 font-medium">Tap for daily breakdown</p>
                            </div>
                            <GlassTooltip content="Your net take-home pay, calculated by subtracting all logged expenses from your gross income." side="right" />
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 font-bold group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all">
                            {entries.length}d Active
                        </span>
                    </div>

                    {/* Net Profit Highlight */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-4 text-white mb-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-70 mb-0.5">Total Net Profit</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold opacity-50">$</span>
                            <p className="animate-number-pop text-2xl font-extrabold tracking-tighter">{totalNetProfit.toFixed(2)}</p>
                        </div>
                        <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-bold">
                            Avg ${avgDailyProfit.toFixed(2)}/day
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Gross', value: `$${totalGross.toFixed(0)}` },
                            { label: 'Miles', value: totalMiles.toFixed(0) },
                            { label: 'Hours', value: totalHours > 0 ? totalHours.toFixed(1) : '—' },
                            { label: '$/hr', value: hourlyRate > 0 ? `$${hourlyRate.toFixed(0)}` : '—' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-lg p-2 border border-white/5 text-center">
                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">{s.label}</p>
                                <p className="text-sm font-bold text-white">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetTrigger>
            <SheetContent className="backdrop-blur-3xl bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-white/5">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Calendar className="size-4 text-blue-500" />
                        Weekly Breakdown
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 text-xs font-medium">
                        Daily performance for the last 7 days.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
                    <div className="space-y-2">
                        {reverseStats.map((day, idx) => {
                            const isZero = day.net === 0 && day.gross === 0 && !day.id;
                            if (isZero) return null;

                            return (
                                <div key={idx} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-blue-500" />
                                            <span className="font-bold text-white text-sm">{day.label}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">{day.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {day.id && (
                                                <div className="flex items-center gap-1">
                                                    <Link href={`/dashboard/entry/${day.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="size-6 rounded-md bg-white/[0.03] hover:bg-blue-500/20 text-slate-500 hover:text-blue-400">
                                                            <Edit className="size-3" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={deletingId === day.id}
                                                        onClick={() => day.id && handleDelete(day.id, day.date)}
                                                        className="size-6 rounded-md bg-white/[0.03] hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                                                    >
                                                        {deletingId === day.id ? (
                                                            <Loader2 className="size-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="text-right">
                                                {day.expenses > 0 && (
                                                    <span className="text-[9px] font-bold text-red-400 block">-${day.expenses.toFixed(2)}</span>
                                                )}
                                                <span className="font-bold text-base text-emerald-400">${day.net.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                            { label: 'Gross', value: `$${day.gross.toFixed(0)}` },
                                            { label: 'Miles', value: day.miles.toFixed(0) },
                                            { label: 'Hours', value: day.hours.toFixed(1) },
                                        ].map((s, i) => (
                                            <div key={i} className="p-1.5 rounded-md bg-white/[0.03] border border-white/5 text-center">
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">{s.label}</p>
                                                <p className="text-xs font-bold text-slate-300">{s.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {reverseStats.every(d => d.net === 0 && d.gross === 0 && !d.id) && (
                            <div className="text-center py-8 text-xs text-slate-500 bg-white/[0.02] rounded-lg border border-dashed border-white/10">
                                No activity recorded this week.
                            </div>
                        )}

                        <div className="pt-3 pb-2 flex justify-center">
                            <Link href="/dashboard/reports" className="group flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-blue-400 transition-colors">
                                View full report
                                <ArrowRight className="size-2.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
});
