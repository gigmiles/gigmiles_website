'use client'

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { saveCostOverride, addExpense, deleteExpense, updatePlatformEarning, deletePlatformEarning } from '@/app/dashboard/actions';
import { PlatformEarning } from '@/app/dashboard/types';
import { calculateHourlyRate } from '@/utils/calculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { SummaryHero } from './summary/SummaryHero';
import { EarningsSheet } from './summary/EarningsSheet';
import { ExpensesSheet } from './summary/ExpensesSheet';
import { SummaryDatePicker } from './summary/SummaryDatePicker';

interface TodaySummaryProps {
    gross: number;
    netProfit: number;
    expenses: number;
    miles: number;
    hours: number;
    tax: number;
    federalTax?: number;
    stateTax?: number;
    tips?: number;
    mpg?: number;
    gasPrice?: number;
    fuelCost?: number;
    gasCost?: number;
    electricCost?: number;
    wearCost?: number;
    insurance?: number;
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
    hasEntry?: boolean;
    selectedDate?: string;
    activeDates?: string[];
    vehicles?: any[];
    activeVehicleId?: string | null;
    isXL?: boolean;
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
    mpg = 0,
    gasPrice = 0,
    fuelCost = 0,
    gasCost = 0,
    electricCost = 0,
    wearCost = 0,
    insurance = 0,
    richEntry,
    hasEntry,
    selectedDate,
    activeDates = [],
    vehicles = [],
    activeVehicleId: initialActiveVehicleId,
    isXL = false
}: TodaySummaryProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [activeVehicleId, setActiveVehicleId] = useState<string | null>(initialActiveVehicleId || (vehicles?.[0]?.id || null));
    const [isSaving, setIsSaving] = useState(false);
    const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
    const [platformEditData, setPlatformEditData] = useState({ amount: '', tips: '', miles: '', hours: '' });
    const [date, setDate] = useState<Date | undefined>(selectedDate ? parseISO(selectedDate) : new Date());
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

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
            toast.error("Failed to delete earning");
        } finally {
            setIsSaving(false);
        }
    };

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

    const hourlyRate = calculateHourlyRate(netProfit, hours);
    const platformEarnings = richEntry?.platform_earnings || [];
    const directExpenses = (richEntry?.expenses || []).filter((e) =>
        !['Depreciation', '__FUEL_OVERRIDE__', '__WEAR_OVERRIDE__', '__INSURANCE_OVERRIDE__'].includes(e.category)
    );
    const totalGrandCosts = expenses + tax;

    return (
        <div className="glass-card p-4 relative overflow-hidden">

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Daily Summary</h2>
                    <p className="text-[9px] text-slate-600 font-medium">Real-time performance metrics</p>
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

                    <SummaryDatePicker
                        date={date}
                        isPending={isPending}
                        activeDates={activeDates}
                        onDateChange={handleDateChange}
                    />
                </div>
            </div>

            <motion.div
                key={selectedDate || 'today'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
            >
                <SummaryHero
                    gross={gross}
                    netProfit={netProfit}
                    totalGrandCosts={totalGrandCosts}
                    hourlyRate={hourlyRate}
                    miles={miles}
                    hours={hours}
                    platformEarnings={platformEarnings}
                    fuelCost={fuelCost}
                    wearCost={wearCost}
                    insurance={insurance}
                    federalTax={federalTax}
                    stateTax={stateTax}
                    directExpenses={directExpenses}
                    tips={tips}
                />
            </motion.div>
        </div>
    );
}
