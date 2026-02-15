import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { VehicleSettingsForm } from './form'

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

            <VehicleSettingsForm vehicle={vehicle} />
        </div>
    )
}
