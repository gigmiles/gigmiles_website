import { getSupportTickets, updateTicketStatus } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { MessageSquare, Calendar, User, Mail, ShieldAlert } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function AdminMessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    const isAdmin = ADMIN_EMAIL ? user.email === ADMIN_EMAIL : false

    if (!isAdmin) {
        redirect('/dashboard')
    }

    const tickets = await getSupportTickets(user.email!)

    if (!tickets) {
        return (
            <div className="p-8 text-center text-slate-500">
                Messages could not be loaded.
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12 w-full max-w-6xl mx-auto">
            <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <MessageSquare className="size-8" />
                    </div>
                    Admin Messages
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                    Manage incoming support tickets and user suggestions.
                </p>
            </div>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500">
                        No messages received yet.
                    </div>
                ) : (
                    tickets.map((ticket: any) => (
                        <Card key={ticket.id} className="glass-card border-white/5 shadow-xl overflow-hidden hover:border-indigo-500/30 transition-all">
                            <CardHeader className="bg-slate-900/40 border-b border-white/5 flex flex-row items-center justify-between pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ticket.status === 'open' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {ticket.status.toUpperCase()}
                                        </span>
                                        <CardTitle className="text-xl font-display text-white">
                                            {ticket.subject}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {format(new Date(ticket.created_at), 'PPPp')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="size-3" />
                                            {ticket.profiles?.full_name || 'Anonymous'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Mail className="size-3" />
                                            {ticket.profiles?.email || 'No email'}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-5">
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {ticket.message}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
