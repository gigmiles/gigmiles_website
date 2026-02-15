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
    expenses: z.array(z.object({
        category: z.string().min(1, 'Category is required'),
        amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Must be a number'),
        description: z.string().optional()
    })).min(1, 'Add at least one expense')
})

export default function NewEntryPage() {
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            notes: '',
            expenses: [{ category: 'Other', amount: '', description: '' }]
        }
    })


    const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
        control,
        name: "expenses"
    })


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
            }, [], expensesData)

            toast.success("Expense added successfully! 💸")

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
                        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Add Expense</h1>
                        <p className="text-muted-foreground">Track your business expenses for accurate deductions.</p>
                    </div>
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
                        <Input
                            label="Notes (Optional)"
                            placeholder="Rainy day, high demand..."
                            {...register('notes')}
                            className="rounded-xl"
                        />
                    </CardContent>
                </Card>


                {/* Expenses Section */}
                <div className="space-y-6">
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
                        {loading ? 'Processing...' : 'Save Expense'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
