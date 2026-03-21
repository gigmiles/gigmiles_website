import { createClient } from '@/utils/supabase/server'

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'founding'
export type SubscriptionTier = 'free' | 'monthly' | 'annual' | 'founding'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  tier: SubscriptionTier
  isActive: boolean
  isFoundingMember: boolean
  isTrial: boolean
  expiresAt: Date | null
  trialEndsAt: Date | null
  memberNumber: number | null
  daysRemaining: number | null
}

export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier, subscription_expires_at, trial_ends_at, member_number')
    .eq('id', userId)
    .single()

  const status = (profile?.subscription_status ?? 'free') as SubscriptionStatus
  const tier = (profile?.subscription_tier ?? 'free') as SubscriptionTier
  const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const memberNumber = profile?.member_number ?? null

  const isActive = ['active', 'trialing', 'founding'].includes(status) &&
    (expiresAt === null || expiresAt > new Date())

  return {
    status,
    tier,
    isActive,
    isFoundingMember: status === 'founding',
    isTrial: status === 'trialing',
    expiresAt,
    trialEndsAt,
    memberNumber,
    daysRemaining: expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
      : null,
  }
}

export function hasAccess(info: SubscriptionInfo): boolean {
  return info.isActive
}
