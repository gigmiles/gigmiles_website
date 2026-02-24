'use client'

import { TrendingUp, MinusCircle, Plus, Trash2, Check, Edit2, X } from 'lucide-react'
import { motion } from 'framer-motion'
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
import { Expense } from '@/app/dashboard/types'

interface ExpensesSheetProps {
    totalGrandCosts: number
    expenses: number
    tax: number
    federalTax: number
    stateTax: number
    directExpenses: any[]
    isAddingExpense: boolean
    newExpense: any
    isSaving: boolean
    editingField: string | null
    editValue: string
    onToggleAddExpense: () => void
    onAddExpense: () => void
    onDeleteExpense: (id: string) => void
    onSaveOverride: (category: string) => void
    setNewExpense: (data: any) => void
    setEditingField: (field: string | null) => void
    setEditValue: (value: string) => void
}

export function ExpensesSheet({
    totalGrandCosts,
    expenses,
    tax,
    federalTax,
    stateTax,
    directExpenses,
    isAddingExpense,
    newExpense,
    isSaving,
    editingField,
    editValue,
    onToggleAddExpense,
    onAddExpense,
    onDeleteExpense,
    onSaveOverride,
    setNewExpense,
    setEditingField,
    setEditValue
}: ExpensesSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="glass-card glass-card-hover p-4 text-left group relative" title="View Expense Breakdown">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <div className="p-1.5 rounded-lg bg-ruby-500/10 text-ruby-500">
                            <TrendingUp className="size-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Total Costs</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            ${totalGrandCosts.toFixed(2)}
                        </p>
                    </div>
                    <div className="mt-3 flex gap-1 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (expenses / totalGrandCosts) * 100)}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-ruby-500"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (tax / totalGrandCosts) * 100)}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-amber-500"
                        />
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-ruby-500" />
                                <span className="text-slate-500 dark:text-slate-400">EXPENSE</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-slate-500 dark:text-slate-400">TAX</span>
                            </div>
                        </div>
                    </div>
                </button>
            </SheetTrigger>
            <SheetContent className="backdrop-blur-3xl bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-white/5">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <MinusCircle className="size-5 text-ruby-500" />
                        Expenses &amp; Projections
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 font-medium">
                        Detailed breakdown of today's costs.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Direct Expenses</h3>
                                <button
                                    onClick={onToggleAddExpense}
                                    className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-500 dark:text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                                >
                                    <Plus className="size-3" />
                                    Add New
                                </button>
                            </div>

                            {isAddingExpense && (
                                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="Category"
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                        />
                                    </div>
                                    <input
                                        placeholder="Description (Optional)"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onAddExpense();
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onAddExpense}
                                            disabled={isSaving}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSaving ? 'Adding...' : 'Add Expense'}
                                        </button>
                                        <button
                                            onClick={onToggleAddExpense}
                                            className="px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {directExpenses.length > 0 ? (
                                <div className="space-y-3">
                                    {directExpenses.map((e, idx: number) => (
                                        <div key={idx} className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm block">{e.category}</span>
                                                    {e.description && (
                                                        <p className="text-xs text-slate-500 mt-1 font-medium italic opacity-70 group-hover:opacity-100">"{e.description}"</p>
                                                    )}
                                                </div>
                                                <span className="font-extrabold text-ruby-400">-${(e.amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end">
                                                <button
                                                    onClick={() => onDeleteExpense(e.id)}
                                                    disabled={isSaving}
                                                    className="p-1.5 rounded-lg bg-ruby-500/10 text-ruby-500 hover:bg-ruby-500 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
                                                    aria-label={`Delete expense ${e.category}`}
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                    No direct expenses.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Projections & Overrides</h3>
                            <div className="space-y-1">
                                <div className="group rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:border-slate-300 dark:hover:border-white/10">
                                    <div className="flex justify-between items-center p-4">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Total Tax Estimates</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white text-lg">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Federal (15.3%)</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">${federalTax.toFixed(2)}</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">State Estimate</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">${stateTax.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
