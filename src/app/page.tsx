import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { VibeLandingClient } from '@/components/landing/VibeLandingClient'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <VibeLandingClient />
}
