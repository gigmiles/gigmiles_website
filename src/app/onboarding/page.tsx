'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, Controller, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagneticCTA } from '@/components/ui/MagneticCTA'
import { getEstimatedMPG, getVehicleModels } from '@/utils/api/external'
import { getDepreciationRate } from '@/utils/calculations'
import { EV_MODELS } from '@/utils/vehicle-data'
import { toast } from 'sonner'
import { VibeLogo } from '@/components/brand/VibeLogo'
import { CheckCircle2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
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
    mpg: z.string().min(1, 'MPG is required'), // Keep as string in schema to match state/input
    fuel_type: z.string().optional(),
    ownership_type: z.string().optional(),
    electricity_cost_per_kwh: z.string().optional()
})

const PLATFORM_OPTIONS = [
    'DoorDash', 'Uber Eats', 'Grubhub', 'Uber', 'Lyft', 'Spark', 'Amazon Flex', 'Instacart', 'Shipt', 'Roadie'
]

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Create supabase client once
    const [supabase] = useState(() => createClient())

    // We can use a single form or multiple. For simplicity, let's manage state manually or use a big form.
    // Actually, separate forms per step is cleaner for validation.

    interface OnboardingFormData {
        full_name: string;
        state: string;
        city: string;
        zip_code: string;
        make: string;
        model: string;
        year: string;
        mpg: string;
        platforms: string[];
    }

    const [formData, setFormData] = useState<OnboardingFormData>({
        full_name: '', state: '', city: '', zip_code: '',
        make: '', model: '', year: '', mpg: '',
        platforms: []
    })

    const [checkingPersistence, setCheckingPersistence] = useState(true)
    const persistenceCheckStarted = useRef(false)

    console.log("[Onboarding] Render State:", { step, loading, checkingPersistence });

    // Step 1 Form
    const { register: register1, handleSubmit: handleSubmit1, control: control1, setValue: setValue1, reset: reset1, formState: { errors: errors1 } } = useForm({
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
        reset: reset2,
        watch: watch2
    } = useForm({
        resolver: zodResolver(step2Schema),
        defaultValues: { make: '', model: '', year: '', mpg: '', fuel_type: 'gasoline', ownership_type: 'owned', electricity_cost_per_kwh: '' }
    })

    // Persistence Check Logic
    useEffect(() => {
        if (persistenceCheckStarted.current) return
        persistenceCheckStarted.current = true

        let isMounted = true

        async function checkPersistence() {
            try {
                console.log("[Persistence] Starting check...")
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                console.log("[Persistence] Auth response received:", { user: user?.id, error: userError })

                if (!isMounted) return

                if (userError) {
                    console.error("[Persistence] User error:", userError)
                    setCheckingPersistence(false)
                    return
                }

                if (!user) {
                    console.log("[Persistence] No user found.")
                    setCheckingPersistence(false)
                    return
                }

                console.log("[Persistence] Fetching profile for ID:", user.id)
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                console.log("[Persistence] Profile result:", !!profile, profileError)

                if (!isMounted) return

                // 2. Fetch Vehicle
                console.log("[Persistence] Fetching vehicle...")
                const { data: vehicle, error: vehicleError } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_primary', true)
                    .maybeSingle()
                console.log("[Persistence] Vehicle result:", !!vehicle, vehicleError)

                if (!isMounted) return

                // 3. Fetch Platforms
                console.log("[Persistence] Fetching platforms...")
                const { data: platforms, error: platformsError } = await supabase
                    .from('user_platforms')
                    .select('platform_name')
                    .eq('user_id', user.id)
                console.log("[Persistence] Platforms result:", platforms?.length, platformsError)

                if (!isMounted) return

                const hasProfile = !!(profile?.full_name && profile?.state_code && profile?.city && profile?.zip_code)
                const hasVehicle = !!(vehicle?.make && vehicle?.model && vehicle?.year && vehicle?.mpg)
                const hasPlatforms = !!(platforms && platforms.length > 0)

                console.log("[Persistence] Progress:", { hasProfile, hasVehicle, hasPlatforms })

                // Populate Forms initially with reset() 
                if (profile) {
                    reset1({
                        full_name: profile.full_name || '',
                        state: profile.state_code || '',
                        city: profile.city || '',
                        zip_code: profile.zip_code || ''
                    })
                }

                if (vehicle) {
                    reset2({
                        make: vehicle.make || '',
                        model: vehicle.model || '',
                        year: vehicle.year?.toString() || '',
                        mpg: vehicle.mpg?.toString() || '25.5',
                        fuel_type: vehicle.fuel_type || 'gasoline',
                        ownership_type: vehicle.ownership_type || 'owned',
                        electricity_cost_per_kwh: vehicle.electricity_cost_per_kwh?.toString() || ''
                    })
                }

                // Synchronize central formData state
                setFormData({
                    full_name: profile?.full_name || '',
                    state: profile?.state_code || '',
                    city: profile?.city || '',
                    zip_code: profile?.zip_code || '',
                    make: vehicle?.make || '',
                    model: vehicle?.model || '',
                    year: vehicle?.year?.toString() || '',
                    mpg: vehicle?.mpg?.toString() || '',
                    platforms: platforms?.map(p => p.platform_name) || []
                })

                if (!isMounted) return

                // Redirection / Step Logic
                if (hasProfile && hasVehicle && hasPlatforms) {
                    console.log("[Persistence] Onboarding complete, redirecting to dashboard...")
                    router.push('/dashboard')
                    return
                } else if (hasProfile && hasVehicle) {
                    setStep(3)
                } else if (hasProfile) {
                    setStep(2)
                } else {
                    setStep(1)
                }

            } catch (error) {
                console.error("[Persistence] Unexpected error:", error)
            } finally {
                if (isMounted) {
                    console.log("[Persistence] Finishing check.")
                    setCheckingPersistence(false)
                }
            }
        }

        // Safety timeout
        const timeout = setTimeout(() => {
            if (isMounted) {
                console.warn("[Persistence] Check timed out after 5s. Forcing UI load.")
                setCheckingPersistence(false)
            }
        }, 5000)

        checkPersistence()
        return () => {
            isMounted = false
            clearTimeout(timeout)
        }
    }, [supabase, router, reset1, reset2])

    const onSubmitStep1 = (data: z.infer<typeof step1Schema>) => {
        setFormData(prev => ({ ...prev, ...data }))
        setStep(2)
    }

    const onSubmitStep2 = (data: z.infer<typeof step2Schema>) => {
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
            const profileUpdate = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: formData.full_name,
                state_code: formData.state,
                city: formData.city,
                zip_code: formData.zip_code,
            })

            if (profileUpdate.error) {
                console.error("Profile update error:", profileUpdate.error)
                throw new Error("Profile update failed: " + profileUpdate.error.message)
            }

            // 2. Insert/Update Vehicle
            console.log("Saving vehicle...")
            const { data: existingVehicle } = await supabase
                .from('vehicles')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_primary', true)
                .single()

            let vehicleResult;
            if (existingVehicle) {
                console.log("Updating existing vehicle:", existingVehicle.id)
                const depreciation_rate = getDepreciationRate(formData.make, formData.model, parseInt(formData.year))
                vehicleResult = await supabase.from('vehicles').update({
                    make: formData.make,
                    model: formData.model,
                    year: parseInt(formData.year),
                    mpg: parseFloat(formData.mpg),
                    depreciation_rate: depreciation_rate
                }).eq('id', existingVehicle.id)
            } else {
                console.log("Inserting new vehicle")
                const depreciation_rate = getDepreciationRate(formData.make, formData.model, parseInt(formData.year))
                vehicleResult = await supabase.from('vehicles').insert({
                    user_id: user.id,
                    make: formData.make,
                    model: formData.model,
                    year: parseInt(formData.year),
                    mpg: parseFloat(formData.mpg || '0'),
                    depreciation_rate: depreciation_rate,
                    is_primary: true,
                    fuel_type: getValues2('fuel_type') || 'gasoline',
                    ownership_type: getValues2('ownership_type') || 'owned',
                    electricity_cost_per_kwh: getValues2('electricity_cost_per_kwh') ? parseFloat(getValues2('electricity_cost_per_kwh') || '0') : null
                })
            }

            if (vehicleResult.error) {
                console.error("Vehicle save error:", vehicleResult.error)
                throw new Error("Vehicle setup failed: " + vehicleResult.error.message)
            }

            // 3. Insert/Update Platforms
            console.log("Upserting platforms...")
            const platformInserts = formData.platforms.map(p => ({
                user_id: user.id,
                platform_name: p,
                is_active: true
            }))

            const platformsInsert = await supabase.from('user_platforms').upsert(platformInserts, { onConflict: 'user_id,platform_name' })

            if (platformsInsert.error) {
                console.error("Platforms upsert error:", platformsInsert.error)
                throw new Error("Platforms setup failed: " + platformsInsert.error.message)
            }

            console.log("All operations successful. Redirecting...")
            router.push('/dashboard')
            router.refresh()
            toast.success("Welcome to GigMiles!")

        } catch (error) {
            console.error('FINAL SUBMIT ERROR:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Error saving data: ' + errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (checkingPersistence) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
                    <div className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
                    <Loader2 className="size-10 text-[#10B981] animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA] animate-pulse">Syncing your session...</p>
                    <div className="pt-8 space-y-4 border-t border-white/[0.06] mt-4">
                        <p className="text-xs text-[#A1A1AA]/60 font-medium">If sync takes too long, you can continue manually.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.05] rounded-xl"
                            onClick={() => {
                                console.log("[Persistence] Manual skip triggered by user");
                                setCheckingPersistence(false);
                            }}
                        >
                            Skip & Manual Setup
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Vibe Ambient Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#10B981]/5 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[5%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E2E8F0]/5 blur-[150px] animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative z-10 w-full max-w-lg mb-8 flex flex-col items-center text-center px-4">
                <VibeLogo className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA] opacity-60">Setup Your Engine</p>
            </div>

            <Card className="relative z-10 w-full max-w-lg rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <CardHeader className="p-6 md:p-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter text-white">
                            {step === 1 && "Personal Details"}
                            {step === 2 && "Vehicle Info"}
                            {step === 3 && "Platforms"}
                        </CardTitle>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                            Step {step}/3
                        </span>
                    </div>
                    {/* Progress Bar — Vibe Style */}
                    <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full bg-[#10B981] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]",
                                step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
                            )}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6 pt-2">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <label className="text-sm font-medium">Brand</label>
                                        <Controller
                                            control={control2}
                                            name="make"
                                            render={({ field }) => (
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val)
                                                    setValue2('model', '') // Reset
                                                    setValue2('mpg', '0')    // Reset

                                                    // Auto-detect Electric Brands
                                                    const electricBrands = ['Tesla', 'Rivian', 'Lucid', 'Polestar', 'Fisker']
                                                    if (electricBrands.includes(val)) {
                                                        setValue2('fuel_type', 'electric')
                                                    } else {
                                                        setValue2('fuel_type', 'gasoline')
                                                    }
                                                }} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Brand" />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Model</label>
                                        <VehicleModelSelect
                                            control={control2}
                                            watch={watch2}
                                            setValue={setValue2}
                                        />
                                        {errors2.model && <p className="text-xs text-red-500">{errors2.model.message as string}</p>}
                                    </div>

                                    {/* MPG or Electricity Cost based on Fuel Type */}
                                    <div className="space-y-2 relative">
                                        {watch2('fuel_type') === 'electric' ? (
                                            <>
                                                <label className="text-sm font-medium">Electricity Cost ($/kWh)</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.15"
                                                        {...register2('electricity_cost_per_kwh')}
                                                        onChange={(e) => {
                                                            // Auto-replace comma with dot
                                                            const val = e.target.value.replace(',', '.')
                                                            setValue2('electricity_cost_per_kwh', val)
                                                        }}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                        $/kWh
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
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
                                                        onChange={(e) => {
                                                            // Auto-replace comma with dot
                                                            const val = e.target.value.replace(',', '.')
                                                            setValue2('mpg', val)
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 hover:text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md transition-colors"
                                                        onClick={async () => {
                                                            const { year, make, model } = getValues2()
                                                            if (!year || !make || !model) {
                                                                toast.error("Fill Year, Brand, Model first")
                                                                return
                                                            }

                                                            const toastId = toast.loading(`Fetching MPG for ${year} ${make} ${model}...`)
                                                            try {
                                                                const mpg = await getEstimatedMPG(year, make, model)
                                                                if (mpg) {
                                                                    setValue2('mpg', mpg.toString(), { shouldValidate: true, shouldDirty: true })
                                                                    toast.success(`Found: ${mpg} MPG`, { id: toastId })
                                                                } else {
                                                                    toast.error("MPG not found. Please enter manually.", { id: toastId })
                                                                }
                                                            } catch (err) {
                                                                console.error("Error fetching MPG", err)
                                                                toast.error("Error fetching MPG", { id: toastId })
                                                            }
                                                        }}
                                                    >
                                                        Auto-Fill
                                                    </button>
                                                </div>
                                                {errors2.mpg && <p className="text-xs text-red-500">{errors2.mpg.message as string}</p>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Ownership & Fuel Type Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ownership</label>
                                        <Controller
                                            control={control2}
                                            name="ownership_type"
                                            defaultValue="owned"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="owned">I Own It</SelectItem>
                                                        <SelectItem value="leased">Leased</SelectItem>
                                                        <SelectItem value="rented">Rented</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/* Only show Fuel Type if NOT an electric-only brand */}
                                    {!['Tesla', 'Rivian', 'Lucid', 'Polestar', 'Fisker'].includes(watch2('make')) && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Fuel Type</label>
                                            <Controller
                                                control={control2}
                                                name="fuel_type"
                                                defaultValue="gasoline"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="gasoline">Gasoline</SelectItem>
                                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                                            <SelectItem value="electric">Electric</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>

                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <MagneticCTA className="flex-[2]">
                                    <Button type="submit" className="w-full h-14 bg-[#10B981] text-black font-black uppercase tracking-tighter hover:bg-[#10B981]/90 rounded-2xl group transition-all hover-spring">
                                        Continue <ChevronRight className="ml-2 size-4" />
                                    </Button>
                                </MagneticCTA>
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
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <MagneticCTA className="flex-[2]">
                                    <Button onClick={handleFinalSubmit} className="w-full h-14 bg-[#10B981] text-black font-black uppercase tracking-tighter hover:bg-[#10B981]/90 rounded-2xl group transition-all hover-spring" disabled={loading}>
                                        {loading ? 'Setting up...' : 'Complete Setup'}
                                    </Button>
                                </MagneticCTA>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface Step2FormData {
    make: string;
    model: string;
    year: string;
    mpg: string;
    fuel_type?: string;
    ownership_type?: string;
    electricity_cost_per_kwh?: string;
}

function VehicleModelSelect({ control, watch, setValue }: {
    control: Control<Step2FormData>,
    watch: UseFormWatch<Step2FormData>,
    setValue: UseFormSetValue<Step2FormData>
}) {
    const [models, setModels] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const year = watch('year')
    const make = watch('make')

    useEffect(() => {
        console.log("[VehicleModelSelect] Effect Triggered:", { year, make })
        async function fetchModels() {
            if (!year || !make) {
                console.log("[VehicleModelSelect] Missing year or make, skipping fetch.")
                return
            }
            console.log("[VehicleModelSelect] Starting fetch for:", { year, make })
            setLoading(true)

            // Check if we have local EV models for this make first
            const localEvModels = EV_MODELS.filter(ev => ev.make === make).map(ev => ev.model)

            try {
                // ... fetch from API (existing logic) ...
                // For now, simulate or just use the API.
                // Merging local EV models with API results if needed, or just relying on API
                // and matching the name.
                const models = await getVehicleModels(year, make)

                // Ensure local EVs are in the list if not returned by API
                const allModels = Array.from(new Set([...models, ...localEvModels])).sort()
                setModels(allModels)
            } catch (error) {
                console.error("Error fetching models:", error)
                // Fallback to local if API fails
                setModels(localEvModels.length > 0 ? localEvModels : [])
            } finally {
                setLoading(false)
            }
        }

        fetchModels()
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
                        // Trigger the parent's setValue handler which contains the auto-fill logic
                        setValue('model', val)
                    }}
                    value={field.value}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={
                            loading ? "Loading models..." :
                                (!year || !make) ? "Select Year & Brand first" :
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
