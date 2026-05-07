import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend       = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = 'dr-dirk@dr-dirkinstitute.org'
const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL || 'info@edvkonzepte.de'

type Lang = 'de' | 'en'

const emailTexts = {
  de: {
    notifySubject: (name: string) => `🎯 Governance-Kurzlage Anfrage – ${name}`,
    notifyLabel:   'Governance-Kurzlage Anfrage',
    notifyFooter:  'Gesendet über Access Hub – Governance-Kurzlage-Formular',
    confirmSubject: 'Ihre Governance-Kurzlage – Anfrage eingegangen',
    confirmGreeting: (name: string) => `Hallo ${name},`,
    confirmBody: 'vielen Dank für Ihre Anfrage. Wir haben Ihre Governance-Kurzlage-Anfrage erhalten und melden uns in Kürze mit den nächsten Schritten.',
    confirmSign:    'Mit freundlichen Grüßen',
    confirmTagline: 'Dr. DirKInstitute · KI-Beratung & Governance',
    wantsBriefing:  { true: 'Ja', false: 'Nein' },
  },
  en: {
    notifySubject: (name: string) => `🎯 Governance Brief Request – ${name}`,
    notifyLabel:   'Governance Brief Request',
    notifyFooter:  'Sent via Access Hub – Governance Brief Form',
    confirmSubject: 'Your Governance Brief – Request Received',
    confirmGreeting: (name: string) => `Hello ${name},`,
    confirmBody: 'Thank you for your inquiry. We have received your Governance Brief request and will be in touch shortly with the next steps.',
    confirmSign:    'Best regards',
    confirmTagline: 'Dr. DirKInstitute · AI Consulting & Governance',
    wantsBriefing:  { true: 'Yes', false: 'No' },
  },
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  // ── 1. Parse + Validate ──────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const {
    name:                rawName,
    email:               rawEmail,
    company:             rawCompany,
    role:                rawRole,
    message:             rawMessage,
    wants_briefing_info: rawWants,
    journey_stage:       rawJourneyStage,
    lang:                rawLang,
  } = body as Record<string, unknown>

  const name         = typeof rawName         === 'string' ? rawName.trim()         : ''
  const email        = typeof rawEmail        === 'string' ? rawEmail.trim()         : ''
  const company      = typeof rawCompany      === 'string' ? rawCompany.trim()       : null
  const role         = typeof rawRole         === 'string' ? rawRole.trim()          : null
  const message      = typeof rawMessage      === 'string' ? rawMessage.trim()       : null
  const journeyStage = typeof rawJourneyStage === 'string' ? rawJourneyStage.trim()  : null
  const wantsBriefingInfo = rawWants === true
  const lang: Lang = rawLang === 'en' ? 'en' : 'de'

  if (!name) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'email_invalid' }, { status: 400 })
  }

  // ── 2. Supabase Insert (first – determines success/failure) ──────────────
  const supabase = getSupabaseAdmin()
  const { error: dbError } = await supabase
    .from('gpt_vault_inquiries')
    .insert({
      inquiry_type:        'governance_kurzlage',
      package_id:          'governance_kurzlage',
      name,
      email:               email.toLowerCase(),
      company:             company      || null,
      role:                role         || null,
      message:             message      || null,
      journey_stage:       journeyStage || null,
      wants_briefing_info: wantsBriefingInfo,
      status:              'new',
      user_agent:          req.headers.get('user-agent') || null,
    })

  if (dbError) {
    console.error('[governance/lead] Supabase error', dbError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // ── 3. Resend – separate try/catch, never blocks the success response ────
  const txt = emailTexts[lang]

  const STAGE_LABELS: Record<string, string> = {
    'ersteinschaetzung': 'Schritt 1 — Ersteinschätzung',
    'struktur_aufbauen': 'Schritt 2 — Struktur schaffen',
    'umsetzung_starten': 'Schritt 3 — Umsetzung & Wirkung',
  }

  try {
    const briefingStr  = wantsBriefingInfo ? txt.wantsBriefing.true : txt.wantsBriefing.false
    const companyStr   = company      ? `<b>Unternehmen:</b> ${company}<br>`                          : ''
    const roleStr      = role         ? `<b>Rolle:</b> ${role}<br>`                                   : ''
    const stageStr     = journeyStage ? `<b>Einstieg:</b> ${STAGE_LABELS[journeyStage] ?? journeyStage}<br>` : ''
    const msgStr       = message
      ? `<b>Situation:</b><br>${message.replace(/\n/g, '<br>')}`
      : ''

    // Interne Notification
    await resend.emails.send({
      from:    `Access Hub <${FROM_EMAIL}>`,
      to:      NOTIFY_EMAIL,
      subject: txt.notifySubject(name),
      html: `
        <h2>${txt.notifyLabel}</h2>
        <b>Name:</b> ${name}<br>
        <b>E-Mail:</b> ${email}<br>
        ${companyStr}
        ${roleStr}
        ${stageStr}
        <b>Briefing-Info gewünscht:</b> ${briefingStr}<br>
        ${msgStr ? `<hr style="margin:16px 0">${msgStr}` : ''}
        <hr style="margin:24px 0">
        <small style="color:#888">${txt.notifyFooter}</small>
      `,
    })

    // Bestätigung an Nutzer
    await resend.emails.send({
      from:    `Dr. DirKInstitute <${FROM_EMAIL}>`,
      to:      email,
      subject: txt.confirmSubject,
      html: `
        <p>${txt.confirmGreeting(name)}</p>
        <p>${txt.confirmBody}</p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:0.9em;color:#374151">
          ${txt.confirmSign}<br>
          <b>Dr. Dirk Kötting</b><br>
          Dr. DirKInstitute · <a href="mailto:${FROM_EMAIL}" style="color:#1d4ed8">${FROM_EMAIL}</a>
        </p>
        <p style="font-size:0.75em;color:#9ca3af">${txt.confirmTagline}</p>
      `,
    })
  } catch (mailErr) {
    console.error('[governance/lead] mail error', mailErr)
    // Lead ist in Supabase gespeichert — Mail-Fehler nicht an Client weitergeben
  }

  return NextResponse.json({ ok: true })
}
