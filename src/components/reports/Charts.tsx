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

interface ChartsProps {
    dailyData: any[]
    platformData: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function Charts({ dailyData, platformData }: ChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Earnings Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Weekly Earnings</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dailyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis prefix="$" />
                        <Tooltip
                            formatter={(value) => [`$${value}`, 'Earnings']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} name="Earnings" />
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
