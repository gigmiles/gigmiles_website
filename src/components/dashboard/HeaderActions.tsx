'use client'

import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NotificationsPanel } from './NotificationsPanel'

export function HeaderActions() {
    return (
        <div className="flex items-center gap-1">
            <NotificationsPanel />
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                onClick={() => toast('Need help?', {
                    description: 'Visit our support page or contact support@gigmiles.app',
                    duration: 4000,
                })}
            >
                <HelpCircle className="size-5" />
            </Button>
        </div>
    )
}
