import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashToken } from '@/lib/tokens'

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// ── GET /api/access/validate-tool-token?token=XYZ&app_id=ki-roi-rechner ───────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') ?? ''
  const appId = searchParams.get('app_id') ?? ''

  if (!token || !appId) {
    return NextResponse.json(
      { valid: false, reason: 'missing_params' },
      { headers: CORS }
    )
  }

  const supabase  = getSupabaseAdmin()
  const tokenHash = hashToken(token)

  // 1. Token-Hash in hub_access_links suchen
  const { data: link, error } = await supabase
    .from('hub_access_links')
    .select('id, used_at, expires_at, registration_id')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !link) {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { headers: CORS })
  }

  // 2. Bereits verwendet?
  if (link.used_at) {
    return NextResponse.json({ valid: false, reason: 'used' }, { headers: CORS })
  }

  // 3. Abgelaufen?
  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, reason: 'expired' }, { headers: CORS })
  }

  // 4. App-ID prüfen (Token gehört zur richtigen App)
  const { data: reg } = await supabase
    .from('hub_registrations')
    .select('app_id')
    .eq('id', link.registration_id)
    .single()

  if (!reg || reg.app_id !== appId) {
    return NextResponse.json({ valid: false, reason: 'wrong_app' }, { headers: CORS })
  }

  // 5. Token als verwendet markieren
  await supabase
    .from('hub_access_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', link.id)

  // 6. Event loggen
  void supabase.from('hub_access_events').insert({
    registration_id: link.registration_id,
    event_type: 'tool_access_granted',
    metadata:   { app_id: appId, token_hash: tokenHash },
  })

  return NextResponse.json({ valid: true, app_id: appId }, { headers: CORS })
}
