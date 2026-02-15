import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -ml-[50%] w-[200%] h-[50%] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="container relative mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Now Available for Early Access
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl mx-auto animate-fade-in animation-delay-100">
                    Stop Guessing. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Start Profiting.</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in animation-delay-200">
                    The automated financial copilot for gig workers. Track miles, expenses, and calculates your <span className="text-slate-900 dark:text-white font-semibold">Real Net Profit</span> automatically.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
                    <Link href="/signup">
                        <Button size="lg" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105">
                            Start for Free <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            Live Demo
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Mockup - Replaced real image with CSS mock for now */}
                <div className="mt-20 relative mx-auto max-w-5xl animate-fade-in animation-delay-500">
                    <div className="relative rounded-xl border border-border/50 bg-slate-950/5 dark:bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-950 border border-border/50 aspect-video flex items-center justify-center relative group">
                            {/* Inner dashboard illustration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col p-8 gap-6 opacity-80">
                                <div className="flex gap-4">
                                    <div className="w-64 h-full bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-sm"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="h-32 flex-1 bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-sm"></div>
                                            <div className="h-32 flex-1 bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-sm"></div>
                                            <div className="h-32 flex-1 bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-sm"></div>
                                        </div>
                                        <div className="h-64 bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 text-center">
                                <Wallet className="size-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium text-slate-500">Dashboard Preview</p>
                            </div>
                        </div>
                    </div>
                    {/* Glow effect under image */}
                    <div className="absolute -inset-10 bg-emerald-500/20 blur-3xl -z-10 rounded-full opacity-50 block" />
                </div>
            </div>
        </section>
    )
}
