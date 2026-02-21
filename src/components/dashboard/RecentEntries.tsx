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
    stateCode: string
}

export function RecentEntries({ entries, primaryVehicle, stateCode }: RecentEntriesProps) {
    if (!entries || entries.length === 0) return null

    return (
        <div className="glass-card p-6 border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
                    <p className="text-xs text-slate-500 font-medium">History of your tracked shifts</p>
                </div>
            </div>

            <div className="space-y-3">
                {entries.map((entry) => {
                    const gross = (entry.platform_earnings).reduce((acc: number, curr) => acc + (curr.amount || 0) + (curr.tips || 0), 0)
                    const cashExpenses = (entry.expenses).reduce((acc: number, curr) => acc + (curr.amount || 0), 0)
                    const miles = (entry.platform_earnings).reduce((acc: number, curr) => acc + (curr.miles || 0), 0)

                    const financials = calculateFinancials({
                        grossEarnings: gross,
                        expenses: cashExpenses,
                        miles: miles,
                        stateCode: stateCode,
                        mpg: primaryVehicle?.mpg,
                        gasPrice: entry.gas_price || 4.50,
                        wearRate: primaryVehicle?.depreciation_rate,
                        ownershipType: primaryVehicle?.ownership_type,
                        monthlyInsurance: primaryVehicle?.monthly_insurance,
                        monthlyLease: primaryVehicle?.monthly_payment,
                        paymentCycle: primaryVehicle?.payment_cycle,
                        insuranceCycle: primaryVehicle?.insurance_cycle,
                        fuelType: primaryVehicle?.fuel_type as any,
                        electricityPrice: primaryVehicle?.electricity_cost_per_kwh,
                        platformFee: primaryVehicle?.platform_fee,
                        platformFeeCycle: primaryVehicle?.platform_fee_cycle
                    })

                    const net = financials.netProfit

                    return (
                        <div key={entry.id} className="relative group/row overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover/row:scale-105 transition-transform">
                                    <Calendar className="size-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">{format(new Date(entry.date), 'MM/dd/yyyy')}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">${net.toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Net</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">${gross.toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Gross</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/entry/${entry.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all active:scale-90">
                                    <Edit className="size-4" />
                                </Button>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
