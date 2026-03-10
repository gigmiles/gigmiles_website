'use client'

import { Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function HeaderActions() {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                onClick={() => toast('Notifications coming soon!', {
                    description: 'You\'ll get alerts for tax deadlines, weekly summaries, and earning milestones.',
                    duration: 3000,
                })}
            >
                <Bell className="size-6" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                onClick={() => toast('Need help?', {
                    description: 'Visit our support page or contact support@gigmiles.app',
                    duration: 4000,
                })}
            >
                <HelpCircle className="size-6" />
            </Button>
        </div>
    )
}
