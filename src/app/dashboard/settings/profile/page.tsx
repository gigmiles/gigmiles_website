import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

import { ProfileSettingsForm } from './profile-form'

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })

    const { data: userPlatforms } = await supabase
        .from('user_platforms')
        .select('*')
        .eq('user_id', user.id)

    return (
        <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/settings" className="text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 text-sm transition-colors w-fit">
                    <ChevronLeft className="size-4" />
                    Back to Settings
                </Link>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Profile Information</h1>
                <p className="text-muted-foreground">Manage your personal and location details.</p>
            </div>

            <ProfileSettingsForm
                profile={profile}
                vehicles={vehicles || []}
                userPlatforms={userPlatforms || []}
            />

            {/* Email Test Section - Temporary for Verification */}

            {/* Email Test Section - Temporary for Verification */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">BETA</span>
                    Email Notifications
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1 mb-4">
                    Test the new weekly summary email integration.
                </p>
                <form action={async () => {
                    'use server'
                    const { sendWeeklyReport } = await import('@/app/dashboard/actions/email')
                    await sendWeeklyReport()
                }}>
                    <Button variant="outline" className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700">
                        Send Test Report Now
                    </Button>
                </form>
            </div>
        </div>
    )
}
