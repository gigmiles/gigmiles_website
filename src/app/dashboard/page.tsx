import { getDashboardStats, getRecentEntries, getDatesWithEntries } from './actions'
import { getActiveShift } from './actions/shift'
import { logToFile } from '@/utils/debug'
import { BoltQuickActions } from '@/components/dashboard/BoltQuickActions'
import { DashboardEarningsChart } from '@/components/dashboard/DashboardEarningsChart'
import { YesterdaysSummaryNotification } from '@/components/dashboard/YesterdaysSummaryNotification'
import { DailyMotivation } from '@/components/dashboard/DailyMotivation'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { ActiveShiftBanner } from '@/components/dashboard/ActiveShiftBanner'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const { date } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    logToFile(`[DashboardPage] User detected: ${user?.id || "None"}`)

    // Parallel fetching
    const [stats, vehicleResult, recentEntries, activeDates, activeShift] = await Promise.all([
        getDashboardStats(date),
        user ? supabase.from('vehicles').select('*').eq('user_id', user.id).eq('is_primary', true).maybeSingle() : Promise.resolve({ data: null }),
        getRecentEntries(5),
        getDatesWithEntries(),
        getActiveShift(),
    ])

    const vehicle = vehicleResult?.data

    if (!stats) return null

    const { today, weekly, chartData } = stats

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Active Shift Banner */}
            {activeShift && (
                <ActiveShiftBanner
                    shiftId={activeShift.id}
                    startTime={activeShift.start_time}
                    platform={activeShift.platform}
                />
            )}

            {/* Header: Title + Yesterday Summary inline */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white">
                        Financial Overview
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]">
                        Track your performance and tax estimates in real-time.
                    </p>
                </div>
                <YesterdaysSummaryNotification />
            </div>


            {/* Bolt Migration Components */}
            <div className="space-y-3">
                <BoltQuickActions
                    vehicles={stats.vehicles}
                    activeVehicleId={stats.activeVehicleId}
                    stateCode={stats.stateCode}
                />
                <DailyMotivation
                    hasEntry={today.hasEntry}
                    userName={user?.user_metadata?.full_name || user?.email}
                />
            </div>

            {/* Core Dynamic Content: Today Summary and Customizable Widgets Grid */}
            <DashboardGrid
                todayStats={today}
                data={stats}
                recentEntries={recentEntries}
                activeVehicleId={stats.activeVehicleId}
                primaryVehicle={stats.primaryVehicle}
                stateCode={stats.stateCode}
                selectedDate={date}
                activeDates={activeDates}
            />

            {/* Earnings Chart at the very bottom as requested */}
            <div className="mt-8">
                <DashboardEarningsChart data={chartData} />
            </div>
        </div>
    )
}
