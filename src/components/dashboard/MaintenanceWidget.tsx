'use client'

import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface MaintenanceWidgetProps {
    milesToNextService?: number
    insuranceDueDays?: number
    vehicleName?: string
}

export const MaintenanceWidget = memo(function MaintenanceWidget({
    milesToNextService = 450,
    insuranceDueDays = 4,
    vehicleName = "Toyota Prius"
}: MaintenanceWidgetProps) {
    // Calculate health percentage for visual feedback
    const healthPercent = Math.max(0, Math.min(100, (milesToNextService / 5000) * 100))

    return (
        <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden group relative">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Wrench className="size-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Smart Maintenance</h3>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">{vehicleName}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Miles to Service */}
                    <div className="relative">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Next Oil Change</span>
                            <span className={cn(
                                "text-sm font-black tracking-tight",
                                milesToNextService < 500 ? "text-amber-500" : "text-emerald-400"
                            )}>
                                {milesToNextService} mi left
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${healthPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full transition-colors duration-500",
                                    milesToNextService < 500 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                            />
                        </div>
                    </div>

                    {/* Insurance Alert */}
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        insuranceDueDays <= 7
                            ? "bg-rose-500/5 border-rose-500/20 text-rose-500"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                    )}>
                        {insuranceDueDays <= 7 ? <AlertTriangle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
                        <div className="flex-1">
                            <p className="text-xs font-bold">Insurance Payment</p>
                            <p className="text-[10px] font-medium opacity-80">Due in {insuranceDueDays} days</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})
