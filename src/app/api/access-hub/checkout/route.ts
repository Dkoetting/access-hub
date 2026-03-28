import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { findAppById } from '@/lib/apps'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ── Schema ─────────────────────────────────────────────────────────────────────

const billingSchema = z.object({
  type:      z.enum(['company', 'private']),
  company:   z.string().max(200).optional(),
  vatId:     z.string().max(50).optional(),
  firstName: z.string().max(100).optional(),
  lastName:  z.string().max(100).optional(),
  street:    z.string().min(1).max(200),
  zip:       z.string().min(1).max(20),
  city:      z.string().min(1).max(100),
  country:   z.string().length(2).or(z.literal('OTHER')).default('DE'),
  email:     z.string().email().max(320),
  phone:     z.string().max(50).optional(),
})

const requestSchema = z.object({
  appId:   z.string().trim().min(1).max(64),
  billing: billingSchema,
})

// ── Invoice number ─────────────────────────────────────────────────────────────

async function nextInvoiceNr(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('hub_invoices')
    .select('*', { count: 'exact', head: true })
  const nr = String((count ?? 0) + 1).padStart(5, '0')
  return `${year}${nr}`
}

// ── POST /api/access-hub/checkout ──────────────────────────────────────────────

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const app = findAppById(body.appId)
  if (!app || app.redirectUrl) {
    return NextResponse.json({ error: 'unknown_app' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'server_config' }, { status: 500 })
  }

  // Preise (priceCents = Netto)
  const amountNet   = app.oneTimePriceCents
  const amountVat   = Math.round(amountNet * 0.19)
  const amountGross = amountNet + amountVat

  const billing    = body.billing
  const email      = billing.email.trim().toLowerCase()

  // Supabase: Invoice speichern
  const supabase   = getSupabaseAdmin()
  const invoiceNr  = await nextInvoiceNr(supabase)

  const { data: invoice, error: dbError } = await supabase
    .from('hub_invoices')
    .insert({
      invoice_nr:         invoiceNr,
      status:             'pending_payment',
      billing_type:       billing.type,
      company:            billing.company   ?? null,
      vat_id:             billing.vatId     ?? null,
      first_name:         billing.firstName ?? null,
      last_name:          billing.lastName  ?? null,
      street:             billing.street,
      zip:                billing.zip,
      city:               billing.city,
      country:            billing.country,
      email,
      phone:              billing.phone ?? null,
      package_id:         app.id,
      amount_net_cents:   amountNet,
      amount_vat_cents:   amountVat,
      amount_gross_cents: amountGross,
    })
    .select('id')
    .single()

  if (dbError || !invoice) {
    console.error('[access-hub/checkout] Supabase error', dbError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // Stripe Session
  const stripe  = new Stripe(stripeKey)
  const baseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'http://localhost:3002'

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 'payment',
      payment_method_types: ['card'],
      customer_email:       email,
      line_items: [{
        quantity:   1,
        price_data: {
          currency:     'eur',
          unit_amount:  amountGross,
          product_data: {
            name:        app.name,
            description: app.description ?? undefined,
          },
        },
      }],
      metadata: {
        app_id:     app.id,
        app_name:   app.name,
        invoice_id: invoice.id,
        invoice_nr: invoiceNr,
      },
      success_url: `${baseUrl}/success?app=${encodeURIComponent(app.id)}&invoice=${invoiceNr}`,
      cancel_url:  `${baseUrl}/`,
    })

    await supabase
      .from('hub_invoices')
      .update({ stripe_session_id: session.id })
      .eq('id', invoice.id)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[access-hub/checkout] Stripe error', msg)
    return NextResponse.json({ error: 'stripe_error', detail: msg }, { status: 500 })
  }
}
