import { DollarSign, TrendingUp, Car, FileText } from 'lucide-react'

const features = [
    {
        name: 'Real Net Profit',
        description: 'Know exactly what you take home after gas, taxes, and wear & tear.',
        icon: DollarSign,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    },
    {
        name: 'Automated Depreciation',
        description: 'Smart algorithms calculate your car\'s true cost per mile automatically.',
        icon: Car,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    {
        name: 'Tax Ready Reports',
        description: 'One-click export for tax season. Save thousands in potential deductions.',
        icon: FileText,
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    },
    {
        name: 'Multi-Platform',
        description: 'Aggregate earnings from Uber, Lyft, DoorDash and more in one place.',
        icon: TrendingUp,
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
]

export function Features() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Everything you need to <br className="hidden sm:block" /> run your gig business.
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Stop using spreadsheets. Gig Tracker automates the boring stuff so you can focus on driving.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <div key={feature.name} className="relative group bg-white dark:bg-slate-900 p-8 rounded-2xl border border-border/50 hover:border-emerald-500/50 transition-colors shadow-sm hover:shadow-lg">
                            <div className={`size-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                                <feature.icon className="size-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                {feature.name}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
