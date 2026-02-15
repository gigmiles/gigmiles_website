export function HowItWorks() {
    const steps = [
        { id: 1, title: 'Connect Profile', desc: 'Set up your vehicle details and platforms.' },
        { id: 2, title: 'Log Shifts', desc: 'Enter your miles and earnings in seconds.' },
        { id: 3, title: 'Get Insights', desc: 'See your true profit and tax deductions instantly.' },
    ]

    return (
        <section className="py-24 border-t border-border/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0" />

                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 bg-background pt-4 md:pt-0 flex flex-col items-center text-center">
                            <div className="size-12 rounded-full bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-xl ring-8 ring-white dark:ring-slate-950">
                                {step.id}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                            <p className="text-muted-foreground max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
