import type { Metadata } from 'next'
import ToolShell from '../_components/ToolShell'
import styles from '../tools.module.css'

export const metadata: Metadata = {
  title: 'K² Kausale Kompetenz · Dr. DirkInstitute',
  description: 'Verstehen, warum KI entscheidet – nicht nur was. Führungsstärke durch Kausaldenken im KI-Zeitalter.',
}

export default function K2KausaleKompetenzPage() {
  return (
    <ToolShell>
      <div className={styles.toolHero}>
        <span className={styles.toolIcon}>🧠</span>
        <span className={styles.toolStepBadge}>Schritt 3 — Umsetzung &amp; Wirkung</span>
        <h1 className={styles.toolTitle}>K² — Kausale Kompetenz</h1>
        <p className={styles.toolTagline}>
          Verstehen, warum KI entscheidet – nicht nur was.
          Führungsstärke durch Kausaldenken: Wer kausale Zusammenhänge versteht, steuert KI statt ihr zu folgen.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Was Sie erhalten</h2>
        <ul className={styles.benefits}>
          {[
            'Einführung in kausale Denkmodelle für KI-Entscheidungen – verständlich für Führungskräfte ohne Data-Science-Hintergrund',
            'Werkzeuge zur Unterscheidung von Korrelation und Kausalität im KI-Kontext – kritisch für Haftung und Verantwortung',
            'Praxisübungen für Vorstände und Führungsteams: KI-Empfehlungen fundiert hinterfragen und einordnen',
            'Framework für kritische KI-Entscheidungsüberprüfung – einsetzbar in Board-Meetings und Governance-Reviews',
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
            'Vorstände und C-Level-Führungskräfte, die KI-Entscheidungen fundiert steuern und verantworten wollen',
            'Führungsteams, die KI-Empfehlungen kritisch hinterfragen müssen – nicht blind folgen',
            'Unternehmen, die algorithmische Systeme strategisch einsetzen und erklärbar machen müssen',
          ].map((t) => (
            <li key={t} className={styles.target}>
              <span className={styles.targetDot} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Kausale Kompetenz aufbauen</h2>
        <p className={styles.ctaSub}>
          Sprechen Sie mit uns über den nächsten Schritt – wir begleiten Sie auf dem Weg zur Board-Readiness.
        </p>
        <a href="/#governance-kurzlage" className={styles.ctaBtn}>
          Umsetzung starten →
        </a>
      </div>
    </ToolShell>
  )
}
