'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            setMessage('Check your email for the confirmation link.')
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Login / Sign Up</h1>
                <form className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Sign Up
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>
        </div>
    )
}
