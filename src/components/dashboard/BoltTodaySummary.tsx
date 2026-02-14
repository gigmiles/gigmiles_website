import { DollarSign, TrendingUp, Navigation, Clock } from 'lucide-react';
import { calculateHourlyRate, calculateProfitMargin } from '@/utils/calculations';

interface TodaySummaryProps {
    gross: number;
    netProfit: number;
    expenses: number;
    miles: number;
    hours: number;
    tax: number;
    tips: number; // New field for detailed breakdown
    mpg?: number;
    gasPrice?: number;
    fuelCost?: number;
}

export function BoltTodaySummary({
    gross,
    netProfit,
    expenses,
    miles,
    hours,
    tax,
    tips,
    mpg,
    gasPrice,
    fuelCost
}: TodaySummaryProps) {
    const hourlyRate = calculateHourlyRate(netProfit, hours);
    const profitMargin = calculateProfitMargin(netProfit, gross);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-premium p-6 border-none">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Summary</h2>
                <span className="text-sm text-slate-500 font-medium">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div className="space-y-4">
                {/* Hero Card */}
                <div className="bg-emerald-600 dark:bg-emerald-900/50 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-sm opacity-90 mb-1 font-medium">Net Profit (Take-Home)</p>
                    <p className="text-4xl font-extrabold tracking-tight">${netProfit.toFixed(2)}</p>
                    {profitMargin > 0 && (
                        <p className="text-sm opacity-90 mt-2 font-medium">
                            {profitMargin.toFixed(1)}% profit margin
                        </p>
                    )}
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <DollarSign className="size-4" />
                            <span className="text-sm font-medium">Gross Income</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">${gross.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            ${(gross - tips).toFixed(2)} + ${tips.toFixed(2)} tips
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <TrendingUp className="size-4" />
                            <span className="text-sm font-medium">Total Costs</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            ${expenses.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            + ${tax.toFixed(2)} tax
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Navigation className="size-4" />
                            <span className="text-sm font-medium">Miles Driven</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{miles.toFixed(1)}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            {miles > 0 ? `$${(netProfit / miles).toFixed(2)}/mile` : '$0.00/mile'}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Expenses</span>
                            <span className="font-medium text-ruby-500">-${expenses.toFixed(2)}</span>
                        </div>
                        {(fuelCost !== undefined && mpg && gasPrice) && (
                            <div className="flex justify-between items-center text-xs pl-2 border-l-2 border-slate-100 dark:border-slate-800 my-1">
                                <span className="text-muted-foreground">⛽ Fuel ({mpg} mpg @ ${gasPrice})</span>
                                <span className="text-slate-500">-${fuelCost.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 mb-1 mt-2"> {/* Added mt-2 for spacing */}
                            <Clock className="size-4" />
                            <span className="text-sm font-medium">Hours Worked</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {hours > 0 ? hours.toFixed(1) : '—'}
                        </p>
                        {hourlyRate > 0 && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">${hourlyRate.toFixed(2)}/hour</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
