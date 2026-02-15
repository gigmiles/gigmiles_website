import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const query = typeof params.q === 'string' ? params.q : ''

    if (!query) {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
            <p className="text-muted-foreground">
                Showing results for <span className="font-semibold text-foreground">"{query}"</span>
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Fallback Empty State for now */}
                <Card className="col-span-full border-dashed shadow-none bg-slate-50 dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg">No exact matches found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            We couldn't find any direct matches for "{query}" in your transactions or vehicles.
                            <br />
                            Try searching for date ranges, platform names, or amounts.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
