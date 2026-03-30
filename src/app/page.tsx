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
    eyebrow:      'KI Governance · Entscheidungssicherheit',
    title:        'KI ist aktuell das größte unkontrollierte Risiko in Ihrem Unternehmen.',
    sub:          'Wir machen KI-Entscheidungen in 5 Minuten belastbar – rechtlich und operativ.',
    cta:          'KI-Governance-Status prüfen →',
    trustLine:    'Keine Registrierung · Sofortiger Start · Ergebnis in 5 Minuten',
    problemsTitle:'Das Problem',
    problems:     ['KI-Entscheidungen ohne Risikoprüfung','Regulatorische Pflichten unklar','Investitionen ohne belastbare Grundlage'],
    systemTitle:  'Das System',
    system:       ['300-Sekunden-Regel: Entscheidungen in 5 Min.','AI Safe Policies – maßgeschneidert & sofort einsetzbar','EU AI Act Navigator – Risikoklasse & Compliance-Check'],
    outcomesTitle:'Das Ergebnis',
    outcomes:     ['Klare, belastbare KI-Entscheidungen','Regulatorische Risiken sichtbar & kontrollierbar','Schnelleres Handeln mit sicherem Fundament'],
    trustRole:    'Dr. DirKInstitute · KI-Beratung & Governance',
    trustDesc:    'Ich begleite Führungskräfte dabei, KI-Entscheidungen rechtssicher und operativ belastbar zu machen – ohne Technologiefokus, mit strategischem Blick.',
    toolsTitle:   'Die Werkzeuge dahinter',
    toolsSub:     'Jedes Tool ist Teil des Frameworks – einzeln nutzbar, gemeinsam wirkungsvoll.',
    badge:        'Einmalige Nutzung',
    badgeExternal:'Eigene Plattform',
    buyBtn:       'Jetzt kaufen →',
    toApp:        'Zur App →',
    footerSub:    '🔒 Sichere Zahlung via Stripe · Rechnung per E-Mail',
    vatLabel:     'zzgl. 19\u00a0% MwSt.',
  },
  en: {
    eyebrow:      'AI Governance · Decision Confidence',
    title:        'AI is currently the largest uncontrolled risk in your organization.',
    sub:          'We make AI decisions audit-proof in 5 minutes – legally and operationally.',
    cta:          'Check AI Governance Status →',
    trustLine:    'No registration · Instant start · Results in 5 minutes',
    problemsTitle:'The Problem',
    problems:     ['AI decisions without risk assessment','Regulatory obligations unclear','Investments without solid foundation'],
    systemTitle:  'The System',
    system:       ['300-Second Rule: Decisions in 5 min.','AI Safe Policies – tailored & ready to deploy','EU AI Act Navigator – Risk class & compliance check'],
    outcomesTitle:'The Result',
    outcomes:     ['Clear, defensible AI decisions','Regulatory risks visible & controlled','Faster action on a secure foundation'],
    trustRole:    'Dr. DirKInstitute · AI Consulting & Governance',
    trustDesc:    'I help executives make AI decisions legally sound and operationally defensible – strategic perspective, no technology focus.',
    toolsTitle:   'The Tools Behind It',
    toolsSub:     'Each tool is part of the framework – usable individually, powerful together.',
    badge:        'Single use',
    badgeExternal:'Own Platform',
    buyBtn:       'Buy now →',
    toApp:        'To App →',
    footerSub:    '🔒 Secure payment via Stripe · Invoice by email',
    vatLabel:     'excl. 19\u00a0% VAT',
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
              width={260}
              height={320}
              className={styles.heroPortraitImg}
              priority
            />
            <div className={styles.heroPortraitCaption}>
              <span className={styles.heroPortraitName}>Dr. Dirk Kötting</span>
              <span className={styles.heroPortraitSlogan}>
                {lang === 'de' ? 'Rechtssicher · Strategisch · Praxisnah' : 'Legally sound · Strategic · Practical'}
              </span>
            </div>
          </div>
        </div>
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

      {/* ── Trust ── */}
      <section className={styles.trust}>
        <div className={styles.trustInner}>
          <Image
            src="/dirk-photo.jpg"
            alt="Dr. Dirk Kötting"
            width={80}
            height={80}
            className={styles.trustPhoto}
          />
          <div className={styles.trustText}>
            <strong className={styles.trustName}>Dr. Dirk Kötting</strong>
            <span className={styles.trustRole}>{t.trustRole}</span>
            <p className={styles.trustDesc}>{t.trustDesc}</p>
          </div>
        </div>
      </section>

      {/* ── Tools (secondary) ── */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>{t.toolsTitle}</h2>
        <p className={styles.sectionSub}>{t.toolsSub}</p>
        <div className={styles.grid}>
          {apps.map((app) => {
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
                    {app.maxUses === 1 && (
                      <span className={styles.badge}>{t.badge}</span>
                    )}
                    {isRedirect && (
                      <span className={styles.badgeExternal}>{t.badgeExternal}</span>
                    )}
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
                    <a href={app.redirectUrl!} className={styles.buyBtnSecondary} target="_blank" rel="noopener noreferrer">
                      {t.toApp}
                    </a>
                  ) : (
                    <Link href={`/checkout?app=${app.id}`} className={styles.buyBtn}>
                      {t.buyBtn}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · 83646 Bad Tölz · dkoetting@edvkonzepte.de</p>
        <p className={styles.footerSub}>{t.footerSub}</p>
      </footer>

    </div>
  )
}
