'use client'

import { createDailyEntry } from '../../actions'
import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Plus,
    Trash2,
    ChevronLeft,
    Calendar as CalendarIcon,
    DollarSign,
    Car,
    Clock,
    Briefcase
} from 'lucide-react'
import { cn } from "@/lib/utils"

const schema = z.object({
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
    platforms: z.array(z.object({
        platform_name: z.string().min(1, 'Platform is required'),
        amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Must be a number'),
        tips: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
        miles: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
        hours: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
    })).min(1, 'Add at least one platform'),
    expenses: z.array(z.object({
        category: z.string().min(1, 'Category is required'),
        amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Must be a number'),
        description: z.string().optional()
    })).optional()
})

export default function NewEntryPage() {
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [quickMode, setQuickMode] = useState(true) // Default to quick mode
    const router = useRouter()
    const supabase = createClient()

    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            notes: '',
            platforms: [{ platform_name: '', amount: '', tips: '', miles: '', hours: '' }],
            expenses: [] // Start empty
        }
    })

    const { fields: platformFields, append: appendPlatform, remove: removePlatform } = useFieldArray({
        control,
        name: "platforms"
    })

    const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
        control,
        name: "expenses"
    })

    const searchParams = useSearchParams()

    // Handle shift session hours
    useEffect(() => {
        const hours = searchParams.get('hours')
        if (hours) {
            setValue('platforms.0.hours', hours)
        }
    }, [searchParams, setValue])

    // Check for scanned receipt data on mount
    useEffect(() => {
        const scannedData = sessionStorage.getItem('scannedReceipt')
        if (scannedData) {
            try {
                const data = JSON.parse(scannedData)
                // Pre-fill date if scanned
                if (data.date) setValue('date', data.date)

                // Add expense
                appendExpense({
                    category: data.category || 'Other',
                    amount: data.total_amount?.toString() || '',
                    description: `Receipt from ${data.merchant}`
                })

                // Clear after using
                sessionStorage.removeItem('scannedReceipt')
            } catch (e) {
                console.error("Failed to parse receipt data", e)
            }
        }
    }, [appendExpense, setValue])

    useEffect(() => {
        async function fetchPlatforms() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('user_platforms')
                    .select('platform_name')
                    .eq('user_id', user.id)
                    .eq('is_active', true)

                if (data) {
                    setAvailablePlatforms(data.map(p => p.platform_name))
                }
            }
        }
        fetchPlatforms()
    }, [])

    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            // Prepare data for server action
            const earningsData = data.platforms.map((p: any) => ({
                platform_name: p.platform_name,
                amount: p.amount,
                tips: p.tips,
                miles: p.miles,
                hours: p.hours,
            }))

            const expensesData = data.expenses?.map((e: any) => ({
                category: e.category,
                amount: e.amount,
                description: e.description
            })) || []

            await createDailyEntry({
                date: data.date,
                notes: data.notes
            }, earningsData, expensesData)

            // Success feedback
            const hasEarnings = earningsData.some(e => parseFloat(e.amount) > 0)
            const hasExpenses = expensesData.some(e => parseFloat(e.amount) > 0)

            if (hasEarnings && hasExpenses) {
                toast.success("Entry added successfully! 🚀")
            } else if (hasExpenses) {
                toast.success("Expense added successfully! 💸")
            } else {
                toast.success("Earnings added successfully! 🚀")
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Error:', error)
            toast.error(`Error saving entry: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-slate-900 flex items-center gap-1 text-sm transition-colors w-fit">
                    <ChevronLeft className="size-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Log Shift Activity</h1>
                        <p className="text-muted-foreground">Keep your records up-to-date for accurate tax projections.</p>
                    </div>
                    <Button
                        type="button"
                        variant={quickMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setQuickMode(!quickMode)}
                        className="rounded-full"
                    >
                        {quickMode ? "⚡ Quick Mode" : "📋 Detailed Mode"}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* General Info */}
                <Card className="shadow-premium border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="size-5 text-emerald-600" />
                            Session Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <Input
                            type="date"
                            label="Date of Shift"
                            {...register('date')}
                            error={errors.date?.message as string}
                            className="rounded-xl"
                        />
                        {!quickMode && (
                            <Input
                                label="Notes (Optional)"
                                placeholder="Rainy day, high demand..."
                                {...register('notes')}
                                className="rounded-xl"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Platform Earnings */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Briefcase className="size-5 text-blue-600" />
                            Platform Earnings
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendPlatform({ platform_name: '', amount: '', tips: '', miles: '', hours: '' })}
                            className="rounded-full border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                        >
                            <Plus className="mr-2 size-4" />
                            Add Platform
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {platformFields.map((field, index) => (
                            <Card key={field.id} className="shadow-premium border-border/50 relative group overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 py-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Entry #{index + 1}</span>
                                    {platformFields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePlatform(index)}
                                            className="text-ruby-500 hover:text-ruby-600 hover:bg-ruby-50 rounded-full"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                        <div className="md:col-span-1 space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
                                            <select
                                                {...register(`platforms.${index}.platform_name`)}
                                                className={cn(
                                                    "flex h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-900/50 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none",
                                                    errors.platforms?.[index]?.platform_name && "border-ruby-500"
                                                )}
                                            >
                                                <option value="">Select app</option>
                                                {availablePlatforms.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <Input
                                                label="Earnings ($)"
                                                type="number" step="0.01"
                                                placeholder="0.00"
                                                {...register(`platforms.${index}.amount`)}
                                                error={errors.platforms?.[index]?.amount?.message as string}
                                            />
                                        </div>

                                        {!quickMode && (
                                            <>
                                                <Input
                                                    label="Tips ($)"
                                                    type="number" step="0.01"
                                                    placeholder="0.00"
                                                    {...register(`platforms.${index}.tips`)}
                                                />

                                                <Input
                                                    label="Miles"
                                                    type="number" step="0.1"
                                                    placeholder="0.0"
                                                    {...register(`platforms.${index}.miles`)}
                                                />

                                                <Input
                                                    label="Hours"
                                                    type="number" step="0.1"
                                                    placeholder="0.0"
                                                    {...register(`platforms.${index}.hours`)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="space-y-6 pt-8 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <DollarSign className="size-5 text-rose-500" />
                            Expenses
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendExpense({ category: 'Other', amount: '', description: '' })}
                            className="rounded-full border-slate-200 hover:border-rose-500 hover:text-rose-600"
                        >
                            <Plus className="mr-2 size-4" />
                            Add Expense
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {expenseFields.map((field, index) => (
                            <Card key={field.id} className="shadow-sm border-border/50 relative group">
                                <CardContent className="pt-6 flex gap-4 items-end">
                                    <div className="w-1/3 space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                        <select
                                            {...register(`expenses.${index}.category`)}
                                            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-900/50 px-3 py-2 text-sm outline-none"
                                        >
                                            <option value="Fuel">Fuel</option>
                                            <option value="Food">Food</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Supplies">Supplies</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="w-1/3">
                                        <Input
                                            label="Amount ($)"
                                            type="number" step="0.01"
                                            {...register(`expenses.${index}.amount`)}
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <Input
                                            label="Description"
                                            {...register(`expenses.${index}.description`)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeExpense(index)}
                                        className="mb-1 text-slate-400 hover:text-rose-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {expenseFields.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-xl text-muted-foreground text-sm">
                                No expenses added for this shift.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-8"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-full px-10 bg-slate-900 text-white hover:bg-slate-800 shadow-xl"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Save Shift Records'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
