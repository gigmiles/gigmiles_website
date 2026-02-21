'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Loader2, Car, CreditCard, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { updateProfile } from './actions'
import { Vehicle } from '@/app/dashboard/types'
import { cn } from '@/lib/utils'

interface Profile {
    full_name: string | null
    state_code: string | null
    zip_code: string | null
    city: string | null
    default_gas_price?: number | null
}

interface ProfileSettingsFormProps {
    profile: Profile | null
    vehicles: Vehicle[]
    userPlatforms: any[]
}

const PLATFORM_OPTIONS = [
    'DoorDash', 'Uber Eats', 'Grubhub', 'Uber', 'Lyft', 'Spark', 'Amazon Flex', 'Instacart', 'Shipt', 'Roadie'
]

export function ProfileSettingsForm({ profile, vehicles, userPlatforms }: ProfileSettingsFormProps) {
    const primaryVehicle = vehicles?.find(v => v.is_primary) || vehicles?.[0]
    const [isLoading, setIsLoading] = useState(false)
    const [platforms, setPlatforms] = useState<string[]>(userPlatforms.map(p => p.platform_name))
    const [isAddingCustom, setIsAddingCustom] = useState(false)
    const [customPlatform, setCustomPlatform] = useState('')

    // Location State for Auto-fill
    const [zipCode, setZipCode] = useState(profile?.zip_code || '')
    const [stateCode, setStateCode] = useState(profile?.state_code || '')
    const [city, setCity] = useState(profile?.city || '')
    const [isLookingUp, setIsLookingUp] = useState(false)

    // Baseline Preview State
    const [selectedBaselineVehicleId, setSelectedBaselineVehicleId] = useState<string | null>(primaryVehicle?.id || (vehicles?.[0]?.id || null))
    const selectedBaselineVehicle = vehicles.find(v => v.id === selectedBaselineVehicleId) || primaryVehicle

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setZipCode(val)

        if (val.length === 5) {
            setIsLookingUp(true)
            try {
                const res = await fetch(`https://api.zippopotam.us/us/${val}`)
                if (res.ok) {
                    const data = await res.json()
                    const place = data.places[0]
                    setCity(place['place name'])
                    setStateCode(place['state abbreviation'])
                    toast.success('Location updated from ZIP')
                }
            } catch (err) {
                console.error('Zip lookup failed:', err)
            } finally {
                setIsLookingUp(false)
            }
        }
    }

    const togglePlatform = async (name: string) => {
        const newPlatforms = platforms.includes(name)
            ? platforms.filter(p => p !== name)
            : [...platforms, name]

        setPlatforms(newPlatforms)
        // Auto-save platforms when toggled
        const { updateUserPlatforms } = await import('./actions')
        await updateUserPlatforms(newPlatforms)
    }

    const handleAddCustom = async () => {
        if (!customPlatform.trim()) return
        if (platforms.includes(customPlatform)) {
            toast.error('Platform already added')
            return
        }
        const newPlatforms = [...platforms, customPlatform]
        setPlatforms(newPlatforms)
        const { updateUserPlatforms } = await import('./actions')
        await updateUserPlatforms(newPlatforms)
        setCustomPlatform('')
        setIsAddingCustom(false)
        toast.success(`${customPlatform} added!`)
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateProfile(formData)
            if (result?.success) {
                toast.success('Profile updated!')
            } else {
                toast.error('Update failed: ' + (result?.error || 'Unknown error'))
            }
        } catch {
            toast.error('An error occurred while updating')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form action={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-border/50 shadow-premium">
                <div className="grid gap-6">
                    <Input
                        name="full_name"
                        label="Full Name"
                        defaultValue={profile?.full_name || ''}
                        placeholder="John Doe"
                        required
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            name="state_code"
                            label="State Code (e.g. CA)"
                            value={stateCode}
                            onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                            placeholder="CA"
                            maxLength={2}
                            required
                        />
                        <div className="relative">
                            <Input
                                name="zip_code"
                                label="ZIP Code"
                                value={zipCode}
                                onChange={handleZipChange}
                                placeholder="90001"
                                required
                            />
                            {isLookingUp && (
                                <div className="absolute right-3 top-[34px] animate-spin">
                                    <Loader2 className="size-4 text-emerald-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        name="city"
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Los Angeles"
                        required
                    />
                    <Input
                        name="default_gas_price"
                        label="Default Gas Price ($/gal)"
                        type="number"
                        step="0.01"
                        defaultValue={profile?.default_gas_price || ''}
                        placeholder="4.50"
                    />
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground mr-4">
                        <p className="font-medium text-slate-900 dark:text-slate-200">Weekly Reports</p>
                        <p>Receive a weekly summary of your earnings.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 px-8 shadow-xl"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 size-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Platform Manager Card */}
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 shadow-premium md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Save className="size-4" />
                            My Gig Platforms
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-500 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-wider"
                            onClick={() => setIsAddingCustom(!isAddingCustom)}
                        >
                            {isAddingCustom ? 'Cancel' : '+ Add Manual'}
                        </Button>
                    </div>

                    {isAddingCustom && (
                        <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                            <Input
                                placeholder="E.g. Local Delivery"
                                value={customPlatform}
                                onChange={(e) => setCustomPlatform(e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Button size="sm" onClick={handleAddCustom} className="bg-emerald-500 text-white">Add</Button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {PLATFORM_OPTIONS.map(name => {
                            const isActive = platforms.includes(name)
                            return (
                                <button
                                    key={name}
                                    onClick={() => togglePlatform(name)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                        isActive
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                            : "bg-slate-50 dark:bg-white/5 border-border/50 text-slate-500 hover:border-emerald-500/30"
                                    )}
                                >
                                    {name}
                                </button>
                            )
                        })}
                        {platforms.filter(p => !PLATFORM_OPTIONS.includes(p)).map(p => (
                            <button
                                key={p}
                                onClick={() => togglePlatform(p)}
                                className="px-4 py-2 rounded-full text-xs font-bold transition-all border bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            >
                                {p} (Custom)
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">Platforms are automatically saved. Selected ones appear in emerald.</p>
                </div>

                {/* Financial Baseline Card */}
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 shadow-premium">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard className="size-4" />
                        Financial Baseline {selectedBaselineVehicle?.id !== primaryVehicle?.id && <span className="text-[10px] text-amber-500 lowercase font-normal">(Preview)</span>}
                    </h3>

                    {selectedBaselineVehicle ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground mr-1">Vehicle</span>
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{selectedBaselineVehicle.year} {selectedBaselineVehicle.make} {selectedBaselineVehicle.model}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground mr-1">Ownership</span>
                                <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">{selectedBaselineVehicle.ownership_type || 'Owned'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground mr-1 capitalize">{selectedBaselineVehicle.payment_cycle || 'Monthly'} Payment</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">${selectedBaselineVehicle.monthly_payment || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground mr-1">Monthly Insurance</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">${selectedBaselineVehicle.monthly_insurance || 0}</span>
                            </div>
                            <Link
                                href="/dashboard/settings/vehicle"
                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 mt-2 w-fit transition-colors"
                            >
                                Edit Financials in Vehicle Settings <ChevronRight className="size-3" />
                            </Link>
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-slate-50 dark:bg-white/5 rounded-xl">
                            <p className="text-xs text-muted-foreground">No primary vehicle set.</p>
                        </div>
                    )}
                </div>

                {/* Vehicles Summary Card */}
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 shadow-premium">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Car className="size-4" />
                            My Vehicles
                        </h3>
                        <Link href="/dashboard/settings/vehicle" className="text-[10px] font-bold text-emerald-500 hover:underline">
                            Manage
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {vehicles?.map(v => (
                            <div
                                key={v.id}
                                onClick={() => setSelectedBaselineVehicleId(v.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border outline-none",
                                    selectedBaselineVehicleId === v.id
                                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                                        : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-border/50"
                                )}
                            >
                                <Car className={`size-4 ${v.is_primary ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold truncate">{v.year} {v.make}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{v.model}</p>
                                </div>
                                {v.is_primary && (
                                    <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">Primary</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
