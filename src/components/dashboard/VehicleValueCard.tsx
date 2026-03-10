'use client'

import { useState, memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassTooltip } from '@/components/ui/GlassTooltip'
import { Car, RefreshCw, TrendingDown, DollarSign } from 'lucide-react'
import { checkVehicleValue } from '@/app/dashboard/actions/vehicle'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VehicleValueCardProps {
    vehicles: any[]
    activeVehicleId: string | null
}

export const VehicleValueCard = memo(function VehicleValueCard({ vehicles, activeVehicleId }: VehicleValueCardProps) {
    const primaryVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || null
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>(activeVehicleId || (vehicles[0]?.id || ''))
    const vehicle = vehicles.find(v => v.id === selectedVehicleId) || primaryVehicle

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
            <Card className="glass-card h-full border-dashed border-white/10 shadow-none">
                <CardContent className="flex flex-col items-center justify-center h-full p-5 text-center">
                    <Car className="size-8 text-slate-700 mb-3" />
                    <p className="text-xs text-slate-500 font-medium">Add a vehicle to track its value.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glass-card p-4 flex flex-col flex-1 overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none z-0" />
            <div className="relative z-10 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-row items-center gap-2">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Asset Value</h2>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Market Valuation</p>
                    </div>
                    <GlassTooltip content="Displays the estimated current market value and potential equity of your selected vehicle." side="right" />
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Car className="size-3.5" />
                </div>
            </div>

            <Select
                value={selectedVehicleId}
                onValueChange={(val) => {
                    setSelectedVehicleId(val)
                    setValue(null)
                    setMileage('')
                }}
            >
                <SelectTrigger className="w-full h-9 bg-white/[0.03] border-white/5 rounded-lg text-xs font-bold text-slate-300 mb-3">
                    <SelectValue placeholder="Select Vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                    {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-xs">
                            {v.year} {v.make} {v.model} {v.is_primary ? '(Primary)' : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="space-y-3 flex-1">
                {value ? (
                    <div>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[9px] font-bold text-slate-600">$</span>
                            <span className="animate-number-pop text-3xl font-extrabold tracking-tighter text-white">
                                {value.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-slate-600 font-bold ml-1 uppercase">USD</span>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/10 w-fit">
                            <TrendingDown className="size-2.5 text-red-400" />
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
                                -${(value * 0.15).toLocaleString('en-US', { maximumFractionDigits: 0 })} / yr
                            </span>
                        </div>

                        <p className="text-[9px] text-slate-700 font-medium mt-3">
                            Updated {lastUpdated?.toLocaleTimeString()}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10 mb-2">
                            <DollarSign className="size-4 text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-300">Market Valuation</p>
                        <p className="text-[9px] text-slate-600 mt-1 px-4">
                            Enter mileage for real-time market value.
                        </p>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider ml-0.5">Mileage</label>
                        <Input
                            placeholder="e.g. 45,000"
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            className="h-9 px-3 text-xs bg-white/[0.03] border-white/5 rounded-lg focus:ring-1 focus:ring-indigo-500/50"
                        />
                    </div>
                    <Button
                        onClick={handleCheckValue}
                        disabled={loading}
                        className="h-9 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/15 px-4 text-xs font-bold active:scale-95 transition-all"
                    >
                        {loading ? <RefreshCw className="size-3.5 animate-spin" /> : "Verify"}
                    </Button>
                </div>
            </div>
            </div>
        </Card>
    )
})
