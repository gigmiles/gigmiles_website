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
        <Card className="shadow-premium border-border/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {entries.map((entry) => {
                    const earnings = entry.platform_earnings.reduce((acc: number, curr: any) => acc + (curr.amount || 0) + (curr.tips || 0), 0)
                    const expenses = entry.expenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)
                    const net = earnings - expenses

                    return (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm border border-slate-100">
                                    <Calendar className="size-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                        <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">${net.toFixed(2)} Net</span>
                                        <span className="text-slate-400">${earnings.toFixed(2)} Gross</span>
                                    </p>
                                </div>
                            </div>
                            <Link href={`/dashboard/entry/${entry.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Edit className="size-4" />
                                </Button>
                            </Link>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
