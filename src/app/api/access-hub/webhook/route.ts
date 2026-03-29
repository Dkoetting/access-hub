import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { generatePlainToken, hashToken } from '@/lib/tokens'
import { findAppById } from '@/lib/apps'
import { generateInvoiceBuffer } from '@/lib/invoice-pdf'
import { appendCrmRow, ensureCrmHeaders } from '@/lib/google-sheets'

const TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS ?? 8)

// ── POST /api/access-hub/webhook ───────────────────────────────────────────────

export async function POST(request: Request) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_ACCESS_HUB

  if (!stripeKey || !webhookSecret) {
    console.error('[access-hub/webhook] Stripe-Konfiguration fehlt')
    return NextResponse.json({ error: 'server_config' }, { status: 500 })
  }

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

  // Skip GPT Vault sessions (handled by gpt-vault webhook)
  if (session.metadata?.package_id === 'session') {
    return NextResponse.json({ received: true })
  }

  const appId     = session.metadata?.app_id     ?? ''
  const invoiceId = session.metadata?.invoice_id ?? ''
  const email     = (session.customer_details?.email ?? session.customer_email ?? '').toLowerCase().trim()

  if (!appId || !email) {
    console.error('[access-hub/webhook] Fehlende Metadaten', { appId, email })
    return NextResponse.json({ error: 'missing_metadata' }, { status: 400 })
  }

  const app = findAppById(appId)
  if (!app) {
    console.error('[access-hub/webhook] Unbekannte App:', appId)
    return NextResponse.json({ error: 'unknown_app' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const nowMs    = Date.now()
  const nowIso   = new Date(nowMs).toISOString()

  // 1. Invoice aus DB laden (Billing-Daten)
  let invoiceRow: {
    id: string; invoice_nr: string; billing_type: string
    company: string|null; vat_id: string|null
    first_name: string|null; last_name: string|null
    street: string; zip: string; city: string; country: string
    phone: string|null
    amount_net_cents: number; amount_vat_cents: number; amount_gross_cents: number
  } | null = null

  if (invoiceId) {
    const { data } = await supabase
      .from('hub_invoices')
      .select('id,invoice_nr,billing_type,company,vat_id,first_name,last_name,street,zip,city,country,phone,amount_net_cents,amount_vat_cents,amount_gross_cents')
      .eq('id', invoiceId)
      .single()
    invoiceRow = data
  }

  // Invoice auf paid setzen
  if (invoiceRow) {
    await supabase
      .from('hub_invoices')
      .update({ status: 'paid', stripe_session_id: session.id })
      .eq('id', invoiceRow.id)
  }

  // 2. Registrierung anlegen
  const fullName = invoiceRow
    ? (invoiceRow.billing_type === 'company'
        ? (invoiceRow.company ?? '')
        : `${invoiceRow.first_name ?? ''} ${invoiceRow.last_name ?? ''}`.trim())
    : (session.customer_details?.name ?? '')

  const { data: newReg, error: regError } = await supabase
    .from('hub_registrations')
    .insert({
      email,
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

  let registrationId: string | null = null

  if (regError?.code === '23505') {
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
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 3. Zugangslink erstellen
  const plainToken = generatePlainToken()
  const tokenHash  = hashToken(plainToken)
  const expiresAt  = new Date(nowMs + TTL_HOURS * 60 * 60 * 1000)

  await supabase.from('hub_access_links').insert({
    registration_id: registrationId,
    token_hash:      tokenHash,
    expires_at:      expiresAt.toISOString(),
  })

  // 4. Events loggen
  void supabase.from('hub_access_events').insert([
    {
      registration_id: registrationId,
      event_type:      'stripe_payment_completed',
      metadata: { stripe_session_id: session.id, app_id: app.id, amount_total: session.amount_total, created_at: nowIso },
    },
    {
      registration_id: registrationId,
      event_type:      'link_created',
      metadata: { token_hash: tokenHash, expires_at: expiresAt.toISOString() },
    },
  ])

  // Direkt zur Tool-URL mit Token (einmaliger Zugang)
  const toolBaseUrl = app.accessUrl.replace(/\/$/, '')
  const accessUrl   = `${toolBaseUrl}?token=${encodeURIComponent(plainToken)}`

  // 5. Rechnung PDF generieren
  let pdfBuffer: Buffer | null = null
  if (invoiceRow) {
    const now = new Date()
    const invoiceDate = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    try {
      pdfBuffer = await generateInvoiceBuffer({
        invoiceNr:        invoiceRow.invoice_nr,
        invoiceDate,
        appName:          app.name,
        appDesc:          app.description ?? '',
        amountNetCents:   invoiceRow.amount_net_cents,
        amountVatCents:   invoiceRow.amount_vat_cents,
        amountGrossCents: invoiceRow.amount_gross_cents,
        billingType:      (invoiceRow.billing_type as 'company' | 'private'),
        company:          invoiceRow.company    ?? undefined,
        vatId:            invoiceRow.vat_id     ?? undefined,
        firstName:        invoiceRow.first_name ?? undefined,
        lastName:         invoiceRow.last_name  ?? undefined,
        street:           invoiceRow.street,
        zip:              invoiceRow.zip,
        city:             invoiceRow.city,
        country:          invoiceRow.country,
        email,
      })
    } catch (pdfErr) {
      console.error('[access-hub/webhook] PDF-Fehler', pdfErr)
    }
  }

  // 6. Google Sheets CRM
  if (invoiceRow) {
    try {
      await ensureCrmHeaders()
      const now        = new Date()
      const kundNr     = `KD-${now.getFullYear()}-${invoiceRow.invoice_nr.slice(-5)}`
      const fmt        = (c: number) => (c / 100).toFixed(2).replace('.', ',')
      const stripePayId = session.payment_intent
        ? (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id)
        : ''

      await appendCrmRow({
        kundennummer:    kundNr,
        rechnungsnummer: invoiceRow.invoice_nr,
        billingTyp:      invoiceRow.billing_type === 'company' ? 'Firma' : 'Privat',
        firma:           invoiceRow.company    ?? '',
        vorname:         invoiceRow.first_name ?? '',
        nachname:        invoiceRow.last_name  ?? '',
        ustId:           invoiceRow.vat_id     ?? '',
        strasse:         invoiceRow.street,
        plz:             invoiceRow.zip,
        ort:             invoiceRow.city,
        land:            invoiceRow.country,
        email,
        telefon:         invoiceRow.phone ?? '',
        produkt:         app.name,
        preisNetto:      fmt(invoiceRow.amount_net_cents),
        mwst:            fmt(invoiceRow.amount_vat_cents),
        preisGross:      fmt(invoiceRow.amount_gross_cents),
        zahlungsstatus:  'paid',
        stripePaymentId: stripePayId,
        supabaseId:      invoiceRow.id,
        erstelltAm:      now.toLocaleString('de-DE'),
      })
    } catch (sheetErr) {
      console.error('[access-hub/webhook] Google Sheets Fehler', sheetErr)
    }
  }

  // 7. E-Mail senden
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  if (resendKey) {
    const resend    = new Resend(resendKey)
    const name      = fullName ? ` ${fullName}` : ''
    const invoiceNr = invoiceRow?.invoice_nr ?? ''

    const attachments: { filename: string; content: Buffer }[] = []
    if (pdfBuffer) {
      attachments.push({ filename: `Rechnung_${invoiceNr}.pdf`, content: pdfBuffer })
    }

    await resend.emails.send({
      from:    fromEmail,
      to:      email,
      subject: `Ihr Zugang: ${app.name}`,
      attachments,
      html: `
        <p>Hallo${name},</p>
        <p>vielen Dank für Ihren Kauf von <strong>${app.name}</strong>.</p>
        <p>
          Ihr persönlicher Zugangslink:<br />
          <a href="${accessUrl}" style="font-weight:bold;">${accessUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          ${app.maxUses === 1
            ? 'Dieser Link kann <strong>einmalig</strong> verwendet werden.'
            : `Dieser Link ist ${TTL_HOURS} Stunden gültig.`
          }
        </p>
        ${pdfBuffer ? '<p>Die Rechnung finden Sie im Anhang dieser E-Mail.</p>' : ''}
        <hr />
        <p style="font-size:12px;color:#9ca3af;">
          K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · 83646 Bad Tölz · dkoetting@edvkonzepte.de
        </p>
      `,
    }).catch((err) => {
      console.error('[access-hub/webhook] E-Mail fehlgeschlagen', err)
    })
  }

  return NextResponse.json({ received: true })
}
