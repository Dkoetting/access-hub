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

const PROBLEMS = [
  'KI-Entscheidungen ohne Risikoprüfung',
  'Regulatorische Pflichten unklar',
  'Investitionen ohne belastbare Grundlage',
]

const SYSTEM = [
  '300-Sekunden-Regel: Entscheidungen in 5 Min.',
  'AI Safe Policies – maßgeschneidert & sofort einsetzbar',
  'EU AI Act Navigator – Risikoklasse & Compliance-Check',
]

const OUTCOMES = [
  'Klare, belastbare KI-Entscheidungen',
  'Regulatorische Risiken sichtbar & kontrollierbar',
  'Schnelleres Handeln mit sicherem Fundament',
]

export default function Home() {
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
        <p className={styles.heroEyebrow}>KI Governance · Entscheidungssicherheit</p>
        <h1 className={styles.heroTitle}>
          KI ist aktuell das größte unkontrollierte Risiko in Ihrem Unternehmen.
        </h1>
        <p className={styles.heroSub}>
          Wir machen KI-Entscheidungen in 5 Minuten belastbar – rechtlich und operativ.
        </p>
        <a
          href="/realitaetscheck/"
          className={styles.heroCta}
        >
          KI-Governance-Status prüfen →
        </a>
        <p className={styles.heroTrust}>
          Keine Registrierung · Sofortiger Start · Ergebnis in 5 Minuten
        </p>
      </section>

      {/* ── 3 Blocks ── */}
      <section className={styles.blocks}>
        <div className={styles.block}>
          <div className={styles.blockIcon}>⚠️</div>
          <h2 className={styles.blockTitle}>Das Problem</h2>
          <ul className={styles.blockList}>
            {PROBLEMS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className={`${styles.block} ${styles.blockCenter}`}>
          <div className={styles.blockIcon}>🧭</div>
          <h2 className={styles.blockTitle}>Das System</h2>
          <ul className={styles.blockList}>
            {SYSTEM.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className={styles.block}>
          <div className={styles.blockIcon}>✅</div>
          <h2 className={styles.blockTitle}>Das Ergebnis</h2>
          <ul className={styles.blockList}>
            {OUTCOMES.map((o) => (
              <li key={o}>{o}</li>
            ))}
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
            <span className={styles.trustRole}>Dr. DirKInstitute · KI-Beratung & Governance</span>
            <p className={styles.trustDesc}>
              Ich begleite Führungskräfte dabei, KI-Entscheidungen rechtssicher und operativ
              belastbar zu machen – ohne Technologiefokus, mit strategischem Blick.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tools (secondary) ── */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Die Werkzeuge dahinter</h2>
        <p className={styles.sectionSub}>
          Jedes Tool ist Teil des Frameworks – einzeln nutzbar, gemeinsam wirkungsvoll.
        </p>
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
                  <h3 className={styles.cardTitle}>{app.name}</h3>
                  <p className={styles.cardDesc}>{app.description}</p>
                  <div className={styles.badgeRow}>
                    {app.maxUses === 1 && (
                      <span className={styles.badge}>Einmalige Nutzung</span>
                    )}
                    {isRedirect && (
                      <span className={styles.badgeExternal}>Eigene Plattform</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  {!isRedirect && (
                    <div className={styles.priceBlock}>
                      <span className={styles.priceGross}>{fmt(grossCents)}</span>
                      <span className={styles.priceNet}>({fmt(netCents)} zzgl. 19&nbsp;% MwSt.)</span>
                    </div>
                  )}
                  {isRedirect ? (
                    <a href={app.redirectUrl!} className={styles.buyBtnSecondary} target="_blank" rel="noopener noreferrer">
                      Zur App →
                    </a>
                  ) : (
                    <Link href={`/checkout?app=${app.id}`} className={styles.buyBtn}>
                      Jetzt kaufen →
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
        <p className={styles.footerSub}>🔒 Sichere Zahlung via Stripe · Rechnung per E-Mail</p>
      </footer>

    </div>
  )
}
