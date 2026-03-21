'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DailyEntry, Vehicle } from '@/app/dashboard/types'
import { calculateFinancials } from '@/utils/calculations'
import { SwipeableCard } from '@/components/ui/SwipeableCard'
import { MobileCard } from '@/components/ui/MobileCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface RecentEntriesProps {
    entries: DailyEntry[]
    primaryVehicle: Vehicle | null
    stateCode?: string | null
}

export function RecentEntries({ entries, primaryVehicle, stateCode = 'CA' }: RecentEntriesProps) {
    const router = useRouter()

    if (!entries || entries.length === 0) {
        return (
            <MobileCard pressable={false} className="flex flex-col h-full">
                <EmptyState
                    title="No recent activity"
                    description="When you track earnings, your shifts will appear here."
                />
            </MobileCard>
        )
    }

    return (
        <MobileCard pressable={false} className="flex flex-col h-full bg-transparent border-0 shadow-none p-0 md:bg-card md:border md:shadow-sm md:p-6">
            <div className="flex items-center justify-between mb-4 px-2 md:px-0">
                <div>
                    <h2 className="text-sm md:text-xl font-bold text-foreground tracking-tight">Recent Activity</h2>
                    <p className="text-[9px] md:text-sm text-muted-foreground font-medium">History of tracked shifts</p>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {entries.map((entry) => {
                    const gross = (entry.platform_earnings).reduce((acc: number, curr) => acc + (curr.amount || 0) + (curr.tips || 0), 0)
                    const cashExpenses = (entry.expenses).reduce((acc: number, curr) => acc + (curr.amount || 0), 0)
                    const miles = (entry.platform_earnings).reduce((acc: number, curr) => acc + (curr.miles || 0), 0)

                    const financials = calculateFinancials({
                        grossEarnings: gross,
                        expenses: cashExpenses,
                        miles: miles,
                        stateCode: stateCode || 'CA',
                        mpg: primaryVehicle?.mpg || 25,
                        gasPrice: entry.gas_price || 4.50,
                        wearRate: primaryVehicle?.depreciation_rate || 0.35,
                        ownershipType: primaryVehicle?.ownership_type || 'owned',
                        monthlyInsurance: primaryVehicle?.monthly_insurance || 0,
                        monthlyLease: primaryVehicle?.monthly_payment || 0,
                        paymentCycle: primaryVehicle?.payment_cycle || 'monthly',
                        insuranceCycle: primaryVehicle?.insurance_cycle || 'monthly',
                        fuelType: (primaryVehicle?.fuel_type as any) || 'gasoline',
                        electricityPrice: primaryVehicle?.electricity_cost_per_kwh || 0.15
                    })

                    const net = financials.netProfit

                    return (
                        <SwipeableCard 
                            key={entry.id}
                            onEdit={() => router.push(`/dashboard/entry/${entry.id}/edit`)}
                        >
                            <MobileCard 
                                pressable={true}
                                onClick={() => router.push(`/dashboard/entry/${entry.id}/edit`)}
                                className="flex items-center justify-between p-4 group/row !bg-background !border-border !rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <Calendar className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-foreground tracking-tight">{format(parseISO(entry.date), 'MMM d, yyyy')}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-emerald-500">${net.toFixed(2)} net</span>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <span className="text-xs text-muted-foreground font-medium">${gross.toFixed(2)} gross</span>
                                        </div>
                                    </div>
                                </div>
                            </MobileCard>
                        </SwipeableCard>
                    )
                })}
            </div>
        </MobileCard>
    )
}
