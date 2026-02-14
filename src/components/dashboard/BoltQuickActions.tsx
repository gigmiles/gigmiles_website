"use client"

import { Plus, Camera, Fuel, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'

export function BoltQuickActions() {
    return (
        <Card className="bg-white dark:bg-slate-900 border-none shadow-premium p-6 mb-8 rounded-[1rem]">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/entry/new">
                    <Button
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="mr-2 size-5" />
                        Add Entry
                    </Button>
                </Link>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => toast.info("Receipt Scanning", { description: "This feature is coming in the next update!" })}
                >
                    <Camera className="mr-2 size-5 text-blue-500" />
                    Scan Receipt
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => toast.info("Fuel Log", { description: "You can currently add fuel costs within a daily entry." })}
                >
                    <Fuel className="mr-2 size-5 text-amber-500" />
                    Fuel Log
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => toast.success("Shift Started", { description: "We've marked your start time. Drive safe!" })}
                >
                    <Play className="mr-2 size-5 text-emerald-500" />
                    Start Shift
                </Button>
            </div>
        </Card>
    )
}
