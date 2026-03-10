'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { DailyEntry, Vehicle } from '@/app/dashboard/types'
import { calculateFinancials } from '@/utils/calculations'

interface RecentEntriesProps {
    entries: DailyEntry[]
    primaryVehicle: Vehicle | null
    stateCode?: string | null
}

export function RecentEntries({ entries, primaryVehicle, stateCode = 'CA' }: RecentEntriesProps) {
    if (!entries || entries.length === 0) return null

    return (
        <div className="glass-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Recent Activity</h2>
                    <p className="text-[9px] text-slate-600 font-medium">History of tracked shifts</p>
                </div>
            </div>

            <div className="space-y-2 flex-1">
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
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/row">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                    <Calendar className="size-3" />
                                </div>
                                <div>
                                    <p className="font-bold text-xs text-white tracking-tight">{format(new Date(entry.date), 'MM/dd/yyyy')}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-emerald-400">${net.toFixed(2)} net</span>
                                        <span className="text-[9px] text-slate-600">·</span>
                                        <span className="text-[9px] text-slate-500 font-bold">${gross.toFixed(2)} gross</span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/entry/${entry.id}/edit`}>
                                <Button variant="ghost" size="icon" className="size-7 rounded-md bg-white/[0.03] hover:bg-blue-500/20 text-slate-600 hover:text-blue-400 transition-all">
                                    <Edit className="size-3" />
                                </Button>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
