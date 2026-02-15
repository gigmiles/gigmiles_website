import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Save } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    async function updateProfile(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const full_name = formData.get('full_name') as string
        const state_code = formData.get('state_code') as string
        const city = formData.get('city') as string
        const zip_code = formData.get('zip_code') as string

        await supabase
            .from('profiles')
            .update({ full_name, state_code, city, zip_code })
            .eq('id', user.id)

        revalidatePath('/dashboard/settings')
        revalidatePath('/dashboard/settings/profile')
    }

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

            <form action={updateProfile} className="space-y-6 bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-border/50 shadow-premium">
                <div className="grid gap-6">
                    <Input
                        name="full_name"
                        label="Full Name"
                        defaultValue={profile?.full_name || ''}
                        placeholder="John Doe"
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            name="state_code"
                            label="State Code (e.g. CA)"
                            defaultValue={profile?.state_code || ''}
                            placeholder="CA"
                        />
                        <Input
                            name="zip_code"
                            label="ZIP Code"
                            defaultValue={profile?.zip_code || ''}
                            placeholder="90001"
                        />
                    </div>

                    <Input
                        name="city"
                        label="City"
                        defaultValue={profile?.city || ''}
                        placeholder="Los Angeles"
                    />
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-slate-900 dark:text-slate-200">Weekly Reports</p>
                        <p>Receive a weekly summary of your earnings.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* 
                            NOTE: This button needs to be a Client Component to handle onClick / pending state nicely.
                            For now, we will use a simple form action for the MVP verification.
                        */}
                        <Button formAction={async () => {
                            'use server'
                            // We need to import dynamically or handling this better in a real client component
                            // But for quick MVP, let's just make a new client component button
                        }} disabled className="hidden">
                            Hidden
                        </Button>

                        <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 px-8 shadow-xl">
                            <Save className="mr-2 size-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>

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
