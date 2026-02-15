'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Loader2, Car, Shield, CreditCard, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { updateProfile } from './actions'

interface ProfileSettingsFormProps {
    profile: any
    vehicles: any[]
}

export function ProfileSettingsForm({ profile, vehicles }: ProfileSettingsFormProps) {
    const primaryVehicle = vehicles?.find(v => v.is_primary) || vehicles?.[0]
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateProfile(formData)
            if (result?.success) {
                toast.success('Profil güncellendi!')
            } else {
                toast.error('Giriş başarısız: ' + (result?.error || 'Bilinmeyen hata'))
            }
        } catch (error) {
            toast.error('Bir hata oluştu')
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
                            defaultValue={profile?.state_code || ''}
                            placeholder="CA"
                            maxLength={2}
                            required
                        />
                        <Input
                            name="zip_code"
                            label="ZIP Code"
                            defaultValue={profile?.zip_code || ''}
                            placeholder="90001"
                            required
                        />
                    </div>

                    <Input
                        name="city"
                        label="City"
                        defaultValue={profile?.city || ''}
                        placeholder="Los Angeles"
                        required
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
                {/* Financial Baseline Card */}
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 shadow-premium">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard className="size-4" />
                        Financial Baseline
                    </h3>

                    {primaryVehicle ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground">Ownership</span>
                                <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">{primaryVehicle.ownership_type || 'Owned'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground capitalize">{primaryVehicle.payment_cycle || 'Monthly'} Payment</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">${primaryVehicle.monthly_payment || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs text-muted-foreground">Monthly Insurance</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">${primaryVehicle.monthly_insurance || 0}</span>
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
                            <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
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
