import { Wallet } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 py-12 border-t border-border/50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 italic">
                    <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/10">
                        <Wallet className="size-6 text-emerald-500" />
                    </div>
                    <span className="font-display font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">GigMiles</span>
                </div>

                <div className="text-sm text-muted-foreground font-medium">
                    &copy; {new Date().getFullYear()} GigMiles. Built for top performers.
                </div>

                <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
                </div>
            </div>
        </footer>
    )
}
