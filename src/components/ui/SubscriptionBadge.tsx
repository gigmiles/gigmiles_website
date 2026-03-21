import { Star, Zap, Crown } from 'lucide-react'
import type { SubscriptionInfo } from '@/utils/subscription'

interface Props {
  info: SubscriptionInfo
  className?: string
}

export function SubscriptionBadge({ info, className = '' }: Props) {
  if (info.isFoundingMember) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] ${className}`}>
        <Star className="size-3 fill-amber-500" />
        Founding Member #{info.memberNumber?.toString().padStart(4, '0')}
        {info.daysRemaining !== null && (
          <span className="text-amber-500/60">· {info.daysRemaining}d left</span>
        )}
      </div>
    )
  }

  if (info.isTrial) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] ${className}`}>
        <Zap className="size-3" />
        Free Trial
        {info.daysRemaining !== null && (
          <span className="text-blue-400/60">· {info.daysRemaining}d left</span>
        )}
      </div>
    )
  }

  if (info.isActive) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-black uppercase tracking-[0.2em] ${className}`}>
        <Crown className="size-3" />
        {info.tier === 'annual' ? 'Annual' : 'Monthly'} Plan
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#A1A1AA] text-[10px] font-black uppercase tracking-[0.2em] ${className}`}>
      Free Plan
    </div>
  )
}
