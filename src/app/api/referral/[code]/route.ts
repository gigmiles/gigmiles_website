import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referral/[code] — validate a referral code
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params
    if (!code || code.length !== 8) {
        return NextResponse.json({ valid: false }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, member_number')
        .eq('referral_code', code.toUpperCase())
        .single()

    if (error || !data) {
        return NextResponse.json({ valid: false }, { status: 404 })
    }

    const firstName = data.full_name?.split(' ')[0] ?? 'A Gigmiles member'
    return NextResponse.json({
        valid: true,
        referrerName: firstName,
        memberNumber: data.member_number,
    })
}
