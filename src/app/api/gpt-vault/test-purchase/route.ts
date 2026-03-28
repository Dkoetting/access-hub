import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getGptVaultDownloadUrl } from '@/lib/gpt-vault-download'
import { getGptVaultProjectDownloadUrl } from '@/lib/gpt-vault-project-download'
import { generatePlainToken, hashToken } from '@/lib/tokens'
import packagesRaw from '@/config/packages.json'

/**
 * POST /api/gpt-vault/test-purchase
 *
 * ⚠ NUR FÜR TESTS – kein Stripe, keine Zahlung.
 * Simuliert den kompletten Kauf-Flow:
 *   → Registration + Lizenz in Supabase anlegen
 *   → Aktivierungs-Token per Mail senden (oder in Response zurückgeben)
 *
 * Gesichert durch TEST_PURCHASE_SECRET (env var).
 * In Produktion: TEST_PURCHASE_SECRET leer lassen → Endpoint deaktiviert.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type Package = {
  id: string
  name: string
  gpts: number | null
  priceCents: number | null
  contactOnly?: boolean
}

const packages = packagesRaw as Package[]

// ── Schema ────────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  secret:    z.string().min(1),
  packageId: z.string().min(1).max(32),
  projectCount: z.number().int().min(1).max(500).optional(),
  email:     z.string().email().max(320),
  name:      z.string().max(120).optional(),
})

// ── Helper ────────────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const hex = randomUUID().replace(/-/g, '').toUpperCase()
  return `GV-${hex.slice(0, 6)}-${hex.slice(6, 12)}-${hex.slice(12, 18)}`
}

const TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS ?? 72)

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // 0. Test-Secret prüfen – verhindert versehentliche Nutzung in Produktion
  const testSecret = process.env.TEST_PURCHASE_SECRET ?? ''
  if (!testSecret) {
    return NextResponse.json(
      { error: 'test_endpoint_disabled', hint: 'TEST_PURCHASE_SECRET ist nicht gesetzt.' },
      { status: 403 },
    )
  }

  // 1. Body parsen
  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // 2. Secret prüfen
  if (body.secret !== testSecret) {
    return NextResponse.json({ error: 'wrong_secret' }, { status: 401 })
  }

  // 3. Produkt bestimmen
  const PRICE_PER_PROJECT_CENTS = 120
  let appId = 'gpt-vault'
  let appName = 'GPT Vault'
  let purchaseLabel = ''
  let maxGpts = 0
  let maxProjects = 0
  let priceCents = 0

  if (body.packageId === 'projects') {
    const count = body.projectCount ?? 1
    appId = 'gpt-vault-project'
    appName = 'GPT Vault Projects'
    purchaseLabel = `${count} Project${count === 1 ? '' : 's'}`
    maxProjects = count
    priceCents = count * PRICE_PER_PROJECT_CENTS
  } else {
    const pkg = packages.find((p) => p.id === body.packageId)
    if (!pkg || pkg.contactOnly || pkg.gpts === null) {
      return NextResponse.json(
        { error: 'unknown_package', available: [...packages.filter((p) => !p.contactOnly).map((p) => p.id), 'projects'] },
        { status: 400 },
      )
    }
    purchaseLabel = pkg.name
    maxGpts = pkg.gpts
    priceCents = pkg.priceCents ?? 0
  }

  const supabase = getSupabaseAdmin()
  const email    = body.email.toLowerCase().trim()
  const nowIso   = new Date().toISOString()

  // 4. Registrierung anlegen
  const { data: registration, error: regError } = await supabase
    .from('hub_registrations')
    .insert({
      email:            email,
      email_normalized: email,
      full_name:        body.name ?? null,
      app_id:           appId,
      app_name:         appName,
      app_price_cents:  priceCents,
      app_currency:     'EUR',
      status:           'active',
    })
    .select('id')
    .single()

  if (regError || !registration) {
    console.error('[test-purchase] Registrierung fehlgeschlagen', regError)
    return NextResponse.json({ error: 'db_error', detail: regError?.message }, { status: 500 })
  }

  // 5. Lizenz anlegen
  const licenseKey = generateLicenseKey()

  const { error: licenseError } = await supabase
    .from('hub_licenses')
    .insert({
      registration_id: registration.id,
      license_key:     licenseKey,
      max_gpts:        maxGpts,
      max_projects:    maxProjects,
      status:          'active',
    })

  if (licenseError) {
    console.error('[test-purchase] Lizenz fehlgeschlagen', licenseError)
    return NextResponse.json({ error: 'db_error', detail: licenseError.message }, { status: 500 })
  }

  // 6. Aktivierungs-Token anlegen
  const plainToken = generatePlainToken()
  const tokenHash  = hashToken(plainToken)
  const expiresAt  = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)

  const { error: linkError } = await supabase
    .from('hub_access_links')
    .insert({
      registration_id: registration.id,
      token_hash:      tokenHash,
      expires_at:      expiresAt.toISOString(),
    })

  if (linkError) {
    console.error('[test-purchase] Access-Link fehlgeschlagen', linkError)
    return NextResponse.json({ error: 'db_error', detail: linkError.message }, { status: 500 })
  }

  // 7. Event loggen
  void supabase.from('hub_access_events').insert({
    registration_id: registration.id,
    event_type:      'test_purchase',
    metadata: {
      app_id:       appId,
      package_id:   body.packageId,
      max_gpts:     maxGpts,
      max_projects: maxProjects,
      created_at:  nowIso,
    },
  })

  // 8. Aktivierungs-Mail senden (wenn Resend konfiguriert)
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const baseUrl   = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'https://access-hub-tan.vercel.app'
  const activationUrl = `${baseUrl}/access?token=${encodeURIComponent(plainToken)}`
  const isProjectFlow = appId === 'gpt-vault-project'
  const downloadUrl = isProjectFlow ? getGptVaultProjectDownloadUrl() : getGptVaultDownloadUrl()
  const subject = isProjectFlow
    ? '[TEST] GPT Vault Projects – your download & activation token'
    : '[TEST] GPT Vault – your download & activation token'
  const productLabel = isProjectFlow ? 'GPT Vault Projects' : 'GPT Vault'
  const downloadLabel = isProjectFlow ? 'Download GPT Vault Projects (ZIP)' : 'Download GPT Vault (ZIP)'
  const stepLabel = isProjectFlow ? 'Download GPT Vault Projects' : 'Download GPT Vault'
  const summaryLine = isProjectFlow
    ? `Projects: ${maxProjects}`
    : `Package: ${purchaseLabel} – max. ${maxGpts} GPTs`

  let mailSent = false
  if (resendKey) {
    const resend = new Resend(resendKey)
    const greeting = body.name ? ` ${body.name}` : ''

    const { error: mailError } = await resend.emails.send({
      from:    fromEmail,
      to:      email,
      subject,
      html: `
        <p>Hello${greeting},</p>
        <p>this is a <strong>test purchase</strong> for ${productLabel}.</p>
        <p><strong>Step 1 – ${stepLabel}:</strong></p>
        <p><a href="${downloadUrl}" style="font-weight:bold;">→ ${downloadLabel}</a></p>
        <p><strong>Step 2 – Activate:</strong></p>
        <p>Start GPT Vault and enter this token when prompted:</p>
        <p style="font-family:monospace;font-size:16px;background:#f3f4f6;padding:12px;border-radius:6px;">
          ${plainToken}
        </p>
        <p><a href="${activationUrl}">→ Activate directly</a></p>
        <p style="color:#6b7280;font-size:12px;">
          ${summaryLine}<br/>
          Token valid until: ${expiresAt.toLocaleString('de-DE')}<br/>
          ⚠ This is a test – no real payment.
        </p>
      `,
    })

    mailSent = !mailError
    if (mailError) {
      console.error('[test-purchase] Mail fehlgeschlagen', mailError)
    }
  }

  // 9. Response – Token auch direkt zurückgeben (für Tests ohne Mail)
  return NextResponse.json({
    ok:             true,
    app_id:         appId,
    package:        body.packageId,
    max_gpts:       maxGpts,
    max_projects:   maxProjects,
    license_key:    licenseKey,
    token:          plainToken,          // ← direkt nutzbar in main.py
    activation_url: activationUrl,
    expires_at:     expiresAt.toISOString(),
    mail_sent:      mailSent,
    registration_id: registration.id,
  })
}
