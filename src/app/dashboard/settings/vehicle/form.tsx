'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Car, Save, Loader2, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DepreciationCalculator } from '@/components/settings/DepreciationCalculator'
import { saveVehicleAction, deleteVehicleAction } from '@/app/dashboard/settings/vehicle/actions'
import { getEstimatedMPG, getVehicleModels } from '@/utils/api/external'
import { getDepreciationRate } from '@/utils/vehicle-data'
import { CAR_MAKES } from '@/utils/constants'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    mpg: number;
    depreciation_rate: number;
    is_primary: boolean;
    ownership_type?: string;
    monthly_payment?: number;
    monthly_insurance?: number;
    payment_cycle?: string;
    fuel_type?: string;
    electricity_cost_per_kwh?: number;
}

interface VehicleSettingsFormProps {
    initialVehicles: Vehicle[]
}

export function VehicleSettingsForm({ initialVehicles }: VehicleSettingsFormProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [year, setYear] = useState('')
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [models, setModels] = useState<string[]>([])
    const [mpg, setMpg] = useState('')
    const [depreciationRate, setDepreciationRate] = useState(0.20)
    const [ownershipType, setOwnershipType] = useState('owned')
    const [monthlyPayment, setMonthlyPayment] = useState('')
    const [monthlyInsurance, setMonthlyInsurance] = useState('')
    const [paymentCycle, setPaymentCycle] = useState('monthly')
    const [fuelType, setFuelType] = useState('gasoline')
    const [electricityCost, setElectricityCost] = useState('0.15')

    const [fetchingModels, setFetchingModels] = useState(false)
    const [fetchingMPG, setFetchingMPG] = useState(false)

    // Reset form when opening sheet for Add or Edit
    useEffect(() => {
        if (isSheetOpen) {
            if (editingVehicle) {
                setYear(editingVehicle.year.toString())
                setMake(editingVehicle.make)
                setModel(editingVehicle.model)
                setMpg(editingVehicle.mpg.toString())
                setDepreciationRate(editingVehicle.depreciation_rate)
                setOwnershipType(editingVehicle.ownership_type || 'owned')
                setMonthlyPayment(editingVehicle.monthly_payment?.toString() || '')
                setMonthlyInsurance(editingVehicle.monthly_insurance?.toString() || '')
                setPaymentCycle(editingVehicle.payment_cycle || 'monthly')
                setFuelType(editingVehicle.fuel_type || 'gasoline')
                setElectricityCost(editingVehicle.electricity_cost_per_kwh?.toString() || '0.15')
            } else {
                setYear('')
                setMake('')
                setModel('')
                setMpg('')
                setDepreciationRate(0.20)
                setOwnershipType('owned')
                setMonthlyPayment('')
                setMonthlyInsurance('')
                setPaymentCycle('monthly')
                setFuelType('gasoline')
                setElectricityCost('0.15')
            }
        }
    }, [isSheetOpen, editingVehicle])

    // Load available models when year/make change
    useEffect(() => {
        async function loadModels() {
            if (!year || !make) return
            setFetchingModels(true)
            try {
                const modelsList = await getVehicleModels(year, make)
                setModels(modelsList)
            } catch (error) {
                console.error("Failed to load models:", error)
            } finally {
                setFetchingModels(false)
            }
        }
        loadModels()
    }, [year, make])

    // Update MPG and Depreciation when model changes
    useEffect(() => {
        async function syncVehicleData() {
            if (!year || !make || !model) return

            const newRate = getDepreciationRate(make, model)
            setDepreciationRate(newRate)

            setFetchingMPG(true)
            try {
                const estimatedMPG = await getEstimatedMPG(year, make, model)
                if (estimatedMPG) setMpg(estimatedMPG.toString())
            } catch (error) {
                console.error("Failed to fetch MPG:", error)
            } finally {
                setFetchingMPG(false)
            }
        }

        const isInitialLoad = editingVehicle &&
            year === editingVehicle.year.toString() &&
            make === editingVehicle.make &&
            model === editingVehicle.model

        if (!isInitialLoad && isSheetOpen) {
            syncVehicleData()
        }
    }, [model])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData()
        formData.set('year', year)
        formData.set('make', make)
        formData.set('model', model)

        // Handle locale-specific decimals (comma to dot)
        const safeMpg = mpg.toString().replace(',', '.')
        const safeDepreciation = depreciationRate.toString().replace(',', '.')
        const safePayment = monthlyPayment.toString().replace(',', '.')
        const safeInsurance = monthlyInsurance.toString().replace(',', '.')

        formData.set('mpg', safeMpg)
        formData.set('depreciation_rate', safeDepreciation)
        formData.set('ownership_type', ownershipType)
        formData.set('monthly_payment', safePayment)
        formData.set('monthly_insurance', safeInsurance)
        formData.set('payment_cycle', paymentCycle)

        // Auto-detect electric vehicles
        const evBrands = ['Tesla', 'Rivian', 'Lucid', 'Polestar']
        const detectedFuelType = evBrands.includes(make) ? 'electric' : fuelType
        formData.set('fuel_type', detectedFuelType)
        formData.set('electricity_cost_per_kwh', electricityCost.replace(',', '.'))

        try {
            const result = await saveVehicleAction(formData, editingVehicle?.id)
            if (result.success) {
                toast.success(editingVehicle ? 'Vehicle updated!' : 'Vehicle added!')
                setIsSheetOpen(false)
                // Window reload is a simple way to refresh server data, 
                // but revalidatePath should handle it if this was a purely server component setup.
                // However, since we are in a client component, we rely on the server action revalidating tags/paths.
            }
        } catch (error) {
            toast.error('Failed to save vehicle')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this vehicle?')) return
        try {
            const result = await deleteVehicleAction(id)
            if (result.success) {
                toast.success('Vehicle removed')
            } else {
                toast.error(result.error || 'Failed to delete')
            }
        } catch (error) {
            toast.error('Error deleting vehicle')
        }
    }

    const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {vehicles.map((v) => (
                    <div
                        key={v.id}
                        className={`glass-card p-5 border-white/5 flex items-center justify-between group transition-all hover:scale-[1.01] ${v.is_primary ? 'ring-2 ring-emerald-500/20' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${v.is_primary ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400'}`}>
                                <Car className="size-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{v.year} {v.make} {v.model}</h3>
                                    {v.is_primary && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="size-3" /> Active
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-xs text-slate-500 font-medium">{v.mpg} MPG</span>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-500 font-medium capitalize">{v.ownership_type || 'Owned'}</span>
                                    <span className="text-xs text-slate-400">•</span>
                                    {v.ownership_type === 'owned' || !v.ownership_type ? (
                                        <span className="text-xs text-slate-500 font-medium">${v.depreciation_rate}/mile wear</span>
                                    ) : (
                                        <span className="text-xs text-emerald-500 font-bold italic">No depreciation</span>
                                    )}
                                    {(Number(v.monthly_payment) > 0 || Number(v.monthly_insurance) > 0) && (
                                        <>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500 font-medium">${(Number(v.monthly_payment || 0) + Number(v.monthly_insurance || 0)).toLocaleString()}/mo fixed</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-xl hover:bg-white/10"
                                onClick={() => {
                                    setEditingVehicle(v)
                                    setIsSheetOpen(true)
                                }}
                            >
                                <Edit2 className="size-4 text-emerald-500" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-xl hover:bg-ruby-500/10"
                                onClick={() => handleDelete(v.id)}
                            >
                                <Trash2 className="size-4 text-ruby-500" />
                            </Button>
                        </div>
                    </div>
                ))}

                <Button
                    variant="outline"
                    className="h-20 border-dashed border-2 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                    onClick={() => {
                        setEditingVehicle(null)
                        setIsSheetOpen(true)
                    }}
                >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                        <Plus className="size-5" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 italic">Add Another Vehicle</span>
                </Button>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md bg-slate-950/95 border-l border-white/10 backdrop-blur-3xl p-0 overflow-y-auto">
                    <SheetHeader className="p-8 border-b border-white/5 bg-white/5">
                        <SheetTitle className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                                <Car className="size-6 text-white" />
                            </div>
                            {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSave} className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Model Year</label>
                                    <Select value={year} onValueChange={setYear}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Brand</label>
                                    <Select value={make} onValueChange={setMake}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue placeholder="Brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CAR_MAKES.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Model</label>
                                <Select value={model} onValueChange={setModel} disabled={fetchingModels || !make}>
                                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                        <SelectValue placeholder={fetchingModels ? "Loading..." : "Select Model"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className={`pt-4 border-t border-white/5 transition-opacity duration-300 ${ownershipType !== 'owned' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-slate-400 block">Depreciation & Wear ($/mile)</label>
                                    {ownershipType !== 'owned' && (
                                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Not Applicable for Rentals</span>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <Input
                                        type="number"
                                        step="0.001"
                                        value={depreciationRate}
                                        onChange={(e) => setDepreciationRate(Number(e.target.value))}
                                        className="h-12 bg-white/5 border-white/10 rounded-xl"
                                    />
                                    <DepreciationCalculator
                                        make={make}
                                        model={model}
                                        year={year}
                                        onRateChange={setDepreciationRate}
                                    />
                                </div>
                            </div>

                            {/* Fuel Type & Electricity Cost */}
                            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Fuel Type</label>
                                    <Select value={fuelType} onValueChange={setFuelType}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gasoline">⛽ Gasoline</SelectItem>
                                            <SelectItem value="electric">⚡ Electric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {fuelType === 'electric' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Electricity Cost ($/kWh)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.15"
                                            value={electricityCost}
                                            onChange={(e) => setElectricityCost(e.target.value)}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl"
                                        />
                                        <p className="text-[10px] text-slate-500 italic">Average US rate: $0.15/kWh. Check your utility bill for exact rate.</p>
                                    </div>
                                )}
                            </div>

                            {/* Ownership & Payments */}
                            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Ownership Type</label>
                                    <Select value={ownershipType} onValueChange={setOwnershipType}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="owned">I Own It (Standard)</SelectItem>
                                            <SelectItem value="leased">Leased (Amortized Payment)</SelectItem>
                                            <SelectItem value="rented">Rented (Weekly/Monthly Rental)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                                {paymentCycle.charAt(0).toUpperCase() + paymentCycle.slice(1)} Payment
                                            </label>
                                            <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                                                {['daily', 'weekly', 'monthly'].map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setPaymentCycle(c)}
                                                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md transition-all ${paymentCycle === c ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        {c.charAt(0).toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={monthlyPayment}
                                            onChange={(e) => setMonthlyPayment(e.target.value)}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Monthly Insurance</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={monthlyInsurance}
                                            onChange={(e) => setMonthlyInsurance(e.target.value)}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={`pt-4 border-t border-white/5 transition-opacity duration-300 ${ownershipType !== 'owned' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-slate-400 block">Depreciation & Wear ($/mile)</label>
                                    {ownershipType !== 'owned' && (
                                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Not Applicable for Rentals</span>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <Input
                                        type="number"
                                        step="0.001"
                                        value={depreciationRate}
                                        onChange={(e) => setDepreciationRate(Number(e.target.value))}
                                        className="h-12 bg-white/5 border-white/10 rounded-xl"
                                    />
                                    <DepreciationCalculator onRateChange={setDepreciationRate} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={isLoading || !model}
                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                            >
                                {isLoading ? <Loader2 className="size-5 animate-spin mr-2" /> : <Save className="size-5 mr-2" />}
                                {editingVehicle ? 'Update Vehicle' : 'Save New Vehicle'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}

