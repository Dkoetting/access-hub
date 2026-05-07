import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'AI Safe Policy Generator · Dr. DirkInstitute',
  description: 'Klare KI-Policies in Stunden statt Wochen – freigabereif, rechtssicher, DSGVO- und EU AI Act-konform.',
}

export default function AiSafePolicyGeneratorPage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>🛡️</span>
        <span className={styles.toolStepBadge}>Schritt 2 — Struktur schaffen</span>
        <h1 className={styles.toolTitle}>AI Safe Policy Generator</h1>
        <p className={styles.toolTagline}>
          Klare KI-Policies in Stunden statt Wochen – freigabereif, rechtssicher,
          DSGVO- und EU AI Act-konform. Verantwortung beginnt mit klaren Regeln.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Maßgeschneiderte KI-Nutzungsrichtlinie für Ihr Unternehmen – angepasst an Branche, Größe und Use-Cases',
            'Rollen, Rechte und Freigabeprozesse strukturiert definiert und dokumentiert',
            'Tool-Zugriffs-Matrix, Logging-Anforderungen und Incident-Pfad klar geregelt',
            'DSGVO- und EU AI Act-konforme Policy-Vorlage – direkt verwendbar, freigabereif',
          ].map((b) => (
            <li key={b} className={styles.benefit}>
              <span className={styles.benefitCheck}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Für wen ist das?</h2>
        <ul className={styles.targets}>
          {[
            'Unternehmen, die erstmalig eine KI-Nutzungsrichtlinie einführen und den Wildwuchs beenden wollen',
            'HR- und Compliance-Teams, die KI-Policies unternehmensweit standardisieren und durchsetzen müssen',
            'Führungskräfte, die Verantwortlichkeiten im KI-Einsatz klar regeln und Haftungsrisiken minimieren wollen',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>KI-Policy strukturiert aufbauen</h2>
        <p className={styles.ctaSub}>
          Teilen Sie uns Ihre Ausgangssituation mit – wir begleiten Sie beim Aufbau klarer KI-Governance-Strukturen.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Struktur aufbauen →
        </a>
      </div>
    </ToolShell>
  )
}
