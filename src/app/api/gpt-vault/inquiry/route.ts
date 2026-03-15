import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = 'dr-dirk@dr-dirkinstitute.org'
const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL || 'info@edvkonzepte.de'

const INQUIRY_LABELS: Record<string, string> = {
  support:     '🛠️ Support-Anfrage',
  enterprise:  '🏢 Enterprise-Anfrage',
  teamviewer:  '🖥️ TeamViewer-Session',
  general:     '💬 Allgemeine Anfrage',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, email, message, packageId } = body

    if (!type || !email) {
      return NextResponse.json({ error: 'type und email sind erforderlich' }, { status: 400 })
    }

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

    // E-Mail-Benachrichtigung an Dirk
    const label = INQUIRY_LABELS[type] || `📩 Anfrage (${type})`
    const nameStr    = name?.trim()    ? `<b>Name:</b> ${name.trim()}<br>`         : ''
    const msgStr     = message?.trim() ? `<b>Nachricht:</b><br>${message.trim().replace(/\n/g, '<br>')}` : '<i>(keine Nachricht)</i>'
    const packageStr = packageId       ? `<b>Paket:</b> ${packageId}<br>`          : ''

    // 1) Benachrichtigung an Dirk
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
        <small style="color:#888">Gesendet über GPT Vault Anfrage-Formular</small>
      `,
    })

    // 2) Bestätigung an den Kunden
    const greetingName = name?.trim() ? ` ${name.trim()}` : ''
    await resend.emails.send({
      from:    `GPT Vault <${FROM_EMAIL}>`,
      to:      email.trim(),
      subject: 'Deine Anfrage ist angekommen – GPT Vault',
      html: `
        <p>Hallo${greetingName},</p>
        <p>vielen Dank für deine Nachricht! Ich habe deine Anfrage erhalten und melde mich so schnell wie möglich bei dir.</p>
        <p style="color:#6b7280;font-size:0.9em">
          <b>Deine Anfrage:</b><br>
          ${msgStr}
        </p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:0.9em;color:#374151">
          Mit freundlichen Grüßen<br>
          <b>Dirk Köttinger</b><br>
          Dr. DirKInstitute · <a href="mailto:${FROM_EMAIL}" style="color:#1d4ed8">${FROM_EMAIL}</a>
        </p>
        <p style="font-size:0.75em;color:#9ca3af">GPT Vault – Dein lokales ChatGPT-Backup-Tool</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[inquiry]', err)
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
  }
}
