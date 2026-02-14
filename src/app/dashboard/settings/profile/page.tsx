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

                <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 px-8 shadow-xl">
                        <Save className="mr-2 size-4" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
