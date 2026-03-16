import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend     = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = 'dr-dirk@dr-dirkinstitute.org'
const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL || 'info@edvkonzepte.de'

type Lang = 'de' | 'en'

const INQUIRY_LABELS: Record<string, Record<Lang, string>> = {
  support:    { de: '🛠️ Support-Anfrage',   en: '🛠️ Support Request' },
  enterprise: { de: '🏢 Enterprise-Anfrage', en: '🏢 Enterprise Inquiry' },
  teamviewer: { de: '🖥️ TeamViewer-Session', en: '🖥️ TeamViewer Session' },
  general:    { de: '💬 Allgemeine Anfrage', en: '💬 General Inquiry' },
  contact:    { de: '✉️ Kontaktanfrage',     en: '✉️ Contact Request' },
}

const emailTexts = {
  de: {
    notifyFooter:    'Gesendet über GPT Vault Anfrage-Formular',
    confirmSubject:  'Deine Anfrage ist angekommen – GPT Vault',
    confirmGreeting: (name: string) => `Hallo${name},`,
    confirmBody:     'vielen Dank für deine Nachricht! Ich habe deine Anfrage erhalten und melde mich so schnell wie möglich bei dir.',
    confirmRequest:  'Deine Anfrage:',
    confirmSign:     'Mit freundlichen Grüßen',
    confirmTagline:  'GPT Vault – Dein lokales ChatGPT-Backup-Tool',
  },
  en: {
    notifyFooter:    'Sent via GPT Vault inquiry form',
    confirmSubject:  'Your inquiry has been received – GPT Vault',
    confirmGreeting: (name: string) => `Hello${name},`,
    confirmBody:     'Thank you for your message! I have received your inquiry and will get back to you as soon as possible.',
    confirmRequest:  'Your inquiry:',
    confirmSign:     'Best regards',
    confirmTagline:  'GPT Vault – Your local ChatGPT backup tool',
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, email, message, packageId, lang } = body

    if (!type || !email) {
      return NextResponse.json({ error: 'type und email sind erforderlich' }, { status: 400 })
    }

    const l: Lang  = lang === 'en' ? 'en' : 'de'
    const txt      = emailTexts[l]
    const labelMap = INQUIRY_LABELS[type]
    const label    = labelMap ? labelMap[l] : `📩 ${type}`

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('gpt_vault_inquiries')
      .insert({
        inquiry_type: type,
        name:         name?.trim()    || null,
        email:        email.trim().toLowerCase(),
        message:      message?.trim() || null,
        package_id:   packageId       || null,
        status:       'new',
        user_agent:   req.headers.get('user-agent') || null,
      })

    if (error) throw error

    const nameStr    = name?.trim()    ? `<b>Name:</b> ${name.trim()}<br>`         : ''
    const msgStr     = message?.trim() ? `<b>${txt.confirmRequest}</b><br>${message.trim().replace(/\n/g, '<br>')}` : '<i>(keine Nachricht / no message)</i>'
    const packageStr = packageId       ? `<b>Paket:</b> ${packageId}<br>`          : ''

    // 1) Notification to Dirk (always bilingual-aware label)
    await resend.emails.send({
      from:    `GPT Vault <${FROM_EMAIL}>`,
      to:      NOTIFY_EMAIL,
      subject: `${label} via GPT Vault`,
      html: `
        <h2>${label}</h2>
        ${nameStr}
        <b>E-Mail:</b> ${email.trim()}<br>
        ${packageStr}
        ${msgStr}
        <hr style="margin:24px 0">
        <small style="color:#888">${txt.notifyFooter} [${l.toUpperCase()}]</small>
      `,
    })

    // 2) Confirmation to customer in their language
    const greetingName = name?.trim() ? ` ${name.trim()}` : ''
    await resend.emails.send({
      from:    `GPT Vault <${FROM_EMAIL}>`,
      to:      email.trim(),
      subject: txt.confirmSubject,
      html: `
        <p>${txt.confirmGreeting(greetingName)}</p>
        <p>${txt.confirmBody}</p>
        <p style="color:#6b7280;font-size:0.9em">
          <b>${txt.confirmRequest}</b><br>
          ${message?.trim() ? message.trim().replace(/\n/g, '<br>') : '<i>–</i>'}
        </p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:0.9em;color:#374151">
          ${txt.confirmSign}<br>
          <b>Dirk Köttinger</b><br>
          Dr. DirKInstitute · <a href="mailto:${FROM_EMAIL}" style="color:#1d4ed8">${FROM_EMAIL}</a>
        </p>
        <p style="font-size:0.75em;color:#9ca3af">${txt.confirmTagline}</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[inquiry]', err)
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
  }
}
