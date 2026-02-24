'use client'

import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { format, isBefore, startOfDay } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SummaryDatePickerProps {
    date: Date | undefined
    isPending: boolean
    activeDates: string[]
    onDateChange: (newDate: Date | undefined) => void
}

export function SummaryDatePicker({
    date,
    isPending,
    activeDates,
    onDateChange
}: SummaryDatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "glass-card border-slate-300 dark:border-white/10 flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 group relative",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isPending}
                >
                    <CalendarIcon className="size-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {date ? format(date, 'MM/dd/yyyy') : format(new Date(), 'MM/dd/yyyy')}
                    </span>
                    {isPending && <RefreshCw className="size-3 animate-spin text-neon-primary" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" align="end">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onDateChange}
                    disabled={(date) => isBefore(startOfDay(new Date()), date)}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    modifiers={{
                        hasEntry: (date) => activeDates?.includes(format(date, 'yyyy-MM-dd')),
                        noEntry: (date) => !activeDates?.includes(format(date, 'yyyy-MM-dd')) && isBefore(date, startOfDay(new Date()))
                    }}
                    modifiersClassNames={{
                        hasEntry: "text-emerald-500 font-bold underline decoration-2 underline-offset-4",
                        noEntry: "text-rose-500/80"
                    }}
                />

                <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Legend</p>
                    <div className="space-y-1.5 flex flex-col">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Logged Entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">No Entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center -ml-1">
                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Today</span>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
