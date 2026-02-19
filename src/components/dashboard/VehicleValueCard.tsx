'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Car, RefreshCw, TrendingDown, DollarSign } from 'lucide-react'
import { checkVehicleValue } from '@/app/dashboard/actions/vehicle'
import { toast } from 'sonner'

interface VehicleValueCardProps {
    vehicle: {
        make: string
        model: string
        year: number
        mpg: number
    } | null
}

export function VehicleValueCard({ vehicle }: VehicleValueCardProps) {
    const [mileage, setMileage] = useState<string>('')
    const [value, setValue] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const handleCheckValue = async () => {
        if (!vehicle) return
        if (!mileage) {
            toast.error("Please enter current mileage")
            return
        }

        setLoading(true)
        try {
            const result = await checkVehicleValue(vehicle.year, vehicle.make, vehicle.model, parseInt(mileage))

            if (result.success && result.data) {
                setValue(result.data.marketAverage)
                setLastUpdated(new Date())
                toast.success("Vehicle value updated!")
            } else {
                toast.error("Could not fetch value. Try again later.")
            }
        } catch (err) {
            console.error('Value check error:', err)
            toast.error("An error occurred.")
        } finally {
            setLoading(false)
        }
    }

    if (!vehicle) {
        return (
            <Card className="h-full border-dashed border-2 shadow-none bg-slate-50/50 dark:bg-slate-900/20">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Car className="size-10 text-slate-300 mb-4" />
                    <p className="text-muted-foreground font-medium">Add a vehicle to track its value.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Asset Value</h2>
                    <p className="text-xs text-slate-500 font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Car className="size-5" />
                </div>
            </div>

            <div className="space-y-6">
                {value ? (
                    <div className="animate-fade-in-up">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">$</span>
                            <span className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-50">
                                {value.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 font-bold ml-1 uppercase">USD</span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 w-fit">
                            <TrendingDown className="size-3 text-rose-500" />
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Est. Depreciation: $1,200 / yr</span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 opacity-60">
                            Last Refreshed: {lastUpdated?.toLocaleTimeString()}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                        <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <DollarSign className="size-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tight">Market Valuation</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed px-4 opacity-80 uppercase tracking-wider">
                                Enter your current mileage to see real-time market value estimates.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-end gap-3 mt-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Mileage</label>
                        <Input
                            placeholder="e.g. 45,000"
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            className="glass-input h-11 px-4 text-sm focus:ring-1 focus:ring-indigo-500/50"
                        />
                    </div>
                    <Button
                        onClick={handleCheckValue}
                        disabled={loading}
                        className="h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 px-6 font-bold active:scale-95 transition-all"
                    >
                        {loading ? <RefreshCw className="size-4 animate-spin" /> : "Verify"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
