import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { fillTemplate, getHubContent } from '@/lib/hub-content'
import { generatePlainToken, hashToken } from '@/lib/tokens'
import { findAppById } from '@/lib/apps'

const TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS ?? 8)

export async function POST(request: Request) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_ACCESS_HUB

  if (!stripeKey || !webhookSecret) {
    console.error('[access-hub/webhook] Stripe-Konfiguration fehlt')
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
    console.error('[access-hub/webhook] Signaturprüfung fehlgeschlagen', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 2. Metadaten lesen
  const appId    = session.metadata?.app_id ?? ''
  const email    = (session.customer_details?.email ?? session.customer_email ?? '').toLowerCase().trim()
  const fullName = session.metadata?.customer_name || session.customer_details?.name || ''

  if (!email || !appId) {
    console.error('[access-hub/webhook] Fehlende Metadaten', { email, appId })
    return NextResponse.json({ error: 'missing_metadata' }, { status: 400 })
  }

  const app = findAppById(appId)
  if (!app) {
    console.error('[access-hub/webhook] Unbekannte App:', appId)
    return NextResponse.json({ error: 'unknown_app' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const nowIso   = new Date().toISOString()
  const nowMs    = Date.now()

  // 3. Registrierung anlegen (Duplicate tolerieren)
  let registrationId: string | null = null

  const { data: newReg, error: regError } = await supabase
    .from('hub_registrations')
    .insert({
      email:            email,
      email_normalized: email,
      full_name:        fullName || null,
      app_id:           app.id,
      app_name:         app.name,
      app_price_cents:  session.amount_total ?? app.oneTimePriceCents,
      app_currency:     'EUR',
      status:           'active',
    })
    .select('id')
    .single()

  if (regError?.code === '23505') {
    // Duplicate → bestehende laden
    const { data: existing } = await supabase
      .from('hub_registrations')
      .select('id')
      .eq('email_normalized', email)
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    registrationId = existing?.id ?? null
  } else if (regError || !newReg) {
    console.error('[access-hub/webhook] Registrierung fehlgeschlagen', regError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  } else {
    registrationId = newReg.id
  }

  if (!registrationId) {
    console.error('[access-hub/webhook] Keine Registration-ID')
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 4. Zugangslink erstellen
  const plainToken = generatePlainToken()
  const tokenHash  = hashToken(plainToken)
  const expiresAt  = new Date(nowMs + TTL_HOURS * 60 * 60 * 1000)

  const { error: linkError } = await supabase.from('hub_access_links').insert({
    registration_id: registrationId,
    token_hash:      tokenHash,
    expires_at:      expiresAt.toISOString(),
  })

  if (linkError) {
    console.error('[access-hub/webhook] Access-Link fehlgeschlagen', linkError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 5. Events loggen
  void supabase.from('hub_access_events').insert([
    {
      registration_id: registrationId,
      event_type:      'stripe_payment_completed',
      metadata: {
        stripe_session_id: session.id,
        app_id:            app.id,
        amount_total:      session.amount_total,
        created_at:        nowIso,
      },
    },
    {
      registration_id: registrationId,
      event_type:      'link_created',
      metadata: { token_hash: tokenHash, expires_at: expiresAt.toISOString() },
    },
  ])

  // 6. Zugangslink per E-Mail senden
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const baseUrl   = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'https://access-hub-tan.vercel.app'
  const accessUrl = `${baseUrl}/access?token=${encodeURIComponent(plainToken)}`

  if (resendKey) {
    const resend  = new Resend(resendKey)
    const content = getHubContent()
    const name    = fullName ? ` ${fullName}` : ''

    const subject = fillTemplate(content.mail.subject, { appName: app.name })
    const greeting = fillTemplate(content.mail.greeting, { namePart: name })
    const intro    = fillTemplate(content.mail.intro,    { appName: app.name })
    const ttlText  = fillTemplate(content.mail.ttl,      { hours: TTL_HOURS })

    await resend.emails.send({
      from:    fromEmail,
      to:      email,
      subject,
      html: `
        <p>${greeting}</p>
        <p>${intro}</p>
        <p>
          <a href="${accessUrl}" style="font-weight:bold;">${content.mail.openLink}</a>
        </p>
        <p>${ttlText}</p>
        <hr />
        <p style="font-size:12px;color:#6b7280;">${content.mail.footer}</p>
      `,
    }).catch((err) => {
      console.error('[access-hub/webhook] E-Mail fehlgeschlagen', err)
    })
  }

  return NextResponse.json({ received: true })
}
