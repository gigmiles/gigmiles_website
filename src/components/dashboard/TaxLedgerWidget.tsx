'use client'

import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Info, ArrowUpRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TaxLedgerWidgetProps {
    totalTaxLiability?: number
    potentialDeductions?: number
}

export const TaxLedgerWidget = memo(function TaxLedgerWidget({
    totalTaxLiability = 420.50,
    potentialDeductions = 1250.00
}: TaxLedgerWidgetProps) {
    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden group relative">
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Wallet className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Tax Ledger</h3>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Est. Liability</p>
                        </div>
                    </div>
                    <button className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                        View Details
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="text-center py-2">
                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                            ${totalTaxLiability.toFixed(2)}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Accumulated Balance</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase mb-1">Deductions</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-200">${potentialDeductions}</span>
                                <ArrowUpRight className="size-3 text-emerald-400" />
                            </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Tax Rate</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-200">15.3%</span>
                                <Info className="size-3 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})
