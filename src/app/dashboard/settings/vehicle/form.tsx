'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Car, Save } from 'lucide-react'
import { DepreciationCalculator } from '@/components/settings/DepreciationCalculator'
import { updateVehicle } from '@/app/dashboard/settings/vehicle/actions'  // We'll move the server action here

interface VehicleSettingsFormProps {
    vehicle: any
}

export function VehicleSettingsForm({ vehicle }: VehicleSettingsFormProps) {
    const [depreciationRate, setDepreciationRate] = useState(vehicle?.depreciation_rate || 0.15)

    return (
        <form action={updateVehicle} className="space-y-6 bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-border/50 shadow-premium">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl mb-4">
                <div className="p-3 bg-emerald-500 text-white rounded-lg">
                    <Car className="size-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Active Vehicle</h3>
                    <p className="text-sm text-muted-foreground">{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "No vehicle set"}</p>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Input
                        name="make"
                        label="Make"
                        defaultValue={vehicle?.make || ''}
                        placeholder="Toyota"
                    />
                    <Input
                        name="model"
                        label="Model"
                        defaultValue={vehicle?.model || ''}
                        placeholder="Camry"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Input
                        name="year"
                        label="Year"
                        type="number"
                        defaultValue={vehicle?.year || ''}
                        placeholder="2020"
                    />
                    <Input
                        name="mpg"
                        label="Miles Per Gallon (MPG)"
                        type="number"
                        step="0.1"
                        defaultValue={vehicle?.mpg || ''}
                        placeholder="28.5"
                    />
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div>
                            <Input
                                name="depreciation_rate"
                                label="Depreciation Rate ($/mile)"
                                type="number"
                                step="0.001"
                                value={depreciationRate}
                                onChange={(e) => setDepreciationRate(Number(e.target.value))}
                                placeholder="0.15"
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Cost of wear & tear per mile driven.
                            </p>
                        </div>
                        <div className="pt-6 md:pt-0">
                            <DepreciationCalculator
                                onRateChange={setDepreciationRate}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 px-8 shadow-xl">
                    <Save className="mr-2 size-4" />
                    Save Vehicle Data
                </Button>
            </div>
        </form>
    )
}
