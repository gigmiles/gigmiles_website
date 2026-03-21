import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Car, Shield, Bell, ChevronRight } from 'lucide-react'
import { GmIcon } from '@/components/ui/GmIcon'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { ReferralCard } from '@/components/ui/ReferralCard'

const settingsOptions = [
    {
        title: "Profile Information",
        description: "Update your name, location, and contact details.",
        icon: User,
        href: "/dashboard/settings/profile",
        accent: "#3b82f6",
    },
    {
        title: "Vehicle & Costs",
        description: "Manage your car details, MPG, and fuel costs.",
        icon: Car,
        href: "/dashboard/settings/vehicle",
        accent: "#10b981",
    },
    {
        title: "Taxes & Compliance",
        description: "Configure your tax exemptions and local rates.",
        icon: Shield,
        href: "/dashboard/tax",
        accent: "#f59e0b",
    },
    {
        title: "Notifications",
        description: "Choose what alerts you want to receive.",
        icon: Bell,
        href: "#",
        accent: "#a855f7",
    },
]

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_bonus_days')
        .eq('id', user.id)
        .single()

    const { count: referralCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-50">Settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your account and app preferences.</p>
            </div>

            <div className="grid gap-3 max-w-3xl">
                {settingsOptions.map((item) => (
                    <Link key={item.title} href={item.href}>
                        <Card className="glass-card rounded-2xl hover:border-white/15 hover:-translate-y-0.5 transition-all cursor-pointer group">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <GmIcon icon={item.icon} accent={item.accent} size="md" glow />
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{item.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="size-4 text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Referral Card */}
            {profile?.referral_code && (
                <ReferralCard
                    referralCode={profile.referral_code}
                    bonusDays={profile.referral_bonus_days ?? 0}
                    referralCount={referralCount ?? 0}
                />
            )}

            <Card className="max-w-3xl border-red-500/20 bg-red-500/[0.03]">
                <CardHeader>
                    <CardTitle className="text-red-400 text-base">Danger Zone</CardTitle>
                    <CardDescription>Actions here cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccountDialog />
                </CardContent>
            </Card>
        </div>
    )
}
