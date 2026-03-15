'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { WeeklyGoalCard } from './WeeklyGoalCard'
import { RecentEntries } from './RecentEntries'
import { BoltWeeklySummary } from './BoltWeeklySummary'
import dynamic from 'next/dynamic'
const PlatformDistributionChart = dynamic(() => import('./PlatformDistributionChart').then(mod => mod.PlatformDistributionChart), { ssr: false })
import { VehicleValueCard } from './VehicleValueCard'
import { BoltTodaySummary } from './BoltTodaySummary'
import { TaxLedgerWidget } from './TaxLedgerWidget'

interface DashboardGridProps {
    todayStats: any
    data: any
    recentEntries: any
    activeVehicleId: string | null
    primaryVehicle: any
    stateCode: string | null
    selectedDate?: string
    activeDates?: string[]
}

/*
 * SYMMETRIC TWO-COLUMN LAYOUT
 * ---------------------------
 * Left column:  Platform Efficiency  |  Right column: Weekly Goal
 *               Weekly Performance   |                Recent Activity
 *                                    |                Asset Value
 *
 * Both columns stretch to equal height via items-stretch.
 * On mobile, stacks vertically in reading order.
 */

const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
}

export function DashboardGrid({
    todayStats,
    data,
    recentEntries,
    activeVehicleId,
    primaryVehicle,
    stateCode,
    selectedDate,
    activeDates
}: DashboardGridProps) {
    const [visibleWidgets, setVisibleWidgets] = useState({
        goals: true,
        efficiency: true,
        vehicle: true,
        weekly: true,
        recent: true,
        tax: true,
    })

    useEffect(() => {
        const savedWidgets = localStorage.getItem('gigmiles_dashboard_widgets')
        if (savedWidgets) {
            try {
                const parsed = JSON.parse(savedWidgets)
                // Merge parsed state with default state to ensure new widgets (like tax) default to true if missing
                setVisibleWidgets(prev => ({ ...prev, ...parsed }))
            } catch (e) {
                console.error('Failed to parse dashboard settings')
            }
        }

        const handleToggle = (e: any) => {
            if (e.detail) {
                setVisibleWidgets(e.detail)
            }
        }

        window.addEventListener('gigmiles_widget_update', handleToggle)
        return () => window.removeEventListener('gigmiles_widget_update', handleToggle)
    }, [])

    const { weekly, platformDistribution, vehicles } = data

    return (
        <div className="space-y-4">
            {/* Hero: Daily Summary — full width */}
            <BoltTodaySummary
                {...todayStats}
                tax={todayStats.estimatedTax}
                selectedDate={selectedDate}
                activeDates={activeDates}
                vehicles={data.vehicles}
                activeVehicleId={activeVehicleId}
                isXL={true}
            />

            {/* Symmetric Two-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* LEFT COLUMN: Platform Efficiency + Weekly Performance */}
                <div className="flex flex-col gap-4">
                    {visibleWidgets.efficiency && (
                        <motion.div {...fadeIn} className="rounded-xl border-l-2 border-l-indigo-500/40">
                            <PlatformDistributionChart data={platformDistribution} />
                        </motion.div>
                    )}
                    {visibleWidgets.weekly && (
                        <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }} className="flex-1 flex flex-col rounded-xl border-l-2 border-l-emerald-500/40">
                            <BoltWeeklySummary
                                entries={weekly.entries}
                                totalNetProfit={weekly.netProfit}
                                totalGross={weekly.gross}
                                totalMiles={weekly.miles}
                                totalHours={weekly.hours}
                                dailyStats={data.chartData}
                            />
                        </motion.div>
                    )}
                </div>

                {/* RIGHT COLUMN: Weekly Goal + Recent Activity + Asset Value */}
                <div className="flex flex-col gap-4">
                    {visibleWidgets.goals && (
                        <motion.div {...fadeIn} transition={{ delay: 0.05, duration: 0.3 }} className="rounded-xl border-l-2 border-l-amber-500/40">
                            <WeeklyGoalCard currentNet={weekly.netProfit} />
                        </motion.div>
                    )}
                    {visibleWidgets.recent && (
                        <motion.div {...fadeIn} transition={{ delay: 0.15, duration: 0.3 }} className="rounded-xl border-l-2 border-l-blue-500/40">
                            <RecentEntries entries={recentEntries} primaryVehicle={primaryVehicle} stateCode={stateCode || ''} />
                        </motion.div>
                    )}
                    {visibleWidgets.tax && (
                        <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.3 }} className="rounded-xl border-l-2 border-l-cyan-500/40">
                            <TaxLedgerWidget 
                                grossIncome={weekly.gross} 
                                totalRealCosts={weekly.gross - weekly.netProfit} 
                                estimatedTax={todayStats.estimatedTax} 
                                stateCode={stateCode || 'DEFAULT'}
                            />
                        </motion.div>
                    )}
                    {visibleWidgets.vehicle && (
                        <motion.div {...fadeIn} transition={{ delay: 0.25, duration: 0.3 }} className="flex-1 flex flex-col rounded-xl border-l-2 border-l-purple-500/40">
                            <VehicleValueCard vehicles={vehicles} activeVehicleId={activeVehicleId} />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
