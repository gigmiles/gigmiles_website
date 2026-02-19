export interface PlatformEarning {
    id?: string;
    entry_id?: string;
    platform_name: string;
    amount: number;
    tips: number;
    miles: number;
    hours: number;
}

export interface Expense {
    id: string;
    entry_id?: string;
    category: string;
    amount: number;
    description?: string;
    date?: string;
}

export interface DailyEntry {
    id: string;
    date: string;
    notes?: string;
    platform_earnings: PlatformEarning[];
    expenses: Expense[];
}

export interface Vehicle {
    id: string;
    user_id: string;
    make: string;
    model: string;
    year: number;
    mpg: number;
    is_primary: boolean;
    depreciation_rate: number;
    ownership_type: string;
    monthly_insurance: number;
    monthly_payment: number;
    payment_cycle: string;
    fuel_type: string;
    electricity_cost_per_kwh: number;
}

export interface DailyData {
    date: string;
    earnings: number;
    expenses: number;
    netProfit: number;
    miles: number;
    depreciationCost: number;
}
