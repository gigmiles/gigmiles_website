'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function DashboardSearch() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (!query.trim()) return
            // For now, let's just show a toast since we don't have a search page yet
            // Or we could redirect to /dashboard/search?q=...
            console.log('Searching for:', query)
            toast.info(`Searching for: "${query}"`)
            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div className="hidden md:flex h-9 w-64 items-center gap-2 rounded-full border border-border/50 bg-slate-50 px-3 text-muted-foreground transition-all focus-within:ring-2 focus-within:ring-ring/20 focus-within:ring-offset-0 dark:bg-slate-900/50">
            <Search className="size-4" />
            <Input
                placeholder="Search everything..."
                className="h-full border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
            />
        </div>
    )
}
