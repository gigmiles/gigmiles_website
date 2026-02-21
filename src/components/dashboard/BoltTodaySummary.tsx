'use client'

import { DollarSign, TrendingUp, Navigation, Clock, Briefcase, MinusCircle, Edit2, Check, X, ArrowUpRight, Plus, Trash2, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateHourlyRate, calculateProfitMargin } from '@/utils/calculations';
import { useRef, useState, useTransition } from 'react';
import { saveCostOverride, addExpense, deleteExpense, updatePlatformEarning, deletePlatformEarning } from '@/app/dashboard/actions';
import { PlatformEarning } from '@/app/dashboard/types';
import { toast } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface TodaySummaryProps {
    gross: number;
    netProfit: number;
    expenses: number;
    miles: number;
    hours: number;
    tax: number;
    federalTax?: number;
    stateTax?: number;
    tips: number;
    mpg?: number;
    gasPrice?: number;
    fuelCost?: number;
    gasCost?: number;
    electricCost?: number;
    wearCost?: number;
    insurance?: number;
    hasEntry?: boolean;
    selectedDate?: string;
    activeDates?: string[];
    vehicles?: any[];
    activeVehicleId?: string | null;
    richEntry?: {
        entry_date?: string;
        platform_earnings?: PlatformEarning[];
        expenses?: Array<{
            id: string;
            category: string;
            amount: number;
            description?: string;
        }>;
    };
}

export function BoltTodaySummary({
    gross,
    netProfit,
    expenses,
    miles,
    hours,
    tax,
    federalTax = 0,
    stateTax = 0,
    tips = 0,
    fuelCost,
    gasCost,
    electricCost,
    wearCost,
    insurance,
    richEntry,
    hasEntry,
    selectedDate,
    activeDates = [],
    vehicles = [],
    activeVehicleId: initialActiveVehicleId
}: TodaySummaryProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [activeVehicleId, setActiveVehicleId] = useState<string | null>(initialActiveVehicleId || (vehicles?.[0]?.id || null));
    const activeVehicle = vehicles?.find(v => v.id === activeVehicleId) || vehicles?.[0] || null;

    console.log("[BoltTodaySummary] Rendering", { activeVehicleId, vehiclesCount: vehicles?.length });

    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Net Goal State
    const [netGoal, setNetGoal] = useState<number>(250);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInputValue, setGoalInputValue] = useState('250');

    // Platform Edit State
    const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
    const [platformEditData, setPlatformEditData] = useState({ amount: '', tips: '', miles: '', hours: '' });

    // Date Pick State
    const initialDate = selectedDate ? parseISO(selectedDate) : new Date();
    const [date, setDate] = useState<Date | undefined>(initialDate);

    const handleDateChange = (newDate: Date | undefined) => {
        if (!newDate) return;
        setDate(newDate);

        const formattedDate = format(newDate, 'yyyy-MM-dd');
        const params = new URLSearchParams(searchParams);
        params.set('date', formattedDate);

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleEditPlatform = (p: PlatformEarning) => {
        if (!p.id) return;
        setEditingPlatformId(p.id);
        setPlatformEditData({
            amount: p.amount?.toString() || '0',
            tips: p.tips?.toString() || '0',
            miles: p.miles?.toString() || '0',
            hours: p.hours?.toString() || '0'
        });
    };

    const handleSavePlatformEdit = async (id: string) => {
        setIsSaving(true);
        try {
            await updatePlatformEarning(id, {
                amount: parseFloat(platformEditData.amount) || 0,
                tips: parseFloat(platformEditData.tips) || 0,
                miles: parseFloat(platformEditData.miles) || 0,
                hours: parseFloat(platformEditData.hours) || 0
            });
            toast.success("Earning updated!");
            setEditingPlatformId(null);
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update earning");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlatform = async (id: string) => {
        if (!confirm("Are you sure you want to delete this earning entry?")) return;
        setIsSaving(true);
        try {
            await deletePlatformEarning(id);
            toast.success("Earning deleted");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete earning");
        } finally {
            setIsSaving(false);
        }
    };

    const hourlyRate = calculateHourlyRate(netProfit, hours);
    const profitMargin = calculateProfitMargin(netProfit, gross);

    // If a different vehicle is selected, we should ideally re-calculate financials here
    // But since the parent (page.tsx) handles fetching, we'll just show the selected vehicle's info
    // and note that changing it requires a refresh or client-side calculation.
    // For now, we'll just allow switching the DISPLAYED vehicle info.

    const platformEarnings = richEntry?.platform_earnings || [];
    // Filter out legacy "Depreciation" entries as they are now calculated dynamically
    const directExpenses = (richEntry?.expenses || []).filter((e) =>
        e.category !== 'Depreciation' &&
        e.category !== '__FUEL_OVERRIDE__' &&
        e.category !== '__WEAR_OVERRIDE__' &&
        e.category !== '__INSURANCE_OVERRIDE__'
    );

    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });

    const handleAddDirectExpense = async () => {
        if (!newExpense.category) {
            toast.error("Please enter a category");
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
        } catch (addError) {
            console.error("Add expense error:", addError);
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
        } catch (deleteError) {
            console.error("Delete expense error:", deleteError);
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
        } catch (saveError) {
            console.error("Save override error:", saveError);
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveGoal = () => {
        const val = parseFloat(goalInputValue);
        if (!isNaN(val) && val > 0) {
            setNetGoal(val);
        }
        setIsEditingGoal(false);
    };

    return (
        <div className="glass-card p-6 border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full transition-all group-hover:bg-emerald-500/10 pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Daily Summary</h2>
                    <p className="text-xs text-slate-500 font-medium">Real-time performance metrics</p>
                </div>

                <div className="flex items-center gap-2">
                    {vehicles?.length > 1 && (
                        <Select value={activeVehicleId || ''} onValueChange={setActiveVehicleId}>
                            <SelectTrigger className="w-[140px] h-9 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                <SelectValue placeholder="Select Vehicle" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                {vehicles?.map(v => (
                                    <SelectItem key={v.id} value={v.id} className="text-xs">
                                        {v.make} {v.model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "glass-card border-slate-300 dark:border-white/10 flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 group relative",
                                    isPending && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={isPending}
                            >
                                <CalendarIcon className="size-4 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                    {date ? format(date, 'MM/dd/yyyy') : format(new Date(), 'MM/dd/yyyy')}
                                </span>
                                {isPending && <RefreshCw className="size-3 animate-spin text-neon-primary" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                disabled={(date) => isBefore(startOfDay(new Date()), date)}
                                className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                modifiers={{
                                    hasEntry: (date) => activeDates?.includes(format(date, 'yyyy-MM-dd')),
                                    noEntry: (date) => !activeDates?.includes(format(date, 'yyyy-MM-dd')) && isBefore(date, startOfDay(new Date()))
                                }}
                                modifiersClassNames={{
                                    hasEntry: "text-emerald-500 font-bold underline decoration-2 underline-offset-4",
                                    noEntry: "text-rose-500/80"
                                }}
                            />

                            {/* Calendar Legend */}
                            <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 mt-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Legend</p>
                                <div className="space-y-1.5 flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Logged Entry</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">No Entry</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center -ml-1">
                                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                                        </div>
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Today</span>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <motion.div
                key={selectedDate || 'today'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Hero Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-slate-900 dark:text-white shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-transform cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                        <TrendingUp className="size-24" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Net Profit (Take-Home)</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold opacity-60">$</span>
                        <p className="text-5xl font-extrabold tracking-tighter">{netProfit.toFixed(2)}</p>
                    </div>
                    {calculateProfitMargin(netProfit, gross) > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 w-fit">
                                <ArrowUpRight className="size-3" />
                                <span className="text-xs font-bold tracking-tight">
                                    {calculateProfitMargin(netProfit, gross).toFixed(1)}% profit margin
                                </span>
                            </div>

                            <div className="flex-1 max-w-[200px] w-full">
                                <div className="flex justify-between items-baseline mb-1.5 px-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Goal Progress</span>
                                    <span className="text-[10px] font-bold font-mono">
                                        {Math.round((netProfit / netGoal) * 100)}%
                                    </span>
                                </div>
                                <div className={cn(
                                    "h-2.5 w-full bg-black/20 rounded-full p-[1.5px] relative transition-all duration-500",
                                    netProfit >= netGoal && "ring-2 ring-yellow-400/50 shadow-lg"
                                )}>
                                    {/* Success Glow - Ultra High Contrast (Yellow on Green) */}
                                    {netProfit >= netGoal && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.2, 0.6, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute -inset-8 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
                                        />
                                    )}

                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min(100, (netProfit / netGoal) * 100)}%`,
                                                backgroundColor: netProfit >= netGoal ? "#059669" : "#facc15"
                                            }}
                                            transition={{
                                                width: { duration: 1.5, ease: "easeOut" },
                                                backgroundColor: { duration: 1 }
                                            }}
                                            className={cn(
                                                "h-full rounded-full relative z-10",
                                                netProfit >= netGoal && "animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="mt-1.5 flex justify-between items-center">
                                    {netProfit >= netGoal ? (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-[8px] font-black bg-white text-emerald-600 px-1.5 py-0.5 rounded shadow-sm tracking-tighter"
                                        >
                                            GOAL REACHED! 🏆
                                        </motion.span>
                                    ) : (
                                        <div />
                                    )}

                                    {isEditingGoal ? (
                                        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-0.5 border border-white/10">
                                            <span className="text-[8px] font-bold text-white/50 uppercase">Goal:</span>
                                            <input
                                                type="number"
                                                value={goalInputValue}
                                                onChange={(e) => setGoalInputValue(e.target.value)}
                                                onBlur={handleSaveGoal}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                                className="w-12 bg-transparent border-none text-white text-[10px] font-bold outline-none focus:ring-0"
                                                autoFocus
                                                placeholder="250"
                                                aria-label="Daily net profit goal"
                                                title="Set your daily net profit goal"
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setIsEditingGoal(true); setGoalInputValue(netGoal.toString()); }}
                                            className="group/goal text-[10px] font-bold tracking-wider"
                                        >
                                            <span className="opacity-60 group-hover/goal:opacity-100 transition-opacity">${netProfit.toFixed(0)}</span>
                                            <span className="mx-1 opacity-20">/</span>
                                            <span className="text-white underline underline-offset-2 decoration-white/20 hover:decoration-white transition-all">${netGoal}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gross Income Card */}
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

                                {/* Platform Breakdown Summary */}
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
                        {/* Sheet content remains same for functionality but can be styled later if needed */}
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
                                            const platformColor = `var(--color-${platformSlug})`;
                                            const isUber = platformSlug.includes('uber');

                                            return (
                                                <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-slate-300 dark:hover:border-white/20 transition-all relative">
                                                    {editingPlatformId === p.id ? (
                                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white mb-2">
                                                                <span>Editing {p.platform_name}</span>
                                                                <button onClick={() => setEditingPlatformId(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full" aria-label="Cancel editing"><X className="size-4" /></button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[10px] uppercase text-slate-500 font-bold">Base Pay</label>
                                                                    <input
                                                                        type="number"
                                                                        title="Base Pay Amount"
                                                                        aria-label="Base Pay Amount"
                                                                        placeholder="0.00"
                                                                        value={platformEditData.amount}
                                                                        onChange={e => setPlatformEditData({ ...platformEditData, amount: e.target.value })}
                                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase text-slate-500 font-bold">Tips</label>
                                                                    <input
                                                                        type="number"
                                                                        title="Tips Amount"
                                                                        aria-label="Tips Amount"
                                                                        placeholder="0.00"
                                                                        value={platformEditData.tips}
                                                                        onChange={e => setPlatformEditData({ ...platformEditData, tips: e.target.value })}
                                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-emerald-400"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase text-slate-500 font-bold">Miles</label>
                                                                    <input
                                                                        type="number"
                                                                        title="Miles Driven"
                                                                        aria-label="Miles Driven"
                                                                        placeholder="0"
                                                                        value={platformEditData.miles}
                                                                        onChange={e => setPlatformEditData({ ...platformEditData, miles: e.target.value })}
                                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-blue-400"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase text-slate-500 font-bold">Hours</label>
                                                                    <input
                                                                        type="number"
                                                                        title="Hours Worked"
                                                                        aria-label="Hours Worked"
                                                                        placeholder="0"
                                                                        value={platformEditData.hours}
                                                                        onChange={e => setPlatformEditData({ ...platformEditData, hours: e.target.value })}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') p.id && handleSavePlatformEdit(p.id);
                                                                        }}
                                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-indigo-400"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 pt-2">
                                                                <button
                                                                    onClick={() => p.id && handleSavePlatformEdit(p.id)}
                                                                    disabled={isSaving}
                                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 dark:text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                                                                    aria-label="Save platform earning changes"
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

                                                                    {/* Action Buttons */}
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => handleEditPlatform(p)}
                                                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                                            title="Edit Entry"
                                                                        >
                                                                            <Edit2 className="size-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => p.id && handleDeletePlatform(p.id)}
                                                                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
                                                                            title="Delete Entry"
                                                                        >
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

                    {/* Total Costs Card */}
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
                                    <div className="h-full bg-ruby-500 transition-all duration-1000" {...({ style: { width: `${Math.min(100, (expenses / totalGrandCosts) * 100)}%` } } as Record<string, unknown>)} />
                                    <div className="h-full bg-amber-500 transition-all duration-1000" {...({ style: { width: `${Math.min(100, (tax / totalGrandCosts) * 100)}%` } } as Record<string, unknown>)} />
                                </div>


                                {/* Hover Breakdown Overlay for Total Costs */}
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
                                    Detailed breakdown of today&apos;s costs.
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Direct Expenses</h3>
                                            <button
                                                onClick={() => setIsAddingExpense(!isAddingExpense)}
                                                className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-500 dark:text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                                                title={isAddingExpense ? "Close Form" : "Add New Expense"}
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
                                                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={newExpense.amount}
                                                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                                    />
                                                </div>
                                                <input
                                                    placeholder="Description (Optional)"
                                                    value={newExpense.description}
                                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddDirectExpense();
                                                    }}
                                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddDirectExpense}
                                                        disabled={isSaving}
                                                        className="flex-1 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isSaving ? 'Adding...' : 'Add Expense'}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsAddingExpense(false)}
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
                                                                    <p className="text-xs text-slate-500 mt-1 font-medium italic opacity-70 group-hover:opacity-100">&quot;{e.description}&quot;</p>
                                                                )}
                                                            </div>
                                                            <span className="font-extrabold text-ruby-400">-${(e.amount || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end">
                                                            <button
                                                                onClick={() => handleDeleteExpense(e.id)}
                                                                disabled={isSaving}
                                                                className="p-1.5 rounded-lg bg-ruby-500/10 text-ruby-500 hover:bg-ruby-500 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                                                                title="Delete Expense"
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

                                            {/* Fuel/Electric Override UI */}
                                            {fuelCost !== undefined && (
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                                        {activeVehicle?.fuel_type === 'electric' ? 'Charging Cost' : 'Fuel Cost'}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'fuel' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                    placeholder="0.00"
                                                                    aria-label="Fuel Cost Override"
                                                                />
                                                                <button onClick={() => handleSaveOverride('__FUEL_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300" title="Save">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500" title="Cancel">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                                                                    ${(activeVehicle?.fuel_type === 'electric' ? (electricCost ?? 0) : (gasCost ?? 0)).toFixed(2)}
                                                                </span>
                                                                <button
                                                                    onClick={() => { setEditingField('fuel'); setEditValue((activeVehicle?.fuel_type === 'electric' ? (electricCost ?? 0) : (gasCost ?? 0)).toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500"
                                                                    title="Edit Cost"
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
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                                        Wear & Tear {activeVehicle ? `(${activeVehicle.make} ${activeVehicle.model})` : ''}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'wear' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                    placeholder="0.00"
                                                                    aria-label="Wear &amp; Tear Override"
                                                                />
                                                                <button onClick={() => handleSaveOverride('__WEAR_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300" title="Save">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500" title="Cancel">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300 tracking-tight">${(wearCost ?? 0).toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => { setEditingField('wear'); setEditValue((wearCost ?? 0).toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500"
                                                                    title="Edit Wear &amp; Tear"
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
                                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">Commercial Ins.</span>
                                                    <div className="flex items-center gap-3">
                                                        {editingField === 'insurance' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 text-sm border-none rounded-lg bg-emerald-500/10 text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    autoFocus
                                                                    placeholder="0.00"
                                                                    aria-label="Insurance Override"
                                                                />
                                                                <button onClick={() => handleSaveOverride('__INSURANCE_OVERRIDE__')} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300" title="Save">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button onClick={() => setEditingField(null)} className="text-slate-500" title="Cancel">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300 tracking-tight">${(insurance ?? 0).toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => { setEditingField('insurance'); setEditValue((insurance ?? 0).toFixed(2)); }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500"
                                                                    title="Edit Commercial Insurance"
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
                                        <div className="flex justify-between items-center font-bold text-2xl text-slate-900 dark:text-white">
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

                    {/* Miles Driven Card */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="glass-card glass-card-hover p-4 text-left group" title="View Miles Breakdown">
                                <div className="flex items-center gap-2 text-slate-500 mb-2 font-display">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Navigation className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Miles Driven</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{miles.toFixed(1)}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {miles > 0 ? `Net Profit: $${(netProfit / miles).toFixed(2)}/mi` : '—'}
                                </p>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="size-4 text-blue-500/50" />
                                </div>
                            </button>
                        </SheetTrigger>
                        <SheetContent className="backdrop-blur-3xl bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-white/5">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Navigation className="size-5 text-blue-500" />
                                    Mileage Breakdown
                                </SheetTitle>
                                <SheetDescription className="text-slate-500 font-medium">
                                    Distance tracked per platform today. <span className="text-blue-500/80 italic text-[10px] block mt-1">Note: Efficiency metrics in this view are based on Net Profit.</span>
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                                <div className="space-y-6">
                                    {platformEarnings.length > 0 ? (
                                        platformEarnings.map((p, idx: number) => {
                                            const platformSlug = (p.platform_name || 'Other').toLowerCase().replace(/\s+/g, '-');
                                            const platformColor = `var(--color-${platformSlug})`;

                                            return (
                                                <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={cn("size-2 rounded-full", `bg-[var(--color-${platformSlug})]`)}
                                                            />
                                                            <span className="font-bold text-slate-900 dark:text-white">{p.platform_name || 'Other'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-extrabold text-blue-400 text-lg">{p.miles || 0} mi</span>
                                                            <button
                                                                onClick={() => handleEditPlatform(p)}
                                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                                title="Edit Distance"
                                                            >
                                                                <Edit2 className="size-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {editingPlatformId === p.id && (
                                                        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/5 animate-in fade-in slide-in-from-top-1">
                                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Update Miles</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={platformEditData.miles}
                                                                    onChange={e => setPlatformEditData({ ...platformEditData, miles: e.target.value })}
                                                                    className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                                    placeholder="0"
                                                                />
                                                                <button
                                                                    onClick={() => p.id && handleSavePlatformEdit(p.id)}
                                                                    disabled={isSaving}
                                                                    className="bg-blue-500 hover:bg-blue-600 text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingPlatformId(null)}
                                                                    className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-lg transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-20 text-slate-600 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                            No platform data recorded.
                                        </div>
                                    )}

                                    <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                                        <div className="flex justify-between items-center font-bold text-xl text-slate-900 dark:text-white">
                                            <span>Total Miles</span>
                                            <span className="text-blue-400">{miles.toFixed(1)} mi</span>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                                            <span>Efficiency</span>
                                            <span className="text-emerald-400">
                                                {miles > 0 ? `$${(netProfit / miles).toFixed(2)}/mi` : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="glass-card p-4 flex flex-col justify-between cursor-help group relative">
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
                                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">
                                            <TrendingUp className="size-3" />
                                            <span>${hourlyRate.toFixed(2)}/hr Net</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="size-4 text-indigo-500/50" />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="w-64 p-4 backdrop-blur-3xl bg-white/95 dark:bg-slate-950/95 border-slate-300 dark:border-white/10 shadow-2xl rounded-2xl">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Hours per Platform</p>
                                    <div className="space-y-2">
                                        {platformEarnings.length > 0 ? (
                                            platformEarnings.map((p, idx) => (
                                                <div key={idx} className="flex justify-between items-center group/item">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("size-1.5 rounded-full", `bg-[var(--color-${(p.platform_name || 'other').toLowerCase().replace(/\s+/g, '-')})]`)} />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover/item:text-slate-200 transition-colors capitalize">{p.platform_name}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{p.hours || 0}h</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-500">No active sessions logged</p>
                                        )}
                                        <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Total</span>
                                            <span className="text-xs font-black text-indigo-400">{hours.toFixed(1)}h</span>
                                        </div>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </motion.div>
        </div>
    )
}
