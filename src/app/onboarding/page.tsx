'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEstimatedMPG, getVehicleModels } from '@/utils/api/external'
import { toast } from 'sonner'
import { Wallet, CheckCircle2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { US_STATES, CAR_MAKES } from '@/utils/constants'

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
    mpg: z.coerce.number().min(1, 'MPG must be a valid number'),
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
    const { register: register1, handleSubmit: handleSubmit1, control: control1, setValue: setValue1, formState: { errors: errors1 } } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: { full_name: '', state: '', city: '', zip_code: '' }
    })

    // Step 2 Form
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        control: control2,
        formState: { errors: errors2 },
        getValues: getValues2,
        setValue: setValue2,
        watch: watch2
    } = useForm({
        resolver: zodResolver(step2Schema),
        defaultValues: { make: '', model: '', year: '', mpg: '' }
    })

    const selectedMake = watch2('make')

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

    const handleZipBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const zip = e.target.value
        if (zip.length === 5) {
            try {
                const toastId = toast.loading("Finding location...")
                const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
                if (res.ok) {
                    const data = await res.json()
                    const place = data.places[0]
                    setValue1('city', place['place name'], { shouldValidate: true, shouldDirty: true })
                    setValue1('state', place['state abbreviation'], { shouldValidate: true, shouldDirty: true })
                    toast.success(`Found: ${place['place name']}, ${place['state abbreviation']}`, { id: toastId })
                } else {
                    toast.dismiss(toastId)
                }
            } catch (error) {
                console.error("Zip lookup failed", error)
            }
        }
    }

    const handleFinalSubmit = async () => {
        console.log("Submit clicked. Current formData:", formData)

        if (formData.platforms.length === 0) {
            console.warn("Validation failed: No platforms selected")
            toast.error('Please select at least one platform')
            return
        }

        setLoading(true)

        try {
            console.log("Checking auth...")
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error("Auth error:", authError)
                throw new Error("Authentication failed: " + authError.message)
            }
            if (!user) {
                console.error("No user found in session")
                throw new Error('No user found')
            }

            console.log("User found:", user.id)

            // 1. Update Profile
            console.log("Updating profile...")
            const profileUpdate = await supabase.from('profiles').update({
                full_name: formData.full_name,
                state_code: formData.state,
                city: formData.city,
                zip_code: formData.zip_code,
            }).eq('id', user.id)

            if (profileUpdate.error) {
                console.error("Profile update error:", profileUpdate.error)
                throw new Error("Profile update failed: " + profileUpdate.error.message)
            }

            // 2. Insert Vehicle
            console.log("Inserting vehicle...")
            const vehicleInsert = await supabase.from('vehicles').insert({
                user_id: user.id,
                make: formData.make,
                model: formData.model,
                year: parseInt(formData.year),
                mpg: parseFloat(formData.mpg),
                is_primary: true
            })

            if (vehicleInsert.error) {
                console.error("Vehicle insert error:", vehicleInsert.error)
                throw new Error("Vehicle insert failed: " + vehicleInsert.error.message)
            }

            // 3. Insert Platforms
            console.log("Inserting platforms...")
            const platformInserts = formData.platforms.map(p => ({
                user_id: user.id,
                platform_name: p,
                is_active: true
            }))

            const platformsInsert = await supabase.from('user_platforms').insert(platformInserts)

            if (platformsInsert.error) {
                console.error("Platforms insert error:", platformsInsert.error)
                throw new Error("Platforms insert failed: " + platformsInsert.error.message)
            }

            console.log("All operations successful. Redirecting...")
            router.push('/dashboard')
            router.refresh()
            toast.success("Welcome to Gig Tracker!")

        } catch (error: any) {
            console.error('FINAL SUBMIT ERROR:', error)
            toast.error('Error saving data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-lg mb-8 text-center">
                <div className="inline-flex items-center gap-2 font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Wallet className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Gig Tracker
                </div>
                <p className="text-muted-foreground">Let's set up your financial copilot.</p>
            </div>

            <Card className="w-full max-w-lg border-border/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>
                            {step === 1 && "Personal Details"}
                            {step === 2 && "Vehicle Information"}
                            {step === 3 && "Select Platforms"}
                        </CardTitle>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Step {step} of 3
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="pt-2">
                    {step === 1 && (
                        <form onSubmit={handleSubmit1(onSubmitStep1)} className="space-y-4">
                            <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input placeholder="John Doe" {...register1('full_name')} />
                                    {errors1.full_name && <p className="text-xs text-red-500">{errors1.full_name.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ZIP Code</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="94103"
                                            {...register1('zip_code')}
                                            onBlur={(e) => {
                                                register1('zip_code').onBlur(e)
                                                handleZipBlur(e)
                                            }}
                                            className="pr-20"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                            Auto-Fill
                                        </span>
                                    </div>
                                    {errors1.zip_code && <p className="text-xs text-red-500">{errors1.zip_code.message as string}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">State</label>
                                        <Controller
                                            control={control1}
                                            name="state"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {US_STATES.map((state) => (
                                                            <SelectItem key={state.value} value={state.value}>
                                                                {state.value} - {state.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors1.state && <p className="text-xs text-red-500">{errors1.state.message as string}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">City</label>
                                        <Input placeholder="San Francisco" {...register1('city')} />
                                        {errors1.city && <p className="text-xs text-red-500">{errors1.city.message as string}</p>}
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 mt-4">
                                Continue <ChevronRight className="ml-2 size-4" />
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit2(onSubmitStep2)} className="space-y-4">
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Year</label>
                                        <Input
                                            type="number"
                                            placeholder="2023"
                                            {...register2('year')}
                                        />
                                        {errors2.year && <p className="text-xs text-red-500">{errors2.year.message as string}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Make</label>
                                        <Controller
                                            control={control2}
                                            name="make"
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val)
                                                    setValue2('model', '') // Reset
                                                    setValue2('mpg', 0)    // Reset
                                                }} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Make" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CAR_MAKES.map((make) => (
                                                            <SelectItem key={make} value={make}>{make}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors2.make && <p className="text-xs text-red-500">{errors2.make.message as string}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Model</label>
                                        <VehicleModelSelect
                                            control={control2}
                                            watch={watch2}
                                            setValue={setValue2}
                                        />
                                        {errors2.model && <p className="text-xs text-red-500">{errors2.model.message as string}</p>}
                                    </div>

                                    <div className="space-y-2 relative">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium">MPG</label>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="25.5"
                                                className="pr-20"
                                                {...register2('mpg')}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 hover:text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md transition-colors"
                                                onClick={async () => {
                                                    const { year, make, model } = getValues2()
                                                    if (!year || !make || !model) {
                                                        toast.error("Fill Year, Make, Model first")
                                                        return
                                                    }

                                                    const toastId = toast.loading(`Fetching MPG for ${year} ${make} ${model}...`)
                                                    try {
                                                        const mpg = await getEstimatedMPG(year, make, model)
                                                        if (mpg) {
                                                            setValue2('mpg', mpg, { shouldValidate: true, shouldDirty: true })
                                                            toast.success(`Found: ${mpg} MPG`, { id: toastId })
                                                        } else {
                                                            toast.error("MPG not found. Please enter manually.", { id: toastId })
                                                        }
                                                    } catch (e) {
                                                        toast.error("Error fetching MPG", { id: toastId })
                                                    }
                                                }}
                                            >
                                                Auto-Fill
                                            </button>
                                        </div>
                                        {errors2.mpg && <p className="text-xs text-red-500">{errors2.mpg.message as string}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <Button type="submit" className="flex-1 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950">
                                    Continue <ChevronRight className="ml-2 size-4" />
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                                {PLATFORM_OPTIONS.map(platform => (
                                    <div
                                        key={platform}
                                        onClick={() => togglePlatform(platform)}
                                        className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3 ${formData.platforms.includes(platform)
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 ring-1 ring-emerald-500'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                                            }`}
                                    >
                                        <div className={`size-4 rounded-full border flex items-center justify-center ${formData.platforms.includes(platform) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                            }`}>
                                            {formData.platforms.includes(platform) && <CheckCircle2 className="size-3 text-white" />}
                                        </div>
                                        <span className="font-medium text-sm">{platform}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleFinalSubmit}
                                    className="flex-1 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                                    disabled={loading}
                                >
                                    {loading ? 'Setting up...' : 'Complete Setup'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function VehicleModelSelect({ control, watch, setValue }: { control: Control<any>, watch: UseFormWatch<any>, setValue: UseFormSetValue<any> }) {
    const [models, setModels] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const year = watch('year')
    const make = watch('make')

    useEffect(() => {
        let active = true

        async function fetchModels() {
            if (!year || !make || year.length < 4) {
                setModels([])
                return
            }

            setLoading(true)
            try {
                const fetchedModels = await getVehicleModels(year, make)
                if (active) {
                    setModels(fetchedModels)
                    if (fetchedModels.length === 0 && year.length === 4) {
                        toast.error(`No models found for ${year} ${make}`)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch models", error)
            } finally {
                if (active) setLoading(false)
            }
        }

        const timeout = setTimeout(fetchModels, 500) // Debounce
        return () => { active = false; clearTimeout(timeout) }
    }, [year, make])

    return (
        <Controller
            control={control}
            name="model"
            render={({ field }) => (
                <Select
                    disabled={!year || !make || loading}
                    onValueChange={(val) => {
                        field.onChange(val)
                    }}
                    value={field.value}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={
                            loading ? "Loading models..." :
                                (!year || !make) ? "Select Year & Make first" :
                                    "Select Model"
                        } />
                    </SelectTrigger>
                    <SelectContent>
                        {models.map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                        {models.length === 0 && !loading && (
                            <SelectItem value="Other" disabled>No models found</SelectItem>
                        )}
                        <SelectItem value="Other_Manual">Other (Enter Manually)</SelectItem>
                    </SelectContent>
                </Select>
            )}
        />
    )
}
