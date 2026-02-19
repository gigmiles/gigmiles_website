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
            <div className="flex flex-col items-center justify-center p-12 glass-card border-dashed border-white/10">
                <Receipt className="size-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium text-sm">No expenses found for this period.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <PieChart className="size-4 text-ruby-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Cost Distribution</h3>
                </div>
                <div className="text-xs font-bold text-slate-500">
                    Total: <span className="text-ruby-400">${totalExpenses.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((category, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedCategory(category)}
                        className="glass-card p-5 border-white/5 hover:bg-white/5 transition-all group text-left relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                            <Receipt className="size-12" />
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold uppercase tracking-tight">
                                {category.items.length} items
                            </span>
                            <ChevronRight className="size-4 text-slate-600 group-hover:text-white transition-colors" />
                        </div>

                        <h4 className="text-lg font-display font-bold text-slate-200 mb-1">{category.category}</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-display font-bold text-ruby-400">${category.total.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 font-bold">
                                {((category.total / totalExpenses) * 100).toFixed(0)}% of costs
                            </span>
                        </div>

                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                            <div
                                className="h-full bg-ruby-500/50 transition-all duration-1000 ease-out"
                                {...({ style: { width: `${(category.total / totalExpenses) * 100}%` } } as Record<string, unknown>)}
                            />
                        </div>
                    </button>
                ))}
            </div>

            {/* Drill-down Detail Sheet */}
            <Sheet open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <SheetContent className="bg-[#020617]/95 backdrop-blur-3xl border-white/5 w-full sm:max-w-md p-0 overflow-hidden">
                    <div className="h-full flex flex-col">
                        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-ruby-500/10 to-transparent">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-ruby-500/20 text-ruby-400">
                                    <Receipt className="size-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ruby-400">Category Breakdown</p>
                                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">{selectedCategory?.category}</h2>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-display font-bold text-white tracking-tighter">
                                    ${selectedCategory?.total.toFixed(2)}
                                </span>
                                <span className="text-sm font-medium text-slate-400">Total Spent</span>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-4">
                                {selectedCategory?.items.map((item, i) => (
                                    <div key={i} className="glass-card p-4 border-white/5 bg-white/[0.02] group hover:bg-white/[0.05] transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="size-3 text-slate-500" />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.date}</span>
                                            </div>
                                            <span className="text-md font-display font-bold text-white">${item.amount.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                                            &quot;{item.description}&quot;
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-6 bg-slate-900/50 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
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
