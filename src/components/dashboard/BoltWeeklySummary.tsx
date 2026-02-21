'use client';

import { TrendingUp, Calendar, ArrowRight, Edit, Trash2, Loader2 } from 'lucide-react';
import { useState, memo } from 'react';
import Link from 'next/link';
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
                // Note: revalidatePath in the action should refresh the server components
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

    // Filter to only show days with actual activity or non-zero stats if preferred, 
    // but showing all 7 days provides context. Let's show days with *any* activity primarily.
    // Actually, user wants "clicks and sees separate days". Showing all valid days in range is good.
    // We will reverse it to show newest first.
    const reverseStats = [...dailyStats].reverse();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="glass-card p-5 border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer transition-all hover:bg-white/5">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 blur-[100px] rounded-full transition-all group-hover:bg-blue-500/10 pointer-events-none" />

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-400 transition-colors">Weekly Performance</h2>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Aggregated insights • Tap for details</p>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md group-hover:bg-blue-500/20 group-hover:border-blue-500/20 transition-all">
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-300 font-bold uppercase tracking-wider">
                                {entries.length}d Active
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 active:scale-[0.99] transition-transform">
                            <div className="absolute top-0 right-0 p-2 opacity-10 transform translate-x-2 -translate-y-2">
                                <TrendingUp className="size-16" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Net Profit</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold opacity-50">$</span>
                                <p className="text-3xl font-extrabold tracking-tighter">{totalNetProfit.toFixed(2)}</p>
                            </div>
                            <div className="mt-3 inline-block px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold">
                                Avg ${avgDailyProfit.toFixed(2)}/day
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-card p-3 border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${totalGross.toFixed(2)}</p>
                            </div>

                            <div className="glass-card p-3 border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Miles</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{totalMiles.toFixed(1)}</p>
                            </div>

                            <div className="glass-card p-3 border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hours</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                    {totalHours > 0 ? totalHours.toFixed(1) : '—'}
                                </p>
                            </div>

                            <div className="glass-card p-3 border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hourly</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                    {hourlyRate > 0 ? `$${hourlyRate.toFixed(2)}` : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetTrigger>
            <SheetContent className="backdrop-blur-3xl bg-slate-950/95 border-white/5">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-white">
                        <Calendar className="size-5 text-blue-500" />
                        Weekly Breakdown
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 font-medium">
                        Daily performance for the last 7 days.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-3">
                        {reverseStats.map((day, idx) => {
                            const isZero = day.net === 0 && day.gross === 0 && !day.id;
                            if (isZero) return null;

                            return (
                                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className="font-bold text-white text-lg">{day.label}</span>
                                            <span className="text-xs text-slate-500 font-medium ml-1">{day.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {day.id && (
                                                <div className="flex items-center gap-1.5 mr-2">
                                                    <Link href={`/dashboard/entry/${day.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all">
                                                            <Edit className="size-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={deletingId === day.id}
                                                        onClick={() => day.id && handleDelete(day.id, day.date)}
                                                        className="size-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                                                    >
                                                        {deletingId === day.id ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="flex flex-col items-end">
                                                {day.expenses > 0 && (
                                                    <span className="text-[10px] font-bold text-rose-400 opacity-80">-${day.expenses.toFixed(2)}</span>
                                                )}
                                                <span className="font-extrabold text-xl text-emerald-400">${day.net.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Gross</p>
                                            <p className="text-sm font-bold text-slate-300">${day.gross.toFixed(0)}</p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Miles</p>
                                            <p className="text-sm font-bold text-slate-300">{day.miles.toFixed(0)}</p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Hours</p>
                                            <p className="text-sm font-bold text-slate-300">{day.hours.toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {reverseStats.every(d => d.net === 0 && d.gross === 0 && !d.id) && (
                            <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                No activity recorded this week.
                            </div>
                        )}

                        <div className="pt-4 pb-2 flex justify-center">
                            <Link href="/dashboard/reports" className="group flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-400 transition-colors">
                                View full detailed report
                                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
});
