import { getExpenseStats } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Receipt, TrendingDown, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ExpensesPage() {
    // Last 30 days
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    const stats = await getExpenseStats({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    })

    if (!stats) {
        return <div>Error loading expenses</div>
    }

    const categoryColors: Record<string, string> = {
        'Fuel': '#ef4444',
        'Food': '#f59e0b',
        'Maintenance': '#3b82f6',
        'Other': '#6b7280'
    }

    const chartData = Object.entries(stats.byCategory).map(([category, data]) => ({
        category,
        amount: data.total,
        count: data.count,
        fill: categoryColors[category] || '#6b7280'
    }))

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-slate-900 flex items-center gap-1 text-sm transition-colors w-fit">
                    <ChevronLeft className="size-4" />
                    Back to Dashboard
                </Link>
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Expense Analytics</h1>
                    <p className="text-muted-foreground">Detailed breakdown of your spending (Last 30 days)</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-premium border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="size-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">${stats.total.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="shadow-premium border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <PieChart className="size-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>

                <Card className="shadow-premium border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Receipt className="size-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.expenses?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Total entries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Donut Chart */}
            <Card className="shadow-premium border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="size-5 text-blue-600" />
                        Expense Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Chart Placeholder - We'll add recharts donut chart here */}
                        <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-sm text-muted-foreground">Donut chart will go here</p>
                        </div>

                        {/* Category List */}
                        <div className="space-y-3">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="size-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <div>
                                            <p className="text-sm font-bold">{item.category}</p>
                                            <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold">${item.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expense List */}
            <Card className="shadow-premium border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="size-5 text-amber-600" />
                        Recent Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.expenses?.slice(0, 20).map((expense, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold">${parseFloat(expense.amount).toFixed(2)}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {expense.category}
                                        </span>
                                    </div>
                                    {expense.description && (
                                        <p className="text-xs text-muted-foreground italic mt-1">"{expense.description}"</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="size-3" />
                                    {new Date(expense.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
