import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'Governance-Kurzlage · Dr. DirkInstitute',
  description: 'Ihr KI-Lagebild in 5 Minuten – kompakt, board-tauglich und handlungsleitend. Risikoklasse, Pflichten, Governance-Gaps.',
}

export default function GovernanceKurzlagePage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>📋</span>
        <span className={styles.toolStepBadge}>Schritt 1 — Ersteinschätzung</span>
        <h1 className={styles.toolTitle}>Governance-Kurzlage</h1>
        <p className={styles.toolTagline}>
          Ihr KI-Lagebild in 5 Minuten – kompakt, board-tauglich, handlungsleitend.
          Risikoklasse, regulatorische Pflichten und Governance-Gaps auf einen Blick.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Einschätzung Ihrer aktuellen KI-Risikoklasse nach EU AI Act in Klartext – ohne Juristendeutsch',
            'Identifikation kritischer Governance-Lücken: Was fehlt, was dringend ist, was wartet',
            'Konkrete Handlungsempfehlungen für CISO, CFO und Board für den nächsten 90-Tage-Horizont',
            'Board-tauglicher Report-Entwurf – direkt verwendbar für Vorstands- oder Aufsichtsratssitzung',
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
            'Führungskräfte, die erstmalig ihre KI-Governance-Situation strukturiert einschätzen lassen wollen',
            'Unternehmen, die ein Board-Meeting zu KI-Themen vorbereiten und belastbare Grundlagen benötigen',
            'Vorstände mit Haftungsbewusstsein: Wer haftet, wenn KI-Entscheidungen nicht nachweisbar gesteuert werden?',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Governance-Kurzlage jetzt anfordern</h2>
        <p className={styles.ctaSub}>
          Teilen Sie uns kurz Ihre Situation mit. Wir melden uns mit Ihrem persönlichen Lagebild.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Kurzlage anfordern →
        </a>
      </div>
    </ToolShell>
  )
}
