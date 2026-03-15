import { getEntryById } from '@/app/dashboard/actions'
import { EditEntryForm } from '@/components/entry/EditEntryForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export function generateStaticParams() {
    return [];
}

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { id } = await params

    const [entry, platformsResult] = await Promise.all([
        getEntryById(id),
        supabase.from('user_platforms').select('platform_name').eq('user_id', user.id).eq('is_active', true)
    ])

    if (!entry) {
        return <div className="p-8 text-center">Entry not found</div>
    }

    const availablePlatforms = platformsResult.data?.map(p => p.platform_name) || []

    return (
        <div>
            <EditEntryForm entry={entry} availablePlatforms={availablePlatforms} />
        </div>
    )
}
