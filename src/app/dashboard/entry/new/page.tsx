'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const schema = z.object({
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
    platforms: z.array(z.object({
        platform_name: z.string().min(1, 'Platform is required'),
        amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Must be a number'),
        tips: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
        miles: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
        hours: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), 'Must be a number'),
    })).min(1, 'Add at least one platform')
})

export default function NewEntryPage() {
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            notes: '',
            platforms: [{ platform_name: '', amount: '', tips: '', miles: '', hours: '' }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "platforms"
    })

    useEffect(() => {
        // Fetch user's active platforms
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Create Daily Entry
            const { data: entry, error: entryError } = await supabase
                .from('daily_entries')
                .insert({
                    user_id: user.id,
                    date: data.date,
                    notes: data.notes
                })
                .select()
                .single()

            if (entryError) throw entryError

            // 2. Create Platform Earnings
            const earningsData = data.platforms.map((p: any) => ({
                entry_id: entry.id,
                platform_name: p.platform_name,
                amount: parseFloat(p.amount),
                tips: p.tips ? parseFloat(p.tips) : 0,
                miles: p.miles ? parseFloat(p.miles) : 0,
                hours: p.hours ? parseFloat(p.hours) : 0,
            }))

            const { error: earningsError } = await supabase
                .from('platform_earnings')
                .insert(earningsData)

            if (earningsError) throw earningsError

            router.push('/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error('Error:', error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Daily Entry</h1>
                <p className="text-slate-500">Log your earnings for the day.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <Input type="date" label="Date" {...register('date')} error={errors.date?.message as string} />
                    <Input label="Notes (Optional)" {...register('notes')} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Platform Earnings</h2>
                    {fields.map((field, index) => (
                        <div key={field.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 relative">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Platform {index + 1}</h3>
                                {fields.length > 1 && (
                                    <button type="button" onClick={() => remove(index)} className="text-red-500 text-sm hover:text-red-600">
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                                    <select
                                        {...register(`platforms.${index}.platform_name`)}
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                    >
                                        <option value="">Select Platform</option>
                                        {availablePlatforms.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    {errors.platforms?.[index]?.platform_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.platforms[index]?.platform_name?.message as string}</p>
                                    )}
                                </div>

                                <Input
                                    label="Earnings ($)"
                                    type="number" step="0.01"
                                    {...register(`platforms.${index}.amount`)}
                                    error={errors.platforms?.[index]?.amount?.message as string}
                                />

                                <Input
                                    label="Tips ($)"
                                    type="number" step="0.01"
                                    {...register(`platforms.${index}.tips`)}
                                />

                                <Input
                                    label="Miles"
                                    type="number" step="0.1"
                                    {...register(`platforms.${index}.miles`)}
                                />

                                <Input
                                    label="Hours"
                                    type="number" step="0.1"
                                    {...register(`platforms.${index}.hours`)}
                                />
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => append({ platform_name: '', amount: '', tips: '', miles: '', hours: '' })}
                        className="w-full"
                    >
                        + Add Another Platform
                    </Button>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Entry'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
