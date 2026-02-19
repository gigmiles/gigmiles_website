import { Button } from '@/components/ui/button'
import { getDashboardStats, getRecentEntries } from './actions'
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
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Parallel fetching
    const [stats, vehicleResult, recentEntries] = await Promise.all([
        getDashboardStats(),
        user ? supabase.from('vehicles').select('*').eq('user_id', user.id).eq('is_primary', true).single() : Promise.resolve({ data: null }),
        getRecentEntries(5)
    ])

    const vehicle = vehicleResult?.data

    if (!stats) return <div className="p-8 text-center text-muted-foreground">Loading insights...</div>

    const { today, weekly, chartData, platformDistribution } = stats

    return (
        <div className="space-y-8 animate-fade-in pb-12">
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
            <div className="mb-8">
                <BoltQuickActions />
            </div>

            {/* Main Content Grid: Two Column Layout for better vertical packing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Primary Column (8/12) */}
                <div className="lg:col-span-8 space-y-8">
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
                        wearCost={today.wearCost}
                        insurance={today.dailyInsurance}
                        richEntry={today.richEntry || undefined}
                    />
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
                    />
                    <PlatformDistributionChart data={platformDistribution} />
                    <RecentEntries entries={recentEntries} />
                    <VehicleValueCard vehicle={vehicle} />
                </div>
            </div>

            {/* Secondary Sections */}
            {
                !today.hasEntry && (
                    <div className="glass-card flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-16 text-center animate-fade-in">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6 drop-shadow-sm">
                            <Car className="size-10 text-slate-400" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">No activity logged today</h3>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            Keep your records accurate by logging your platform income and miles for the current shift.
                        </p>
                        <Link href="/dashboard/entry/new" className="mt-8">
                            <Button variant="outline" className="rounded-full px-8 hover:bg-slate-50">
                                Start Tracking Today
                            </Button>
                        </Link>
                    </div>
                )
            }
        </div>
    )
}
