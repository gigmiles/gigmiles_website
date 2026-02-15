'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface DailyData {
    date: string
    earnings: number
    expenses: number
    netProfit: number
    miles: number
    depreciationCost: number
}

interface PlatformData {
    name: string
    value: number
}

interface ChartsProps {
    dailyData: DailyData[]
    platformData: PlatformData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function Charts({ dailyData, platformData }: ChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Earnings & Net Profit Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Weekly Profit Analysis</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dailyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        stackOffset="sign"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="netProfit" fill="#10b981" name="Real Net Profit" stackId="a" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses (Fuel/Other)" stackId="a" />
                        <Bar dataKey="depreciationCost" fill="#f59e0b" name="Depreciation (Wear)" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Platform Breakdown Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Platform Breakdown</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {platformData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
