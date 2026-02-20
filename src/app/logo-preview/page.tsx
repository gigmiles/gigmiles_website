'use client'

import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function LogoPreviewPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="absolute top-8 left-8">
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="mr-2 size-4" /> Back to App
                    </Button>
                </Link>
            </div>

            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-4xl font-bold text-white tracking-tight">GigMiles Brand Identity</h1>
                <p className="text-slate-400">High-resolution preview of the new gem-styled "G" logo. Perfect for status updates or sharing with the team.</p>
            </div>

            {/* Large Preview Container */}
            <div className="relative group p-20 rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-500/10 transition-all hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[3rem] blur-3xl group-hover:bg-emerald-500/10 transition-all" />

                {/* We scale the logo component by passing a custom className or wrapping it */}
                <div className="relative z-10 scale-[3]">
                    <Logo />
                </div>
            </div>

            <div className="flex gap-4">
                <Button
                    variant="outline"
                    className="rounded-full border-slate-800 text-slate-400 hover:bg-slate-900"
                    onClick={() => window.print()}
                >
                    <Download className="mr-2 size-4" /> Export/Print
                </Button>
                <Button className="rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                    <Share2 className="mr-2 size-4" /> Copy Screenshot Link
                </Button>
            </div>

            <p className="text-xs text-slate-500 max-w-xs text-center">
                Tip: Use Cmd+Shift+4 (Mac) or Win+Shift+S (Windows) to capture a crisp screenshot of the icon.
            </p>
        </div>
    )
}
