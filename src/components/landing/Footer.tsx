import { Wallet } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 py-12 border-t border-border/50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <Wallet className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">Gig Tracker</span>
                </div>

                <div className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Gig Tracker. All rights reserved.
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
