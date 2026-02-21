import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Send, Globe, Github, Twitter, ArrowRight } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 py-16 border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <Link href="/" className="transition-transform active:scale-95">
                            <Logo />
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            The ultimate financial dashboard for the future of work. Built for drivers, shoppers, and couriers.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy-dark dark:text-white mb-6 uppercase text-xs tracking-[0.2em]">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Tax Tracking</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Mileage Log</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Profit Analysis</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Referral Program</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy-dark dark:text-white mb-6 uppercase text-xs tracking-[0.2em]">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-navy-dark dark:text-white mb-2 uppercase text-xs tracking-[0.2em]">Stay Updated</h4>
                        <div className="flex gap-2">
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm px-4 py-2.5 focus:ring-1 focus:ring-neon-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="Email address"
                                type="email"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe to newsletter"
                                className="bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-lg shadow-electric-blue/20"
                            >
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-xs font-medium italic">© 2026 GigMiles Technologies Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-slate-400 hover:text-navy-dark dark:hover:text-white transition-colors">
                            <Globe className="size-5" />
                        </Link>
                        <Link href="#" className="text-slate-400 hover:text-navy-dark dark:hover:text-white transition-colors">
                            <Github className="size-5" />
                        </Link>
                        <Link href="#" className="text-slate-400 hover:text-navy-dark dark:hover:text-white transition-colors">
                            <Twitter className="size-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
