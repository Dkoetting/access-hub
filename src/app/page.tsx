'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAvailableApps } from '@/lib/apps'
import styles from './landing.module.css'

const APP_ICONS: Record<string, string> = {
  'k-kausale-kompetenz-test': '🧠',
  'ki-roi-rechner':           '📊',
  'ai-traffic-seven':         '🚦',
  'eu-ai-act-navigator':      '⚖️',
  'be-ai-safe':               '🛡️',
  'gpt-vault':                '🔐',
}

function fmt(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

const T = {
  de: {
    eyebrow:        'KI Governance · Agenten-Kontrolle · Entscheidungssicherheit',
    title:          'Wenn Agenten handeln, ist es nicht mehr nur KI – es ist operatives Risiko.',
    sub:            'Wir machen KI- und Agenten-Einsatz prüfbar: Risikoklasse, Pflichten, Kontrollen, Verantwortlichkeiten – in einem klaren Governance-Output.',
    cta:            'Governance-Kurzlage erhalten (5 Min.) →',
    trustLine:      'Keine Registrierung · Sofortiger Start · Board-taugliches Ergebnis',
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
    trustDesc:      'Ich begleite Führungskräfte dabei, KI-Entscheidungen rechtssicher und operativ belastbar zu machen – ohne Technologiefokus, mit strategischem Blick',
    toolsTitle:     'Governance-Tools',
    toolsSub:       'Jedes Tool liefert einen konkreten Governance-Output – einzeln nutzbar, gemeinsam wirkungsvoll.',
    controlsTitle:  'Controls & Tooling',
    controlsSub:    'Operativer Kontrollbaustein für nachweisbare Agent-Governance.',
    badge:          'Einmalige Nutzung',
    badgeExternal:  'Eigene Plattform',
    buyBtn:         'Jetzt kaufen →',
    toApp:          'Zur App →',
    footerSub:      '🔒 Sichere Zahlung via Stripe · Rechnung per E-Mail',
    vatLabel:       'zzgl. 19\u00a0% MwSt.',
  },
  en: {
    eyebrow:        'AI Governance · Agent Control · Decision Confidence',
    title:          'When agents act, it\'s no longer just AI – it\'s operational risk.',
    sub:            'We make AI and agent deployment auditable: risk class, obligations, controls, responsibilities – in a clear governance output.',
    cta:            'Get Governance Brief (5 min.) →',
    trustLine:      'No registration · Instant start · Board-ready output',
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
    toolsTitle:     'Governance Tools',
    toolsSub:       'Each tool delivers a concrete governance output – usable individually, powerful together.',
    controlsTitle:  'Controls & Tooling',
    controlsSub:    'Operational control component for demonstrable agent governance.',
    badge:          'Single use',
    badgeExternal:  'Own Platform',
    buyBtn:         'Buy now →',
    toApp:          'To App →',
    footerSub:      '🔒 Secure payment via Stripe · Invoice by email',
    vatLabel:       'excl. 19\u00a0% VAT',
  },
}

export default function Home() {
  const [lang, setLang] = useState<'de' | 'en'>('de')
  const t = T[lang]
  const apps = getAvailableApps()

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

        {/* DE/EN Toggle */}
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
            <a href="/realitaetscheck/" className={styles.heroCta}>{t.cta}</a>
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
              <p className={styles.heroPortraitDesc}>{t.trustDesc}</p>
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
          {t.agents.map((a) => <li key={a}><span className={styles.agentsBullet}>⚡</span>{a}</li>)}
        </ul>
      </section>

      {/* ── 3 Blocks ── */}
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

      {/* ── Governance Tools ── */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>{t.toolsTitle}</h2>
        <p className={styles.sectionSub}>{t.toolsSub}</p>
        <div className={styles.grid}>
          {apps.filter(app => app.id !== 'gpt-vault').map((app) => {
            const netCents   = app.oneTimePriceCents
            const vatCents   = Math.round(netCents * 0.19)
            const grossCents = netCents + vatCents
            const isRedirect = !!app.redirectUrl
            return (
              <div key={app.id} className={styles.card}>
                <div className={styles.cardIcon}>{APP_ICONS[app.id] ?? '🤖'}</div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{lang === 'en' ? (app.name_en ?? app.name) : app.name}</h3>
                  <p className={styles.cardDesc}>{lang === 'en' ? (app.description_en ?? app.description) : app.description}</p>
                  <div className={styles.badgeRow}>
                    {app.maxUses === 1 && <span className={styles.badge}>{t.badge}</span>}
                    {isRedirect && <span className={styles.badgeExternal}>{t.badgeExternal}</span>}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  {!isRedirect && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceGross}>{fmt(grossCents)}</span>
                      <span className={styles.priceNet}>({fmt(netCents)} {t.vatLabel})</span>
                    </div>
                  )}
                  {isRedirect ? (
                    <a href={app.redirectUrl!} className={styles.buyBtnSecondary} target="_blank" rel="noopener noreferrer">{t.toApp}</a>
                  ) : (
                    <Link href={`/checkout?app=${app.id}`} className={styles.buyBtn}>{t.buyBtn}</Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ── Controls & Tooling (GPT Vault) ── */}
      {apps.filter(app => app.id === 'gpt-vault').map((app) => {
        const netCents   = app.oneTimePriceCents
        const vatCents   = Math.round(netCents * 0.19)
        const grossCents = netCents + vatCents
        return (
          <section key={app.id} className={styles.controlsSection}>
            <h2 className={styles.sectionTitle}>{t.controlsTitle}</h2>
            <p className={styles.sectionSub}>{t.controlsSub}</p>
            <div className={styles.controlsCard}>
              <div className={styles.cardIcon}>🔐</div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>
                  {lang === 'de'
                    ? 'Agent Control Vault – Versionierung & Audit-Trail für Custom GPTs'
                    : 'Agent Control Vault – Versioning & Audit Trail for Custom GPTs'}
                </h3>
                <p className={styles.cardDesc}>
                  {lang === 'de'
                    ? 'Sichert Custom GPTs und Projekte aus ChatGPT lokal – inkl. Beschreibung, dedizierter JSON-Datei und lokalem Repository. So bleiben Ihre KI-Agenten versioniert, nachvollziehbar und unabhängig von der ChatGPT-Plattform. Ab 4,90 €.'
                    : 'Saves Custom GPTs and Projects from ChatGPT locally – including description, dedicated JSON file and local repository. Keeps your AI agents versioned, traceable and independent of the ChatGPT platform. From €4.90.'}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceGross}>{fmt(grossCents)}</span>
                  <span className={styles.priceNet}>({fmt(netCents)} {t.vatLabel})</span>
                </div>
                <Link href={`/checkout?app=${app.id}`} className={styles.buyBtnSecondary}>{t.buyBtn}</Link>
              </div>
            </div>
          </section>
        )
      })}

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · 83646 Bad Tölz · dkoetting@edvkonzepte.de</p>
        <p className={styles.footerSub}>{t.footerSub}</p>
      </footer>

    </div>
  )
}
