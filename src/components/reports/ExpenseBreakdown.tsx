'use client'

import { useState } from 'react'
import {
    ChevronRight,
    Receipt,
    Calendar as CalendarIcon,
    PieChart
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExpenseItem {
    amount: number
    description: string
    date: string
}

interface ExpenseCategory {
    category: string
    total: number
    items: ExpenseItem[]
}

interface ExpenseBreakdownProps {
    data: ExpenseCategory[]
}

export function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
    const totalExpenses = data.reduce((acc, curr) => acc + curr.total, 0)

    if (!data || data.length === 0) {
        return (
            <div className="glass-card flex flex-col items-center justify-center p-8 border-dashed shadow-none">
                <Receipt className="size-8 text-slate-700 mb-3" />
                <p className="text-slate-500 font-medium text-xs">No expenses found for this period.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <PieChart className="size-3.5 text-red-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Cost Distribution</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                    Total: <span className="text-red-400">${totalExpenses.toFixed(2)}</span>
                </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((category, idx) => {
                    const pct = (category.total / totalExpenses) * 100;
                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(category)}
                            className="glass-card glass-card-hover p-4 transition-all text-left active:scale-[0.98] group hover-spring"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 font-bold">
                                    {category.items.length} items
                                </span>
                                <ChevronRight className="size-3 text-slate-700 group-hover:text-slate-400 transition-colors" />
                            </div>

                            <h4 className="text-sm font-bold text-slate-300 mb-1">{category.category}</h4>
                            <div className="flex items-baseline gap-1.5">
                                <span className="animate-number-pop text-lg font-bold text-red-400">${category.total.toFixed(2)}</span>
                                <span className="text-[9px] text-slate-600 font-bold">{pct.toFixed(0)}%</span>
                            </div>

                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-red-500/40 rounded-full transition-all duration-700"
                                    {...({ style: { width: `${pct}%` } } as Record<string, unknown>)}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Drill-down Sheet */}
            <Sheet open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <SheetContent className="bg-[#0B1120]/95 backdrop-blur-3xl border-white/5 w-full sm:max-w-md p-0 overflow-hidden">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-red-500/5 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400">
                                    <Receipt className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-red-400">Category</p>
                                    <h2 className="text-2xl font-display font-bold text-white tracking-tight">{selectedCategory?.category}</h2>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="animate-number-pop text-4xl font-display font-bold text-white tracking-tighter">
                                    ${selectedCategory?.total.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Total</span>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-5">
                            <div className="space-y-3">
                                {selectedCategory?.items.map((item, i) => (
                                    <div key={i} className="glass-card glass-card-hover p-4 transition-colors">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarIcon className="size-2.5 text-slate-600" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.date}</span>
                                            </div>
                                            <span className="animate-number-pop text-sm font-bold text-white">${item.amount.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium italic">&quot;{item.description}&quot;</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-slate-900/50 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                <span>Period Items</span>
                                <span>{selectedCategory?.items.length} Transactions</span>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
