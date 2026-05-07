import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'KI ROI Rechner · Dr. DirkInstitute',
  description: 'Den Business Case Ihrer KI-Agenten messbar machen – für Board, CFO und Investoren. Strukturiert, nachvollziehbar, board-tauglich.',
}

export default function KiRoiRechnerPage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>📊</span>
        <span className={styles.toolStepBadge}>Schritt 3 — Umsetzung &amp; Wirkung</span>
        <h1 className={styles.toolTitle}>KI ROI Rechner</h1>
        <p className={styles.toolTagline}>
          Den Business Case Ihrer KI-Agenten messbar machen – für Board, CFO und Investoren.
          Wirkung sichtbar, Investition gerechtfertigt, Verantwortung nachgewiesen.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Strukturierte Methodik zur KI-ROI-Berechnung – jenseits von Hype-Zahlen, mit realistischen Annahmen',
            'Vorlage für Kosten-Nutzen-Analyse von KI-Projekten inkl. Implementierungs-, Betrieb- und Governance-Kosten',
            'Berücksichtigung von Risiko-, Compliance- und Governance-Kosten – oft vergessen, entscheidend für CFO',
            'Board-taugliche Präsentationsvorlage für den Business Case – direkt für Vorstands- oder Investorengespräch verwendbar',
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
            'CFOs und Finanzverantwortliche, die KI-Investitionen mit belastbaren Zahlen bewerten und rechtfertigen müssen',
            'Vorstände, die ROI-Rechenschaft für KI-Agenten gegenüber Aufsichtsrat oder Investoren erbringen müssen',
            'Projektverantwortliche, die Budgetentscheidungen für KI-Initiativen vorbereiten und intern vertreten wollen',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>KI-Business-Case messbar machen</h2>
        <p className={styles.ctaSub}>
          Teilen Sie uns Ihre KI-Initiative mit – wir begleiten Sie beim Aufbau eines belastbaren Business Case.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Umsetzung starten →
        </a>
      </div>
    </ToolShell>
  )
}
