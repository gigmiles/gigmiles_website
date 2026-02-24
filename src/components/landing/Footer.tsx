import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Globe, Github, Twitter, ArrowRight } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-[#080c14] py-10 border-t border-white/[0.04] transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <Link href="/" className="transition-transform active:scale-95">
                            <Logo />
                        </Link>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-xs font-medium">
                            The ultimate financial dashboard for the future of work. Built for drivers, shoppers, and couriers.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Interactive Dashboard</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Shift Tracking</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Expense & Tax Management</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Detailed History Log</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">GigBot AI Assistant</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-neon-primary transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-black text-white mb-2 uppercase text-[10px] tracking-[0.2em]">Stay Updated</h4>
                        <div className="flex gap-2">
                            <input
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm px-4 py-2.5 focus:ring-1 focus:ring-neon-primary/50 focus:border-neon-primary/30 outline-none transition-all placeholder:text-slate-600 text-white"
                                placeholder="Email address"
                                type="email"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe to newsletter"
                                className="bg-neon-primary hover:bg-neon-primary/90 text-[#0a0e17] px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(57,255,20,0.15)]"
                            >
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-700 text-xs font-medium">© 2026 GigMiles Technologies Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Globe className="size-5" />
                        </Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Github className="size-5" />
                        </Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors">
                            <Twitter className="size-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
