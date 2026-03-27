import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashToken } from '@/lib/tokens'

/**
 * POST /api/access/validate-cli
 *
 * Modus A – Erstaktivierung:   { token, app_id }
 *   Token (aus E-Mail-Link) validieren → license_key generieren
 *   → in hub_licenses speichern → token als benutzt markieren
 *   Response je nach app_id:
 *     gpt-vault         → { valid: true, customer_name, email, license_key, max_gpts }
 *     gpt-vault-project → { valid: true, customer_name, email, license_key, max_projects }
 *
 * Modus B – Lizenz-Check:      { license_key, app_id }
 *   Gespeicherten license_key gegen hub_licenses prüfen
 *   Response je nach app_id:
 *     gpt-vault         → { valid: true, customer_name, max_gpts }
 *     gpt-vault-project → { valid: true, customer_name, max_projects }
 *
 * Fehler (beide Modi): { valid: false, error: string }
 */

// ── Schemas ──────────────────────────────────────────────────────────────────

const activationSchema = z.object({
  token:  z.string().min(16).max(512),
  app_id: z.string().min(1).max(64),
})

const checkSchema = z.object({
  license_key: z.string().min(16).max(128),
  app_id:      z.string().min(1).max(64),
})

// ── Helper ───────────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const hex = randomUUID().replace(/-/g, '').toUpperCase()
  return `CGPT-${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}`
}

function buildEntitlementPayload(
  appId: string,
  values: { max_gpts?: number | null; max_projects?: number | null },
) {
  if (appId === 'gpt-vault-project') {
    const maxProjects = values.max_projects ?? 0
    const plan = maxProjects === 0 ? 'Unlimited' : `${maxProjects} Projects`
    return { max_projects: maxProjects, plan }
  }

  const maxGpts = values.max_gpts ?? 0
  const plan = maxGpts === 0 ? 'Unlimited' : `${maxGpts} GPTs`
  return { max_gpts: maxGpts, plan }
}

// ── Router ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ valid: false, error: 'invalid_request' }, { status: 400 })
  }

  const hasLicenseKey = typeof (rawBody as Record<string, unknown>).license_key === 'string'
  const hasToken      = typeof (rawBody as Record<string, unknown>).token === 'string'

  if (hasLicenseKey && !hasToken) {
    return handleLicenseCheck(rawBody)
  }
  if (hasToken) {
    return handleActivation(rawBody)
  }
  return NextResponse.json({ valid: false, error: 'invalid_request' }, { status: 400 })
}

// ── Modus B: Lizenz-Check (bei jedem Start) ──────────────────────────────────

async function handleLicenseCheck(rawBody: unknown) {
  let body: z.infer<typeof checkSchema>
  try {
    body = checkSchema.parse(rawBody)
  } catch {
    return NextResponse.json({ valid: false, error: 'invalid_request' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // 1. Lizenz suchen
  const { data: license, error: licenseError } = await supabase
    .from('hub_licenses')
    .select('id, registration_id, max_gpts, max_projects, status')
    .eq('license_key', body.license_key)
    .maybeSingle()

  if (licenseError) {
    console.error('[validate-cli] select license failed', licenseError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  if (!license) {
    return NextResponse.json({ valid: false, error: 'invalid_license_key' }, { status: 404 })
  }

  if (license.status !== 'active') {
    return NextResponse.json({ valid: false, error: 'license_revoked' }, { status: 403 })
  }

  // 2. Registrierung laden
  const { data: registration, error: regError } = await supabase
    .from('hub_registrations')
    .select('id, email, full_name, app_id, status')
    .eq('id', license.registration_id)
    .single()

  if (regError || !registration) {
    console.error('[validate-cli] registration not found', regError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  if (registration.status !== 'active') {
    return NextResponse.json({ valid: false, error: 'access_revoked' }, { status: 403 })
  }

  if (registration.app_id !== body.app_id) {
    return NextResponse.json({ valid: false, error: 'wrong_app' }, { status: 403 })
  }

  // 3. Summe aller aktiven Lizenzen der Registration ermitteln
  // Projekte werden einzeln abgerechnet → mehrfache Käufe addieren sich
  const { data: allLicenses } = await supabase
    .from('hub_licenses')
    .select('max_gpts, max_projects')
    .eq('registration_id', registration.id)
    .eq('status', 'active')

  const effectiveMaxGpts     = (allLicenses ?? []).reduce((sum, l) => sum + (l.max_gpts     ?? 0), 0)
  const effectiveMaxProjects = (allLicenses ?? []).reduce((sum, l) => sum + (l.max_projects ?? 0), 0)

  // 4. Event loggen (asynchron – Fehler ignorieren)
  void supabase.from('hub_access_events').insert({
    registration_id: registration.id,
    event_type: 'cli_license_checked',
    metadata: { app_id: body.app_id, checked_at: new Date().toISOString() },
  })

  return NextResponse.json({
    valid:         true,
    customer_name: registration.full_name ?? '',
    ...buildEntitlementPayload(body.app_id, {
      max_gpts: effectiveMaxGpts,
      max_projects: effectiveMaxProjects,
    }),
  })
}

// ── Modus A: Erstaktivierung ─────────────────────────────────────────────────

async function handleActivation(rawBody: unknown) {
  let body: z.infer<typeof activationSchema>
  try {
    body = activationSchema.parse(rawBody)
  } catch {
    return NextResponse.json({ valid: false, error: 'invalid_request' }, { status: 400 })
  }

  const tokenHash = hashToken(body.token)
  const nowIso    = new Date().toISOString()
  const supabase  = getSupabaseAdmin()

  // 1. Access-Link suchen
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

  // 2. Bereits benutzt?
  if (link.used_at) {
    return NextResponse.json({ valid: false, error: 'token_already_used' }, { status: 410 })
  }

  // 3. Abgelaufen?
  if (new Date(link.expires_at).getTime() < Date.now()) {
    void supabase
      .from('hub_registrations')
      .update({ status: 'expired' })
      .eq('id', link.registration_id)
    void supabase.from('hub_access_events').insert({
      registration_id: link.registration_id,
      event_type: 'link_expired',
      metadata: { checked_at: nowIso },
    })
    return NextResponse.json({ valid: false, error: 'token_expired' }, { status: 410 })
  }

  // 4. Registrierung laden
  const { data: registration, error: regError } = await supabase
    .from('hub_registrations')
    .select('id, email, full_name, app_id, status')
    .eq('id', link.registration_id)
    .single()

  if (regError || !registration) {
    console.error('[validate-cli] registration not found', regError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  if (registration.status !== 'active') {
    return NextResponse.json({ valid: false, error: 'access_revoked' }, { status: 403 })
  }

  if (registration.app_id !== body.app_id) {
    return NextResponse.json({ valid: false, error: 'wrong_app' }, { status: 403 })
  }

  // 5. Bestehende Lizenz für diese Registration prüfen (Idempotenz)
  // .limit(1) + order by created_at desc → neueste Lizenz bei mehrfachen Käufen
  const { data: existingLicense } = await supabase
    .from('hub_licenses')
    .select('license_key, max_gpts, max_projects')
    .eq('registration_id', registration.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let licenseKey: string
  let maxGpts: number
  let maxProjects: number

  if (existingLicense) {
    // Lizenz bereits vorhanden → gleichen Key zurückgeben (z.B. Re-Aktivierung)
    licenseKey = existingLicense.license_key
    maxGpts    = existingLicense.max_gpts
    maxProjects = existingLicense.max_projects ?? 0
  } else {
    // Neue Lizenz anlegen
    licenseKey = generateLicenseKey()
    maxGpts    = 0   // Standard: unbegrenzt
    maxProjects = 0

    const { error: insertError } = await supabase
      .from('hub_licenses')
      .insert({
        registration_id: registration.id,
        license_key:     licenseKey,
        max_gpts:        maxGpts,
        max_projects:    maxProjects,
        status:          'active',
      })

    if (insertError) {
      console.error('[validate-cli] insert license failed', insertError)
      return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
    }
  }

  // 6. Token als benutzt markieren (race-condition-sicher)
  const { error: markUsedError } = await supabase
    .from('hub_access_links')
    .update({ used_at: nowIso })
    .eq('id', link.id)
    .is('used_at', null)

  if (markUsedError) {
    console.error('[validate-cli] mark used failed', markUsedError)
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }

  // 7. Event loggen
  void supabase.from('hub_access_events').insert({
    registration_id: registration.id,
    event_type: 'cli_license_activated',
    metadata: { app_id: body.app_id, activated_at: nowIso },
  })

  return NextResponse.json({
    valid:         true,
    customer_name: registration.full_name ?? '',
    email:         registration.email,
    license_key:   licenseKey,
    ...buildEntitlementPayload(body.app_id, {
      max_gpts: maxGpts,
      max_projects: maxProjects,
    }),
  })
}
