import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { findAppById } from '@/lib/apps'

const requestSchema = z.object({
  appId: z.string().trim().min(1).max(64),
  email: z.string().email().max(320).optional(),
  name:  z.string().trim().max(120).optional(),
})

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const app = findAppById(body.appId)
  if (!app) {
    return NextResponse.json({ error: 'unknown_app' }, { status: 400 })
  }
  if (app.redirectUrl) {
    return NextResponse.json({ error: 'redirect_app' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('[access-hub/checkout] STRIPE_SECRET_KEY fehlt')
    return NextResponse.json({ error: 'server_config' }, { status: 500 })
  }

  const stripe  = new Stripe(stripeKey)
  const baseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'http://localhost:3002'

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 'payment',
      payment_method_types: ['card'],
      customer_email:       body.email,
      line_items: [
        {
          quantity:   1,
          price_data: {
            currency:     'eur',
            unit_amount:  app.oneTimePriceCents,
            product_data: {
              name:        app.name,
              description: app.description ?? undefined,
            },
          },
        },
      ],
      metadata: {
        app_id:   app.id,
        app_name: app.name,
        // Name mitgeben für die Bestätigungs-Mail
        customer_name: body.name ?? '',
      },
      success_url: `${baseUrl}/success?app=${encodeURIComponent(app.name)}`,
      cancel_url:  `${baseUrl}/`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[access-hub/checkout] Stripe error', err)
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }
}
