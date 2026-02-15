'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, HelpCircle, ArrowRight } from 'lucide-react'

interface DepreciationCalculatorProps {
    onRateChange: (rate: number) => void
}

export function DepreciationCalculator({ onRateChange }: DepreciationCalculatorProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Inputs
    const [vehicleValue, setVehicleValue] = useState(25000)
    const [salvageValue, setSalvageValue] = useState(10000)
    const [expectedMiles, setExpectedMiles] = useState(100000)

    // Result
    const calculatedRate = useMemo(() => {
        const depreciationTotal = vehicleValue - salvageValue
        return expectedMiles > 0 ? depreciationTotal / expectedMiles : 0
    }, [vehicleValue, salvageValue, expectedMiles])

    const applyRate = () => {
        onRateChange(Number(calculatedRate.toFixed(3)))
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="w-full mt-2 border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
            >
                <Calculator className="mr-2 size-4" />
                Help Me Calculate My Rate
            </Button>
        )
    }

    return (
        <Card className="mt-4 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <Calculator className="size-4" />
                    Depreciation Rate Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Current Value ($)
                            <span title="What is your car worth today?" className="cursor-help text-slate-400"><HelpCircle className="size-3" /></span>
                        </label>
                        <Input
                            type="number"
                            value={vehicleValue}
                            onChange={(e) => setVehicleValue(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border-emerald-200 h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Est. Resale Value ($)
                            <span title="What will it be worth when you sell it?" className="cursor-help text-slate-400"><HelpCircle className="size-3" /></span>
                        </label>
                        <Input
                            type="number"
                            value={salvageValue}
                            onChange={(e) => setSalvageValue(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border-emerald-200 h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Est. Miles to Drive
                            <span title="How many miles do you plan to drive before selling?" className="cursor-help text-slate-400"><HelpCircle className="size-3" /></span>
                        </label>
                        <Input
                            type="number"
                            value={expectedMiles}
                            onChange={(e) => setExpectedMiles(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border-emerald-200 h-8 text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                    <div className="text-xs text-muted-foreground">
                        <p>(${vehicleValue} - ${salvageValue}) / {expectedMiles.toLocaleString()} miles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Calculated Rate</p>
                            <p className="text-xl font-bold font-mono">${calculatedRate.toFixed(3)}<span className="text-sm font-normal text-muted-foreground">/mi</span></p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={applyRate}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Use This <ArrowRight className="ml-1 size-3" />
                        </Button>
                    </div>
                </div>

                <div className="text-center">
                    <Button
                        type="button" variant="ghost" size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-muted-foreground hover:text-slate-900"
                    >
                        Close Calculator
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
