'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
        } catch (error) {
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
        <Card className="shadow-premium border-border/50 relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Car className="size-5 text-indigo-500" />
                    Asset Value
                </CardTitle>
                <CardDescription>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {value ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                                    ${value.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground font-medium">USD</span>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md w-fit">
                                <TrendingDown className="size-3" />
                                <span>Est. Depreciation: $1,200 / yr</span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4">
                                Updated: {lastUpdated?.toLocaleTimeString()}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mb-2">
                                <DollarSign className="size-6 text-indigo-500" />
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Know Your Car's Worth</p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Enter mileage to see real-time market value based on similar listings.
                            </p>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground ml-1">Current Mileage</label>
                            <Input
                                placeholder="e.g. 45000"
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <Button
                            onClick={handleCheckValue}
                            disabled={loading}
                            className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                        >
                            {loading ? <RefreshCw className="size-4 animate-spin" /> : "Check"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
