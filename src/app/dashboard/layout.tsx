import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-emerald-600">GigTracker</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg group">
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/reports" className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg group">
                        <span className="font-medium">Reports</span>
                    </Link>
                    <Link href="/dashboard/tax" className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg group">
                        <span className="font-medium">Tax Center</span>
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg group">
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {profile.full_name.charAt(0)}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-slate-900">{profile.full_name}</p>
                            <p className="text-slate-500 text-xs">Free Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
