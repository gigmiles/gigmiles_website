import { Button } from '@/components/ui/button'
import { getDashboardStats, getRecentEntries, getDatesWithEntries } from './actions'
import Link from 'next/link'
import {
    Car,
    Plus
} from 'lucide-react'
import { BoltQuickActions } from '@/components/dashboard/BoltQuickActions'
import { BoltTodaySummary } from '@/components/dashboard/BoltTodaySummary'
import { BoltWeeklySummary } from '@/components/dashboard/BoltWeeklySummary'
import { EarningsChart } from '@/components/dashboard/EarningsChart'
import { PlatformDistributionChart } from '@/components/dashboard/PlatformDistributionChart'
import { RecentEntries } from '@/components/dashboard/RecentEntries'
import { VehicleValueCard } from '@/components/dashboard/VehicleValueCard'
import { YesterdaysSummaryNotification } from '@/components/dashboard/YesterdaysSummaryNotification'
import { DailyMotivation } from '@/components/dashboard/DailyMotivation'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const { date } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Parallel fetching
    const [stats, vehicleResult, recentEntries, activeDates] = await Promise.all([
        getDashboardStats(date),
        user ? supabase.from('vehicles').select('*').eq('user_id', user.id).eq('is_primary', true).single() : Promise.resolve({ data: null }),
        getRecentEntries(5),
        getDatesWithEntries()
    ])

    const vehicle = vehicleResult?.data

    if (!stats) return <div className="p-8 text-center text-muted-foreground">Loading insights...</div>

    const { today, weekly, chartData, platformDistribution } = stats

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <YesterdaysSummaryNotification />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        Financial Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Track your performance and tax estimates in real-time.
                    </p>
                </div>
                <Link href="/dashboard/entry/new">
                    <Button size="lg" className="rounded-full bg-emerald-600 px-6 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
                        <Plus className="mr-2 size-5" />
                        New Entry
                    </Button>
                </Link>
            </div>

            {/* Bolt Migration Components */}
            <div className="mb-8 space-y-4">
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

            {/* Main Content Grid: Two Column Layout for better vertical packing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Primary Column (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    {today.hasEntry ? (
                        <BoltTodaySummary
                            gross={today.gross}
                            netProfit={today.netProfit}
                            expenses={today.totalRealCosts}
                            miles={today.miles}
                            hours={today.hours}
                            tax={today.estimatedTax}
                            federalTax={today.federalTax}
                            stateTax={today.stateTax}
                            tips={today.tips}
                            mpg={today.mpg}
                            gasPrice={today.gasPrice}
                            fuelCost={today.fuelCost}
                            gasCost={today.gasCost}
                            electricCost={today.electricCost}
                            wearCost={today.wearCost}
                            insurance={today.dailyInsurance}
                            richEntry={today.richEntry || undefined}
                            hasEntry={today.hasEntry}
                            selectedDate={date}
                            activeDates={activeDates}
                            vehicles={stats.vehicles}
                            activeVehicleId={stats.activeVehicleId}
                        />
                    ) : (
                        <div className="glass-card flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 p-16 text-center animate-fade-in shadow-premium h-[420px]">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 mb-6 drop-shadow-md">
                                <Car className="size-12 text-slate-400" />
                            </div>
                            <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">Let's Get Started</h3>
                            <p className="mt-4 text-muted-foreground max-w-sm text-base">
                                Your dashboard is waiting. Log your first shift of the day to see your insights come to life.
                            </p>
                            <Link href="/dashboard/entry/new" className="mt-8">
                                <Button size="lg" className="rounded-full px-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 font-bold text-base">
                                    <Plus className="mr-2 size-5" /> Add First Entry
                                </Button>
                            </Link>
                        </div>
                    )}

                    <EarningsChart data={chartData} />
                </div>

                {/* Right Secondary Column (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <BoltWeeklySummary
                        entries={weekly.entries}
                        totalNetProfit={weekly.netProfit}
                        totalGross={weekly.gross}
                        totalMiles={weekly.miles}
                        totalHours={weekly.hours}
                        dailyStats={chartData}
                    />
                    <PlatformDistributionChart data={platformDistribution} />
                    <RecentEntries entries={recentEntries} primaryVehicle={stats.primaryVehicle} stateCode={stats.stateCode} />
                    <VehicleValueCard vehicles={stats.vehicles} activeVehicleId={stats.activeVehicleId} />
                </div>
            </div>
        </div>
    )
}
