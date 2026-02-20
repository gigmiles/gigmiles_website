'use client'

import { updateDailyEntry, deleteDailyEntry } from '@/app/dashboard/actions'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyEntry, PlatformEarning, Expense } from '@/app/dashboard/types'
import {
    Plus,
    Trash2,
    ChevronLeft,
    Calendar as CalendarIcon,
    DollarSign,
    Briefcase,
    Save
} from 'lucide-react'
import { cn } from "@/lib/utils"

const schema = z.object({
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional().nullable(),
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
    })).optional(),
    gas_price: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number')
})

interface EditEntryFormProps {
    entry: DailyEntry
    availablePlatforms: string[]
}

export function EditEntryForm({ entry, availablePlatforms }: EditEntryFormProps) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: entry.date,
            notes: entry.notes || '',
            platforms: entry.platform_earnings.map((p: PlatformEarning) => ({
                platform_name: p.platform_name,
                amount: p.amount?.toString() || '',
                tips: p.tips?.toString() || '',
                miles: p.miles?.toString() || '',
                hours: p.hours?.toString() || ''
            })),
            expenses: entry.expenses.map((e: Expense) => ({
                category: e.category,
                amount: e.amount?.toString() || '',
                description: e.description || ''
            })),
            gas_price: entry.gas_price?.toString() || ''
        }
    })

    const { fields: platformFields, append: appendPlatform, remove: removePlatform } = useFieldArray({ control, name: "platforms" })
    const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({ control, name: "expenses" })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true)
        try {
            const earningsData: PlatformEarning[] = data.platforms.map(p => ({
                platform_name: p.platform_name,
                amount: parseFloat(p.amount),
                tips: p.tips ? parseFloat(p.tips) : 0,
                miles: p.miles ? parseFloat(p.miles) : 0,
                hours: p.hours ? parseFloat(p.hours) : 0
            }))

            const expensesData: Expense[] = data.expenses?.map(e => ({
                id: '', // Temporary ID for insertion/update logic if needed, but actions usually handle it
                category: e.category,
                amount: parseFloat(e.amount),
                description: e.description
            })) || []

            await updateDailyEntry(entry.id, {
                date: data.date,
                notes: data.notes || '',
                gas_price: data.gas_price ? parseFloat(data.gas_price) : undefined
            }, earningsData, expensesData)

            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            const err = error as Error;
            console.error('Error:', err)
            alert(`Error updating entry: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) return
        setDeleting(true)
        try {
            await deleteDailyEntry(entry.id)
            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            const err = error as Error;
            alert(`Error deleting entry: ${err.message}`)
            setDeleting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in pb-20 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href="/dashboard" className="text-muted-foreground hover:text-slate-900 flex items-center gap-1 text-sm transition-colors w-fit mb-2">
                        <ChevronLeft className="size-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Edit Entry</h1>
                </div>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full md:w-auto"
                >
                    <Trash2 className="mr-2 size-4" />
                    {deleting ? 'Deleting...' : 'Delete Entry'}
                </Button>
            </div>

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
                    <Input
                        label="Notes (Optional)"
                        placeholder="Rainy day, high demand..."
                        {...register('notes')}
                        className="rounded-xl"
                    />
                    <Input
                        label="Pump Price ($/gal - Optional)"
                        placeholder="4.50"
                        type="number"
                        step="0.01"
                        {...register('gas_price')}
                        error={errors.gas_price?.message as string}
                        className="rounded-xl"
                    />
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePlatform(index)}
                                    className="text-ruby-500 hover:text-ruby-600 hover:bg-ruby-50 rounded-full"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
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
                                </div>
                            </CardContent>
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
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
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
                    <Save className="mr-2 size-4" />
                    {loading ? 'Saving Changes...' : 'Update Entry'}
                </Button>
            </div>
        </form>
    )
}
