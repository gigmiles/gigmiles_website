'use client'

import { useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
    getDay
} from 'date-fns'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DailyData {
    date: string
    fullDate?: string
    earnings: number
    expenses: number
    netProfit: number
    miles: number
    depreciationCost: number
}

interface ActivityCalendarProps {
    data: DailyData[]
}

export function ActivityCalendar({ data }: ActivityCalendarProps) {
    // Group data by fullDate for O(1) lookup
    const dataMap = new Map(data.map(d => [d.fullDate, d]))

    // Find the range of months to display
    // If no data, default to current month
    // Since props data is filtered by the page capability, we might just show the months present in data.
    // However, usually we want to see at least one full month structure.
    // Let's assume the user wants to see the months covered by the current filter.

    // Sort data to find start/end
    const sortedData = [...data].sort((a, b) => (a.fullDate || '').localeCompare(b.fullDate || ''))

    // If no data, use current date
    const startDate = sortedData.length > 0 && sortedData[0].fullDate
        ? parseISO(sortedData[0].fullDate)
        : new Date()

    // We will control the "Current Month" being viewed
    const [currentMonth, setCurrentMonth] = useState(startDate)
    const [selectedDay, setSelectedDay] = useState<DailyData | null>(null)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Padding days for grid alignment (Mon = 1, Sun = 0 in date-fns getDay... actually Sun=0, Mon=1)
    // We want Mon start? Or Sun start? Let's do Sun start standard.
    const startDayIndex = getDay(monthStart) // 0 = Sunday

    const handlePrevMonth = () => {
        const prev = new Date(currentMonth)
        prev.setMonth(prev.getMonth() - 1)
        setCurrentMonth(prev)
    }

    const handleNextMonth = () => {
        const next = new Date(currentMonth)
        next.setMonth(next.getMonth() + 1)
        setCurrentMonth(next)
    }

    const getColorClass = (netProfit: number) => {
        if (netProfit <= 0) return 'bg-white/5 text-slate-500 hover:bg-white/10'
        if (netProfit < 50) return 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/30'
        if (netProfit < 100) return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
        if (netProfit < 200) return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30'
        return 'bg-emerald-500 text-black font-bold border-emerald-400 hover:bg-emerald-400'
    }

    return (
        <div className="space-y-4">
            {/* Header / Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="size-5 text-emerald-500" />
                    Activity Calendar
                </h3>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors" aria-label="Previous Month">
                        <ChevronLeft className="size-4 text-slate-400" />
                    </button>
                    <span className="text-xs font-bold text-slate-300 w-24 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors" aria-label="Next Month">
                        <ChevronRight className="size-4 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="max-w-2xl mx-auto">
                <div className="glass-card p-4 border-white/5">
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {/* Empty slots for start padding */}
                        {Array.from({ length: startDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {daysInMonth.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const dayData = dataMap.get(dateStr)
                            const net = dayData?.netProfit || 0
                            const hasActivity = dayData && (dayData.earnings > 0 || dayData.miles > 0)

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => dayData && setSelectedDay(dayData)}
                                    disabled={!hasActivity && !dayData}
                                    className={`
                                        aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all
                                        ${hasActivity ? 'cursor-pointer' : 'cursor-default border-transparent'}
                                        ${hasActivity ? getColorClass(net) : 'bg-white/5 border-white/5 text-slate-600'}
                                    `}
                                >
                                    <span className="text-[11px] font-medium">{format(day, 'd')}</span>
                                    {hasActivity && (
                                        <span className="text-[8px] opacity-80 font-bold">${Math.round(net)}</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Heat Legend */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Less</span>
                        <div className="flex gap-1">
                            <div className="size-3 rounded bg-white/5 border border-white/5" />
                            <div className="size-3 rounded bg-emerald-900/20 border border-emerald-500/20" />
                            <div className="size-3 rounded bg-emerald-900/40 border border-emerald-500/30" />
                            <div className="size-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                            <div className="size-3 rounded bg-emerald-500 border border-emerald-400" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">More</span>
                    </div>
                </div>
            </div>

            {/* Details Sheet */}
            <Sheet open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
                <SheetContent className="backdrop-blur-3xl bg-slate-950/95 border-white/5">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-white">
                            Activity Details
                        </SheetTitle>
                        <SheetDescription className="text-slate-500 font-medium">
                            {selectedDay && format(parseISO(selectedDay.fullDate!), 'EEEE, MMMM d, yyyy')}
                        </SheetDescription>
                    </SheetHeader>
                    {selectedDay && (
                        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                            <div className="space-y-6">
                                <div className="space-y-1 text-center py-6 bg-white/5 rounded-2xl border border-emerald-500/20">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Profit</p>
                                    <p className="text-4xl font-extrabold text-emerald-400 text-glow-emerald">
                                        ${selectedDay.netProfit.toFixed(2)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gross Earnings</p>
                                        <p className="text-lg font-bold text-white">${selectedDay.earnings.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Expenses</p>
                                        <p className="text-lg font-bold text-rose-400">-${selectedDay.expenses.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Miles Driven</p>
                                        <p className="text-lg font-bold text-blue-400">{selectedDay.miles}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Items Processed</p>
                                        <p className="text-lg font-bold text-amber-400">—</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
