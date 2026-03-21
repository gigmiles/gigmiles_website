'use client'

import { useState } from 'react'
import { Users, Copy, Check } from 'lucide-react'

interface ReferralCardProps {
    referralCode: string
    bonusDays: number
    referralCount: number
}

export function ReferralCard({ referralCode, bonusDays, referralCount }: ReferralCardProps) {
    const [copied, setCopied] = useState(false)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigmiles.app'
    const referralLink = `${siteUrl}/login?signup=true&ref=${referralCode}`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-3xl rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                    <Users className="size-5 text-[#10B981]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Invite Friends. Both Win.</h3>
                    <p className="text-slate-500 text-xs font-medium">+30 days free for you and every friend who joins</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <p className="text-[#10B981] font-black text-2xl">{referralCount}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-0.5">Friends Joined</p>
                </div>
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <p className="text-[#10B981] font-black text-2xl">{bonusDays}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-0.5">Bonus Days Earned</p>
                </div>
            </div>

            {/* Referral link + copy */}
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 overflow-hidden">
                    <p className="text-slate-400 text-xs font-mono truncate">{referralLink}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="shrink-0 size-11 rounded-xl bg-[#10B981] flex items-center justify-center hover:bg-[#0d9e72] active:scale-95 transition-all"
                >
                    {copied
                        ? <Check className="size-4 text-black" />
                        : <Copy className="size-4 text-black" />
                    }
                </button>
            </div>
        </div>
    )
}
