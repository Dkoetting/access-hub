import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

import packagesRaw from '@/config/packages.json'

// ── Types ─────────────────────────────────────────────────────────────────────

type Package = {
  id: string
  name: string
  gpts: number | null
  priceCents: number | null
  currency: string
  description: string
  contactOnly?: boolean
}

const packages = packagesRaw as Package[]

// ── Schema ────────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  packageId:    z.string().min(1).max(32),
  email:        z.string().email().max(320).optional(),
  projectCount: z.number().int().min(1).max(500).optional(),
})

// ── POST /api/gpt-vault/checkout ─────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Parse body
  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // 2. Paket suchen – oder dynamisches Projekt-Paket
  const PRICE_PER_PROJECT_CENTS = 120

  let lineItemName: string
  let lineItemDesc: string
  let priceCents:   number
  let metaAppId:    string
  let metaPackageId: string
  let metaMaxGpts:   string
  let metaMaxProjects: string
  let currency = 'eur'
  let successUrl: string
  let cancelUrl: string

  if (body.packageId === 'projects') {
    const count = body.projectCount ?? 1
    priceCents    = count * PRICE_PER_PROJECT_CENTS
    lineItemName  = `GPT Vault – Projekte (${count})`
    lineItemDesc  = `Backup von ${count} ChatGPT-Projekt${count === 1 ? '' : 'en'} · 1,20 € / Projekt`
    metaAppId     = 'gpt-vault-project'
    metaPackageId = 'projects'
    metaMaxGpts   = '0'
    metaMaxProjects = String(count)
  } else {
    const pkg = packages.find((p) => p.id === body.packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'unknown_package' }, { status: 400 })
    }
    if (pkg.contactOnly || pkg.priceCents === null) {
      return NextResponse.json({ error: 'contact_only' }, { status: 400 })
    }
    priceCents    = pkg.priceCents
    currency      = pkg.currency.toLowerCase()
    lineItemName  = `GPT Vault – ${pkg.name}`
    lineItemDesc  = pkg.description
    metaAppId     = 'gpt-vault'
    metaPackageId = pkg.id
    metaMaxGpts   = String(pkg.gpts ?? 0)
    metaMaxProjects = '0'
  }

  // 3. Stripe initialisieren
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('[gpt-vault/checkout] STRIPE_SECRET_KEY fehlt')
    return NextResponse.json({ error: 'server_config' }, { status: 500 })
  }
  const stripe = new Stripe(stripeKey)

  // 4. Basis-URL
  const baseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'http://localhost:3004'
  successUrl =
    metaAppId === 'gpt-vault-project'
      ? `${baseUrl}/gpt-vault/success?mode=projects&session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/gpt-vault/success?session_id={CHECKOUT_SESSION_ID}`
  cancelUrl = `${baseUrl}/gpt-vault`

  // 5. Checkout Session erstellen
  try {
    const session = await stripe.checkout.sessions.create({
      mode:           'payment',
      payment_method_types: ['card'],
      customer_email: body.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount:  priceCents,
            product_data: {
              name:        lineItemName,
              description: lineItemDesc,
            },
          },
        },
      ],
      metadata: {
        app_id:        metaAppId,
        package_id:    metaPackageId,
        max_gpts:      metaMaxGpts,
        max_projects:  metaMaxProjects,
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[gpt-vault/checkout] Stripe error', err)
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }
}
