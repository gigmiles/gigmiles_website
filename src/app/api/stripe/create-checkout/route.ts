import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Stripe Price IDs — fill these after creating products in Stripe Dashboard
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',   // $7.99/mo
  annual: process.env.STRIPE_PRICE_ANNUAL ?? '',     // $59.99/yr
} as const

export type PlanType = keyof typeof PRICE_IDS

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: PlanType }

  if (!PRICE_IDS[plan]) {
    return NextResponse.json(
      { error: 'Stripe not configured yet. Coming soon!' },
      { status: 503 }
    )
  }

  // TODO: Uncomment when stripe package is installed
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
  // const session = await stripe.checkout.sessions.create({
  //   customer_email: user.email,
  //   line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
  //   mode: 'subscription',
  //   trial_period_days: 14,
  //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscribed=1`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  //   metadata: { userId: user.id },
  // })
  // return NextResponse.json({ url: session.url })

  return NextResponse.json(
    { error: 'Stripe not configured yet. Coming soon!' },
    { status: 503 }
  )
}
