import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'EU AI Act Navigator · Dr. DirkInstitute',
  description: 'Compliance-Nachweis statt Regulierungs-Rätsel – strukturiert, prüfbar, entlastend. EU AI Act Pflichten für Ihr Unternehmen.',
}

export default function EuAiActNavigatorPage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>⚖️</span>
        <span className={styles.toolStepBadge}>Schritt 2 — Struktur schaffen</span>
        <h1 className={styles.toolTitle}>EU AI Act Navigator</h1>
        <p className={styles.toolTagline}>
          Compliance-Nachweis statt Regulierungs-Rätsel – strukturiert, prüfbar, entlastend.
          Wissen Sie, welche Pflichten für Ihre KI-Systeme gelten?
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Einordnung Ihrer KI-Systeme in die EU AI Act Risikoklassen – Prohibited, High-Risk, Limited Risk, Minimal Risk',
            'Klare Darstellung aller geltenden Pflichten je Use-Case: Dokumentation, Transparenz, menschliche Aufsicht, Registrierung',
            'Compliance-Checkliste für Dokumentation und Governance – audit-ready für Aufsichtsbehörden',
            'Prüfbarer Compliance-Nachweis als Entlastungsdokument für Vorstand und Aufsichtsrat',
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
            'Compliance- und Rechtsverantwortliche, die EU AI Act-Pflichten strukturiert erfassen und dokumentieren müssen',
            'CISOs und CDOs mit regulatorischer Verantwortung in Hochrisikobereichen',
            'Unternehmen in regulierten Sektoren: Finanzen, Gesundheit, Personalwesen, kritische Infrastruktur',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>EU AI Act Compliance strukturieren</h2>
        <p className={styles.ctaSub}>
          Sprechen Sie mit uns über Ihren aktuellen Stand – wir zeigen Ihnen, wo Handlungsbedarf besteht.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Struktur aufbauen →
        </a>
      </div>
    </ToolShell>
  )
}
