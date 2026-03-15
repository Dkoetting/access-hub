import styles from './page.module.css'

export default function GptVaultSuccessPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.icon}>✅</div>
        <h1 className={styles.title}>Kauf erfolgreich!</h1>
        <p className={styles.sub}>
          Vielen Dank – dein Aktivierungs-Token ist unterwegs.
        </p>

        <div className={styles.steps}>
          <h2 className={styles.stepsTitle}>So geht es weiter:</h2>

          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>E-Mail prüfen</strong>
              <p>Du erhältst gleich eine E-Mail mit deinem Aktivierungs-Token.</p>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>GPT Vault herunterladen</strong>
              <p>
                Lade die aktuelle Version herunter und entpacke das ZIP auf deinem PC.
              </p>
              <a
                href="https://drive.google.com/file/d/1elsv6G2dadd-B-5Q0pNe0C6tcOgCDIyB/view"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadLink}
              >
                → GPT Vault herunterladen
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>Starten &amp; Token eingeben</strong>
              <p>
                Starte <code>start.bat</code> (Windows) oder <code>start.sh</code> (Mac),
                gib deinen Token ein – fertig.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.hint}>
          <p>Keine E-Mail erhalten? Spam-Ordner prüfen oder schreib uns:</p>
          <a href="mailto:dirk@koetting.bayern">dirk@koetting.bayern</a>
        </div>

        <a href="/gpt-vault" className={styles.backLink}>← Zurück zur Übersicht</a>

      </div>
    </main>
  )
}
