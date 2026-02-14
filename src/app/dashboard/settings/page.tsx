import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Car, Shield, Bell, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const settingsOptions = [
        {
            title: "Profile Information",
            description: "Update your name, location, and contact details.",
            icon: User,
            href: "/dashboard/settings/profile",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-500/10"
        },
        {
            title: "Vehicle & Costs",
            description: "Manage your car details, MPG, and fuel costs.",
            icon: Car,
            href: "/dashboard/settings/vehicle",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10"
        },
        {
            title: "Taxes & Compliance",
            description: "Configure your tax exemptions and local rates.",
            icon: Shield,
            href: "/dashboard/tax",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10"
        },
        {
            title: "Notifications",
            description: "Choose what alerts you want to receive.",
            icon: Bell,
            href: "#",
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-500/10"
        }
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your account and app preferences.</p>
            </div>

            <div className="grid gap-4 max-w-3xl">
                {settingsOptions.map((item) => (
                    <Link key={item.title} href={item.href}>
                        <Card className="shadow-premium border-border/50 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                        <item.icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="max-w-3xl border-ruby-500/20 bg-ruby-50/10 dark:bg-ruby-950/10">
                <CardHeader>
                    <CardTitle className="text-ruby-600 dark:text-ruby-400">Danger Zone</CardTitle>
                    <CardDescription>Actions here cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" className="rounded-full">Delete Account Data</Button>
                </CardContent>
            </Card>
        </div>
    )
}
