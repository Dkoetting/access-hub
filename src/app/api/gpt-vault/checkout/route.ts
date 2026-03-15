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
  packageId: z.string().min(1).max(32),
  email:     z.string().email().max(320).optional(),
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

  // 2. Paket suchen
  const pkg = packages.find((p) => p.id === body.packageId)
  if (!pkg) {
    return NextResponse.json({ error: 'unknown_package' }, { status: 400 })
  }
  if (pkg.contactOnly || pkg.priceCents === null) {
    return NextResponse.json({ error: 'contact_only' }, { status: 400 })
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
            currency:     pkg.currency.toLowerCase(),
            unit_amount:  pkg.priceCents,
            product_data: {
              name:        `GPT Vault – ${pkg.name}`,
              description: pkg.description,
            },
          },
        },
      ],
      metadata: {
        app_id:     'gpt-vault',
        package_id: pkg.id,
        max_gpts:   String(pkg.gpts ?? 0),
      },
      success_url: `${baseUrl}/gpt-vault/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/gpt-vault`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[gpt-vault/checkout] Stripe error', err)
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }
}
