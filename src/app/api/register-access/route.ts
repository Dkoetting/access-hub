import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

import { findAppById } from '@/lib/apps'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { fillTemplate, getHubContent } from '@/lib/hub-content'
import { generatePlainToken, hashToken } from '@/lib/tokens'

const requestSchema = z.object({
  email: z.email().max(320),
  name: z.string().trim().min(1).max(120).optional(),
  appId: z.string().trim().min(1).max(64),
})

const TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS ?? 8)

type ExistingRegistrationRow = {
  id: string
  created_at: string
  status: string
}

type ExistingLinkRow = {
  registration_id: string
  expires_at: string
  created_at: string
}

export async function POST(request: Request) {
  const content = getHubContent()
  let parsed: z.infer<typeof requestSchema>

  try {
    parsed = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: content.apiErrors.invalidPayload }, { status: 400 })
  }

  const app = findAppById(parsed.appId)
  if (!app) {
    return NextResponse.json({ error: content.apiErrors.unknownApp }, { status: 400 })
  }

  const email = parsed.email.trim().toLowerCase()
  const nowMs = Date.now()
  const nowIso = new Date(nowMs).toISOString()

  let supabase: ReturnType<typeof getSupabaseAdmin>
  try {
    supabase = getSupabaseAdmin()
  } catch (error) {
    console.error('[register-access] missing server config', error)
    return NextResponse.json({ error: content.messages.serverConfig }, { status: 500 })
  }

  const { data: existingRegistrations, error: existingError } = await supabase
    .from('hub_registrations')
    .select('id, created_at, status')
    .eq('email_normalized', email)
    .eq('app_id', parsed.appId)
    .order('created_at', { ascending: false })

  if (existingError) {
    console.error('[register-access] select existing failed', existingError)
    return NextResponse.json({ error: content.apiErrors.database }, { status: 500 })
  }

  const registrations = (existingRegistrations ?? []) as ExistingRegistrationRow[]
  const registrationIds = registrations.map((r) => r.id)

  let latestLinkByRegistrationId = new Map<string, ExistingLinkRow>()

  if (registrationIds.length > 0) {
    const { data: links, error: linksError } = await supabase
      .from('hub_access_links')
      .select('registration_id, expires_at, created_at')
      .in('registration_id', registrationIds)
      .order('created_at', { ascending: false })

    if (linksError) {
      console.error('[register-access] select existing links failed', linksError)
      return NextResponse.json({ error: content.apiErrors.database }, { status: 500 })
    }

    const existingLinks = (links ?? []) as ExistingLinkRow[]
    for (const link of existingLinks) {
      if (!latestLinkByRegistrationId.has(link.registration_id)) {
        latestLinkByRegistrationId.set(link.registration_id, link)
      }
    }
  }

  const blockingRegistration = registrations.find((registration) => {
    if (registration.status !== 'active') return false
    const latestLink = latestLinkByRegistrationId.get(registration.id)
    if (!latestLink) return false
    return new Date(latestLink.expires_at).getTime() > nowMs
  })

  if (blockingRegistration) {
    return NextResponse.json(
      {
        error: content.apiErrors.alreadyRegistered,
        code: 'ALREADY_REGISTERED',
        registeredAt: blockingRegistration.created_at,
      },
      { status: 409 },
    )
  }

  const expiredRegistrationIds = registrations
    .filter((registration) => {
      if (registration.status !== 'active') return false
      const latestLink = latestLinkByRegistrationId.get(registration.id)
      if (!latestLink) return true
      return new Date(latestLink.expires_at).getTime() <= nowMs
    })
    .map((registration) => registration.id)

  if (expiredRegistrationIds.length > 0) {
    const { error: expireError } = await supabase
      .from('hub_registrations')
      .update({ status: 'expired', updated_at: nowIso })
      .in('id', expiredRegistrationIds)

    if (expireError) {
      console.error('[register-access] mark expired failed', expireError)
      return NextResponse.json({ error: content.apiErrors.database }, { status: 500 })
    }
  }

  const { data: registration, error: insertError } = await supabase
    .from('hub_registrations')
    .insert({
      email,
      email_normalized: email,
      full_name: parsed.name ?? null,
      app_id: parsed.appId,
      app_name: app.name,
      app_price_cents: app.oneTimePriceCents,
      app_currency: 'EUR',
      status: 'active',
    })
    .select('id')
    .single()

  if (insertError || !registration) {
    console.error('[register-access] insert registration failed', insertError)
    return NextResponse.json({ error: content.apiErrors.database }, { status: 500 })
  }

  const plainToken = generatePlainToken()
  const tokenHash = hashToken(plainToken)
  const expiresAt = new Date(nowMs + TTL_HOURS * 60 * 60 * 1000)

  const { error: linkInsertError } = await supabase.from('hub_access_links').insert({
    registration_id: registration.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  if (linkInsertError) {
    console.error('[register-access] insert access link failed', linkInsertError)
    return NextResponse.json({ error: content.apiErrors.database }, { status: 500 })
  }

  const { error: eventError } = await supabase.from('hub_access_events').insert([
    {
      registration_id: registration.id,
      event_type: 'registration_created',
      metadata: {
        email,
        app_id: parsed.appId,
        app_name: app.name,
        app_price_cents: app.oneTimePriceCents,
        app_currency: 'EUR',
        created_at: nowIso,
      },
    },
    {
      registration_id: registration.id,
      event_type: 'link_created',
      metadata: {
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      },
    },
  ])

  if (eventError) {
    console.error('[register-access] insert event failed', eventError)
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? 'http://localhost:3004'
  const accessUrl = `${appBaseUrl}/access?token=${encodeURIComponent(plainToken)}`

  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  if (!resendKey) {
    return NextResponse.json({ ok: true, delivery: 'dev_preview', accessUrl, expiresAt: expiresAt.toISOString() })
  }

  const resend = new Resend(resendKey)

  const subject = fillTemplate(content.mail.subject, { appName: app.name })
  const greeting = fillTemplate(content.mail.greeting, {
    namePart: parsed.name ? ` ${parsed.name}` : '',
  })
  const intro = fillTemplate(content.mail.intro, { appName: app.name })
  const ttlText = fillTemplate(content.mail.ttl, { hours: TTL_HOURS })

  const { error: mailError, data: mailData } = await resend.emails.send({
    from: fromEmail,
    to: email,
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
  })

  if (mailError) {
    console.error('[register-access] resend error', mailError)
    return NextResponse.json({ error: content.apiErrors.emailDeliveryFailed }, { status: 502 })
  }

  return NextResponse.json({ ok: true, delivery: 'email', messageId: mailData?.id ?? null, expiresAt: expiresAt.toISOString() })
}

