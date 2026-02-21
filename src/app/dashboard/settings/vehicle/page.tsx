import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" className="rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold">
                            ← Back to Settings
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Vehicle Settings</h1>
                        <p className="mt-2 text-muted-foreground">Manage your car fleet and cost baselines.</p>
                    </div>
                </div>
            </div>

            <VehicleSettingsForm initialVehicles={vehicles || []} />
        </div>
    )
}
