'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Edit, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface RecentEntriesProps {
    entries: any[]
}

export function RecentEntries({ entries }: RecentEntriesProps) {
    if (!entries || entries.length === 0) return null

    return (
        <div className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
                    <p className="text-xs text-slate-500 font-medium">History of your tracked shifts</p>
                </div>
            </div>

            <div className="space-y-3">
                {entries.map((entry) => {
                    const earnings = entry.platform_earnings.reduce((acc: number, curr: any) => acc + (curr.amount || 0) + (curr.tips || 0), 0)
                    const expenses = entry.expenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)
                    const net = earnings - expenses

                    return (
                        <div key={entry.id} className="relative group/row overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover/row:scale-105 transition-transform">
                                    <Calendar className="size-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">${net.toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Net</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${earnings.toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Gross</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/entry/${entry.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all active:scale-90">
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
