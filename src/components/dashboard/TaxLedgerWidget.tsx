'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Info, Zap } from 'lucide-react'
import { GlassTooltip } from '@/components/ui/GlassTooltip'
import { MagneticCTA } from '@/components/ui/MagneticCTA'
import { GmIcon } from '@/components/ui/GmIcon'
import { useRouter } from 'next/navigation'

import { STATE_TAX_RATES, FEDERAL_SE_TAX_RATE } from '@/utils/calculations'

interface TaxLedgerWidgetProps {
    grossIncome?: number
    totalRealCosts?: number
    estimatedTax?: number
    stateCode?: string
}

export const TaxLedgerWidget = memo(function TaxLedgerWidget({
    grossIncome = 0,
    totalRealCosts = 0,
    estimatedTax = 0,
    stateCode = 'DEFAULT'
}: TaxLedgerWidgetProps) {
    const router = useRouter()
    // 1. Determine Personalized Tax Rate (Federal SE 15.3% + State Income Tax)
    const stateRate = STATE_TAX_RATES[stateCode] ?? STATE_TAX_RATES['DEFAULT'];
    const personalizedTaxRate = FEDERAL_SE_TAX_RATE + stateRate;

    // 2. Potential Maximum Tax (If you had 0 deductions, this is what you'd owe)
    const potentialMaxTax = grossIncome * personalizedTaxRate; 
    
    // Total deductions = all real costs tracked
    const deductions = totalRealCosts;
    
    // 3. How much tax was "prevented" by tracking deductions? 
    // Every $1 of deduction saves personalizedTaxRate in taxes.
    const taxSaved = Math.min(deductions * personalizedTaxRate, potentialMaxTax);
    
    // 4. Shield percentage is how much of your potential max tax you've shielded
    let shieldPercentage = potentialMaxTax > 0 
        ? Math.min((taxSaved / potentialMaxTax) * 100, 100) 
        : 0;

    // Dynamic UI states
    let shieldColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    let progressColor = "bg-amber-500";
    let Icon = ShieldAlert;
    let message = "Log more miles to build your shield!";

    if (shieldPercentage >= 80) {
        shieldColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        progressColor = "bg-emerald-500";
        Icon = ShieldCheck;
        message = "Maximum shield! You're paying zero tax.";
    } else if (shieldPercentage >= 40) {
        shieldColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        progressColor = "bg-indigo-500";
        Icon = Shield;
        message = "Good shield! Keep logging expenses.";
    }

    if (grossIncome === 0) {
        message = "Start driving to activate shield.";
        shieldPercentage = 0;
        shieldColor = "text-slate-500 bg-white/5 border-white/5";
        progressColor = "bg-slate-600";
        Icon = Shield;
    }

    return (
        <Card className="glass-card overflow-hidden group relative flex flex-col h-full">
            {/* Background Ambient Glow */}
            <div className={`absolute -bottom-12 -left-12 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-all duration-700 opacity-50 ${progressColor.replace('bg-', 'bg-')}`} />

            <CardContent className="p-6 flex flex-col h-full justify-between relative z-10">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={shieldPercentage >= 80 ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <GmIcon
                                    icon={Icon}
                                    accent={
                                        shieldPercentage >= 80 ? '#10b981'
                                        : shieldPercentage >= 40 ? '#6366f1'
                                        : grossIncome === 0 ? '#475569'
                                        : '#f59e0b'
                                    }
                                    size="md"
                                    glow={shieldPercentage >= 40}
                                />
                            </motion.div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">The Tax Shield</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Protection Active</p>
                            </div>
                        </div>
                        <GlassTooltip content="Calculates your theoretical maximum tax liability based on combined Federal and State rates." side="left" />
                    </div>

                    <div className="text-center py-4">
                        <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-end justify-center gap-1">
                            {shieldPercentage.toFixed(0)}<span className="text-2xl text-slate-500 mb-1">%</span>
                        </span>
                        <p className="text-[11px] font-medium text-slate-400 mt-2 h-4">{message}</p>
                    </div>
                </div>

                <div className="space-y-4 mt-auto">
                    {/* Segmented Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">Exposed</span>
                            <span className="text-slate-300">Shielded</span>
                        </div>
                        <div className="flex gap-1 h-3 w-full opacity-90">
                            {[...Array(10)].map((_, i) => {
                                const fillPercentage = Math.max(0, Math.min(1, (shieldPercentage - (i * 10)) / 10));
                                return (
                                    <div key={i} className="flex-1 rounded-sm bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                                        <div 
                                            className={`absolute inset-0 h-full ${progressColor} transition-all duration-700`}
                                            style={{ width: `${fillPercentage * 100}%` }}
                                        />
                                        {/* Shimmer for fully filled blocks */}
                                        {fillPercentage === 1 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
                            <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Tax Saved</p>
                            <span className="text-sm font-black text-emerald-400">${taxSaved.toFixed(0)}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col justify-center">
                            <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1 flex items-center gap-1">
                                Est. Owed <Info className="size-2.5" />
                            </p>
                            <span className="text-sm font-black text-red-400">${Math.max(0, estimatedTax).toFixed(0)}</span>
                        </div>
                    </div>

                    {/* Actionable Hook: Boost Shield */}
                    {shieldPercentage < 80 && grossIncome > 0 && (
                        <div className="pt-2">
                             <MagneticCTA onClick={() => router.push('/dashboard/entry/expense')}>
                                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 group/boost">
                                    <Zap className="size-4 group-hover/boost:animate-bounce" />
                                    Boost Shield
                                </button>
                             </MagneticCTA>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
})
