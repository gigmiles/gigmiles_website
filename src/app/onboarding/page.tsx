'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getEstimatedMPG } from '@/utils/api/external'
import { toast } from 'sonner'

const step1Schema = z.object({
    full_name: z.string().min(2, 'Name is required'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    zip_code: z.string().min(5, 'ZIP Code is required'),
})

const step2Schema = z.object({
    make: z.string().min(2, 'Make is required'),
    model: z.string().min(2, 'Model is required'),
    year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
    mpg: z.string().refine((val) => !isNaN(parseFloat(val)), 'MPG must be a number'),
})

const step3Schema = z.object({
    platforms: z.array(z.string()).min(1, 'Select at least one platform'),
})

const PLATFORM_OPTIONS = [
    'DoorDash', 'Uber Eats', 'Grubhub', 'Uber', 'Lyft', 'Spark', 'Amazon Flex', 'Instacart', 'Shipt', 'Roadie'
]

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // We can use a single form or multiple. For simplicity, let's manage state manually or use a big form.
    // Actually, separate forms per step is cleaner for validation.

    const [formData, setFormData] = useState({
        full_name: '', state: '', city: '', zip_code: '',
        make: '', model: '', year: '', mpg: '',
        platforms: [] as string[]
    })

    // Step 1 Form
    const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: { full_name: '', state: '', city: '', zip_code: '' }
    })

    // Step 2 Form
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
        getValues: getValues2,
        setValue: setValue2
    } = useForm({
        resolver: zodResolver(step2Schema),
        defaultValues: { make: '', model: '', year: '', mpg: '' }
    })

    const onSubmitStep1 = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }))
        setStep(2)
    }

    const onSubmitStep2 = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }))
        setStep(3)
    }

    const togglePlatform = (platform: string) => {
        setFormData(prev => {
            const platforms = prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
            return { ...prev, platforms }
        })
    }

    const handleFinalSubmit = async () => {
        if (formData.platforms.length === 0) {
            alert('Please select at least one platform')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    state_code: formData.state,
                    city: formData.city,
                    zip_code: formData.zip_code,
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            // 2. Insert Vehicle
            const { error: vehicleError } = await supabase
                .from('vehicles')
                .insert({
                    user_id: user.id,
                    make: formData.make,
                    model: formData.model,
                    year: parseInt(formData.year),
                    mpg: parseFloat(formData.mpg),
                    is_primary: true
                })

            if (vehicleError) throw vehicleError

            // 3. Insert Platforms
            // Note: We need the user_platforms table. If it doesn't exist, this will fail.
            // For now, let's assume we created it or we skip this.
            // Let's try to insert into 'user_platforms' if it exists.

            const platformInserts = formData.platforms.map(p => ({
                user_id: user.id,
                platform_name: p,
                is_active: true
            }))

            const { error: platformError } = await supabase
                .from('user_platforms')
                .insert(platformInserts)

            if (platformError) {
                console.error('Platform insert error:', platformError)
                // Fallback: maybe just log it or ignore if table doesn't exist yet
            }

            router.push('/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error('Error saving data:', error)
            alert('Error saving data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">Setup Profile</h1>
                        <span className="text-sm font-medium text-slate-500">Step {step} of 3</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSubmit1(onSubmitStep1)} className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
                        <Input label="Full Name" {...register1('full_name')} error={errors1.full_name?.message as string} />
                        <Input label="State (e.g. CA)" {...register1('state')} error={errors1.state?.message as string} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="City" {...register1('city')} error={errors1.city?.message as string} />
                            <Input label="ZIP Code" {...register1('zip_code')} error={errors1.zip_code?.message as string} />
                        </div>
                        <Button type="submit" className="w-full mt-6">Next: Vehicle</Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit2(onSubmitStep2)} className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Make (e.g. Toyota)" {...register2('make')} error={errors2.make?.message as string} />
                            <Input label="Model (e.g. Camry)" {...register2('model')} error={errors2.model?.message as string} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Year" type="number" {...register2('year')} error={errors2.year?.message as string} />
                            <div className="relative">
                                <Input
                                    label="Est. MPG"
                                    type="number"
                                    step="0.1"
                                    {...register2('mpg')}
                                    error={errors2.mpg?.message as string}
                                />
                                <button
                                    type="button"
                                    className="absolute right-0 top-0 text-xs text-emerald-600 hover:text-emerald-700 font-medium px-1 py-1"
                                    onClick={async () => {
                                        const { year, make, model } = getValues2() // access form values
                                        if (!year || !make || !model) {
                                            toast.error("Please fill Year, Make, and Model first")
                                            return
                                        }
                                        const toastId = toast.loading("Fetching MPG...")
                                        const mpg = await getEstimatedMPG(year, make, model)
                                        if (mpg) {
                                            setValue2('mpg', mpg.toString())
                                            toast.success(`Found MPG: ${mpg}`, { id: toastId })
                                        } else {
                                            toast.error("Could not find MPG, please enter manually", { id: toastId })
                                        }
                                    }}
                                >
                                    Auto-Fill
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                            <Button type="submit" className="flex-1">Next: Platforms</Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Select Platforms</h2>
                        <p className="text-sm text-slate-500 mb-4">Select all the apps you work with.</p>

                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                            {PLATFORM_OPTIONS.map(platform => (
                                <div
                                    key={platform}
                                    onClick={() => togglePlatform(platform)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.platforms.includes(platform)
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                                        : 'border-slate-200 hover:border-emerald-300'
                                        }`}
                                >
                                    {platform}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                            <Button
                                onClick={handleFinalSubmit}
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Complete Setup'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
