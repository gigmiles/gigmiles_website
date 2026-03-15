import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar'
import { HeaderActions } from '@/components/dashboard/HeaderActions'
import Link from "next/link";
import { VibeLogo } from '@/components/brand/VibeLogo';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if profile is complete
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, state_code')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile || !profile.full_name || !profile.state_code) {
        redirect('/onboarding')
    }

    const userData = {
        full_name: profile.full_name,
        email: user.email,
    }

    // Fetch vehicles for the sidebar (Force Rebuild)
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeVehicleId = (vehicles as any[])?.find((v: any) => v.is_primary)?.id || (vehicles as any[])?.[0]?.id || null

    return (
        <SidebarProvider>
            <AppSidebar user={userData} vehicles={vehicles as any || []} activeVehicleId={activeVehicleId} />
            <SidebarInset className="relative overflow-hidden bg-[#0B1120] flex flex-col">
                {/* Global Animated Mesh Gradient & Noise (Premium Emerald/Blue) */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
                    <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-blue-500/10 rounded-full blur-[80px] animate-pulse delay-1000" />
                </div>

                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-3xl px-6 md:px-10">
                    <div className="mx-auto max-w-[1600px] w-full flex items-center justify-between gap-2">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white transition-colors" />
                            <div className="h-4 w-px bg-white/[0.06]" />
                        </div>

                        <HeaderActions />
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-10 relative z-0 overflow-y-auto pb-24 md:pb-10 min-w-0">
                    <div className="mx-auto max-w-[1600px] w-full">
                        {children}
                    </div>
                </main>
                <MobileNav />
            </SidebarInset>
        </SidebarProvider>
    )
}
