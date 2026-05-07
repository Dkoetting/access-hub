import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'AI Traffic Seven · Dr. DirkInstitute',
  description: 'Sieben Dimensionen. Eine Ampel. Sofortiger Überblick über Ihren KI-Reifegrad – board-tauglich und handlungsleitend.',
}

export default function AiTrafficSevenPage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>🚦</span>
        <span className={styles.toolStepBadge}>Schritt 1 — Ersteinschätzung</span>
        <h1 className={styles.toolTitle}>AI Traffic Seven</h1>
        <p className={styles.toolTagline}>
          Sieben Dimensionen. Eine Ampel. Sofortiger Überblick über Ihren KI-Reifegrad –
          board-tauglich, handlungsleitend, ohne Technikfokus.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Reifegrad-Einschätzung in 7 KI-Governance-Dimensionen: Strategie, Risiko, Daten, Mensch, Recht, Technik, Kontrolle',
            'Ampel-Visualisierung (Rot / Gelb / Grün) je Dimension – auf einen Blick erkennbar',
            'Priorisierter Report mit den dringlichsten Handlungsfeldern für CISO und Board',
            'Solide Grundlage für die Governance-Kurzlage und erste regulatorische Einordnung',
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
            'Vorstände und Geschäftsführung, die schnell und ohne Technologie-Vorkenntnisse wissen wollen, wo sie stehen',
            'CISOs und Compliance-Verantwortliche, die eine strukturierte Ausgangsbasis für ihre Governance-Initiative benötigen',
            'Unternehmen, die KI erstmals einsetzen oder ihren bestehenden Einsatz erstmals bewerten wollen',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Jetzt Governance-Kurzlage anfordern</h2>
        <p className={styles.ctaSub}>
          Teilen Sie uns kurz Ihre Situation mit – wir erstellen Ihr persönliches Lagebild inkl. AI Traffic Seven Einschätzung.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Ersteinschätzung anfordern →
        </a>
      </div>
    </ToolShell>
  )
}
