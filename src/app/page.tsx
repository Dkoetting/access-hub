'use client'
import { useState } from 'react'
import Image from 'next/image'
import styles from './landing.module.css'

// ── i18n ──────────────────────────────────────────────────────────────────
const T = {
  de: {
    eyebrow:        'KI Governance · Agenten-Kontrolle · Entscheidungssicherheit',
    title:          'Wenn Agenten handeln, ist es nicht mehr nur KI – es ist operatives Risiko.',
    sub:            'Sparringspartner für Vorstände und C-Level: KI-Governance, die schützt, entlastungsfähig ist und Entscheidungssicherheit bei regulatorischen Pflichten schafft.',
    heroCta:        'In 5 Minuten: KI-Risiko & Pflichten einschätzen →',
    trustLine:      'Keine Registrierung · Sofortiger Start · Board-taugliches Ergebnis',
    heroBullets: [
      'Risikoklasse & Pflichten nach EU AI Act in Klartext',
      'Governance-Gaps in einem kompakten Kurzlage-Report',
      'Konkreter nächster Schritt für CISO-/Board-Briefing',
    ],
    principleTitle: 'Verantwortung ist nicht delegierbar. Steuerung schon.',
    principleSub:   'Policy, Freigabeprozess, Tool-Zugriffe, Logging, Incident-Pfad.',
    agentsTitle:    'Warum Agenten anders sind',
    agents:         [
      'Sie führen Aktionen aus (APIs, Systeme, Daten) – nicht nur Text.',
      'Sie erzeugen Ketteneffekte (Sub-Agents, Tool-Chains, Automationen).',
      'Kontrolle braucht Guardrails: Rollen, Rechte, Logging, Freigabe, Kill-Switch.',
    ],
    problemsTitle:  'Das Problem',
    problems:       ['KI-/Agenten-Entscheidungen ohne Kontrollrahmen','Verantwortlichkeiten nicht prüfbar – keine Nachweise','Regulatorische Pflichten unklar oder nicht umgesetzt'],
    systemTitle:    'Das System',
    system:         ['Risikoklasse + Kontrollplan in 5 Min.','Rollen, Rechte, Logging, Freigaben – strukturiert','EU AI Act Navigator – Compliance-Nachweis ready'],
    outcomesTitle:  'Das Ergebnis',
    outcomes:       ['Prüfbarer Governance-Output für Board & CISO','Nachweisbare Steuerung bei nicht delegierbarer Verantwortung','Board-tauglicher Report: Risikoklasse, Kontrollpfad, Maßnahmen'],
    trustRole:      'Dr. DirKInstitute · KI-Beratung & Governance',
    trustDesc:      'Ich begleite Führungskräfte dabei, KI-Entscheidungen\nrechtssicher und operativ belastbar zu machen,\nohne Technologiefokus, mit strategischem Blick',
    staircaseTitle: 'Ihre Governance-Reise in 3 Schritten',
    steps: [
      {
        number:   '01',
        stage:    'ersteinschaetzung',
        title:    'Ersteinschätzung',
        products: [
          { label: '🚦 AI Traffic Seven',   href: '/tools/ai-traffic-seven' },
          { label: '📋 Governance-Kurzlage', href: '/tools/governance-kurzlage' },
        ],
        desc:     'Schnelle Ersteinschätzung: Wo stehen Sie heute bei KI-Risiko, Pflichten und Use-Cases?',
        cta:      'Governance-Kurzlage anfordern →',
      },
      {
        number:   '02',
        stage:    'struktur_aufbauen',
        title:    'Struktur schaffen',
        products: [
          { label: '⚖️ EU AI Act Navigator',        href: '/tools/eu-ai-act-navigator' },
          { label: '🛡️ AI Safe Policy Generator', href: '/tools/ai-safe-policy-generator' },
        ],
        desc:     'Pflichten, Rollen und Policies strukturiert aufsetzen – EU-AI-Act-ready.',
        cta:      'Struktur aufbauen →',
      },
      {
        number:   '03',
        stage:    'umsetzung_starten',
        title:    'Umsetzung & Wirkung',
        products: [
          { label: '🧠 K² Kausale Kompetenz', href: '/tools/k2-kausale-kompetenz' },
          { label: '📊 KI ROI Rechner',        href: '/tools/ki-roi-rechner' },
        ],
        desc:     'Board-Readiness, Causal Literacy und Business Case der KI-Agenten messbar machen.',
        cta:      'Umsetzung starten →',
      },
    ],
    stageLabels: {
      'ersteinschaetzung': 'Schritt 1 — Ersteinschätzung',
      'struktur_aufbauen': 'Schritt 2 — Struktur schaffen',
      'umsetzung_starten': 'Schritt 3 — Umsetzung & Wirkung',
    } as Record<string, string>,
    stageBadgePrefix: 'Ihr Einstieg:',
    controlsHint:   '🔐 GPT Vault — Versionierung & Audit-Trail für Custom GPTs →',
    controlsHintUrl: 'https://gpt-vault-theta.vercel.app/',
    leadTitle:      'Governance-Kurzlage: Ihr Lagebild in 5 Minuten',
    leadSub:        'Teilen Sie uns kurz Ihre Situation mit. Wir melden uns mit einem kompakten Lagebild zu Ihrer KI-Risikoklasse, den regulatorischen Pflichten und dem empfohlenen nächsten Schritt.',
    labelName:      'Name *',
    labelEmail:     'E-Mail *',
    labelCompany:   'Unternehmen',
    labelRole:      'Rolle / Funktion',
    labelMessage:   'Ihre Situation (optional)',
    labelBriefing:  'Ich möchte Informationen zu weiteren Governance-Angeboten erhalten',
    submitBtn:      'Governance-Kurzlage anfordern →',
    loadingBtn:     'Wird gesendet…',
    successTitle:   'Anfrage eingegangen!',
    successText:    'Vielen Dank. Wir melden uns in Kürze mit Ihrem Lagebild und den nächsten Schritten.',
    successCallHint: 'Möchten Sie direkt einen Termin vereinbaren?',
    bookCallBtn:    'Erstgespräch buchen →',
    errorGeneral:   'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    footerSub:      '🔒 Sichere Zahlung via Stripe · Rechnung per E-Mail',
  },
  en: {
    eyebrow:        'AI Governance · Agent Control · Decision Confidence',
    title:          'When agents act, it\'s no longer just AI – it\'s operational risk.',
    sub:            'Strategic partner for boards and C-level: AI governance that protects, enables accountability and creates decision confidence in regulatory obligations.',
    heroCta:        'In 5 Minutes: Assess Your AI Risk & Obligations →',
    trustLine:      'No registration · Instant start · Board-ready output',
    heroBullets: [
      'Risk class & obligations under the EU AI Act in plain language',
      'Governance gaps in a compact situation report',
      'Concrete next step for CISO/board briefing',
    ],
    principleTitle: 'Responsibility cannot be delegated. Control can.',
    principleSub:   'Policy, approval process, tool access, logging, incident path.',
    agentsTitle:    'Why Agents Are Different',
    agents:         [
      'They execute actions (APIs, systems, data) – not just text.',
      'They create chain effects (sub-agents, tool-chains, automations).',
      'Control requires guardrails: roles, rights, logging, approval, kill-switch.',
    ],
    problemsTitle:  'The Problem',
    problems:       ['AI/agent decisions without control framework','Responsibilities not auditable – no evidence','Regulatory obligations unclear or not implemented'],
    systemTitle:    'The System',
    system:         ['Risk class + control plan in 5 min.','Roles, rights, logging, approvals – structured','EU AI Act Navigator – compliance evidence ready'],
    outcomesTitle:  'The Result',
    outcomes:       ['Auditable governance output for board & CISO','Demonstrable control where responsibility can\'t be delegated','Board-ready report: risk class, control path, measures'],
    trustRole:      'Dr. DirKInstitute · AI Consulting & Governance',
    trustDesc:      'I help executives make AI decisions legally sound and operationally defensible – strategic perspective, no technology focus',
    staircaseTitle: 'Your Governance Journey in 3 Steps',
    steps: [
      {
        number:   '01',
        stage:    'ersteinschaetzung',
        title:    'Initial Assessment',
        products: [
          { label: '🚦 AI Traffic Seven',   href: '/tools/ai-traffic-seven' },
          { label: '📋 Governance Brief',    href: '/tools/governance-kurzlage' },
        ],
        desc:     'Initial assessment: where do you stand today on AI risk, obligations and use cases?',
        cta:      'Request Governance Brief →',
      },
      {
        number:   '02',
        stage:    'struktur_aufbauen',
        title:    'Build Structure',
        products: [
          { label: '⚖️ EU AI Act Navigator',        href: '/tools/eu-ai-act-navigator' },
          { label: '🛡️ AI Safe Policy Generator', href: '/tools/ai-safe-policy-generator' },
        ],
        desc:     'Set up obligations, roles and policies in a structured way – EU AI Act ready.',
        cta:      'Build structure →',
      },
      {
        number:   '03',
        stage:    'umsetzung_starten',
        title:    'Implementation & Impact',
        products: [
          { label: '🧠 K² Causal Competence', href: '/tools/k2-kausale-kompetenz' },
          { label: '📊 AI ROI Calculator',     href: '/tools/ki-roi-rechner' },
        ],
        desc:     'Make board-readiness, causal literacy and the business case for AI agents measurable.',
        cta:      'Start implementation →',
      },
    ],
    stageLabels: {
      'ersteinschaetzung': 'Step 1 — Initial Assessment',
      'struktur_aufbauen': 'Step 2 — Build Structure',
      'umsetzung_starten': 'Step 3 — Implementation & Impact',
    } as Record<string, string>,
    stageBadgePrefix: 'Your entry point:',
    controlsHint:   '🔐 GPT Vault — Versioning & audit trail for Custom GPTs →',
    controlsHintUrl: 'https://gpt-vault-theta.vercel.app/',
    leadTitle:      'Governance Brief: Your Situation in 5 Minutes',
    leadSub:        'Share a brief description of your situation. We will respond with a compact overview of your AI risk class, regulatory obligations and the recommended next step.',
    labelName:      'Name *',
    labelEmail:     'Email *',
    labelCompany:   'Company',
    labelRole:      'Role / Function',
    labelMessage:   'Your situation (optional)',
    labelBriefing:  'I would like to receive information about further governance offerings',
    submitBtn:      'Request Governance Brief →',
    loadingBtn:     'Sending…',
    successTitle:   'Request received!',
    successText:    'Thank you. We will be in touch shortly with your situational assessment and next steps.',
    successCallHint: 'Would you like to schedule a call directly?',
    bookCallBtn:    'Book an initial call →',
    errorGeneral:   'Something went wrong. Please try again.',
    footerSub:      '🔒 Secure payment via Stripe · Invoice by email',
  },
}

// ── Lead-Formular-State ────────────────────────────────────────────────────
type FormState = 'idle' | 'loading' | 'success' | 'error'

// ── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<'de' | 'en'>('de')
  const t = T[lang]

  // Lead-Form State
  const [formState,    setFormState]    = useState<FormState>('idle')
  const [errorMsg,     setErrorMsg]     = useState('')
  const [journeyStage, setJourneyStage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name:                '',
    email:               '',
    company:             '',
    role:                '',
    message:             '',
    wants_briefing_info: false,
  })

  function setField(key: keyof typeof form, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/governance/lead', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:                form.name,
          email:               form.email,
          company:             form.company  || undefined,
          role:                form.role     || undefined,
          message:             form.message  || undefined,
          wants_briefing_info: form.wants_briefing_info,
          journey_stage:       journeyStage  || undefined,
          lang,
        }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setFormState('success')
      } else {
        const msg = data.error === 'email_invalid' ? (lang === 'de' ? 'Bitte eine gültige E-Mail-Adresse eingeben.' : 'Please enter a valid email address.')
                  : data.error === 'name_required'  ? (lang === 'de' ? 'Bitte Name eingeben.' : 'Please enter your name.')
                  : t.errorGeneral
        setErrorMsg(msg)
        setFormState('error')
      }
    } catch {
      setErrorMsg(t.errorGeneral)
      setFormState('error')
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Header Bar ── */}
      <header className={styles.headerBar}>
        <div className={styles.headerLogoWrap}>
          <Image
            src="/kn-logo.png"
            alt="K&N EDV-Konzepte"
            width={150}
            height={38}
            className={styles.headerLogoLeft}
            priority
          />
        </div>

        <div className={styles.headerCenter}>
          <span className={styles.headerBrandName}>Dr. DirkInstitute</span>
          <span className={styles.headerBrandSub}>Board Risk &amp; AI Governance</span>
        </div>

        <div className={styles.langToggle}>
          <button
            className={`${styles.langBtn} ${lang === 'de' ? styles.langBtnActive : ''}`}
            onClick={() => setLang('de')}
          >DE</button>
          <button
            className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => setLang('en')}
          >EN</button>
        </div>

        <div className={styles.headerLogoWrap}>
          <Image
            src="/logo-dirk.jpg"
            alt="Dr. DirKInstitute"
            width={110}
            height={38}
            className={styles.headerLogoRight}
            priority
          />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>{t.eyebrow}</p>
            <h1 className={styles.heroTitle}>{t.title}</h1>
            <p className={styles.heroSub}>{t.sub}</p>
            <ul className={styles.heroBullets}>
              {t.heroBullets.map((b) => (
                <li key={b} className={styles.heroBullet}>
                  <span className={styles.heroBulletCheck}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <a href="/realitaetscheck/" className={styles.heroCta}>
              {t.heroCta}
            </a>
            <p className={styles.heroTrust}>{t.trustLine}</p>
          </div>
          <div className={styles.heroPortrait}>
            <Image
              src="/dirk-portrait.jpg"
              alt="Dr. Dirk Kötting"
              width={320}
              height={420}
              className={styles.heroPortraitImg}
              priority
            />
            <div className={styles.heroPortraitCaption}>
              <span className={styles.heroPortraitName}>Dr. Dirk Kötting</span>
              <span className={styles.heroPortraitSlogan}>{t.trustRole}</span>
              <p className={styles.heroPortraitDesc} style={{whiteSpace:'pre-line'}}>{t.trustDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prinzip-Banner ── */}
      <section className={styles.principle}>
        <h2 className={styles.principleTitle}>{t.principleTitle}</h2>
        <p className={styles.principleSub}>{t.principleSub}</p>
      </section>

      {/* ── Agenten-Block ── */}
      <section className={styles.agentsSection}>
        <h2 className={styles.agentsSectionTitle}>{t.agentsTitle}</h2>
        <ul className={styles.agentsList}>
          {t.agents.map((a) => (
            <li key={a}><span className={styles.agentsBullet}>⚡</span>{a}</li>
          ))}
        </ul>
      </section>

      {/* ── 3 Blocks: Problem / System / Ergebnis ── */}
      <section className={styles.blocks}>
        <div className={styles.block}>
          <div className={styles.blockIcon}>⚠️</div>
          <h2 className={styles.blockTitle}>{t.problemsTitle}</h2>
          <ul className={styles.blockList}>
            {t.problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <div className={`${styles.block} ${styles.blockCenter}`}>
          <div className={styles.blockIcon}>🧭</div>
          <h2 className={styles.blockTitle}>{t.systemTitle}</h2>
          <ul className={styles.blockList}>
            {t.system.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div className={styles.block}>
          <div className={styles.blockIcon}>✅</div>
          <h2 className={styles.blockTitle}>{t.outcomesTitle}</h2>
          <ul className={styles.blockList}>
            {t.outcomes.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      {/* ── Produkttreppe ── */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>{t.staircaseTitle}</h2>
        <div className={styles.staircase}>
          {t.steps.map((step) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <div className={styles.stepProducts}>
                  {step.products.map((p) => (
                    <a key={p.label} href={p.href} className={styles.stepProductTag}>
                      {p.label}
                    </a>
                  ))}
                </div>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
              <div className={styles.stepCtaWrap}>
                <a
                  href="#governance-kurzlage"
                  className={styles.stepCta}
                  onClick={() => setJourneyStage(step.stage)}
                >
                  {step.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* GPT Vault Controls-Hinweis */}
        <a
          href={t.controlsHintUrl}
          className={styles.controlsHint}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.controlsHint}
        </a>
      </main>

      {/* ── Lead-Form: Governance-Kurzlage ── */}
      <section id="governance-kurzlage" className={styles.leadSection}>
        <div className={styles.leadInner}>
          <h2 className={styles.leadTitle}>{t.leadTitle}</h2>
          <p className={styles.leadSub}>{t.leadSub}</p>

          {formState === 'success' ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>{t.successTitle}</h3>
              <p className={styles.successText}>{t.successText}</p>
              <div className={styles.successCallWrap}>
                <p className={styles.successCallHint}>{t.successCallHint}</p>
                <a
                  href="https://terminbuchung-ten.vercel.app/"
                  className={styles.successCallBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.bookCallBtn}
                </a>
              </div>
            </div>
          ) : (
            <form className={styles.leadForm} onSubmit={handleLeadSubmit} noValidate>
              {journeyStage && (
                <div className={styles.stageBadge}>
                  <span className={styles.stageBadgePrefix}>{t.stageBadgePrefix}</span>
                  <span className={styles.stageBadgeLabel}>{t.stageLabels[journeyStage]}</span>
                </div>
              )}
              <div className={styles.leadRow}>
                <label className={styles.leadLabel}>
                  {t.labelName}
                  <input
                    required
                    type="text"
                    className={styles.leadInput}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Dr. Max Mustermann"
                    disabled={formState === 'loading'}
                  />
                </label>
                <label className={styles.leadLabel}>
                  {t.labelEmail}
                  <input
                    required
                    type="email"
                    className={styles.leadInput}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="max@beispiel.de"
                    disabled={formState === 'loading'}
                  />
                </label>
              </div>

              <div className={styles.leadRow}>
                <label className={styles.leadLabel}>
                  {t.labelCompany}
                  <input
                    type="text"
                    className={styles.leadInput}
                    value={form.company}
                    onChange={(e) => setField('company', e.target.value)}
                    placeholder="Musterfirma GmbH"
                    disabled={formState === 'loading'}
                  />
                </label>
                <label className={styles.leadLabel}>
                  {t.labelRole}
                  <input
                    type="text"
                    className={styles.leadInput}
                    value={form.role}
                    onChange={(e) => setField('role', e.target.value)}
                    placeholder="CISO / CTO / Geschäftsführung"
                    disabled={formState === 'loading'}
                  />
                </label>
              </div>

              <label className={styles.leadLabel}>
                {t.labelMessage}
                <textarea
                  className={`${styles.leadInput} ${styles.leadTextarea}`}
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  placeholder={lang === 'de'
                    ? 'Kurze Beschreibung Ihrer KI-Situation, offener Fragen oder Use-Cases…'
                    : 'Brief description of your AI situation, open questions or use cases…'}
                  rows={4}
                  disabled={formState === 'loading'}
                />
              </label>

              <label className={styles.leadCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.leadCheckbox}
                  checked={form.wants_briefing_info}
                  onChange={(e) => setField('wants_briefing_info', e.target.checked)}
                  disabled={formState === 'loading'}
                />
                <span>{t.labelBriefing}</span>
              </label>

              {formState === 'error' && (
                <p className={styles.leadError}>{errorMsg}</p>
              )}

              <button
                type="submit"
                className={styles.leadSubmit}
                disabled={formState === 'loading'}
              >
                {formState === 'loading' ? t.loadingBtn : t.submitBtn}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · 83646 Bad Tölz · dkoetting@edvkonzepte.de</p>
        <p className={styles.footerSub}>{t.footerSub}</p>
      </footer>

    </div>
  )
}
