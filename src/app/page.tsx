import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { VibeLandingClient } from '@/components/landing/VibeLandingClient'
import { logToFile } from '@/utils/debug'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  logToFile(`[LandingPage] User ID: ${user?.id || "None"}`)

  if (user) {
    logToFile(`[LandingPage] User found, redirecting to /dashboard`)
    redirect('/dashboard')
  }

  return <VibeLandingClient />
}
