import styles from './page.module.css'
import { getGptVaultDownloadUrl } from '@/lib/gpt-vault-download'
import { getGptVaultProjectDownloadUrl } from '@/lib/gpt-vault-project-download'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GptVaultSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const mode = typeof params.mode === 'string' ? params.mode : ''
  const isProjectFlow = mode === 'projects'

  const downloadUrl = isProjectFlow
    ? getGptVaultProjectDownloadUrl()
    : getGptVaultDownloadUrl()

  const title = isProjectFlow ? 'GPT Vault Projekte herunterladen' : 'GPT Vault herunterladen'
  const downloadLabel = isProjectFlow ? '→ GPT Vault Projekte herunterladen' : '→ GPT Vault herunterladen'
  const backHref = '/gpt-vault'

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
              <strong>{title}</strong>
              <p>
                Lade die aktuelle Version herunter und entpacke das ZIP auf deinem PC.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadLink}
              >
                {downloadLabel}
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

        <a href={backHref} className={styles.backLink}>← Zurück zur Übersicht</a>

      </div>
    </main>
  )
}
