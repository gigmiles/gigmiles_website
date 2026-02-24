'use client'

import { DollarSign, Briefcase, X, Edit2, Trash2 } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from '@/lib/utils'
import { PlatformEarning } from '@/app/dashboard/types'

interface EarningsSheetProps {
    gross: number
    platformEarnings: PlatformEarning[]
    editingPlatformId: string | null
    platformEditData: any
    isSaving: boolean
    onEdit: (p: PlatformEarning) => void
    onCancelEdit: () => void
    onSaveEdit: (id: string) => void
    onDelete: (id: string) => void
    setPlatformEditData: (data: any) => void
}

export function EarningsSheet({
    gross,
    platformEarnings,
    editingPlatformId,
    platformEditData,
    isSaving,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    setPlatformEditData
}: EarningsSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="glass-card glass-card-hover p-4 text-left group relative" title="View Earnings Breakdown">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="size-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Gross Income</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            ${gross.toFixed(2)}
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {platformEarnings.length > 0 ? (
                                platformEarnings.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "size-1.5 rounded-full",
                                            `bg-[var(--color-${(p.platform_name || 'Other').toLowerCase().replace(/\s+/g, '-')})]`
                                        )} />
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                            {p.platform_name}: <span className="text-slate-700 dark:text-slate-200">${((p.amount || 0) + (p.tips || 0)).toFixed(0)}</span>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[10px] font-bold text-slate-500/50 uppercase tracking-widest italic">No Data logged</span>
                            )}
                        </div>
                    </div>
                </button>
            </SheetTrigger>
            <SheetContent className="backdrop-blur-3xl bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-white/5">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Briefcase className="size-5 text-emerald-400" />
                        Earnings Breakdown
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 font-medium">
                        Platform-specific performance for today. <span className="text-emerald-500/80 italic text-[10px] block mt-1">Note: Hourly rates in this view are based on Gross Income.</span>
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-6">
                        {platformEarnings.length > 0 ? (
                            platformEarnings.map((p, idx: number) => {
                                const platformSlug = (p.platform_name || 'Other').toLowerCase().replace(/\s+/g, '-');
                                const isUber = platformSlug.includes('uber');

                                return (
                                    <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-slate-300 dark:hover:border-white/20 transition-all relative">
                                        {editingPlatformId === p.id ? (
                                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white mb-2">
                                                    <span>Editing {p.platform_name}</span>
                                                    <button onClick={onCancelEdit} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full" aria-label="Cancel editing"><X className="size-4" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label htmlFor={`base-pay-${p.id}`} className="text-[10px] uppercase text-slate-500 font-bold">Base Pay</label>
                                                        <input
                                                            id={`base-pay-${p.id}`}
                                                            type="number"
                                                            value={platformEditData.amount}
                                                            onChange={e => setPlatformEditData({ ...platformEditData, amount: e.target.value })}
                                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`tips-${p.id}`} className="text-[10px] uppercase text-slate-500 font-bold">Tips</label>
                                                        <input
                                                            id={`tips-${p.id}`}
                                                            type="number"
                                                            value={platformEditData.tips}
                                                            onChange={e => setPlatformEditData({ ...platformEditData, tips: e.target.value })}
                                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-emerald-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`miles-${p.id}`} className="text-[10px] uppercase text-slate-500 font-bold">Miles</label>
                                                        <input
                                                            id={`miles-${p.id}`}
                                                            type="number"
                                                            value={platformEditData.miles}
                                                            onChange={e => setPlatformEditData({ ...platformEditData, miles: e.target.value })}
                                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-blue-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`hours-${p.id}`} className="text-[10px] uppercase text-slate-500 font-bold">Hours</label>
                                                        <input
                                                            id={`hours-${p.id}`}
                                                            type="number"
                                                            value={platformEditData.hours}
                                                            onChange={e => setPlatformEditData({ ...platformEditData, hours: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') p.id && onSaveEdit(p.id);
                                                            }}
                                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-indigo-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => p.id && onSaveEdit(p.id)}
                                                        disabled={isSaving}
                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 dark:text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={cn(
                                                                "size-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                                                isUber && "uber-halo-dot",
                                                                `bg-[var(--color-${platformSlug})]`
                                                            )}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "font-bold text-lg tracking-tight",
                                                                isUber && "uber-halo-text",
                                                                `text-[var(--color-${platformSlug})]`
                                                            )}
                                                        >
                                                            {p.platform_name || 'Other'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-extrabold text-slate-900 dark:text-white text-xl">${((p.amount || 0) + (p.tips || 0)).toFixed(2)}</span>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label={`Edit ${p.platform_name}`}>
                                                                <Edit2 className="size-3" />
                                                            </button>
                                                            <button onClick={() => p.id && onDelete(p.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors" aria-label={`Delete ${p.platform_name}`}>
                                                                <Trash2 className="size-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                                                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
                                                        <span>Base Earnings</span>
                                                        <span className="text-slate-700 dark:text-slate-200">${(p.amount || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
                                                        <span>Tips &amp; Extras</span>
                                                        <span className="text-emerald-400/80">+${(p.tips || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span>Distance</span>
                                                        <span className="text-slate-700 dark:text-slate-200">{p.miles || 0} mi</span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span>Time</span>
                                                        <span className="text-slate-700 dark:text-slate-200">{p.hours || 0} h</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 text-slate-600 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                No platform earnings recorded.
                            </div>
                        )}

                        <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                            <div className="flex justify-between items-center font-bold text-xl text-slate-900 dark:text-white">
                                <span>Total Gross</span>
                                <span className="text-emerald-400">${gross.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
