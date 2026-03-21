import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// TODO: Install stripe package: npm install stripe
// TODO: Add to .env.local:
//   STRIPE_SECRET_KEY=sk_live_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

export async function POST(req: NextRequest) {
  // Stripe webhook signature verification
  const stripeSignature = req.headers.get('stripe-signature')
  if (!stripeSignature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // TODO: Uncomment when stripe package is installed
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
  // const body = await req.text()
  // let event: Stripe.Event
  // try {
  //   event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret)
  // } catch {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  // }

  // Placeholder — will handle these events:
  // - checkout.session.completed → activate subscription
  // - customer.subscription.updated → update status
  // - customer.subscription.deleted → cancel
  // - invoice.payment_failed → mark past_due

  return NextResponse.json({ received: true })
}
