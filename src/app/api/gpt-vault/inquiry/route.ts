import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, email, message, packageId } = body

    if (!type || !email) {
      return NextResponse.json({ error: 'type und email sind erforderlich' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('gpt_vault_inquiries')
      .insert({
        inquiry_type: type,
        name:         name?.trim()    || null,
        email:        email.trim().toLowerCase(),
        message:      message?.trim() || null,
        package_id:   packageId       || null,
        status:       'new',
        // Browser-Infos für späteres Follow-up
        user_agent:   req.headers.get('user-agent') || null,
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[inquiry]', err)
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
  }
}
