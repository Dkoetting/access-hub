import { NextResponse } from 'next/server'
import { z } from 'zod'

import { findAppById } from '@/lib/apps'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashToken, signHubSession } from '@/lib/tokens'

const bodySchema = z.object({ token: z.string().min(16).max(512) })

const DEFAULT_SESSION_TTL_SECONDS = Number(process.env.HUB_SESSION_TTL_SECONDS ?? 900)
const PERMANENT_SESSION_TTL_SECONDS = Number(process.env.HUB_PERMANENT_SESSION_TTL_SECONDS ?? 315360000)

function parsePermanentEmails(): Set<string> {
  return new Set(
    (process.env.HUB_PERMANENT_ACCESS_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),
  )
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>

  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const tokenHash = hashToken(body.token)
  const nowIso = new Date().toISOString()

  const supabase = getSupabaseAdmin()

  const { data: link, error: linkError } = await supabase
    .from('hub_access_links')
    .select('id, registration_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (linkError) {
    console.error('[access-consume] select link failed', linkError)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!link) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  if (link.used_at) {
    return NextResponse.json({ error: 'Link already used' }, { status: 410 })
  }

  if (new Date(link.expires_at).getTime() < Date.now()) {
    await supabase.from('hub_registrations').update({ status: 'expired' }).eq('id', link.registration_id)
    await supabase.from('hub_access_events').insert({
      registration_id: link.registration_id,
      event_type: 'link_expired',
      metadata: { checked_at: nowIso },
    })
    return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  }

  const { data: registration, error: regError } = await supabase
    .from('hub_registrations')
    .select('id, email, app_id, status')
    .eq('id', link.registration_id)
    .single()

  if (regError || !registration) {
    console.error('[access-consume] registration not found', regError)
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  if (registration.status !== 'active') {
    return NextResponse.json({ error: 'Registration inactive' }, { status: 403 })
  }

  const { error: markUsedError } = await supabase
    .from('hub_access_links')
    .update({ used_at: nowIso })
    .eq('id', link.id)
    .is('used_at', null)

  if (markUsedError) {
    console.error('[access-consume] mark used failed', markUsedError)
    return NextResponse.json({ error: 'Failed to consume link' }, { status: 500 })
  }

  await supabase.from('hub_access_events').insert({
    registration_id: registration.id,
    event_type: 'link_consumed',
    metadata: { consumed_at: nowIso },
  })

  const app = findAppById(registration.app_id)
  if (!app) {
    return NextResponse.json({ error: 'Unknown app target' }, { status: 500 })
  }

  const permanentEmails = parsePermanentEmails()
  const isPermanent = permanentEmails.has(registration.email.toLowerCase())
  const sessionTtl = isPermanent ? PERMANENT_SESSION_TTL_SECONDS : DEFAULT_SESSION_TTL_SECONDS

  let hubToken: string
  try {
    hubToken = signHubSession(
      {
        registrationId: registration.id,
        email: registration.email,
        appId: registration.app_id,
      },
      sessionTtl,
    )
  } catch (error) {
    console.error('[access-consume] sign session failed', error)
    return NextResponse.json({ error: 'Server configuration missing (HUB_SIGNING_SECRET)' }, { status: 500 })
  }

  const sep = app.accessUrl.includes('?') ? '&' : '?'
  const redirectUrl = `${app.accessUrl}${sep}hub_token=${encodeURIComponent(hubToken)}`

  return NextResponse.json({ ok: true, redirectUrl })
}