import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar'
import { Search, Bell, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
        .single()

    if (!profile || !profile.full_name || !profile.state_code) {
        redirect('/onboarding')
    }

    const userData = {
        full_name: profile.full_name,
        email: user.email,
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <AppSidebar user={userData} />
                <SidebarInset className="flex flex-col">
                    {/* Premium Header */}
                    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl md:px-6">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="hidden md:flex h-9 w-64 items-center gap-2 rounded-full border border-border/50 bg-slate-50 px-3 text-muted-foreground transition-all focus-within:ring-2 focus-within:ring-ring/20 focus-within:ring-offset-0">
                                <Search className="size-4" />
                                <Input
                                    placeholder="Search everything..."
                                    className="h-full border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                <HelpCircle className="size-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground">
                                <Bell className="size-5" />
                                <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                            </Button>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
