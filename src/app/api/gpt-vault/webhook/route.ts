import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { randomUUID } from 'crypto'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getGptVaultDownloadUrl } from '@/lib/gpt-vault-download'
import { generatePlainToken, hashToken } from '@/lib/tokens'

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const hex = randomUUID().replace(/-/g, '').toUpperCase()
  return `GV-${hex.slice(0, 6)}-${hex.slice(6, 12)}-${hex.slice(12, 18)}`
}

const TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS ?? 72)

// ── POST /api/gpt-vault/webhook ───────────────────────────────────────────────

export async function POST(request: Request) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_GPT_VAULT

  if (!stripeKey || !webhookSecret) {
    console.error('[gpt-vault/webhook] Stripe-Konfiguration fehlt')
    return NextResponse.json({ error: 'server_config' }, { status: 500 })
  }

  // 1. Stripe Signatur prüfen
  const stripe    = new Stripe(stripeKey)
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[gpt-vault/webhook] Signaturprüfung fehlgeschlagen', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  // 2. Nur checkout.session.completed verarbeiten
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 3. Metadaten lesen
  const packageId = session.metadata?.package_id ?? ''
  const maxGpts   = parseInt(session.metadata?.max_gpts ?? '0', 10)
  const email     = (session.customer_details?.email ?? session.customer_email ?? '').toLowerCase().trim()
  const fullName  = session.customer_details?.name ?? ''

  if (!email || !packageId) {
    console.error('[gpt-vault/webhook] Fehlende Metadaten', { email, packageId })
    return NextResponse.json({ error: 'missing_metadata' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const nowIso   = new Date().toISOString()

  // 4. Registrierung anlegen (oder bestehende verwenden bei Duplicate)
  let registration: { id: string } | null = null

  const { data: newReg, error: regError } = await supabase
    .from('hub_registrations')
    .insert({
      email:            email,
      email_normalized: email,
      full_name:        fullName || null,
      app_id:           'gpt-vault',
      app_name:         'GPT Vault',
      app_price_cents:  session.amount_total ?? 0,
      app_currency:     'EUR',
      status:           'active',
    })
    .select('id')
    .single()

  if (regError?.code === '23505') {
    // Duplicate → bestehende Registration laden
    const { data: existing } = await supabase
      .from('hub_registrations')
      .select('id')
      .eq('email_normalized', email)
      .eq('app_id', 'gpt-vault')
      .single()
    registration = existing
  } else if (regError || !newReg) {
    console.error('[gpt-vault/webhook] Registrierung fehlgeschlagen', regError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  } else {
    registration = newReg
  }

  if (!registration) {
    console.error('[gpt-vault/webhook] Keine Registration gefunden')
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 5. Lizenz anlegen (mit max_gpts aus dem Paket)
  const licenseKey = generateLicenseKey()

  const { error: licenseError } = await supabase
    .from('hub_licenses')
    .insert({
      registration_id: registration.id,
      license_key:     licenseKey,
      max_gpts:        maxGpts,
      status:          'active',
    })

  if (licenseError) {
    console.error('[gpt-vault/webhook] Lizenz-Anlage fehlgeschlagen', licenseError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 6. Aktivierungs-Token für main.py erstellen
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
    console.error('[gpt-vault/webhook] Access-Link fehlgeschlagen', linkError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 7. Events loggen
  void supabase.from('hub_access_events').insert([
    {
      registration_id: registration.id,
      event_type:      'stripe_payment_completed',
      metadata: {
        stripe_session_id: session.id,
        package_id:        packageId,
        max_gpts:          maxGpts,
        amount_total:      session.amount_total,
        created_at:        nowIso,
      },
    },
    {
      registration_id: registration.id,
      event_type:      'license_created',
      metadata: { license_key: licenseKey, max_gpts: maxGpts },
    },
  ])

  // 8. Aktivierungs-Mail senden
  const resendKey   = process.env.RESEND_API_KEY
  const fromEmail   = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const baseUrl     = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'https://access-hub-tan.vercel.app'
  const downloadUrl = getGptVaultDownloadUrl()
  const activationUrl = `${baseUrl}/access?token=${encodeURIComponent(plainToken)}`

  if (resendKey) {
    const resend = new Resend(resendKey)
    const name   = fullName ? ` ${fullName}` : ''

    await resend.emails.send({
      from:    fromEmail,
      to:      email,
      subject: 'GPT Vault – your download & activation token',
      html: `
        <p>Hello${name},</p>
        <p>thank you for purchasing <strong>GPT Vault</strong>!</p>
        <p><strong>Step 1 – Download GPT Vault:</strong></p>
        <p>
          <a href="${downloadUrl}" style="font-weight:bold;">→ Download GPT Vault (ZIP)</a>
        </p>
        <p><strong>Step 2 – Activate:</strong></p>
        <p>Start GPT Vault and enter the following token when prompted,<br/>
        or click the activation link:</p>
        <p style="font-family:monospace;font-size:16px;background:#f3f4f6;padding:12px;border-radius:6px;">
          ${plainToken}
        </p>
        <p>
          <a href="${activationUrl}" style="font-weight:bold;">→ Activate directly</a>
        </p>
        <p style="color:#6b7280;font-size:12px;">
          Your package: GPT Vault – ${packageId} (max. ${maxGpts} GPTs)<br/>
          Token valid for ${TTL_HOURS} hours.<br/>
          Questions? dr-dirk@dr-dirkinstitute.org
        </p>
      `,
    }).catch((err) => {
      console.error('[gpt-vault/webhook] E-Mail fehlgeschlagen', err)
    })
  }

  return NextResponse.json({ received: true })
}
