'use client'

import { DollarSign, TrendingUp, Navigation, Clock, Briefcase, MinusCircle, Info, Edit2, Check, X, ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { calculateHourlyRate, calculateProfitMargin } from '@/utils/calculations';
import { useState } from 'react';
import { saveCostOverride, addExpense, deleteExpense } from '@/app/dashboard/actions';
import { toast } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TodaySummaryProps {
    gross: number;
    netProfit: number;
    expenses: number;
    miles: number;
    hours: number;
    tax: number;
    tips: number;
    mpg?: number;
    gasPrice?: number;
    fuelCost?: number;
    wearCost?: number;
    insurance?: number;
    richEntry?: any;
}

export function BoltTodaySummary({
    gross,
    netProfit,
    expenses,
    miles,
    hours,
    tax,
    tips,
    mpg,
    gasPrice,
    fuelCost,
    wearCost,
    insurance,
    richEntry
}: TodaySummaryProps) {
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const hourlyRate = calculateHourlyRate(netProfit, hours);
    const profitMargin = calculateProfitMargin(netProfit, gross);

    const platformEarnings = richEntry?.platform_earnings || [];
    // Filter out legacy "Depreciation" entries as they are now calculated dynamically
    const directExpenses = (richEntry?.expenses || []).filter((e: any) =>
        e.category !== 'Depreciation' &&
        e.category !== '__FUEL_OVERRIDE__' &&
        e.category !== '__WEAR_OVERRIDE__' &&
        e.category !== '__INSURANCE_OVERRIDE__'
    );

    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });

    const handleAddDirectExpense = async () => {
        if (!newExpense.category || !newExpense.amount) {
            toast.error("Please enter a category and amount");
            return;
        }

        setIsSaving(true);
        try {
            const date = richEntry?.entry_date || new Date().toISOString().split('T')[0];
            await addExpense(date, {
                category: newExpense.category,
                amount: parseFloat(newExpense.amount),
                description: newExpense.description
            });
            toast.success("Expense added successfully!");
            setIsAddingExpense(false);
            setNewExpense({ category: '', amount: '', description: '' });
        } catch (error) {
            toast.error("Failed to add expense");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        setIsSaving(true);
        try {
            await deleteExpense(id);
            toast.success("Expense deleted");
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsSaving(false);
        }
    };

    const totalGrandCosts = expenses + tax;

    const handleSaveOverride = async (category: string) => {
        setIsSaving(true);
        try {
            const date = richEntry?.entry_date || new Date().toISOString().split('T')[0];
            const amount = parseFloat(editValue);

            await saveCostOverride(date, category, isNaN(amount) ? 0 : amount);
            toast.success("Cost updated!");
            setEditingField(null);
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full transition-all group-hover:bg-emerald-500/10 pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Daily Summary</h2>
                    <p className="text-xs text-slate-500 font-medium">Real-time performance metrics</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Hero Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-transform cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                        <TrendingUp className="size-24" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Net Profit (Take-Home)</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold opacity-60">$</span>
                        <p className="text-5xl font-extrabold tracking-tighter">{netProfit.toFixed(2)}</p>
                    </div>
                    {profitMargin > 0 && (
                        <div className="inline-flex items-center gap-2 mt-6 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                            <ArrowUpRight className="size-3" />
                            <span className="text-xs font-bold tracking-tight">
                                {profitMargin.toFixed(1)}% profit margin
                            </span>
                        </div>
                    )}
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Gross Income Card */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="glass-card glass-card-hover p-4 text-left group">
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <DollarSign className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Gross Income</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">${gross.toFixed(2)}</p>
                                <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (gross / (gross + totalGrandCosts || 1)) * 100)}%` }}
                                    />
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="size-4 text-emerald-500/50" />
                                </div>
                            </button>
                        </SheetTrigger>
                        {/* Sheet content remains same for functionality but can be styled later if needed */}
                        <SheetContent className="backdrop-blur-3xl bg-slate-950/95 border-white/5">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-white">
                                    <Briefcase className="size-5 text-emerald-400" />
                                    Earnings Breakdown
                                </SheetTitle>
                                <SheetDescription className="text-slate-500 font-medium">
                                    Platform-specific performance for today.
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                                <div className="space-y-6">
                                    {platformEarnings.length > 0 ? (
                                        platformEarnings.map((p: any, idx: number) => {
                                            const platformSlug = p.platform_name.toLowerCase().replace(/\s+/g, '-');
                                            const platformColor = `var(--color-${platformSlug})`;
                                            const isUber = platformSlug.includes('uber');

                                            return (
                                                <div key={idx} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`size-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isUber ? 'uber-halo-dot' : ''}`}
                                                                style={{ backgroundColor: platformColor }}
                                                            />
                                                            <span
                                                                className={`font-bold text-lg tracking-tight ${isUber ? 'uber-halo-text' : ''}`}
                                                                style={{ color: platformColor }}
                                                            >
                                                                {p.platform_name}
                                                            </span>
                                                        </div>
                                                        <span className="font-extrabold text-white text-xl">${((p.amount || 0) + (p.tips || 0)).toFixed(2)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 font-medium mt-2">
                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                            <span>Base Earnings</span>
                                                            <span className="text-slate-200">${(p.amount || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                            <span>Tips & Extras</span>
                                                            <span className="text-emerald-400/80">+${(p.tips || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span>Distance</span>
                                                            <span className="text-slate-200">{p.miles || 0} mi</span>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span>Time</span>
                                                            <span className="text-slate-200">{p.hours || 0} h</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-20 text-slate-600 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                            No platform earnings recorded.
                                        </div>
                                    )}

                                    <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                                        <div className="flex justify-between items-center font-bold text-xl text-white">
                                            <span>Total Gross</span>
                                            <span className="text-emerald-400">${gross.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    {/* Total Costs Card */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="glass-card glass-card-hover p-4 text-left group">
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
                                    <div className="h-full bg-ruby-500 transition-all duration-1000" style={{ width: `${Math.min(100, (expenses / totalGrandCosts) * 100)}%` }} />
                                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(100, (tax / totalGrandCosts) * 100)}%` }} />
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="size-4 text-ruby-500/50" />
                                </div>
                            </button>
                        </SheetTrigger>
                        <SheetContent className="backdrop-blur-3xl bg-slate-950/95 border-white/5">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-white">
                                    <MinusCircle className="size-5 text-ruby-500" />
                                    Expenses & Projections
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
                                                onClick={() => setIsAddingExpense(!isAddingExpense)}
                                                className="p-1 px-2 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                                            >
                                                <Plus className="size-3" />
                                                Add New
                                            </button>
                                        </div>

                                        {isAddingExpense && (
                                            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        placeholder="Category (e.g. Car Wash)"
                                                        value={newExpense.category}
                                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                                        className="bg-slate-900/50 border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={newExpense.amount}
                                                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                        className="bg-slate-900/50 border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                                    />
                                                </div>
                                                <input
                                                    placeholder="Description (Optional)"
                                                    value={newExpense.description}
                                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                                    className="w-full bg-slate-900/50 border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddDirectExpense}
                                                        disabled={isSaving}
                                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isSaving ? 'Adding...' : 'Add Expense'}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsAddingExpense(false)}
                                                        className="px-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl text-xs transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {directExpenses.length > 0 ? (
                                            <div className="space-y-3">
                                                {directExpenses.map((e: any, idx: number) => (
                                                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="font-bold text-white text-sm block">{e.category}</span>
                                                                {e.description && (
                                                                    <p className="text-xs text-slate-500 mt-0.5 mt-1 font-medium italic opacity-70 group-hover:opacity-100">"{e.description}"</p>
                                                                )}
                                                            </div>
                                                            <span className="font-extrabold text-ruby-400">-${(e.amount || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                                            <button
                                                                onClick={() => handleDeleteExpense(e.id)}
                                                                disabled={isSaving}
                                                                className="p-1.5 rounded-lg bg-ruby-500/10 text-ruby-500 hover:bg-ruby-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-xs font-bold text-slate-600 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                                No direct expenses.
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Projections & Overrides</h3>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                                                <span className="text-sm font-medium text-slate-400 uppercase tracking-tight">Tax Estimates</span>
                                                <span className="font-bold text-slate-300">${tax.toFixed(2)}</span>
                                            </div>

                                            {/* Fuel Override UI */}
                                            {fuelCost !== undefined && (
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-400 uppercase tracking-tight">Fuel Cost</span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'fuel' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => handleSaveOverride('__FUEL_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-300 tracking-tight">${fuelCost.toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => { setEditingField('fuel'); setEditValue(fuelCost.toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-slate-500"
                                                                >
                                                                    <Edit2 className="size-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Wear Override UI */}
                                            {wearCost !== undefined && (
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-400 uppercase tracking-tight">Wear & Tear</span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'wear' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => handleSaveOverride('__WEAR_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-300 tracking-tight">${wearCost.toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => { setEditingField('wear'); setEditValue(wearCost.toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-slate-500"
                                                                >
                                                                    <Edit2 className="size-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Insurance Override UI */}
                                            {insurance !== undefined && (
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-400 uppercase tracking-tight">Commercial Ins.</span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'insurance' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => handleSaveOverride('__INSURANCE_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-300 tracking-tight">${insurance.toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => { setEditingField('insurance'); setEditValue(insurance.toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-slate-500"
                                                                >
                                                                    <Edit2 className="size-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-ruby-500/10 p-6 rounded-3xl border border-ruby-500/20 shadow-xl shadow-ruby-500/5">
                                        <div className="flex justify-between items-center font-bold text-2xl text-white">
                                            <span>Total Costs</span>
                                            <span className="text-ruby-400">${totalGrandCosts.toFixed(2)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium uppercase tracking-widest text-center opacity-80">
                                            Includes platform fees, tax estimates, and variable operating costs.
                                        </p>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <div className="glass-card p-4">
                        <div className="flex items-center gap-2 text-slate-500 mb-2 font-display">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                <Navigation className="size-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Miles Driven</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{miles.toFixed(1)}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2">
                            {miles > 0 ? `$${(netProfit / miles).toFixed(2)}/mile` : 'No data'}
                        </p>
                    </div>

                    <div className="glass-card p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-slate-500 mb-2 font-display">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <Clock className="size-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Hours Worked</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {hours > 0 ? hours.toFixed(1) : '—'}
                            </p>
                        </div>
                        {hourlyRate > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                <TrendingUp className="size-3" />
                                <span>${hourlyRate.toFixed(2)}/hr</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

