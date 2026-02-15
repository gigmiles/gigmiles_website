import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { VehicleSettingsForm } from './form'

export default async function VehicleSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch all vehicles for this user
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-3xl space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/settings" className="text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 text-sm transition-colors w-fit">
                    <ChevronLeft className="size-4" />
                    Back to Settings
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Vehicle Fleet</h1>
                        <p className="text-muted-foreground">Manage multiple vehicles and operating costs.</p>
                    </div>
                </div>
            </div>

            <VehicleSettingsForm initialVehicles={vehicles || []} />
        </div>
    )
}
