'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { submitSupportTicket } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ContactForm() {
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !message) return toast.error("Please fill in all fields")

        startTransition(async () => {
            const result = await submitSupportTicket(subject, message)
            if (result.success) {
                setSuccess(true)
                toast.success("Message sent successfully!")
                setSubject('')
                setMessage('')
            } else {
                toast.error("Failed to send message")
            }
        })
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-fade-in-up">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="size-8" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Message Sent!</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">We'll get back to you shortly.</p>
                </div>
                <Button variant="outline" onClick={() => setSuccess(false)} className="mt-4 border-white/10 hover:bg-white/5 rounded-xl font-bold">
                    Send Another
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Bug Report or Question"
                    className="h-11 bg-slate-900/50 border-white/10 text-white rounded-xl focus:ring-1 focus:ring-indigo-500/50"
                />
            </div>
            <div className="space-y-2 flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="min-h-[140px] resize-none p-3 text-sm bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                />
            </div>
            <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white font-bold rounded-xl active:scale-95 transition-all"
            >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : (
                    <>
                        <Send className="mr-2 size-4" /> Send Message
                    </>
                )}
            </Button>
        </form>
    )
}
