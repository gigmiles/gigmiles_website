'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logToFile } from '@/utils/debug'

export async function signIn(formData: any) {
    const { email, password } = formData
    logToFile(`[Action:SignIn] Attempting sign-in for: ${email}`)
    
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        logToFile(`[Action:SignIn] Error: ${error.message}`)
        return { error: error.message }
    }

    logToFile(`[Action:SignIn] Success! User ID: ${data.user?.id}`)
    
    // Explicitly revalidate everything to ensure the layout/page can see the new session
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signUp(formData: any) {
    const { email, password, redirectTo, referralCode } = formData
    logToFile(`[Action:SignUp] Attempting sign-up for: ${email}`)

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectTo,
            data: referralCode ? { referred_by_code: referralCode.toUpperCase() } : undefined,
        },
    })

    if (error) {
        logToFile(`[Action:SignUp] Error: ${error.message}`)
        return { error: error.message }
    }

    logToFile(`[Action:SignUp] Success! Verification email sent.`)
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signOut() {
    logToFile(`[Action:SignOut] User signing out`)
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
