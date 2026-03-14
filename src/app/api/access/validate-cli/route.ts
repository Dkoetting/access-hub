import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashToken } from '@/lib/tokens'

/**
 * POST /api/access/validate-cli
 *
 * CLI-Tool-Variante von /api/access/consume.
 * Nimmt Token + app_id, validiert und markiert als benutzt.
 * Gibt JSON zurück (kein Redirect) – perfekt für Python-Scripts.
 *
 * Body:  { token: string, app_id: string }
 * 200:   { valid: true, customer_name: string, email: string }
 * 4xx:   { valid: false, error: string }
 */

const bodySchema = z.object({
  token: z.string().min(16).max(512),
  app_id: z.string().min(1).max(64),
})

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>

  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ valid: false, error: 'invalid_request' }, { status: 400 })
  }

  const tokenHash = hashToken(body.token)
  const nowIso = new Date().toISOString()
  const supabase = getSupabaseAdmin()

  // ── 1. Access-Link suchen ─────────────────────────────────────────────────
  const { data: link, error: linkError } = await supabase
    .from('hub_access_links')
    .select('id, registration_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (linkError) {
    console.error('[validate-cli] select link failed', linkError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  if (!link) {
    return NextResponse.json({ valid: false, error: 'invalid_token' }, { status: 404 })
  }

  // ── 2. Bereits benutzt? ───────────────────────────────────────────────────
  if (link.used_at) {
    return NextResponse.json({ valid: false, error: 'token_already_used' }, { status: 410 })
  }

  // ── 3. Abgelaufen? ────────────────────────────────────────────────────────
  if (new Date(link.expires_at).getTime() < Date.now()) {
    await supabase
      .from('hub_registrations')
      .update({ status: 'expired' })
      .eq('id', link.registration_id)
    await supabase.from('hub_access_events').insert({
      registration_id: link.registration_id,
      event_type: 'link_expired',
      metadata: { checked_at: nowIso },
    })
    return NextResponse.json({ valid: false, error: 'token_expired' }, { status: 410 })
  }

  // ── 4. Registrierung laden ────────────────────────────────────────────────
  const { data: registration, error: regError } = await supabase
    .from('hub_registrations')
    .select('id, email, full_name, app_id, status')
    .eq('id', link.registration_id)
    .single()

  if (regError || !registration) {
    console.error('[validate-cli] registration not found', regError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  // ── 5. Status aktiv? ──────────────────────────────────────────────────────
  if (registration.status !== 'active') {
    return NextResponse.json({ valid: false, error: 'access_revoked' }, { status: 403 })
  }

  // ── 6. Richtige App? ──────────────────────────────────────────────────────
  if (registration.app_id !== body.app_id) {
    return NextResponse.json({ valid: false, error: 'wrong_app' }, { status: 403 })
  }

  // ── 7. Token als benutzt markieren (race-condition-sicher) ────────────────
  const { error: markUsedError } = await supabase
    .from('hub_access_links')
    .update({ used_at: nowIso })
    .eq('id', link.id)
    .is('used_at', null)   // nur wenn noch nicht benutzt

  if (markUsedError) {
    console.error('[validate-cli] mark used failed', markUsedError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  // ── 8. Event loggen ───────────────────────────────────────────────────────
  await supabase.from('hub_access_events').insert({
    registration_id: registration.id,
    event_type: 'cli_access_granted',
    metadata: { app_id: body.app_id, activated_at: nowIso },
  })

  // ── 9. Erfolg ─────────────────────────────────────────────────────────────
  return NextResponse.json({
    valid: true,
    customer_name: registration.full_name ?? '',
    email: registration.email,
  })
}
