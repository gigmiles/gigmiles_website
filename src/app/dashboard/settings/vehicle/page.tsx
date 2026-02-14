import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Save, Car } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function VehicleSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

    async function updateVehicle(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const make = formData.get('make') as string
        const model = formData.get('model') as string
        const year = parseInt(formData.get('year') as string)
        const mpg = parseFloat(formData.get('mpg') as string)

        if (vehicle) {
            await supabase
                .from('vehicles')
                .update({ make, model, year, mpg })
                .eq('id', vehicle.id)
        } else {
            await supabase
                .from('vehicles')
                .insert({ user_id: user.id, make, model, year, mpg, is_primary: true })
        }

        revalidatePath('/dashboard/settings')
        revalidatePath('/dashboard/settings/vehicle')
    }

    return (
        <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/settings" className="text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 text-sm transition-colors w-fit">
                    <ChevronLeft className="size-4" />
                    Back to Settings
                </Link>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Vehicle & Costs</h1>
                <p className="text-muted-foreground">Manage your vehicle performance and operating costs.</p>
            </div>

            <form action={updateVehicle} className="space-y-6 bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-border/50 shadow-premium">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl mb-4">
                    <div className="p-3 bg-emerald-500 text-white rounded-lg">
                        <Car className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Active Vehicle</h3>
                        <p className="text-sm text-muted-foreground">{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "No vehicle set"}</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            name="make"
                            label="Make"
                            defaultValue={vehicle?.make || ''}
                            placeholder="Toyota"
                        />
                        <Input
                            name="model"
                            label="Model"
                            defaultValue={vehicle?.model || ''}
                            placeholder="Camry"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            name="year"
                            label="Year"
                            type="number"
                            defaultValue={vehicle?.year || ''}
                            placeholder="2020"
                        />
                        <Input
                            name="mpg"
                            label="Miles Per Gallon (MPG)"
                            type="number"
                            step="0.1"
                            defaultValue={vehicle?.mpg || ''}
                            placeholder="28.5"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 border-dashed">
                    <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                        <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">Fuel & Wear Estimation</h4>
                        <p className="text-xs text-muted-foreground">These values are used to calculate your real-time expenses on the dashboard. We use current average market rates unless specified.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 px-8 shadow-xl">
                        <Save className="mr-2 size-4" />
                        Save Vehicle Data
                    </Button>
                </div>
            </form>
        </div>
    )
}
